AFRAME.registerSystem("grabbable-listener", {
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
