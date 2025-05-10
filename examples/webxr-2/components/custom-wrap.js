AFRAME.registerComponent("custom-wrap", {
  init: function () {
    this.el.addEventListener("materialtextureloaded", () => {
      const mesh = this.el.getObject3D("mesh");
      console.log(mesh.material.map);
      if (!mesh) return;
      const material = mesh.material;
      if (material.map) {
        const texture = material.map;
        texture.wrapS = THREE.MirroredRepeatWrapping;
        texture.wrapT = THREE.MirroredRepeatWrapping;
        texture.needsUpdate = true;
        console.log("wrapping", texture);
      }
    });
  },
});
