AFRAME.registerComponent("occlude-mesh", {
  schema: {
    enabled: { default: true },
  },

  init: function () {
    this.mesh = this.el.getObject3D("mesh");
    this.originalMaterial = this.mesh.material;
    this.occludedMaterial = new THREE.MeshBasicMaterial({
      colorWrite: false,
      depthWrite: true,
    });
    this.updateMesh();
  },

  updateMesh: function () {
    if (this.data.enabled) {
      this.mesh.material = this.occludedMaterial;
    } else {
      this.mesh.material = this.originalMaterial;
    }
  },
});
