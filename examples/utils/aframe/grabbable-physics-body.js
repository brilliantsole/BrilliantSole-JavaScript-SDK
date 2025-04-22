AFRAME.registerSystem("grabbable-physics-body", {
  schema: {},

  init: function () {
    this.allGrabControls = Array.from(
      document.querySelectorAll("[hand-tracking-grab-controls]")
    );
    this.allGrabControls.forEach((grabControls) => {
      grabControls.addEventListener("grabstarted", (event) => {
        const { grabbedEl } = event.detail;
        grabbedEl.emit(event.type);
      });
      grabControls.addEventListener("grabended", (event) => {
        const { grabbedEl } = event.detail;
        grabbedEl.emit(event.type);
      });
    });
  },
});

AFRAME.registerComponent("grabbable-physics-body", {
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

    this.el.addEventListener("grabstarted", () => {
      this.isGrabbed = true;
      this.positionHistory = [];
      this.velocity.set(0, 0, 0);
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

      // Re-add physics and apply velocity
      if (this.data.type === "static") {
        this.el.setAttribute("static-body", this.data.staticBody);
      } else {
        this.el.setAttribute("dynamic-body", this.data.dynamicBody);
        this.el.addEventListener(
          "body-loaded",
          () => {
            const body = this.el.body;
            if (body) {
              setTimeout(() => {
                body.velocity.set(
                  this.velocity.x * this.velocityScalar,
                  this.velocity.y * this.velocityScalar,
                  this.velocity.z * this.velocityScalar
                );
              }, 1);
            }
          },
          { once: true }
        );
      }
    });
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
  },
});
