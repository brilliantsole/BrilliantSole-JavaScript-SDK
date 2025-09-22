import { createConsole } from "./Console.ts";
import opentype from "opentype.js";
import { Vector2 } from "./MathUtils.ts";

const _console = createConsole("PathUtils", { log: false });

type PathCommand = opentype.PathCommand;

function perpendicularDistance(p: Vector2, p1: Vector2, p2: Vector2): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  if (dx === 0 && dy === 0) return Math.hypot(p.x - p1.x, p.y - p1.y);
  const t = ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / (dx * dx + dy * dy);
  const projX = p1.x + t * dx;
  const projY = p1.y + t * dy;
  return Math.hypot(p.x - projX, p.y - projY);
}

function rdp(points: Vector2[], epsilon: number): Vector2[] {
  if (points.length < 3) return points;
  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(
      points[i],
      points[0],
      points[points.length - 1]
    );
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist > epsilon) {
    const left = rdp(points.slice(0, index + 1), epsilon);
    const right = rdp(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[points.length - 1]];
}

// Linear interpolation
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Sample quadratic Bezier
function sampleQuadratic(
  p0: Vector2,
  p1: Vector2,
  p2: Vector2,
  steps: number = 5
): Vector2[] {
  const points: Vector2[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x;
    const y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y;
    points.push({ x, y });
  }
  return points;
}

// Sample cubic Bezier
function sampleCubic(
  p0: Vector2,
  p1: Vector2,
  p2: Vector2,
  p3: Vector2,
  steps: number = 5
): Vector2[] {
  const points: Vector2[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const x =
      mt ** 3 * p0.x +
      3 * mt ** 2 * t * p1.x +
      3 * mt * t ** 2 * p2.x +
      t ** 3 * p3.x;
    const y =
      mt ** 3 * p0.y +
      3 * mt ** 2 * t * p1.y +
      3 * mt * t ** 2 * p2.y +
      t ** 3 * p3.y;
    points.push({ x, y });
  }
  return points;
}

function areCollinear(
  p1: Vector2,
  p2: Vector2,
  p3: Vector2,
  epsilon = 1e-6
): boolean {
  // Vector p1->p2
  const dx1 = p2.x - p1.x;
  const dy1 = p2.y - p1.y;

  // Vector p2->p3
  const dx2 = p3.x - p2.x;
  const dy2 = p3.y - p2.y;

  // Cross product
  const cross = dx1 * dy2 - dy1 * dx2;
  return Math.abs(cross) < epsilon;
}

export function simplifyPath(
  commands: PathCommand[],
  epsilon = 1
): PathCommand[] {
  const simplified: PathCommand[] = [];
  let cursor: Vector2 = { x: 0, y: 0 };

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];

    switch (cmd.type) {
      case "M":
        simplified.push({ ...cmd });
        cursor = { x: cmd.x, y: cmd.y };
        break;

      case "L": {
        // Merge collinear lines
        const nextPoint = { x: cmd.x, y: cmd.y };
        const lastCmd = simplified[simplified.length - 1];
        if (
          lastCmd &&
          lastCmd.type === "L" &&
          simplified.length >= 2 &&
          areCollinear(
            simplified[simplified.length - 2] as Vector2,
            lastCmd as Vector2,
            nextPoint
          )
        ) {
          // Remove middle collinear point
          simplified.pop();
        }
        simplified.push({ ...cmd });
        cursor = nextPoint;
        break;
      }

      case "Q": {
        const p0 = cursor;
        const p1 = { x: cmd.x1, y: cmd.y1 };
        const p2 = { x: cmd.x, y: cmd.y };

        // Sample points along the curve
        const sampled = sampleQuadratic(p0, p1, p2, 5);
        const simplifiedPoints = rdp(sampled, epsilon);

        // If curve is almost straight, convert to a line
        if (simplifiedPoints.length === 2) {
          simplified.push({ type: "L", x: p2.x, y: p2.y });
        } else {
          simplified.push({ ...cmd }); // Keep the curve
        }
        cursor = p2;
        break;
      }

      case "C": {
        const p0 = cursor;
        const p1 = { x: cmd.x1, y: cmd.y1 };
        const p2 = { x: cmd.x2, y: cmd.y2 };
        const p3 = { x: cmd.x, y: cmd.y };

        const sampled = sampleCubic(p0, p1, p2, p3, 5);
        const simplifiedPoints = rdp(sampled, epsilon);

        if (simplifiedPoints.length === 2) {
          simplified.push({ type: "L", x: p3.x, y: p3.y });
        } else {
          simplified.push({ ...cmd }); // Keep the curve
        }
        cursor = p3;
        break;
      }

      case "Z":
        simplified.push({ ...cmd });
        break;
    }
  }

  return simplified;
}
