AFRAME.registerComponent("occlude-mesh", {
  schema: {
    enabled: { default: true },
    shadow: { default: false },
  },

  init: function () {
    this.mesh = this.el.getObject3D("mesh");
    this.originalMaterial = this.mesh.material;
    if (this.data.shadow) {
      this.occludedMaterial = new THREE.ShadowMaterial();
      this.originalMaterial.opacity = 0.2;
      this.mesh.receiveShadow = true;
    } else {
      this.occludedMaterial = new THREE.MeshBasicMaterial({
        colorWrite: false,
        depthWrite: true,
        side: THREE.BackSide, // Only occlude with back faces
      });
    }

    this.raycastMesh = this.mesh.clone();
    this.raycastMesh.material = new THREE.MeshBasicMaterial({
      colorWrite: false,
      depthWrite: true,
    });
    this.raycastMesh.visible = false;
    this.mesh.raycast = () => {};
    this.el.object3D.add(this.raycastMesh);

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
