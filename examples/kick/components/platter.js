AFRAME.registerComponent("platter", {
  schema: {},

  init: function () {
    this.el.setAttribute("grow-shrink", "");
    this.hand = this.el.closest("[hand-tracking-controls]");
    this.hand.setAttribute("palm-up-detector", "");
    this.hand.addEventListener("palmupon", () => {
      this.el.emit("grow");
    });
    this.hand.addEventListener("palmupoff", () => {
      this.el.emit("shrink");
    });
  },
});
