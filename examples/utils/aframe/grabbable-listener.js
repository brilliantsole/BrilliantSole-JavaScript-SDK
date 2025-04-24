AFRAME.registerSystem("grabbable-listener", {
  schema: {},

  init: function () {
    this.allGrabControls = Array.from(
      document.querySelectorAll("[hand-tracking-grab-controls]")
    );
    this.allGrabControls.forEach((grabControls) => {
      grabControls.addEventListener("grabstarted", (event) => {
        if (!event.detail?.grabbedEl) {
          return;
        }
        const { grabbedEl } = event.detail;
        grabbedEl.emit(event.type, {
          hand: event.target.components["hand-tracking-controls"].data.hand,
          grab: event.target.components["hand-tracking-grab-controls"],
        });
      });
      grabControls.addEventListener("grabended", (event) => {
        if (!event.detail?.grabbedEl) {
          return;
        }
        const { grabbedEl } = event.detail;
        grabbedEl.emit(event.type, {
          hand: event.target.components["hand-tracking-controls"].data.hand,
          grab: event.target.components["hand-tracking-grab-controls"],
        });
      });
    });
  },
});
