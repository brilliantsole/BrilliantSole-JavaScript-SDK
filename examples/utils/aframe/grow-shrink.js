AFRAME.registerComponent("grow-shrink", {
  schema: {
    duration: { type: "number", default: 200 }, // ms
    targetScale: { type: "vec3", default: { x: 1, y: 1, z: 1 } },
  },

  init() {
    this.el.addEventListener("grow", () => {
      this.animateScale(this.data.targetScale);
    });
    this.el.addEventListener("shrink", () => {
      this.animateScale({ x: 0, y: 0, z: 0 });
    });
  },

  animateScale(to, duration) {
    this.el.removeAttribute("animation__scale"); // clear existing animation if any
    this.el.setAttribute("animation__scale", {
      property: "scale",
      to: `${to.x} ${to.y} ${to.z}`,
      dur: duration || this.data.duration,
      easing: "easeInOutQuad",
    });
  },
});
