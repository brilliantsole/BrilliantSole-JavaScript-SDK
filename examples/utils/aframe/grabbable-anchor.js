AFRAME.registerComponent("grabbable-anchor", {
  schema: {},
  dependencies: ["anchored", "grabbable"],

  init: function () {
    this.el.addEventListener("grabstarted", () => {
      this.el.removeAttribute("anchored");
    });

    this.el.addEventListener("grabended", () => {
      this.el.setAttribute("anchored", "persistent: true;");
      this.shouldCreateAnchor = true;
    });
  },

  tick: function () {
    if (this.shouldCreateAnchor && this.el.components.anchored.createAnchor) {
      this.shouldCreateAnchor = false;

      const position = new THREE.Vector3();
      this.el.object3D.getWorldPosition(position);
      const quaternion = new THREE.Quaternion();
      this.el.object3D.getWorldQuaternion(quaternion);
      this.el.components.anchored.createAnchor(position, quaternion);
    }
  },
});
