AFRAME.registerComponent("soft-shadow-light", {
  init: function () {
    const light = this.el.getObject3D("light");
    if (!light || !light.shadow) return;

    light.shadow.bias = -0.0005; // Helps with acne and lightening
    light.shadow.radius = 4; // Optional: blur (needs PCFSoft)
  },
});
