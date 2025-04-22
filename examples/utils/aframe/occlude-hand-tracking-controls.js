AFRAME.registerComponent("occlude-hand-tracking-controls", {
  dependencies: ["hand-tracking-controls"],

  schema: {
    enabled: { default: true },
  },

  init: function () {
    this.el.addEventListener("controllermodelready", () => {
      this.skinnedMesh =
        this.el.components["hand-tracking-controls"].skinnedMesh;
      this.originalMaterial = this.skinnedMesh.material;
      this.occludedMaterial = new THREE.MeshBasicMaterial({
        colorWrite: false,
        depthWrite: true,
      });
      this.updateSkinnedMesh();
    });
  },

  updateSkinnedMesh: function () {
    if (this.data.enabled) {
      this.skinnedMesh.material = this.occludedMaterial;
    } else {
      this.skinnedMesh.material = this.originalMaterial;
    }
  },
});
