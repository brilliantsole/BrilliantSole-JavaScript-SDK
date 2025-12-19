import { createConsole } from "./Console.ts";
import {
  DisplayContextCommand,
  trimContextCommands,
} from "./DisplayContextCommand.ts";
import { INode, parseSync } from "svgson";
import { SVGPathData } from "svg-pathdata";
import { DisplayBezierCurve, DisplaySize } from "../DisplayManager.ts";
import { pointInPolygon, Vector2 } from "./MathUtils.ts";
import {
  contourArea,
  DisplaySprite,
  DisplaySpriteSheet,
  spriteLinesToSerializedLines,
  stringToSpriteLines,
} from "./DisplaySpriteSheetUtils.ts";
import { simplifyCurves } from "./PathUtils.ts";
import { DisplayBoundingBox } from "./DisplayCanvasHelper.ts";
import RangeHelper from "./RangeHelper.ts";
import { kMeansColors, mapToClosestPaletteIndex } from "./ColorUtils.ts";
import { DefaultDisplayContextState } from "./DisplayContextState.ts";
import { DisplayManagerInterface } from "./DisplayManagerInterface.ts";

const _console = createConsole("SvgUtils", { log: true });

type FillRule = "nonzero" | "evenodd";
type CanvasCommand =
  | { type: "lineWidth"; lineWidth: number }
  | { type: "fillStyle"; fillStyle: string }
  | { type: "strokeStyle"; strokeStyle: string }
  | { type: "fillRule"; fillRule: FillRule }
  | { type: "pathStart" | "pathEnd" }
  | { type: "moveTo" | "lineTo"; x: number; y: number }
  | { type: "line"; x1: number; y1: number; x2: number; y2: number }
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
  | { type: "closePath"; checkIfHole?: boolean }
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
    }
  | {
      type: "roundRect";
      x: number;
      y: number;
      width: number;
      height: number;
      r: number;
      rotation: number;
    }
  | { type: "circle"; x: number; y: number; r: number }
  | {
      type: "ellipse";
      x: number;
      y: number;
      rx: number;
      ry: number;
      rotation: number;
    }
  | {
      type: "text";
      text: string;
      x: number;
      y: number;
      fontFamily: string;
      fill: string;
      fontSize: string;
      fontStyle: string;
      fontWeight: string;
      stroke: string;
      strokeDasharray: string;
      strokeWidth: number;
    };

interface Transform {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

interface DecomposedTransform {
  translation: { x: number; y: number };
  rotation: number; // in radians
  scale: { x: number; y: number };
  skew: { x: number; y: number }; // skewX/Y in radians
  isScaleUniform: boolean; // true if scaleX ≈ scaleY
}

/** Fully decompose a 2D affine transform */
function decomposeTransform(
  t: Transform,
  tolerance = 1e-6
): DecomposedTransform {
  // Translation
  const tx = t.e;
  const ty = t.f;

  // Compute scale
  const scaleX = Math.sqrt(t.a * t.a + t.b * t.b);
  const scaleY = Math.sqrt(t.c * t.c + t.d * t.d);

  // Compute rotation (from X-axis)
  let rotation = 0;
  if (scaleX !== 0) {
    rotation = Math.atan2(t.b / scaleX, t.a / scaleX);
  }

  // Compute skew (skewX = angle between x and y axes)
  let skewX = 0;
  let skewY = 0;
  if (scaleX !== 0 && scaleY !== 0) {
    skewX = Math.atan2(t.a * t.c + t.b * t.d, scaleX * scaleX);
    skewY = 0; // rarely needed, can be calculated similarly if desired
  }

  // Uniform scale check
  const isScaleUniform = Math.abs(scaleX - scaleY) < tolerance;

  return {
    translation: { x: tx, y: ty },
    rotation,
    scale: { x: scaleX, y: scaleY },
    skew: { x: skewX, y: skewY },
    isScaleUniform,
  };
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
        //_console.log("translate", { x: args[0], y: args[1] });
        m.e = args[0];
        m.f = args[1] || 0;
        break;
      case "scale":
        //_console.log("scale", { x: args[0], y: args[1] });
        m.a = args[0];
        m.d = args[1] !== undefined ? args[1] : args[0];
        break;
      case "rotate":
        const angle = (args[0] * Math.PI) / 180;
        //_console.log("rotate", { angle });
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
        //_console.log("matrix", args);
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
function parseStyle(styleStr: string | undefined): Record<string, string> {
  const style: Record<string, string> = {};
  if (!styleStr) return style;

  styleStr.split(";").forEach((item) => {
    const [key, value] = item.split(":").map((s) => s.trim());
    if (key && value) style[key] = value;
  });
  return style;
}

const circleBezierConstant = 0.5522847498307936;
function svgJsonToCanvasCommands(svgJson: INode): CanvasCommand[] {
  const commands: CanvasCommand[] = [];

  function traverse(node: INode, parentTransform: Transform) {
    //_console.log("traversing node", node, parentTransform);
    const transform = parseTransform(node.attributes.transform);
    //_console.log("transform", transform);
    const nodeTransform = multiply(parentTransform, transform);
    //_console.log("nodeTransform", nodeTransform);

    const { scale, translation, rotation, isScaleUniform } =
      decomposeTransform(nodeTransform);
    //_console.log({ scale, translation, rotation, isScaleUniform });
    const uniformScale = scale.x;

    // Handle styles
    const style = parseStyle(node.attributes.style);
    if (style.fill) commands.push({ type: "fillStyle", fillStyle: style.fill });
    if (node.attributes.fill)
      commands.push({ type: "fillStyle", fillStyle: node.attributes.fill });

    // Stroke
    if (style.stroke)
      commands.push({ type: "strokeStyle", strokeStyle: style.stroke });
    if (node.attributes.stroke)
      commands.push({
        type: "strokeStyle",
        strokeStyle: node.attributes.stroke,
      });

    // Stroke width
    let strokeWidth = 0;
    if (style["stroke-width"])
      strokeWidth = parseLength(style["stroke-width"]) ?? 0;
    if (node.attributes["stroke-width"])
      strokeWidth = parseLength(node.attributes["stroke-width"]) ?? strokeWidth;
    if (strokeWidth)
      commands.push({
        type: "lineWidth",
        lineWidth: strokeWidth * nodeTransform.a, // scale to pixels
      });

    // Fill rule
    let fillRule = style["fill-rule"];
    if (node.attributes["fill-rule"]) fillRule = node.attributes["fill-rule"];
    if (fillRule)
      commands.push({ type: "fillRule", fillRule: fillRule as FillRule });

    switch (node.name) {
      case "path":
        const d = node.attributes.d;
        if (!d) break;
        const pathData = new SVGPathData(d)
          .toAbs()
          .aToC()
          .normalizeHVZ(false)
          .normalizeST()
          .removeCollinear()
          .sanitize();
        //_console.log("pathData", d, pathData);
        commands.push({ type: "pathStart" });
        for (const cmd of pathData.commands) {
          switch (cmd.type) {
            case SVGPathData.MOVE_TO:
              commands.push({ type: "closePath" });
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
            default:
              _console.warn("uncaught command", cmd);
              break;
          }
        }
        if (commands.at(-1)?.type != "closePath") {
          commands.push({ type: "closePath" });
        }
        commands.push({ type: "pathEnd" });

        break;

      case "rect": {
        const x = parseFloat(node.attributes.x || "0");
        const y = parseFloat(node.attributes.y || "0");
        const width = parseFloat(node.attributes.width || "0");
        const height = parseFloat(node.attributes.height || "0");

        let rx = parseFloat(node.attributes.rx || "0");
        let ry = parseFloat(node.attributes.ry || "0");
        if (!node.attributes.ry && rx) ry = rx;

        rx = Math.min(rx, width / 2);
        ry = Math.min(ry, height / 2);

        if (rx === 0 && ry === 0) {
          // sharp rect
          if (isScaleUniform) {
            const center = applyTransform(
              x + width / 2,
              y + height / 2,
              nodeTransform
            );
            commands.push({
              type: "rect",
              x: center.x,
              y: center.y,
              width: width * uniformScale,
              height: height * uniformScale,
              rotation,
            });
          } else {
            const tl = applyTransform(x, y, nodeTransform);
            const tr = applyTransform(x + width, y, nodeTransform);
            const br = applyTransform(x + width, y + height, nodeTransform);
            const bl = applyTransform(x, y + height, nodeTransform);

            commands.push({ type: "moveTo", x: tl.x, y: tl.y });
            commands.push({ type: "lineTo", x: tr.x, y: tr.y });
            commands.push({ type: "lineTo", x: br.x, y: br.y });
            commands.push({ type: "lineTo", x: bl.x, y: bl.y });
            commands.push({ type: "closePath" });
          }
        } else {
          // rounded rect
          if (rx == ry && isScaleUniform) {
            const center = applyTransform(
              x + width / 2,
              y + height / 2,
              nodeTransform
            );
            commands.push({
              type: "roundRect",
              x: center.x,
              y: center.y,
              width: width * uniformScale,
              height: height * uniformScale,
              rotation,
              r: rx * uniformScale,
            });
          } else {
            const ox = rx * circleBezierConstant; // x offset for control points
            const oy = ry * circleBezierConstant; // y offset for control points

            // Corners before transform
            const p1 = { x: x + rx, y: y };
            const p2 = { x: x + width - rx, y: y };
            const p3 = { x: x + width, y: y + ry };
            const p4 = { x: x + width, y: y + height - ry };
            const p5 = { x: x + width - rx, y: y + height };
            const p6 = { x: x + rx, y: y + height };
            const p7 = { x: x, y: y + height - ry };
            const p8 = { x: x, y: y + ry };

            // Move to start
            const start = applyTransform(p1.x, p1.y, nodeTransform);
            commands.push({ type: "moveTo", x: start.x, y: start.y });

            // Top edge + top-right corner
            let cp1 = applyTransform(p2.x + ox, p2.y, nodeTransform);
            let cp2 = applyTransform(p3.x, p3.y - oy, nodeTransform);
            let end = applyTransform(p3.x, p3.y, nodeTransform);
            commands.push({
              type: "lineTo",
              x: applyTransform(p2.x, p2.y, nodeTransform).x,
              y: applyTransform(p2.x, p2.y, nodeTransform).y,
            });
            commands.push({
              type: "bezierCurveTo",
              cp1x: cp1.x,
              cp1y: cp1.y,
              cp2x: cp2.x,
              cp2y: cp2.y,
              x: end.x,
              y: end.y,
            });

            // Right edge + bottom-right corner
            cp1 = applyTransform(p4.x, p4.y + oy, nodeTransform);
            cp2 = applyTransform(p5.x + ox, p5.y, nodeTransform);
            end = applyTransform(p5.x, p5.y, nodeTransform);
            commands.push({
              type: "lineTo",
              x: applyTransform(p4.x, p4.y, nodeTransform).x,
              y: applyTransform(p4.x, p4.y, nodeTransform).y,
            });
            commands.push({
              type: "bezierCurveTo",
              cp1x: cp1.x,
              cp1y: cp1.y,
              cp2x: cp2.x,
              cp2y: cp2.y,
              x: end.x,
              y: end.y,
            });

            // Bottom edge + bottom-left corner
            cp1 = applyTransform(p6.x - ox, p6.y, nodeTransform);
            cp2 = applyTransform(p7.x, p7.y + oy, nodeTransform);
            end = applyTransform(p7.x, p7.y, nodeTransform);
            commands.push({
              type: "lineTo",
              x: applyTransform(p6.x, p6.y, nodeTransform).x,
              y: applyTransform(p6.x, p6.y, nodeTransform).y,
            });
            commands.push({
              type: "bezierCurveTo",
              cp1x: cp1.x,
              cp1y: cp1.y,
              cp2x: cp2.x,
              cp2y: cp2.y,
              x: end.x,
              y: end.y,
            });

            // Left edge + top-left corner
            cp1 = applyTransform(p8.x, p8.y - oy, nodeTransform);
            cp2 = applyTransform(p1.x - ox, p1.y, nodeTransform);
            end = applyTransform(p1.x, p1.y, nodeTransform);
            commands.push({
              type: "lineTo",
              x: applyTransform(p8.x, p8.y, nodeTransform).x,
              y: applyTransform(p8.x, p8.y, nodeTransform).y,
            });
            commands.push({
              type: "bezierCurveTo",
              cp1x: cp1.x,
              cp1y: cp1.y,
              cp2x: cp2.x,
              cp2y: cp2.y,
              x: end.x,
              y: end.y,
            });

            commands.push({ type: "closePath" });
          }
        }
        break;
      }

      case "circle": {
        const cx = parseFloat(node.attributes.cx || "0");
        const cy = parseFloat(node.attributes.cy || "0");
        const r = parseFloat(node.attributes.r || "0");

        if (r === 0) break;

        if (isScaleUniform) {
          //_console.log({ cx, cy, r, uniformScale });
          const center = applyTransform(cx, cy, nodeTransform);
          commands.push({
            type: "circle",
            x: center.x,
            y: center.y,
            r: r * uniformScale,
          });
        } else {
          const ox = r * circleBezierConstant; // control point offset

          // Points around the circle
          const pTop = applyTransform(cx, cy - r, nodeTransform);
          const pRight = applyTransform(cx + r, cy, nodeTransform);
          const pBottom = applyTransform(cx, cy + r, nodeTransform);
          const pLeft = applyTransform(cx - r, cy, nodeTransform);
          //_console.log({ pTop, pRight, pBottom, pLeft });

          const cpTopRight = applyTransform(cx + ox, cy - r, nodeTransform);
          const cpRightTop = applyTransform(cx + r, cy - ox, nodeTransform);

          const cpRightBottom = applyTransform(cx + r, cy + ox, nodeTransform);
          const cpBottomRight = applyTransform(cx + ox, cy + r, nodeTransform);

          const cpBottomLeft = applyTransform(cx - ox, cy + r, nodeTransform);
          const cpLeftBottom = applyTransform(cx - r, cy + ox, nodeTransform);

          const cpLeftTop = applyTransform(cx - r, cy - ox, nodeTransform);
          const cpTopLeft = applyTransform(cx - ox, cy - r, nodeTransform);

          commands.push({ type: "moveTo", x: pTop.x, y: pTop.y });

          commands.push({
            type: "bezierCurveTo",
            cp1x: cpTopRight.x,
            cp1y: cpTopRight.y,
            cp2x: cpRightTop.x,
            cp2y: cpRightTop.y,
            x: pRight.x,
            y: pRight.y,
          });

          commands.push({
            type: "bezierCurveTo",
            cp1x: cpRightBottom.x,
            cp1y: cpRightBottom.y,
            cp2x: cpBottomRight.x,
            cp2y: cpBottomRight.y,
            x: pBottom.x,
            y: pBottom.y,
          });

          commands.push({
            type: "bezierCurveTo",
            cp1x: cpBottomLeft.x,
            cp1y: cpBottomLeft.y,
            cp2x: cpLeftBottom.x,
            cp2y: cpLeftBottom.y,
            x: pLeft.x,
            y: pLeft.y,
          });

          commands.push({
            type: "bezierCurveTo",
            cp1x: cpLeftTop.x,
            cp1y: cpLeftTop.y,
            cp2x: cpTopLeft.x,
            cp2y: cpTopLeft.y,
            x: pTop.x,
            y: pTop.y,
          });

          commands.push({ type: "closePath" });
        }
        break;
      }

      case "ellipse": {
        const cx = parseFloat(node.attributes.cx || "0");
        const cy = parseFloat(node.attributes.cy || "0");
        const rx = parseFloat(node.attributes.rx || "0");
        const ry = parseFloat(node.attributes.ry || "0");

        if (rx === 0 || ry === 0) break;

        if (isScaleUniform) {
          const center = applyTransform(cx, cy, nodeTransform);
          if (rx == ry) {
            commands.push({
              type: "circle",
              x: center.x,
              y: center.y,
              r: rx * uniformScale,
            });
          } else {
            commands.push({
              type: "ellipse",
              x: center.x,
              y: center.y,
              rx: rx * uniformScale,
              ry: ry * uniformScale,
              rotation,
            });
          }
        } else {
          const ox = rx * circleBezierConstant;
          const oy = ry * circleBezierConstant;

          // Key points
          const pTop = applyTransform(cx, cy - ry, nodeTransform);
          const pRight = applyTransform(cx + rx, cy, nodeTransform);
          const pBottom = applyTransform(cx, cy + ry, nodeTransform);
          const pLeft = applyTransform(cx - rx, cy, nodeTransform);

          // Control points
          const cpTopRight = applyTransform(cx + ox, cy - ry, nodeTransform);
          const cpRightTop = applyTransform(cx + rx, cy - oy, nodeTransform);

          const cpRightBottom = applyTransform(cx + rx, cy + oy, nodeTransform);
          const cpBottomRight = applyTransform(cx + ox, cy + ry, nodeTransform);

          const cpBottomLeft = applyTransform(cx - ox, cy + ry, nodeTransform);
          const cpLeftBottom = applyTransform(cx - rx, cy + oy, nodeTransform);

          const cpLeftTop = applyTransform(cx - rx, cy - oy, nodeTransform);
          const cpTopLeft = applyTransform(cx - ox, cy - ry, nodeTransform);

          // Draw ellipse using cubic Beziers
          commands.push({ type: "moveTo", x: pTop.x, y: pTop.y });

          commands.push({
            type: "bezierCurveTo",
            cp1x: cpTopRight.x,
            cp1y: cpTopRight.y,
            cp2x: cpRightTop.x,
            cp2y: cpRightTop.y,
            x: pRight.x,
            y: pRight.y,
          });

          commands.push({
            type: "bezierCurveTo",
            cp1x: cpRightBottom.x,
            cp1y: cpRightBottom.y,
            cp2x: cpBottomRight.x,
            cp2y: cpBottomRight.y,
            x: pBottom.x,
            y: pBottom.y,
          });

          commands.push({
            type: "bezierCurveTo",
            cp1x: cpBottomLeft.x,
            cp1y: cpBottomLeft.y,
            cp2x: cpLeftBottom.x,
            cp2y: cpLeftBottom.y,
            x: pLeft.x,
            y: pLeft.y,
          });

          commands.push({
            type: "bezierCurveTo",
            cp1x: cpLeftTop.x,
            cp1y: cpLeftTop.y,
            cp2x: cpTopLeft.x,
            cp2y: cpTopLeft.y,
            x: pTop.x,
            y: pTop.y,
          });

          commands.push({ type: "closePath" });
        }
        break;
      }

      case "polyline":
      case "polygon": {
        const pointsStr: string = node.attributes.points || "";
        const points: { x: number; y: number }[] = pointsStr
          .trim()
          .split(/[\s,]+/)
          .map(Number)
          .reduce<{ x?: number; y?: number }[]>((acc, val, idx) => {
            if (idx % 2 === 0) acc.push({ x: val, y: 0 });
            else acc[acc.length - 1].y = val;
            return acc;
          }, [])
          .map((p) => ({ x: p.x!, y: p.y! }));

        if (points.length === 0) break;

        // Move to first point
        const start = applyTransform(points[0].x, points[0].y, nodeTransform);
        commands.push({ type: "moveTo", x: start.x, y: start.y });

        // Draw lines to remaining points
        for (let i = 1; i < points.length; i++) {
          const p = applyTransform(points[i].x, points[i].y, nodeTransform);
          commands.push({ type: "lineTo", x: p.x, y: p.y });
        }

        // close path, even if polyline
        commands.push({ type: "closePath" });
        break;
      }

      case "line": {
        const x1 = parseFloat(node.attributes.x1 || "0");
        const y1 = parseFloat(node.attributes.y1 || "0");
        const x2 = parseFloat(node.attributes.x2 || "0");
        const y2 = parseFloat(node.attributes.y2 || "0");

        const p1 = applyTransform(x1, y1, nodeTransform);
        const p2 = applyTransform(x2, y2, nodeTransform);

        commands.push({ type: "line", x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });

        break;
      }
      case "svg":
      case "g":
        break;
      case "text":
        const text =
          node.children.find((child) => child.type == "text")?.value ?? "";

        const x = parseFloat(node.attributes.x || "0");
        const y = parseFloat(node.attributes.y || "0");
        const p = applyTransform(x, y, nodeTransform);
        const strokeWidth = parseFloat(node.attributes["stroke-width"] || "0");

        // console.log(node.attributes);

        const {
          "font-family": fontFamily,
          fill,
          "font-size": fontSize,
          "font-style": fontStyle,
          "font-weight": fontWeight,
          stroke,
          "stroke-dasharray": strokeDasharray,
        } = node.attributes;

        //_console.log({ text }, node.attributes);
        commands.push({
          type: "text",
          text,
          x: p.x,
          y: p.y,
          fontFamily,
          fill,
          fontSize,
          fontStyle,
          fontWeight,
          stroke,
          strokeDasharray,
          strokeWidth,
        });
        break;
      default:
        _console.log("uncaught node", node);
        break;
    }

    if (node.children && node.name != "text") {
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
  let width = parseLength(attrs.width);
  let height = parseLength(attrs.height);

  // Fallback to viewBox dimensions
  if ((width == null || height == null) && attrs.viewBox) {
    const [, , vbWidth, vbHeight] = attrs.viewBox
      .split(/[\s,]+/)
      .map(parseFloat);
    width ??= vbWidth;
    height ??= vbHeight;
  }

  const size: DisplaySize = {
    width: width ?? 300,
    height: height ?? 150,
  };
  //_console.log("size", size);
  return size;
}

function getSvgJsonViewBox(svgJson: INode): DisplayBoundingBox {
  const attrs = svgJson.attributes || {};
  let x = 0,
    y = 0,
    width: number | undefined,
    height: number | undefined;

  if (attrs.viewBox) {
    [x, y, width, height] = attrs.viewBox.split(/[\s,]+/).map(parseFloat);
  }

  // Fallback to size if no viewBox
  if (width == null || height == null) {
    const size = getSvgJsonSize(svgJson);
    width ??= size.width;
    height ??= size.height;
  }

  const viewBox: DisplayBoundingBox = {
    x,
    y,
    width: width!,
    height: height!,
  };
  //_console.log("viewBox", viewBox);
  return viewBox;
}

function getSvgJsonBoundingBox(svgJson: INode): DisplayBoundingBox {
  const { width, height } = getSvgJsonSize(svgJson);
  const viewBox = getSvgJsonViewBox(svgJson);

  if (width !== undefined && height !== undefined) {
    return { x: 0, y: 0, width, height };
  } else if (viewBox.width !== undefined && viewBox.height !== undefined) {
    return viewBox;
  } else {
    return { x: 0, y: 0, width: 300, height: 150 };
  }
}

function getSvgTransformToPixels(svgJson: INode): Transform {
  const attrs = svgJson.attributes || {};
  const { width, height } = getSvgJsonSize(svgJson); // in px
  const viewBox = getSvgJsonViewBox(svgJson); // { x, y, width, height }

  //_console.log({ width, height, viewBox });

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
  centered?: boolean;
  displayManager?: DisplayManagerInterface;
  includeText?: boolean;
};
const defaultParseSvgOptions: ParseSvgOptions = {
  fit: false,
  centered: true,
};

function transformCanvasCommands(
  canvasCommands: CanvasCommand[],
  xCallback: (x: number) => number,
  yCallback: (y: number) => number,
  type: "offset" | "scale"
): CanvasCommand[] {
  return canvasCommands.map((command) => {
    switch (command.type) {
      case "moveTo":
      case "lineTo": {
        let { x, y } = command;
        x = xCallback(x);
        y = yCallback(y);
        return { type: command.type, x, y };
        break;
      }
      case "quadraticCurveTo": {
        let { x, y, cpx, cpy } = command;
        x = xCallback(x);
        y = yCallback(y);
        cpx = xCallback(cpx);
        cpy = yCallback(cpy);
        return { type: command.type, x, y, cpx, cpy };
        break;
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
        break;
      }
      case "lineWidth": {
        if (type == "scale") {
          let { lineWidth } = command;
          lineWidth = xCallback(lineWidth);
          return { type: command.type, lineWidth };
        }
        break;
      }
      case "rect":
      case "roundRect": {
        let { x, y, width, height, rotation } = command;
        x = xCallback(x);
        y = yCallback(y);
        if (type == "scale") {
          width = xCallback(width);
          height = yCallback(height);
        }
        if (command.type == "roundRect") {
          let { r } = command;
          if (type == "scale") {
            r = xCallback(r);
          }
          return { type: command.type, x, y, width, height, rotation, r };
        }
        return { type: command.type, x, y, width, height, rotation };
        break;
      }
      case "circle":
        {
          let { x, y, r } = command;
          x = xCallback(x);
          y = yCallback(y);
          if (type == "scale") {
            r = xCallback(r);
          }
          return { type: command.type, x, y, r };
        }
        break;
      case "ellipse":
        {
          let { x, y, rx, ry, rotation } = command;
          x = xCallback(x);
          y = yCallback(y);
          if (type == "scale") {
            rx = xCallback(rx);
            ry = xCallback(ry);
          }
          return { type: command.type, x, y, rx, ry, rotation };
        }
        break;
      default:
        return command;
    }
    return command;
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
    (y) => y + offsetY,
    "offset"
  );
}
function scaleCanvasCommands(
  canvasCommands: CanvasCommand[],
  scaleX: number,
  scaleY: number
) {
  return transformCanvasCommands(
    canvasCommands,
    (x) => x * scaleX,
    (y) => y * scaleY,
    "scale"
  );
}

function getBoundingBox(path: Vector2[]) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of path) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

function bboxContains(
  a: ReturnType<typeof getBoundingBox>,
  b: ReturnType<typeof getBoundingBox>
) {
  return (
    a.minX <= b.minX && a.minY <= b.minY && a.maxX >= b.maxX && a.maxY >= b.maxY
  );
}

export function classifySubpath(
  subpath: Vector2[],
  previous: { path: Vector2[]; isHole: boolean }[],
  fillRule: FillRule
): boolean {
  const centroid = subpath.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );
  centroid.x /= subpath.length;
  centroid.y /= subpath.length;

  const subBBox = getBoundingBox(subpath);

  let insideCount = 0;

  for (const other of previous) {
    const otherBBox = getBoundingBox(other.path);

    // must be fully inside bbox
    if (!bboxContains(otherBBox, subBBox)) continue;

    // require *most* points to be inside
    const insidePoints = subpath.filter((p) =>
      pointInPolygon(p, other.path)
    ).length;
    const allInside = insidePoints > subpath.length * 0.8;
    if (!allInside) continue;

    insideCount++;
  }

  if (fillRule === "evenodd") {
    return insideCount % 2 === 1; // odd count = hole
  } else {
    // non-zero winding rule
    let winding = 0;
    for (const other of previous) {
      const otherBBox = getBoundingBox(other.path);
      if (!bboxContains(otherBBox, subBBox)) continue;
      if (pointInPolygon(centroid, other.path)) {
        winding += contourArea(other.path) > 0 ? 1 : -1;
      }
    }
    return winding !== 0; // nonzero = inside → hole
  }
}

const SVG_XMLNS = "http://www.w3.org/2000/svg";

export async function getSvgString(input: string): Promise<string> {
  const trimmed = input.trim();

  // If it's not markup, fetch it
  const svgText = trimmed.startsWith("<svg") ? trimmed : await fetchSvg(input);

  console.log("svgText", svgText);
  return ensureSvgXmlns(svgText);
}

async function fetchSvg(pathOrUrl: string): Promise<string> {
  const res = await fetch(pathOrUrl);

  if (!res.ok) {
    throw new Error(`Failed to load SVG: ${pathOrUrl}`);
  }

  return await res.text();
}

function ensureSvgXmlns(svgText: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");

  const svg = doc.documentElement;

  if (svg.tagName.toLowerCase() !== "svg") {
    throw new Error("Invalid SVG");
  }

  if (!svg.hasAttribute("xmlns")) {
    svg.setAttribute("xmlns", SVG_XMLNS);
  }

  return new XMLSerializer().serializeToString(svg);
}

export async function svgToDisplayContextCommands(
  svgString: string,
  numberOfColors: number,
  paletteOffset: number,
  colors?: string[],
  options?: ParseSvgOptions
) {
  svgString = await getSvgString(svgString);

  _console.assertWithError(
    numberOfColors > 1,
    "numberOfColors must be greater than 1"
  );
  options = { ...defaultParseSvgOptions, ...options };
  _console.log("options", options);

  const svgJson = parseSync(svgString);

  let canvasCommands = svgJsonToCanvasCommands(svgJson);
  _console.log("canvasCommands", canvasCommands);

  const boundingBox = getSvgJsonBoundingBox(svgJson);
  _console.log("boundingBox", boundingBox);

  let intrinsicWidth = boundingBox.width;
  let intrinsicHeight = boundingBox.height;

  _console.log({ intrinsicWidth, intrinsicHeight });

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

  let width = Math.ceil(intrinsicWidth * scaleX);
  let height = Math.ceil(intrinsicHeight * scaleY);

  _console.log({ width, height });

  if (scaleX !== 1 || scaleY !== 1) {
    canvasCommands = scaleCanvasCommands(canvasCommands, scaleX, scaleY);
  }

  if (options.fit) {
    const rangeHelper = {
      x: new RangeHelper(),
      y: new RangeHelper(),
    };
    forEachCanvasCommandVector2(canvasCommands, (x, y) => {
      rangeHelper.x.update(x);
      rangeHelper.y.update(y);
    });

    // _console.log("xRange", rangeHelper.x.min, rangeHelper.x.max);
    // _console.log("yRange", rangeHelper.y.min, rangeHelper.y.max);

    width = rangeHelper.x.span;
    height = rangeHelper.y.span;

    const offsetX = -rangeHelper.x.min;
    const offsetY = -rangeHelper.y.min;

    canvasCommands = offsetCanvasCommands(canvasCommands, offsetX, offsetY);
  }

  if (options.offsetX || options.offsetY) {
    const offsetX = options.offsetX || 0;
    const offsetY = options.offsetY || 0;
    canvasCommands = offsetCanvasCommands(canvasCommands, offsetX, offsetY);
  }

  if (options.centered) {
    const offsetX = -width / 2;
    const offsetY = -height / 2;
    canvasCommands = offsetCanvasCommands(canvasCommands, offsetX, offsetY);
  }

  let svgColors: string[] = [];
  canvasCommands.forEach((canvasCommand) => {
    let color: string | undefined;
    switch (canvasCommand.type) {
      case "fillStyle":
        color = canvasCommand.fillStyle;
        break;
      case "strokeStyle":
        color = canvasCommand.strokeStyle;
        break;
      default:
        return;
    }
    if (color && color != "none" && !svgColors.includes(color)) {
      svgColors.push(color);
    }
  });
  if (svgColors.length == 0) {
    svgColors.push("black");
  }
  if (svgColors.length == 1) {
    svgColors.push("white");
  }
  _console.log("colors", svgColors);

  const colorToIndex: Record<string, number> = {};
  if (colors) {
    colors = colors.slice(0, numberOfColors);
    const mapping = mapToClosestPaletteIndex(svgColors, colors.slice(1));
    _console.log("mapping", mapping, colors);
    svgColors.forEach((color) => {
      colorToIndex[color] = mapping[color] + 1;
    });
  } else {
    // FIX - annoying when an svg has a black fill
    const { palette, mapping } = kMeansColors(svgColors, numberOfColors);
    _console.log("mapping", mapping);
    _console.log("palette", palette);

    svgColors.forEach((color) => {
      colorToIndex[color] = mapping[color];
    });
    colors = palette;
  }
  _console.log("colorToIndex", colorToIndex);

  _console.log("transformed canvasCommands", canvasCommands);

  let curves: DisplayBezierCurve[] = [];
  let startPoint: Vector2 = { x: 0, y: 0 };
  let fillRule: FillRule = "nonzero";
  let fillStyle: string | undefined;
  let strokeStyle = "none";
  let lineWidth = 1;
  let segmentRadius = 1;
  let wasHole = false;
  let ignoreFill = false;
  let ignoreLine = true;
  let fillColorIndex = 1;
  let lineColorIndex = 1;
  const getFillColorIndex = () => fillColorIndex + paletteOffset;
  const getLineColorIndex = () => lineColorIndex + paletteOffset;
  let isDrawingPath = false;
  const parsedPaths: { path: Vector2[]; isHole: boolean }[] = [];

  let displayCommands: DisplayContextCommand[] = [];
  displayCommands.push({
    type: "selectFillColor",
    fillColorIndex: getFillColorIndex(),
  });
  displayCommands.push({
    type: "selectLineColor",
    lineColorIndex: getLineColorIndex(),
  });
  displayCommands.push({ type: "setIgnoreLine", ignoreLine: true });
  displayCommands.push({ type: "setLineWidth", lineWidth });
  displayCommands.push({
    type: "setSegmentRadius",
    segmentRadius,
  });

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
        controlPoints.forEach((controlPoint) => {
          controlPoint.x = Math.round(controlPoint.x);
          controlPoint.y = Math.round(controlPoint.y);
        });

        if (isDrawingPath) {
          const isHole = classifySubpath(controlPoints, parsedPaths, fillRule);
          parsedPaths.push({ path: controlPoints, isHole });

          // _console.log({
          //   pathIndex: parsedPaths.length - 1,
          //   isHole,
          //   fillStyle,
          //   strokeStyle,
          //   fillRule,
          //   lineWidth,
          // });

          if (isHole != wasHole) {
            wasHole = isHole;
            if (isHole) {
              displayCommands.push({
                type: "selectFillColor",
                fillColorIndex: 0,
              });
            } else {
              displayCommands.push({
                type: "selectFillColor",
                fillColorIndex: getFillColorIndex(),
              });
            }
          }
        }

        if (ignoreFill) {
          displayCommands.push({
            type: "setLineWidth",
            lineWidth: 0,
          });
          displayCommands.push({
            type: "selectFillColor",
            fillColorIndex: getLineColorIndex(),
          });
          displayCommands.push({
            type: "setIgnoreFill",
            ignoreFill: false,
          });
        }

        const isSegments = curves.every((c) => c.type === "segment");
        if (isSegments) {
          if (ignoreFill) {
            displayCommands.push({
              type: "drawSegments",
              points: controlPoints,
            });
          } else {
            displayCommands.push({
              type: "drawPolygon",
              points: controlPoints,
            });
          }
        } else {
          if (ignoreFill) {
            displayCommands.push({ type: "drawPath", curves });
          } else {
            displayCommands.push({ type: "drawClosedPath", curves });
          }
        }

        if (ignoreFill) {
          displayCommands.push({
            type: "setLineWidth",
            lineWidth,
          });
          displayCommands.push({
            type: "selectFillColor",
            fillColorIndex: getFillColorIndex(),
          });
          displayCommands.push({
            type: "setIgnoreFill",
            ignoreFill,
          });
        }

        // Reset curves
        curves = [];
        break;
      case "pathStart":
        parsedPaths.length = 0;
        if (wasHole) {
          displayCommands.push({ type: "selectFillColor", fillColorIndex });
        }
        wasHole = false;
        isDrawingPath = true;
        break;
      case "pathEnd":
        isDrawingPath = false;
        break;
      case "line":
        if (strokeStyle != "none") {
          displayCommands.push({
            type: "setLineWidth",
            lineWidth: 0,
          });
          displayCommands.push({
            type: "selectFillColor",
            fillColorIndex: getLineColorIndex(),
          });
          displayCommands.push({
            type: "setIgnoreFill",
            ignoreFill: false,
          });

          const { x1, y1, x2, y2 } = canvasCommand;
          displayCommands.push({
            type: "drawSegment",
            startX: x1,
            startY: y1,
            endX: x2,
            endY: y2,
          });

          displayCommands.push({
            type: "setLineWidth",
            lineWidth,
          });
          displayCommands.push({
            type: "selectFillColor",
            fillColorIndex: getFillColorIndex(),
          });
          displayCommands.push({
            type: "setIgnoreFill",
            ignoreFill,
          });
        }

        break;
      case "fillStyle":
        //_console.log("fillStyle", canvasCommand.fillStyle);
        const newIgnoreFill = canvasCommand.fillStyle == "none";
        if (
          fillStyle != canvasCommand.fillStyle ||
          ignoreFill != newIgnoreFill
        ) {
          if (ignoreFill != newIgnoreFill) {
            ignoreFill = newIgnoreFill;
            //_console.log({ ignoreFill });
            displayCommands.push({ type: "setIgnoreFill", ignoreFill });
          }
          if (!ignoreFill) {
            if (fillStyle != canvasCommand.fillStyle) {
              fillStyle = canvasCommand.fillStyle;
              if (fillColorIndex != colorToIndex[fillStyle]) {
                _console.log({ fillColorIndex });
                fillColorIndex = colorToIndex[fillStyle];
                displayCommands.push({
                  type: "selectFillColor",
                  fillColorIndex: getFillColorIndex(),
                });
              }
            }
          }
        }
        break;
      case "strokeStyle":
        //_console.log("strokeStyle", canvasCommand.strokeStyle);
        const newIgnoreLine = canvasCommand.strokeStyle == "none";
        if (
          strokeStyle != canvasCommand.strokeStyle ||
          ignoreLine != newIgnoreLine
        ) {
          if (ignoreLine != newIgnoreLine) {
            ignoreLine = newIgnoreLine;
            //_console.log({ ignoreLine });
            displayCommands.push({ type: "setIgnoreLine", ignoreLine });
          }
          if (!ignoreLine) {
            if (strokeStyle != canvasCommand.strokeStyle) {
              strokeStyle = canvasCommand.strokeStyle;
              if (lineColorIndex != colorToIndex[strokeStyle]) {
                //_console.log({ lineColorIndex });
                lineColorIndex = colorToIndex[strokeStyle];
                displayCommands.push({
                  type: "selectLineColor",
                  lineColorIndex: getLineColorIndex(),
                });
              }
            }
          }
        }
        break;
      case "lineWidth":
        if (lineWidth != canvasCommand.lineWidth) {
          lineWidth = canvasCommand.lineWidth;
          lineWidth = Math.ceil(lineWidth);
          displayCommands.push({ type: "setLineWidth", lineWidth });
          segmentRadius = lineWidth / 2;
          segmentRadius = Math.ceil(segmentRadius);
          displayCommands.push({
            type: "setSegmentRadius",
            segmentRadius,
          });
        }
        break;
      case "fillRule":
        fillRule = canvasCommand.fillRule;
        break;
      case "rect":
        {
          let { x, y, width, height, rotation } = canvasCommand;
          x = Math.round(x);
          y = Math.round(y);
          width = Math.round(width);
          height = Math.round(height);
          rotation = Math.round(rotation);
          displayCommands.push({
            type: "setRotation",
            rotation,
            isRadians: true,
          });
          displayCommands.push({
            type: "drawRect",
            offsetX: x,
            offsetY: y,
            width: width,
            height: height,
          });
        }
        break;
      case "roundRect":
        {
          let { x, y, width, height, rotation, r } = canvasCommand;
          x = Math.round(x);
          y = Math.round(y);
          width = Math.round(width);
          height = Math.round(height);
          rotation = Math.round(rotation);
          r = Math.round(r);
          displayCommands.push({
            type: "setRotation",
            rotation,
            isRadians: true,
          });
          displayCommands.push({
            type: "drawRoundRect",
            offsetX: x,
            offsetY: y,
            width: width,
            height: height,
            borderRadius: r,
          });
        }
        break;
      case "circle":
        {
          let { x, y, r } = canvasCommand;
          x = Math.round(x);
          y = Math.round(y);
          r = Math.round(r);
          displayCommands.push({
            type: "drawCircle",
            offsetX: x,
            offsetY: y,
            radius: r,
          });
        }
        break;
      case "ellipse":
        {
          let { x, y, rx, ry, rotation } = canvasCommand;
          x = Math.round(x);
          y = Math.round(y);
          width = Math.round(width);
          height = Math.round(height);
          rotation = Math.round(rotation);
          rx = Math.round(rx);
          ry = Math.round(ry);
          displayCommands.push({
            type: "setRotation",
            rotation,
            isRadians: true,
          });
          displayCommands.push({
            type: "drawEllipse",
            offsetX: x,
            offsetY: y,
            radiusX: rx,
            radiusY: ry,
          });
        }
        break;
      case "text":
        if (options.includeText && options.displayManager) {
          const { displayManager } = options;
          let { x, y, strokeWidth } = canvasCommand;
          const { text, fontSize, fill, stroke } = canvasCommand;
          x = Math.round(x);
          y = Math.round(y);
          strokeWidth = Math.round(strokeWidth);

          //_console.log({ text, x, y, fontSize, fill, stroke, strokeWidth });

          // FIX
          displayCommands.push({
            type: "setSpritesLineHeight",
            spritesLineHeight: displayManager.contextState.spritesLineHeight,
          });
          displayCommands.push({
            type: "setHorizontalAlignment",
            horizontalAlignment: "start",
          });
          displayCommands.push({
            type: "setVerticalAlignment",
            verticalAlignment: "end",
          });
          displayCommands.push({
            type: "setSpritesAlignment",
            spritesAlignment: "end",
          });
          displayCommands.push({
            type: "setSpritesLineAlignment",
            spritesLineAlignment: "start",
          });
          // displayCommands.push({
          //   type: "setSpriteScaleX",
          //   spriteScaleX: scaleX,
          // });
          // displayCommands.push({
          //   type: "setSpriteScaleY",
          //   spriteScaleY: scaleY,
          // });
          const spriteLines = stringToSpriteLines(
            text,
            displayManager.spriteSheets,
            DefaultDisplayContextState
          );
          displayCommands.push({
            type: "drawSprites",
            offsetX: Math.round(x - width / 2),
            offsetY: Math.round(y - height / 2),
            spriteSerializedLines: spriteLinesToSerializedLines(
              displayManager,
              spriteLines
            ),
          });
          displayCommands.push({
            type: "resetSpriteScale",
          });
          displayCommands.push({
            type: "resetAlignment",
          });
        }
        break;
      default:
        _console.warn("uncaught canvasCommand", canvasCommand);
        break;
    }
  });

  displayCommands = trimContextCommands(displayCommands);

  _console.log("displayCommands", displayCommands);
  _console.log("colors", colors);
  return { commands: displayCommands, colors, width, height };
}

export async function svgToSprite(
  svgString: string,
  spriteName: string,
  numberOfColors: number,
  paletteName: string,
  overridePalette: boolean,
  spriteSheet: DisplaySpriteSheet,
  paletteOffset = 0,
  options?: ParseSvgOptions
) {
  options = { ...defaultParseSvgOptions, ...options };
  _console.log("options", options, { overridePalette });

  let palette = spriteSheet.palettes?.find(
    (palette) => palette.name == paletteName
  );
  if (!palette) {
    palette = {
      name: paletteName,
      numberOfColors,
      colors: new Array(numberOfColors).fill("#000000"),
    };
    spriteSheet.palettes = spriteSheet.palettes || [];
    spriteSheet.palettes?.push(palette);
  }
  _console.log("pallete", palette);

  const { commands, colors, width, height } = await svgToDisplayContextCommands(
    svgString,
    numberOfColors,
    paletteOffset,
    !overridePalette ? palette.colors : undefined,
    options
  );

  const sprite: DisplaySprite = {
    name: spriteName,
    width,
    height,
    paletteSwaps: [],
    commands,
  };
  if (overridePalette) {
    _console.log("overriding palette", colors);
    colors.forEach((color, index) => {
      palette.colors[index + paletteOffset] = color;
    });
  }

  const spriteIndex = spriteSheet.sprites.findIndex(
    (sprite) => sprite.name == spriteName
  );
  if (spriteIndex == -1) {
    spriteSheet.sprites.push(sprite);
  } else {
    _console.log(`overwriting spriteInde ${spriteIndex}`);
    spriteSheet.sprites[spriteIndex] = sprite;
  }

  return sprite;
}

export async function svgToSpriteSheet(
  svgString: string,
  spriteSheetName: string,
  numberOfColors: number,
  paletteName: string,
  options?: ParseSvgOptions
) {
  const spriteSheet: DisplaySpriteSheet = {
    name: spriteSheetName,
    palettes: [],
    paletteSwaps: [],
    sprites: [],
  };

  await svgToSprite(
    svgString,
    "svg",
    numberOfColors,
    paletteName,
    true,
    spriteSheet,
    0,
    options
  );

  return spriteSheet;
}

export function getSvgStringFromDataUrl(string: string) {
  if (!string.startsWith("data:image/svg+xml"))
    throw new Error("Not a data URL");

  // Data URL might be base64 or URI encoded
  const data = string.split(",")[1];
  if (string.includes("base64")) {
    return atob(data);
  } else {
    return decodeURIComponent(data);
  }
}

export function isValidSVG(svgString: string) {
  if (typeof svgString !== "string") return false;
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");

  // Different browsers may put parser errors in different places; check several ways:
  if (
    doc.querySelector("parsererror") ||
    doc.getElementsByTagName("parsererror").length > 0
  ) {
    return false;
  }

  const root = doc.documentElement;
  return !!root && root.nodeName.toLowerCase() === "svg";
}
