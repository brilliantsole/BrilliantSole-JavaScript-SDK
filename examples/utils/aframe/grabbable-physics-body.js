AFRAME.registerComponent("grabbable-physics-body", {
  dependencies: ["grabbable"],

  schema: {
    type: {
      default: "static",
      oneOf: ["static", "dynamic"],
    },
    staticBody: { default: "" },
    dynamicBody: { default: "" },
  },

  init: function () {
    this.velocityScalar = 1.5;
    this.isGrabbed = false;
    this.positionHistory = [];
    this.velocity = new THREE.Vector3();

    this.rotationHistory = [];
    this.angularVelocityScalar = 1.0;
    this.angularVelocity = new THREE.Vector3();

    this.el.addEventListener("grabstarted", () => {
      this.isGrabbed = true;

      this.positionHistory = [];
      this.velocity.set(0, 0, 0);

      this.angularVelocity.set(0, 0, 0);
      this.rotationHistory = [];

      this.el.removeAttribute("static-body");
      this.el.removeAttribute("dynamic-body");
    });

    this.el.addEventListener("grabended", () => {
      this.isGrabbed = false;

      // Compute velocity from position history
      const history = this.positionHistory;
      if (history.length >= 2) {
        const first = history[0];
        const last = history[history.length - 1];
        const dt = (last.time - first.time) / 1000;
        if (dt > 0) {
          this.velocity.copy(last.pos).sub(first.pos).divideScalar(dt);
        }
      }

      // Compute angular velocity
      const rotHistory = this.rotationHistory;
      if (rotHistory.length >= 2) {
        const first = rotHistory[0];
        const last = rotHistory[rotHistory.length - 1];
        const dt = (last.time - first.time) / 1000;

        this.angularVelocity = this.getAngularVelocityFromQuaternions(
          first.rot,
          last.rot,
          dt
        );
      }

      // Re-add physics and apply velocity
      if (this.data.type === "static") {
        this.el.setAttribute("static-body", this.data.staticBody);
      } else {
        this.el.setAttribute("dynamic-body", this.data.dynamicBody);
        const setVelocity = () => {
          const body = this.el.body;
          if (body) {
            setTimeout(() => {
              // console.log("setting velocity", this.velocity);
              body.velocity.set(
                this.velocity.x * this.velocityScalar,
                this.velocity.y * this.velocityScalar,
                this.velocity.z * this.velocityScalar
              );

              // console.log("setting angularVelocity", this.angularVelocity);
              body.angularVelocity.set(
                this.angularVelocity.x * this.angularVelocityScalar,
                this.angularVelocity.y * this.angularVelocityScalar,
                this.angularVelocity.z * this.angularVelocityScalar
              );
            }, 0);
          }
          return Boolean(body);
        };
        if (!setVelocity()) {
          this.el.addEventListener(
            "body-loaded",
            () => {
              setVelocity();
            },
            { once: true }
          );
        }
      }
    });
  },

  getAngularVelocityFromQuaternions: function (q1, q2, deltaTime) {
    const invQ1 = q1.clone().invert();
    const deltaQ = q2.clone().multiply(invQ1);

    // Convert delta quaternion to axis-angle
    const axis = new THREE.Vector3();
    let angle = 2 * Math.acos(deltaQ.w);

    if (angle > Math.PI) {
      angle -= 2 * Math.PI;
    }

    const s = Math.sqrt(1 - deltaQ.w * deltaQ.w);
    if (s < 0.001) {
      axis.set(1, 0, 0); // arbitrary
    } else {
      axis.set(deltaQ.x / s, deltaQ.y / s, deltaQ.z / s);
    }

    // Angular velocity = axis * angle / deltaTime
    const angularVelocity = axis.multiplyScalar(angle / deltaTime);

    return angularVelocity;
  },

  tick: function (time, delta) {
    if (!this.isGrabbed) return;

    // Track recent positions (with timestamp)
    const pos = new THREE.Vector3();
    this.el.object3D.getWorldPosition(pos);
    this.positionHistory.push({ pos, time });

    // Keep only recent entries (e.g. last 100ms or 10 positions)
    while (this.positionHistory.length > 10) {
      this.positionHistory.shift();
    }

    const rot = new THREE.Quaternion();
    this.el.object3D.getWorldQuaternion(rot);
    this.rotationHistory.push({ rot, time });

    while (this.rotationHistory.length > 10) {
      this.rotationHistory.shift();
    }
  },
});
