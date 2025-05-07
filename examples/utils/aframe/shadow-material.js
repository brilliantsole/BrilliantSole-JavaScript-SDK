AFRAME.registerComponent("shadow-material", {
  init: function () {
    console.log("shadow-material");
    let el = this.el;
    let mesh = el.getObject3D("mesh");

    if (!mesh) {
      console.error("no mesh found");
      return;
    }

    // Apply shadow material
    const shadowMat = new THREE.ShadowMaterial();
    shadowMat.opacity = 1.0;
    mesh.material = shadowMat;

    // Important: mark the mesh to receive shadows
    mesh.receiveShadow = true;
  },
});
