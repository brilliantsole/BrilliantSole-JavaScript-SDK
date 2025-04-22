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
    this.isGrabbed = false;
    this.velocity = new THREE.Vector3();
    this.el.addEventListener("grabstarted", () => {
      this.isGrabbed = true;
      this.velocity.set(0, 0, 0);
      this.el.removeAttribute("static-body");
      this.el.removeAttribute("dynamic-body");
    });
    this.el.addEventListener("grabended", () => {
      this.isGrabbed = false;
      if (this.data.type == "static") {
        this.el.setAttribute("static-body", this.data.staticBody);
      } else {
        this.el.setAttribute("dynamic-body", this.data.dynamicBody);
        // FILL - apply this.velocity
      }
    });
  },
  tick: function (time, delta) {
    if (!this.isGrabbed) {
      return;
    }
    // FILL - set velocity
  },
});
