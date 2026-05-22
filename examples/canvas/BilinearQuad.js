import * as three from "../utils/three/three.module.min.js";

const EPSILON = 1e-6;

export class BilinearQuad {
  constructor() {
    /** @type {three.Vector2[]} */
    this.points = [];
  }

  // --------------------------------------------------
  // PUBLIC
  // --------------------------------------------------

  addControlPoint(point) {
    const p = point.clone();

    // fewer than 4 → always add
    if (this.points.length < 4) {
      this.points.push(p);

      if (this.points.length >= 3) {
        this.points = this.#sortQuadPoints(this.#convexHull(this.points));
      }

      return true;
    }

    // test hull expansion
    const candidate = [...this.points, p];
    const hull = this.#convexHull(candidate);

    // if new point not on hull → reject
    const includesNewPoint = hull.some(
      (h) => Math.abs(h.x - p.x) < EPSILON && Math.abs(h.y - p.y) < EPSILON,
    );

    if (!includesNewPoint) {
      return false;
    }

    // only accept convex quads
    if (hull.length === 4) {
      this.points = this.#sortQuadPoints(hull);
      return true;
    }

    return false;
  }

  getControlPoints() {
    return this.points.map((p) => p.clone());
  }

  clear() {
    this.points.length = 0;
  }

  isReady() {
    return this.points.length === 4;
  }

  // --------------------------------------------------
  // BILINEAR MAP
  // --------------------------------------------------

  mapUV(u, v) {
    if (!this.isReady()) {
      return new THREE.Vector2(u, v);
    }

    const p00 = this.points[0];
    const p10 = this.points[1];
    const p11 = this.points[2];
    const p01 = this.points[3];

    const result = new THREE.Vector2();

    result.addScaledVector(p00, (1 - u) * (1 - v));

    result.addScaledVector(p10, u * (1 - v));

    result.addScaledVector(p01, (1 - u) * v);

    result.addScaledVector(p11, u * v);

    return result;
  }

  // --------------------------------------------------
  // INVERSE BILINEAR MAP
  // --------------------------------------------------

  inverseMap(point, clamp = true) {
    if (!this.isReady()) {
      return point.clone();
    }

    let u = 0.5;
    let v = 0.5;

    for (let i = 0; i < 20; i++) {
      const p = this.mapUV(u, v);

      const errorX = p.x - point.x;
      const errorY = p.y - point.y;

      if (Math.abs(errorX) < 1e-6 && Math.abs(errorY) < 1e-6) {
        break;
      }

      const p00 = this.points[0];
      const p10 = this.points[1];
      const p11 = this.points[2];
      const p01 = this.points[3];

      const du = new THREE.Vector2()
        .addScaledVector(p00, -(1 - v))
        .addScaledVector(p10, 1 - v)
        .addScaledVector(p01, -v)
        .addScaledVector(p11, v);

      const dv = new THREE.Vector2()
        .addScaledVector(p00, -(1 - u))
        .addScaledVector(p10, -u)
        .addScaledVector(p01, 1 - u)
        .addScaledVector(p11, u);

      const det = du.x * dv.y - du.y * dv.x;

      if (Math.abs(det) < 1e-8) {
        break;
      }

      const invDet = 1 / det;

      const stepU = (dv.y * errorX - dv.x * errorY) * invDet;

      const stepV = (-du.y * errorX + du.x * errorY) * invDet;

      u -= stepU;
      v -= stepV;

      if (clamp) {
        u = THREE.MathUtils.clamp(u, 0, 1);
        v = THREE.MathUtils.clamp(v, 0, 1);
      }
    }

    return new THREE.Vector2(u, v);
  }

  // --------------------------------------------------
  // PRIVATE
  // --------------------------------------------------

  #cross2(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  }

  #polygonArea(points) {
    let area = 0;

    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];

      area += a.x * b.y - a.y * b.x;
    }

    return area * 0.5;
  }

  #convexHull(points) {
    if (points.length <= 1) {
      return [...points];
    }

    const sorted = [...points].sort((a, b) => {
      if (a.x !== b.x) {
        return a.x - b.x;
      }

      return a.y - b.y;
    });

    const lower = [];

    for (const p of sorted) {
      while (
        lower.length >= 2 &&
        this.#cross2(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
      ) {
        lower.pop();
      }

      lower.push(p);
    }

    const upper = [];

    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i];

      while (
        upper.length >= 2 &&
        this.#cross2(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
      ) {
        upper.pop();
      }

      upper.push(p);
    }

    lower.pop();
    upper.pop();

    return lower.concat(upper);
  }

  #sortQuadPoints(points) {
    const center = new THREE.Vector2();

    for (const p of points) {
      center.add(p);
    }

    center.multiplyScalar(1 / points.length);

    let topLeft = null;
    let topRight = null;
    let bottomRight = null;
    let bottomLeft = null;

    for (const p of points) {
      const left = p.x < center.x;
      const top = p.y < center.y;

      if (left && top) {
        topLeft = p;
      } else if (!left && top) {
        topRight = p;
      } else if (!left && !top) {
        bottomRight = p;
      } else {
        bottomLeft = p;
      }
    }

    // fallback if classification failed
    if (!topLeft || !topRight || !bottomRight || !bottomLeft) {
      // use angle sort fallback
      const sorted = [...points].sort((a, b) => {
        const angleA = Math.atan2(a.y - center.y, a.x - center.x);

        const angleB = Math.atan2(b.y - center.y, b.x - center.x);

        return angleA - angleB;
      });

      return sorted;
    }

    return [topLeft, topRight, bottomRight, bottomLeft];
  }
}
