import { createConsole } from "./Console.ts";
import { DisplayContextCommand } from "./DisplayContextCommand.ts";
import { INode, parseSync } from "svgson";
import { SVGCommand, SVGPathData } from "svg-pathdata";
import { DisplayBezierCurve } from "../DisplayManager.ts";
import { pointInPolygon, Vector2 } from "./MathUtils.ts";
import { contourArea } from "./DisplaySpriteSheetUtils.ts";
import { simplifyCurves } from "./PathUtils.ts";
import { DisplayBoundingBox } from "./DisplayCanvasHelper.ts";
import RangeHelper from "./RangeHelper.ts";

const _console = createConsole("SvgUtils", { log: true });

type CanvasCommand =
  | { type: "moveTo" | "lineTo"; x: number; y: number }
  | { type: "closePath" }
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
  | { type: "fillStyle" | "strokeStyle" | "lineWidth"; value: string | number };

interface Transform {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

const identity: Transform = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

function multiply(t1: Transform, t2: Transform): Transform {
  //_console.log("multiplying matrices", t1, t2);
  return {
    a: t1.a * t2.a + t1.c * t2.b,
    b: t1.b * t2.a + t1.d * t2.b,
    c: t1.a * t2.c + t1.c * t2.d,
    d: t1.b * t2.c + t1.d * t2.d,
    e: t1.a * t2.e + t1.c * t2.f + t1.e,
    f: t1.b * t2.e + t1.d * t2.f + t1.f,
  };
}

function parseTransform(transformStr: string): Transform {
  // Very basic parser, handles translate, scale, rotate, matrix
  if (!transformStr) return identity;

  const t = transformStr.match(/(\w+)\(([^)]+)\)/g);
  if (!t) return identity;

  let matrix = structuredClone(identity);

  for (const part of t) {
    const [, fn, argsStr] = /(\w+)\(([^)]+)\)/.exec(part)!;
    const args = argsStr.split(/[\s,]+/).map(Number);
    let m: Transform = structuredClone(identity);

    switch (fn) {
      case "translate":
        _console.log("translate", { x: args[0], y: args[1] });
        m.e = args[0];
        m.f = args[1] || 0;
        break;
      case "scale":
        _console.log("scale", { x: args[0], y: args[1] });
        m.a = args[0];
        m.d = args[1] !== undefined ? args[1] : args[0];
        break;
      case "rotate":
        const angle = (args[0] * Math.PI) / 180;
        _console.log("rotate", { angle });
        const cos = Math.cos(angle),
          sin = Math.sin(angle);
        if (args[1] !== undefined && args[2] !== undefined) {
          const [cx, cy] = [args[1], args[2]];
          m = {
            a: cos,
            b: sin,
            c: -sin,
            d: cos,
            e: cx - cos * cx + sin * cy,
            f: cy - sin * cx - cos * cy,
          };
        } else {
          m.a = cos;
          m.b = sin;
          m.c = -sin;
          m.d = cos;
        }
        break;
      case "matrix":
        _console.log("matrix", args);
        [m.a, m.b, m.c, m.d, m.e, m.f] = args;
        break;
    }

    matrix = multiply(matrix, m);
  }

  //_console.log("parsedTransform", matrix);
  return matrix;
}

function applyTransform(x: number, y: number, t: Transform) {
  //_console.log("applying transform", { x, y, t });
  const value: Vector2 = {
    x: t.a * x + t.c * y + t.e,
    y: t.b * x + t.d * y + t.f,
  };
  //_console.log("transformed value", value);
  return value;
}

function svgJsonToCanvasCommands(svgJson: INode): CanvasCommand[] {
  const commands: CanvasCommand[] = [];

  function traverse(node: any, parentTransform: Transform) {
    _console.log("traversing node", node, parentTransform);
    const transform = parseTransform(node.attributes.transform);
    //_console.log("transform", transform);
    const nodeTransform = multiply(parentTransform, transform);
    //_console.log("nodeTransform", nodeTransform);

    // Handle styles
    if (node.attributes.fill)
      commands.push({ type: "fillStyle", value: node.attributes.fill });
    if (node.attributes.stroke)
      commands.push({ type: "strokeStyle", value: node.attributes.stroke });
    if (node.attributes["stroke-width"])
      commands.push({
        type: "lineWidth",
        value: parseFloat(node.attributes["stroke-width"]),
      });

    switch (node.name) {
      case "path":
        const d = node.attributes.d;
        if (!d) break;
        const pathData = new SVGPathData(d).toAbs();
        for (const cmd of pathData.commands) {
          switch (cmd.type) {
            case SVGPathData.MOVE_TO:
              const m = applyTransform(cmd.x!, cmd.y!, nodeTransform);
              commands.push({ type: "moveTo", x: m.x, y: m.y });
              break;
            case SVGPathData.LINE_TO:
              const l = applyTransform(cmd.x!, cmd.y!, nodeTransform);
              commands.push({ type: "lineTo", x: l.x, y: l.y });
              break;
            case SVGPathData.CURVE_TO:
              const c1 = applyTransform(cmd.x1!, cmd.y1!, nodeTransform);
              const c2 = applyTransform(cmd.x2!, cmd.y2!, nodeTransform);
              const ce = applyTransform(cmd.x!, cmd.y!, nodeTransform);
              commands.push({
                type: "bezierCurveTo",
                cp1x: c1.x,
                cp1y: c1.y,
                cp2x: c2.x,
                cp2y: c2.y,
                x: ce.x,
                y: ce.y,
              });
              break;
            case SVGPathData.QUAD_TO:
              const qcp = applyTransform(cmd.x1!, cmd.y1!, nodeTransform);
              const qe = applyTransform(cmd.x!, cmd.y!, nodeTransform);
              commands.push({
                type: "quadraticCurveTo",
                cpx: qcp.x,
                cpy: qcp.y,
                x: qe.x,
                y: qe.y,
              });
              break;
            case SVGPathData.CLOSE_PATH:
              commands.push({ type: "closePath" });
              break;
          }
        }
        break;

      case "rect":
        const x = parseFloat(node.attributes.x || "0");
        const y = parseFloat(node.attributes.y || "0");
        const width = parseFloat(node.attributes.width || "0");
        const height = parseFloat(node.attributes.height || "0");
        const tl = applyTransform(x, y, nodeTransform);
        const tr = applyTransform(x + width, y, nodeTransform);
        const br = applyTransform(x + width, y + height, nodeTransform);
        const bl = applyTransform(x, y + height, nodeTransform);
        commands.push({ type: "moveTo", x: tl.x, y: tl.y });
        commands.push({ type: "lineTo", x: tr.x, y: tr.y });
        commands.push({ type: "lineTo", x: br.x, y: br.y });
        commands.push({ type: "lineTo", x: bl.x, y: bl.y });
        commands.push({ type: "closePath" });
        break;

      // TODO: add circle, ellipse, polygon, line, etc.
    }

    if (node.children) {
      for (const child of node.children) traverse(child, nodeTransform);
    }
  }

  traverse(svgJson, getSvgTransformToPixels(svgJson));
  return commands;
}

function parseLength(
  str: string | undefined,
  relativeTo?: number
): number | undefined {
  if (!str) return undefined;
  const match = /^([0-9.]+)([a-z%]*)$/.exec(str.trim());
  if (!match) return undefined;

  const value = parseFloat(match[1]);
  const unit = match[2] || "px";

  switch (unit) {
    case "px":
      return value;
    case "pt":
      return value * (96 / 72); // 1pt = 1/72in, 96dpi
    case "in":
      return value * 96; // 1in = 96px
    case "cm":
      return value * (96 / 2.54); // 1cm = 96/2.54 px
    case "mm":
      return value * (96 / 25.4); // 1mm = 96/25.4 px
    case "%":
      if (relativeTo === undefined) return undefined;
      return (value / 100) * relativeTo;
    case "":
      return value; // unitless → px
    default:
      return value; // unknown unit → assume px
  }
}

function getSvgJsonSize(svgJson: INode) {
  const attrs = svgJson.attributes || {};

  const width = parseLength(attrs.width) ?? 300;
  const height = parseLength(attrs.height) ?? 150;

  return { width, height };
}
function getSvgJsonViewBox(svgJson: INode): DisplayBoundingBox {
  const attrs = svgJson.attributes || {};

  let x = 0,
    y = 0,
    width = 0,
    height = 0;
  if (attrs.viewBox) {
    const parts = attrs.viewBox.split(/[\s,]+/).map(parseFloat);
    if (parts.length === 4) {
      [x, y, width, height] = parts;
    }
  }

  return {
    x,
    y,
    width,
    height,
  };
}
function getSvgJsonBoundingBox(svgJson: INode): DisplayBoundingBox {
  const { width, height } = getSvgJsonSize(svgJson);
  const viewBox = getSvgJsonViewBox(svgJson);

  // 3. Decide output
  if (width !== undefined && height !== undefined) {
    return { x: 0, y: 0, width, height };
  } else if (viewBox.width !== undefined && viewBox.height !== undefined) {
    return viewBox;
  } else {
    // fallback per SVG spec: 300x150 default
    return { x: 0, y: 0, width: 300, height: 150 };
  }
}

function getSvgTransformToPixels(svgJson: INode): Transform {
  const attrs = svgJson.attributes || {};
  const { width, height } = getSvgJsonSize(svgJson); // in px
  const viewBox = getSvgJsonViewBox(svgJson); // { x, y, width, height }

  // Base scales
  let scaleX = width / viewBox.width;
  let scaleY = height / viewBox.height;
  let offsetX = 0;
  let offsetY = 0;

  // Handle preserveAspectRatio="xMidYMid meet"
  if (attrs.preserveAspectRatio?.includes("meet")) {
    const s = Math.min(scaleX, scaleY);
    offsetX = (width - viewBox.width * s) / 2;
    offsetY = (height - viewBox.height * s) / 2;
    scaleX = scaleY = s;
  }

  // Return the affine transform matrix
  return {
    a: scaleX,
    b: 0,
    c: 0,
    d: scaleY,
    e: -viewBox.x * scaleX + offsetX,
    f: -viewBox.y * scaleY + offsetY,
  };
}

export type ParseSvgOptions = {
  fit?: boolean; // removes extra empty space around the shapes
  width?: number; // scale output to this width
  height?: number; // scale output to this height
  aspectRatio?: number; // width / height, used if only one of width/height is provided
  offsetX?: number;
  offsetY?: number;
};
const defaultParseSvgOptions: ParseSvgOptions = {
  fit: true,
};

function transformCanvasCommands(
  canvasCommands: CanvasCommand[],
  xCallback: (x: number) => number,
  yCallback: (y: number) => number
) {
  return canvasCommands.map((command) => {
    switch (command.type) {
      case "moveTo":
      case "lineTo": {
        let { x, y } = command;
        x = xCallback(x);
        y = yCallback(y);
        return { type: command.type, x, y };
      }
      case "quadraticCurveTo": {
        let { x, y, cpx, cpy } = command;
        x = xCallback(x);
        y = yCallback(y);
        cpx = xCallback(cpx);
        cpy = yCallback(cpy);
        return { type: command.type, x, y, cpx, cpy };
      }
      case "bezierCurveTo": {
        let { x, y, cp1x, cp1y, cp2x, cp2y } = command;
        x = xCallback(x);
        y = yCallback(y);
        cp1x = xCallback(cp1x);
        cp1y = yCallback(cp1y);
        cp2x = xCallback(cp2x);
        cp2y = yCallback(cp2y);
        return { type: command.type, x, y, cp1x, cp1y, cp2x, cp2y };
      }
      default:
        return command;
    }
  });
}
function forEachCanvasCommandVector2(
  canvasCommands: CanvasCommand[],
  vectorCallback: (x: number, y: number) => void
) {
  canvasCommands.forEach((command) => {
    switch (command.type) {
      case "moveTo":
      case "lineTo":
        {
          let { x, y } = command;
          vectorCallback(x, y);
        }
        break;
      case "quadraticCurveTo":
        {
          let { x, y, cpx, cpy } = command;
          vectorCallback(x, y);
          vectorCallback(cpx, cpy);
        }
        break;
      case "bezierCurveTo": {
        let { x, y, cp1x, cp1y, cp2x, cp2y } = command;
        vectorCallback(x, y);
        vectorCallback(cp1x, cp1y);
        vectorCallback(cp2x, cp2y);
      }
      default:
        break;
    }
  });
}
function offsetCanvasCommands(
  canvasCommands: CanvasCommand[],
  offsetX = 0,
  offsetY = 0
) {
  return transformCanvasCommands(
    canvasCommands,
    (x) => x + offsetX,
    (y) => y + offsetY
  );
}
function scaleCanvasCommands(
  canvasCommands: CanvasCommand[],
  scaleX = 1,
  scaleY = 1
) {
  return transformCanvasCommands(
    canvasCommands,
    (x) => x * scaleX,
    (y) => y * scaleY
  );
}
export function svgToDisplayContextCommands(
  svgString: string,
  options?: ParseSvgOptions
): DisplayContextCommand[] {
  options = { ...defaultParseSvgOptions, ...options };

  const displayCommands: DisplayContextCommand[] = [];

  const svgJson = parseSync(svgString);

  let canvasCommands = svgJsonToCanvasCommands(svgJson);
  _console.log("canvasCommands", canvasCommands);

  const boundingBox = getSvgJsonBoundingBox(svgJson);
  _console.log("boundingBox", boundingBox);

  let width = boundingBox.width;
  let height = boundingBox.height;

  if (options.fit) {
    const rangeHelper = {
      x: new RangeHelper(),
      y: new RangeHelper(),
    };
    forEachCanvasCommandVector2(canvasCommands, (x, y) => {
      rangeHelper.x.update(x);
      rangeHelper.y.update(y);
    });

    console.log("xRange", rangeHelper.x.min, rangeHelper.x.max);
    console.log("yRange", rangeHelper.y.min, rangeHelper.y.max);

    width = rangeHelper.x.span;
    height = rangeHelper.y.span;

    const offsetX = -rangeHelper.x.min;
    const offsetY = -rangeHelper.y.min;

    canvasCommands = offsetCanvasCommands(canvasCommands, offsetX, offsetY);
  }

  _console.log({ width, height });

  let scaleX = 1,
    scaleY = 1;
  if (options.width && options.height) {
    scaleX = options.width / width;
    scaleY = options.height / height;
  } else if (options.width) {
    scaleX = scaleY = options.width / width;
    if (options.aspectRatio) scaleY = scaleX / options.aspectRatio;
  } else if (options.height) {
    scaleX = scaleY = options.height / height;
    if (options.aspectRatio) scaleX = scaleY * options.aspectRatio;
  }

  _console.log({ scaleX, scaleY });

  if (scaleX !== 1 || scaleY !== 1) {
    canvasCommands = scaleCanvasCommands(canvasCommands, scaleX, scaleY);
  }

  if (options.offsetX || options.offsetY) {
    const offsetX = options.offsetX || 0;
    const offsetY = options.offsetY || 0;
    canvasCommands = offsetCanvasCommands(canvasCommands, offsetX, offsetY);
  }

  let curves: DisplayBezierCurve[] = [];
  let startPoint: Vector2 = { x: 0, y: 0 };

  const displayCommandObjects: {
    command: DisplayContextCommand;
    area: number;
    points: Vector2[];
  }[] = [];
  canvasCommands.forEach((canvasCommand) => {
    switch (canvasCommand.type) {
      case "moveTo":
        {
          const { x, y } = canvasCommand;
          startPoint.x = x;
          startPoint.y = y;
        }
        break;
      case "lineTo":
        {
          const { x, y } = canvasCommand;
          const controlPoints: Vector2[] = [{ x, y }];
          if (curves.length === 0) {
            controlPoints.unshift({ ...startPoint });
          }
          curves.push({ type: "segment", controlPoints });
        }
        break;
      case "quadraticCurveTo":
        {
          const { x, y, cpx, cpy } = canvasCommand;
          const controlPoints: Vector2[] = [
            { x: cpx, y: cpy },
            { x, y },
          ];
          if (curves.length === 0) {
            controlPoints.unshift({ ...startPoint });
          }
          curves.push({ type: "quadratic", controlPoints });
        }
        break;
      case "bezierCurveTo":
        {
          const { x, y, cp1x, cp1y, cp2x, cp2y } = canvasCommand;
          const controlPoints: Vector2[] = [
            { x: cp1x, y: cp1y },
            { x: cp2x, y: cp2y },
            { x, y },
          ];
          if (curves.length === 0) {
            controlPoints.unshift({ ...startPoint });
          }
          curves.push({ type: "cubic", controlPoints });
        }
        break;
      case "closePath":
        if (curves.length === 0) break;

        curves = simplifyCurves(curves);

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
      case "fillStyle":
        // FILL
        break;
      case "strokeStyle":
        // FILL
        break;
      case "lineWidth":
        // FILL
        break;
    }
  });

  if (displayCommandObjects.length > 0) {
    // displayCommandObjects.sort((a, b) => {
    //   return a.points.every((aPoint) => pointInPolygon(aPoint, b.points))
    //     ? 1
    //     : -1;
    // });

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

  return displayCommands;
}
