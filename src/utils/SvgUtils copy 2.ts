import { createConsole } from "./Console.ts";
import { DisplayContextCommand } from "./DisplayContextCommand.ts";
import { parseSync } from "svgson";
import { SVGPathData } from "svg-pathdata";
import { DisplayBezierCurve } from "../DisplayManager.ts";
import { pointInPolygon, Vector2 } from "./MathUtils.ts";
import { contourArea } from "./DisplaySpriteSheetUtils.ts";

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

  let matrix = identity;

  for (const part of t) {
    const [, fn, argsStr] = /(\w+)\(([^)]+)\)/.exec(part)!;
    const args = argsStr.split(/[\s,]+/).map(Number);
    let m: Transform = identity;

    switch (fn) {
      case "translate":
        m.e = args[0];
        m.f = args[1] || 0;
        break;
      case "scale":
        m.a = args[0];
        m.d = args[1] !== undefined ? args[1] : args[0];
        break;
      case "rotate":
        const angle = (args[0] * Math.PI) / 180;
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
        [m.a, m.b, m.c, m.d, m.e, m.f] = args;
        break;
    }

    matrix = multiply(matrix, m);
  }

  return matrix;
}

function applyTransform(x: number, y: number, t: Transform) {
  _console.log("applying transform", { x, y, t });
  const value: Vector2 = {
    x: t.a * x + t.c * y + t.e,
    y: t.b * x + t.d * y + t.f,
  };
  _console.log("transformed value", value);
  return value;
}

function svgToCanvasCommands(svgString: string): CanvasCommand[] {
  const svgJson = parseSync(svgString);
  const commands: CanvasCommand[] = [];

  function traverse(node: any, parentTransform: Transform) {
    _console.log("traversing node", node, parentTransform);

    const nodeTransform = multiply(
      parentTransform,
      parseTransform(node.attributes.transform)
    );

    _console.log("nodeTransform", nodeTransform);

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

  traverse(svgJson, identity);
  return commands;
}

export type ParseSvgOptions = {
  crop?: boolean; // removes extra empty space around the shapes
  width?: number; // scale output to this width
  height?: number; // scale output to this height
  aspectRatio?: number; // width / height, used if only one of width/height is provided
};

export function svgToDisplayContextCommands(
  svgString: string,
  options?: ParseSvgOptions
): DisplayContextCommand[] {
  const displayCommands: DisplayContextCommand[] = [];

  let canvasCommands = svgToCanvasCommands(svgString);
  _console.log("canvasCommands", canvasCommands);

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
        startPoint.x = canvasCommand.x;
        startPoint.y = canvasCommand.x;
        break;
      case "lineTo":
        {
          const controlPoints: Vector2[] = [
            { x: canvasCommand.x, y: canvasCommand.y },
          ];
          if (curves.length === 0) {
            controlPoints.unshift({ ...startPoint });
          }
          curves.push({ type: "segment", controlPoints });
        }
        break;
      case "quadraticCurveTo":
        {
          const controlPoints: Vector2[] = [
            { x: canvasCommand.cpx, y: canvasCommand.cpy },
            { x: canvasCommand.x, y: canvasCommand.y },
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
            { x: canvasCommand.cp1x, y: canvasCommand.cp1y },
            { x: canvasCommand.cp2x, y: canvasCommand.cp2y },
            { x: canvasCommand.x, y: canvasCommand.y },
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
