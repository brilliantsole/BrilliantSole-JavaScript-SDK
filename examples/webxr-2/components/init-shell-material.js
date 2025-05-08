AFRAME.registerSystem("init-physics-materials", {
  init: function () {
    const sceneEl = this.el.sceneEl;
    const system = sceneEl.systems.physics;

    if (system && system.driver && system.driver.addMaterial) {
      // Add a frictionless material if not defined already
      const material = new CANNON.Material("shell");
      material.friction = 0.0;
      material.restitution = 1; // adjust bounce if needed
      //system.driver.world.defaultContactMaterial.contactEquationStiffness = 1e9;
      //system.driver.world.defaultContactMaterial.contactEquationRelaxation = 4;

      system.driver.materials["shell"] = material;
      //console.log("added material", material, system.driver.materials);

      sceneEl.addEventListener("shell-init", () => this.addContactMaterial(), {
        once: true,
      });
    }
  },
  addContactMaterial: function () {
    const sceneEl = this.el.sceneEl;
    const system = sceneEl.systems.physics;

    if (system && system.driver && system.driver.addMaterial) {
      material = system.driver.materials["shell"];
      const contact = new CANNON.ContactMaterial(
        material,
        system.driver.materials.defaultMaterial,
        { friction: 0, restitution: 1 }
      );
      system.driver.world.addContactMaterial(contact);
      //console.log("added contact material", contact);
    }
  },
});
