import { DisplayBezierCurve } from "../DisplayManager.ts";
import { createConsole } from "./Console.ts";
import { DisplayContextCommand } from "./DisplayContextCommand.ts";
import { contourArea } from "./DisplaySpriteSheetUtils.ts";
import { pointInPolygon, Vector2 } from "./MathUtils.ts";
import { simplifyPath } from "./PathUtils.ts";

const _console = createConsole("SvgUtils", { log: true });

type SvgCommand =
  | { type: "moveTo" | "lineTo"; x: number; y: number }
  | { type: "quadraticCurveTo"; cpx: number; cpy: number; x: number; y: number }
  | {
      type: "bezierCurveTo";
      cp1x: number;
      cp1y: number;
      cp2x: number;
      cp2y: number;
      x: number;
      y: number;
    }
  | { type: "closePath" }
  | {
      type: "arc";
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      startAngle: number;
      endAngle: number;
      xAxisRotation?: number;
      largeArc?: boolean;
      sweep?: boolean;
    };

type SvgStyle = {
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
};

type SvgElementData = {
  commands: SvgCommand[];
  style: SvgStyle;
};

// ----------------- TRANSFORM HELPERS -----------------
type Matrix2D = [number, number, number, number, number, number];

function multiplyMatrix(m1: Matrix2D, m2: Matrix2D): Matrix2D {
  const [a1, b1, c1, d1, e1, f1] = m1;
  const [a2, b2, c2, d2, e2, f2] = m2;
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1,
    b1 * e2 + d1 * f2 + f1,
  ];
}

function applyMatrix(x: number, y: number, m: Matrix2D): [number, number] {
  const [a, b, c, d, e, f] = m;
  return [a * x + c * y + e, b * x + d * y + f];
}

function parseTransform(transform: string | null): Matrix2D {
  if (!transform) return [1, 0, 0, 1, 0, 0];

  let matrix: Matrix2D = [1, 0, 0, 1, 0, 0];
  const regex = /(\w+)\(([^)]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(transform)) !== null) {
    const [, type, argsStr] = match;
    const args = argsStr.split(/[\s,]+/).map(Number);
    let m: Matrix2D = [1, 0, 0, 1, 0, 0];

    switch (type) {
      case "translate": {
        const tx = args[0],
          ty = args[1] || 0;
        m = [1, 0, 0, 1, tx, ty];
        break;
      }
      case "scale": {
        const sx = args[0],
          sy = args[1] !== undefined ? args[1] : args[0];
        m = [sx, 0, 0, sy, 0, 0];
        break;
      }
      case "rotate": {
        const angle = (args[0] * Math.PI) / 180;
        const cos = Math.cos(angle),
          sin = Math.sin(angle);
        if (args[1] !== undefined && args[2] !== undefined) {
          const cx = args[1],
            cy = args[2];
          m = [
            cos,
            sin,
            -sin,
            cos,
            cx - cos * cx + sin * cy,
            cy - sin * cx - cos * cy,
          ];
        } else {
          m = [cos, sin, -sin, cos, 0, 0];
        }
        break;
      }
      case "matrix":
        if (args.length === 6)
          m = [args[0], args[1], args[2], args[3], args[4], args[5]];
        break;
      case "skewX":
        m = [1, 0, Math.tan((args[0] * Math.PI) / 180), 1, 0, 0];
        break;
      case "skewY":
        m = [1, Math.tan((args[0] * Math.PI) / 180), 0, 1, 0, 0];
        break;
    }

    matrix = multiplyMatrix(matrix, m);
  }

  return matrix;
}

function applyTransformToCommands(
  commands: SvgCommand[],
  transform: Matrix2D
): SvgCommand[] {
  return commands.map((cmd) => {
    switch (cmd.type) {
      case "moveTo":
      case "lineTo": {
        const [x, y] = applyMatrix(cmd.x, cmd.y, transform);
        return { ...cmd, x, y };
      }
      case "quadraticCurveTo": {
        const [cpx, cpy] = applyMatrix(cmd.cpx, cmd.cpy, transform);
        const [x, y] = applyMatrix(cmd.x, cmd.y, transform);
        return { ...cmd, cpx, cpy, x, y };
      }
      case "bezierCurveTo": {
        const [cp1x, cp1y] = applyMatrix(cmd.cp1x, cmd.cp1y, transform);
        const [cp2x, cp2y] = applyMatrix(cmd.cp2x, cmd.cp2y, transform);
        const [x, y] = applyMatrix(cmd.x, cmd.y, transform);
        return { ...cmd, cp1x, cp1y, cp2x, cp2y, x, y };
      }
      case "arc": {
        const [cx, cy] = applyMatrix(cmd.cx, cmd.cy, transform);
        return { ...cmd, cx, cy };
      }
      default:
        return cmd;
    }
  });
}

// ----------------- STYLE HELPER -----------------
function extractStyle(el: Element): SvgStyle {
  const styleAttr = el.getAttribute("style") || "";
  const style: SvgStyle = {};
  styleAttr.split(";").forEach((pair) => {
    const [key, value] = pair.split(":").map((s) => s.trim());
    if (!key || !value) return;
    switch (key) {
      case "stroke":
        style.stroke = value;
        break;
      case "stroke-width":
        style.strokeWidth = parseFloat(value);
        break;
      case "fill":
        style.fill = value;
        break;
      case "fill-opacity":
        style.fillOpacity = parseFloat(value);
        break;
    }
  });
  if (el.getAttribute("stroke")) style.stroke = el.getAttribute("stroke")!;
  if (el.getAttribute("stroke-width"))
    style.strokeWidth = parseFloat(el.getAttribute("stroke-width")!);
  if (el.getAttribute("fill")) style.fill = el.getAttribute("fill")!;
  if (el.getAttribute("fill-opacity"))
    style.fillOpacity = parseFloat(el.getAttribute("fill-opacity")!);
  return style;
}

type ParseSvgOptions = {
  crop?: boolean; // removes extra empty space around the shapes
  width?: number; // scale output to this width
  height?: number; // scale output to this height
  aspectRatio?: number; // width / height, used if only one of width/height is provided
};

function parseSvgShapes(svgString: string): SvgElementData[] {
  //_console.log("parseSvg", svgString);

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const elementsData: SvgElementData[] = [];

  const parseNumbers = (str: string) =>
    str
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);

  function processElement(el: Element, commands: SvgCommand[]) {
    const style = extractStyle(el);
    const transform = parseTransform(el.getAttribute("transform"));
    const transformedCommands = applyTransformToCommands(commands, transform);
    elementsData.push({ commands: transformedCommands, style });
  }

  // --- PATH ---
  for (const path of Array.from(doc.querySelectorAll("path"))) {
    const d = path.getAttribute("d");
    if (!d) continue;
    const commands: SvgCommand[] = [];
    const regex = /([MLCQZHVSAmlcqzhvsa])([^MLCQZHVSAmlcqzhvsa]*)/g;
    let match: RegExpExecArray | null;

    let currentX = 0,
      currentY = 0,
      startX = 0,
      startY = 0,
      prevCmd: string | null = null,
      prevCP: [number, number] | null = null;

    const getCoord = (x: number, y: number, relative: boolean) =>
      relative ? [currentX + x, currentY + y] : [x, y];
    const reflect = (coord: [number, number]) =>
      [2 * currentX - coord[0], 2 * currentY - coord[1]] as [number, number];

    while ((match = regex.exec(d)) !== null) {
      const [, type, params] = match;
      const values = parseNumbers(params);
      let i = 0;
      const isRelative = type === type.toLowerCase();

      switch (type.toUpperCase()) {
        case "M":
          while (i < values.length) {
            const [x, y] = getCoord(values[i++], values[i++], isRelative);
            commands.push({ type: "moveTo", x, y });
            currentX = startX = x;
            currentY = startY = y;
          }
          break;
        case "L":
          while (i < values.length) {
            const [x, y] = getCoord(values[i++], values[i++], isRelative);
            commands.push({ type: "lineTo", x, y });
            currentX = x;
            currentY = y;
          }
          break;
        case "H":
          while (i < values.length) {
            const x = isRelative ? currentX + values[i++] : values[i++];
            commands.push({ type: "lineTo", x, y: currentY });
            currentX = x;
          }
          break;
        case "V":
          while (i < values.length) {
            const y = isRelative ? currentY + values[i++] : values[i++];
            commands.push({ type: "lineTo", x: currentX, y });
            currentY = y;
          }
          break;
        case "C":
          while (i + 5 < values.length) {
            const [x1, y1] = getCoord(values[i++], values[i++], isRelative);
            const [x2, y2] = getCoord(values[i++], values[i++], isRelative);
            const [x, y] = getCoord(values[i++], values[i++], isRelative);
            commands.push({
              type: "bezierCurveTo",
              cp1x: x1,
              cp1y: y1,
              cp2x: x2,
              cp2y: y2,
              x,
              y,
            });
            prevCP = [x2, y2];
            currentX = x;
            currentY = y;
          }
          break;
        case "S":
          while (i + 3 < values.length) {
            const [x2, y2] = getCoord(values[i++], values[i++], isRelative);
            const [x, y] = getCoord(values[i++], values[i++], isRelative);
            const [cp1x, cp1y]: [number, number] =
              prevCmd && /[CS]/i.test(prevCmd) && prevCP
                ? reflect(prevCP)
                : [currentX, currentY];
            commands.push({
              type: "bezierCurveTo",
              cp1x,
              cp1y,
              cp2x: x2,
              cp2y: y2,
              x,
              y,
            });
            prevCP = [x2, y2];
            currentX = x;
            currentY = y;
          }
          break;
        case "Q":
          while (i + 3 < values.length) {
            const [cpx, cpy] = getCoord(values[i++], values[i++], isRelative);
            const [x, y] = getCoord(values[i++], values[i++], isRelative);
            commands.push({ type: "quadraticCurveTo", cpx, cpy, x, y });
            prevCP = [cpx, cpy];
            currentX = x;
            currentY = y;
          }
          break;
        case "T":
          while (i + 1 < values.length) {
            const [x, y] = getCoord(values[i++], values[i++], isRelative);
            const [cpx, cpy]: [number, number] =
              prevCmd && /[QT]/i.test(prevCmd) && prevCP
                ? reflect(prevCP)
                : [currentX, currentY];
            commands.push({ type: "quadraticCurveTo", cpx, cpy, x, y });
            prevCP = [cpx, cpy];
            currentX = x;
            currentY = y;
          }
          break;
        case "A":
          while (i + 6 < values.length) {
            const rx = values[i++],
              ry = values[i++],
              xAxisRotation = values[i++],
              largeArc = values[i++] !== 0,
              sweep = values[i++] !== 0;
            const [x, y] = getCoord(values[i++], values[i++], isRelative);
            commands.push({
              type: "arc",
              cx: currentX,
              cy: currentY,
              rx,
              ry,
              startAngle: 0,
              endAngle: Math.PI * 2,
              xAxisRotation,
              largeArc,
              sweep,
            });
            currentX = x;
            currentY = y;
          }
          break;
        case "Z":
          commands.push({ type: "closePath" });
          currentX = startX;
          currentY = startY;
          break;
      }

      prevCmd = type;
    }

    processElement(path, commands);
  }

  // --- RECT ---
  for (const rect of Array.from(doc.querySelectorAll("rect"))) {
    const commands: SvgCommand[] = [];
    const x = parseFloat(rect.getAttribute("x") || "0");
    const y = parseFloat(rect.getAttribute("y") || "0");
    const w = parseFloat(rect.getAttribute("width") || "0");
    const h = parseFloat(rect.getAttribute("height") || "0");
    commands.push({ type: "moveTo", x, y });
    commands.push({ type: "lineTo", x: x + w, y });
    commands.push({ type: "lineTo", x: x + w, y: y + h });
    commands.push({ type: "lineTo", x, y: y + h });
    // FILL - replace with drawRect (centered xy)
    commands.push({ type: "closePath" });
    processElement(rect, commands);
  }

  // --- CIRCLE ---
  for (const circle of Array.from(doc.querySelectorAll("circle"))) {
    const commands: SvgCommand[] = [];
    const cx = parseFloat(circle.getAttribute("cx") || "0");
    const cy = parseFloat(circle.getAttribute("cy") || "0");
    const r = parseFloat(circle.getAttribute("r") || "0");
    commands.push({
      type: "arc",
      cx,
      cy,
      rx: r,
      ry: r,
      startAngle: 0,
      endAngle: Math.PI * 2,
    });
    processElement(circle, commands);
  }

  // --- ELLIPSE ---
  for (const ellipse of Array.from(doc.querySelectorAll("ellipse"))) {
    const commands: SvgCommand[] = [];
    const cx = parseFloat(ellipse.getAttribute("cx") || "0");
    const cy = parseFloat(ellipse.getAttribute("cy") || "0");
    const rx = parseFloat(ellipse.getAttribute("rx") || "0");
    const ry = parseFloat(ellipse.getAttribute("ry") || "0");
    commands.push({
      type: "arc",
      cx,
      cy,
      rx,
      ry,
      startAngle: 0,
      endAngle: Math.PI * 2,
    });
    processElement(ellipse, commands);
  }

  // --- LINE ---
  for (const line of Array.from(doc.querySelectorAll("line"))) {
    const commands: SvgCommand[] = [];
    const x1 = parseFloat(line.getAttribute("x1") || "0");
    const y1 = parseFloat(line.getAttribute("y1") || "0");
    const x2 = parseFloat(line.getAttribute("x2") || "0");
    const y2 = parseFloat(line.getAttribute("y2") || "0");
    commands.push({ type: "moveTo", x: x1, y: y1 });
    commands.push({ type: "lineTo", x: x2, y: y2 });
    processElement(line, commands);
  }

  // --- POLYGON / POLYLINE ---
  for (const poly of Array.from(doc.querySelectorAll("polygon, polyline"))) {
    const commands: SvgCommand[] = [];
    const pointsAttr = poly.getAttribute("points");
    if (!pointsAttr) continue;
    const points = pointsAttr
      .trim()
      .split(/\s+/)
      .map((p) => p.split(",").map(Number))
      .filter((p) => p.length === 2);

    if (points.length === 0) continue;
    commands.push({ type: "moveTo", x: points[0][0], y: points[0][1] });
    for (let i = 1; i < points.length; i++) {
      commands.push({ type: "lineTo", x: points[i][0], y: points[i][1] });
    }
    if (poly.tagName.toLowerCase() === "polygon")
      commands.push({ type: "closePath" });

    processElement(poly, commands);
  }

  //_console.log("elementsData", elementsData);

  return elementsData;
}

function parseSvg(
  svgString: string,
  options?: ParseSvgOptions
): SvgElementData[] {
  _console.log("parseSvg", { svgString }, options);

  options = { crop: true, ...options };

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const elementsData: SvgElementData[] = [];

  // --- Get intrinsic width/height ---
  const svgEl = doc.querySelector("svg");
  let intrinsicWidth = parseFloat(svgEl?.getAttribute("width") || "") || 0;
  let intrinsicHeight = parseFloat(svgEl?.getAttribute("height") || "") || 0;
  if ((!intrinsicWidth || !intrinsicHeight) && svgEl?.hasAttribute("viewBox")) {
    const vb = svgEl
      .getAttribute("viewBox")!
      .split(/[\s,]+/)
      .map(Number);
    if (vb.length === 4) {
      intrinsicWidth = vb[2];
      intrinsicHeight = vb[3];
    }
  }
  if (!intrinsicWidth) intrinsicWidth = 300;
  if (!intrinsicHeight) intrinsicHeight = 150;

  _console.log({ intrinsicWidth, intrinsicHeight });

  // --- Parse SVG normally ---
  const elements = parseSvgShapes(svgString); // reuse earlier code to extract SvgElementData[]
  elementsData.push(...elements);

  // --- CROP: find bounding box ---
  if (options.crop) {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const el of elementsData) {
      for (const cmd of el.commands) {
        switch (cmd.type) {
          case "moveTo":
          case "lineTo":
            minX = Math.min(minX, cmd.x);
            minY = Math.min(minY, cmd.y);
            maxX = Math.max(maxX, cmd.x);
            maxY = Math.max(maxY, cmd.y);
            break;
          case "quadraticCurveTo":
            minX = Math.min(minX, cmd.cpx, cmd.x);
            minY = Math.min(minY, cmd.cpy, cmd.y);
            maxX = Math.max(maxX, cmd.cpx, cmd.x);
            maxY = Math.max(maxY, cmd.cpy, cmd.y);
            break;
          case "bezierCurveTo":
            minX = Math.min(minX, cmd.cp1x, cmd.cp2x, cmd.x);
            minY = Math.min(minY, cmd.cp1y, cmd.cp2y, cmd.y);
            maxX = Math.max(maxX, cmd.cp1x, cmd.cp2x, cmd.x);
            maxY = Math.max(maxY, cmd.cp1y, cmd.cp2y, cmd.y);
            break;
          case "arc":
            minX = Math.min(minX, cmd.cx - cmd.rx);
            minY = Math.min(minY, cmd.cy - cmd.ry);
            maxX = Math.max(maxX, cmd.cx + cmd.rx);
            maxY = Math.max(maxY, cmd.cy + cmd.ry);
            break;
        }
      }
    }
    const cropWidth = maxX - minX;
    const cropHeight = maxY - minY;
    _console.log({ minX, maxX, minY, maxY, cropWidth, cropHeight });
    // Shift all coordinates so top-left is at 0,0
    for (const el of elementsData) {
      el.commands = el.commands.map((cmd) => {
        switch (cmd.type) {
          case "moveTo":
          case "lineTo":
            return { ...cmd, x: cmd.x - minX, y: cmd.y - minY };
          case "quadraticCurveTo":
            return {
              ...cmd,
              cpx: cmd.cpx - minX,
              cpy: cmd.cpy - minY,
              x: cmd.x - minX,
              y: cmd.y - minY,
            };
          case "bezierCurveTo":
            return {
              ...cmd,
              cp1x: cmd.cp1x - minX,
              cp1y: cmd.cp1y - minY,
              cp2x: cmd.cp2x - minX,
              cp2y: cmd.cp2y - minY,
              x: cmd.x - minX,
              y: cmd.y - minY,
            };
          case "arc":
            return { ...cmd, cx: cmd.cx - minX, cy: cmd.cy - minY };
          default:
            return cmd;
        }
      });
    }
    intrinsicWidth = cropWidth;
    intrinsicHeight = cropHeight;
  }

  // --- SCALE: width/height/aspectRatio ---
  let scaleX = 1,
    scaleY = 1;
  if (options.width && options.height) {
    scaleX = options.width / intrinsicWidth;
    scaleY = options.height / intrinsicHeight;
  } else if (options.width) {
    scaleX = scaleY = options.width / intrinsicWidth;
    if (options.aspectRatio) scaleY = scaleX / options.aspectRatio;
  } else if (options.height) {
    scaleX = scaleY = options.height / intrinsicHeight;
    if (options.aspectRatio) scaleX = scaleY * options.aspectRatio;
  }

  _console.log({ scaleX, scaleY });

  if (scaleX !== 1 || scaleY !== 1) {
    for (const el of elementsData) {
      el.commands = el.commands.map((cmd) => {
        switch (cmd.type) {
          case "moveTo":
          case "lineTo":
            return { ...cmd, x: cmd.x * scaleX, y: cmd.y * scaleY };
          case "quadraticCurveTo":
            return {
              ...cmd,
              cpx: cmd.cpx * scaleX,
              cpy: cmd.cpy * scaleY,
              x: cmd.x * scaleX,
              y: cmd.y * scaleY,
            };
          case "bezierCurveTo":
            return {
              ...cmd,
              cp1x: cmd.cp1x * scaleX,
              cp1y: cmd.cp1y * scaleY,
              cp2x: cmd.cp2x * scaleX,
              cp2y: cmd.cp2y * scaleY,
              x: cmd.x * scaleX,
              y: cmd.y * scaleY,
            };
          case "arc":
            return {
              ...cmd,
              cx: cmd.cx * scaleX,
              cy: cmd.cy * scaleY,
              rx: cmd.rx * scaleX,
              ry: cmd.ry * scaleY,
            };
          default:
            return cmd;
        }
      });
    }
  }

  return elementsData;
}

export function svgToDisplayContextCommands(
  svgString: string,
  options?: ParseSvgOptions
): DisplayContextCommand[] {
  const displayCommands: DisplayContextCommand[] = [];

  const svgElementData = parseSvg(svgString, options);
  svgElementData.forEach(({ commands, style }) => {
    _console.log("commands", commands, "style", style);
    let curves: DisplayBezierCurve[] = [];
    let startPoint: Vector2 = { x: 0, y: 0 };

    const displayCommandObjects: {
      command: DisplayContextCommand;
      area: number;
      points: Vector2[];
    }[] = [];

    commands.forEach((command) => {
      switch (command.type) {
        case "moveTo":
          startPoint.x = command.x;
          startPoint.y = command.y;
          break;
        case "lineTo":
          {
            const controlPoints: Vector2[] = [{ x: command.x, y: command.y }];
            if (curves.length === 0) {
              controlPoints.unshift({ ...startPoint });
            }
            curves.push({ type: "segment", controlPoints });
          }
          break;
        case "quadraticCurveTo":
          {
            const controlPoints: Vector2[] = [
              { x: command.cpx, y: command.cpy },
              { x: command.x, y: command.y },
            ];
            if (curves.length === 0) {
              controlPoints.unshift({ ...startPoint });
            }
            curves.push({ type: "quadratic", controlPoints });
          }
          break;
        case "bezierCurveTo":
          {
            const controlPoints: Vector2[] = [
              { x: command.cp1x, y: command.cp1y },
              { x: command.cp2x, y: command.cp2y },
              { x: command.x, y: command.y },
            ];
            if (curves.length === 0) {
              controlPoints.unshift({ ...startPoint });
            }
            curves.push({ type: "cubic", controlPoints });
          }
          break;
        case "closePath":
          if (curves.length === 0) break;

          // Flatten all control points
          const controlPoints = curves.flatMap((c) => c.controlPoints);

          const area = contourArea(controlPoints);

          const isSegments = curves.every((c) => c.type === "segment");
          if (isSegments) {
            displayCommandObjects.push({
              command: {
                type: "drawPolygon",
                points: controlPoints,
              },
              points: controlPoints,
              area,
            });
          } else {
            // FIX
            displayCommandObjects.push({
              command: {
                type: "drawPath",
                curves,
              },
              area,
              points: controlPoints,
            });
          }

          // Reset curves
          curves = [];
          break;
        case "arc":
          // FILL
          break;
      }
    });

    if (displayCommandObjects.length > 0) {
      displayCommandObjects.sort((a, b) => {
        return a.points.every((aPoint) => pointInPolygon(aPoint, b.points))
          ? 1
          : -1;
      });

      let isDrawingHole = false;
      let isHoleAreaPositive = displayCommandObjects[0].area < 0;
      displayCommandObjects.forEach(({ area, command }) => {
        const isHole = isHoleAreaPositive ? area > 0 : area < 0;
        if (isDrawingHole != isHole) {
          isDrawingHole = isHole;
          // displayCommands.push({
          //   type: "selectFillColor",
          //   fillColorIndex: isHole ? 0 : 1,
          // });
        }
        displayCommands.push(command);
      });
    }
  });
  return displayCommands;
}
