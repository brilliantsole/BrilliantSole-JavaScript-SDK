AFRAME.registerComponent("platter", {
  schema: {},

  init: function () {
    this.el.setAttribute("grow-shrink", "");
    this.hand = this.el.closest("[hand-tracking-controls]");
    this.hand.setAttribute("palm-up-detector", "");
    this.hand.addEventListener("palmupon", () => {
      this.el.emit("grow");
      this.hand.setAttribute("occlude-hand-tracking-controls", {
        enabled: false,
      });
    });
    this.hand.addEventListener("palmupoff", () => {
      this.el.emit("shrink");
      this.hand.setAttribute("occlude-hand-tracking-controls", {
        enabled: true,
      });
    });
  },
});
