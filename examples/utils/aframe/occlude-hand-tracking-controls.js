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
        depthTest: true,
      });
      this.skinnedMesh.renderOrder = 0;
      this.updateSkinnedMesh();
    });
  },

  update: function (oldData) {
    const diff = AFRAME.utils.diff(oldData, this.data);

    const diffKeys = Object.keys(diff);

    diffKeys.forEach((diffKey) => {
      switch (diffKey) {
        case "enabled":
          this.updateSkinnedMesh();
          break;
      }
    });
  },

  updateSkinnedMesh: function () {
    if (!this.skinnedMesh) {
      return;
    }
    if (this.data.enabled) {
      this.skinnedMesh.material = this.occludedMaterial;
    } else {
      this.skinnedMesh.material = this.originalMaterial;
    }
  },
});
