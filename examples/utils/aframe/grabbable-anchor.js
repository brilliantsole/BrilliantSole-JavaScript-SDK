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

  deleteAnchor: async function () {
    this.isDeletingAnchor = true;
    const uuid = localStorage.getItem(this.el.id);
    if (uuid) {
      const frame = this.el.sceneEl.renderer.xr.getFrame();
      console.log("removing persistant anchor");
      try {
        await frame.session.deletePersistentAnchor(uuid);
      } catch (e) {
        console.log(e);
      }
      localStorage.removeItem(this.el.id);
    }
    this.isDeletingAnchor = false;
  },

  tick: function () {
    if (this.shouldCreateAnchor && this.el.components.anchored?.createAnchor) {
      this.deleteAnchor();
      if (this.isDeletingAnchor) {
        return;
      }
      this.shouldCreateAnchor = false;
      const position = new THREE.Vector3();
      this.el.object3D.getWorldPosition(position);
      const quaternion = new THREE.Quaternion();
      this.el.object3D.getWorldQuaternion(quaternion);
      this.el.components.anchored.createAnchor(position, quaternion);
    }
  },
});
