AFRAME.registerSystem("init-shell-material", {
  init: function () {
    const sceneEl = this.el.sceneEl;
    const system = sceneEl.systems.physics;

    if (system && system.driver && system.driver.addMaterial) {
      system.driver.world.defaultContactMaterial.contactEquationStiffness = 1e9;
      system.driver.world.defaultContactMaterial.contactEquationRelaxation = 4;

      // Add a frictionless material if not defined already
      const shellMaterial = new CANNON.Material("shell");
      shellMaterial.friction = 0.0;
      shellMaterial.restitution = 1; // adjust bounce if needed
      system.driver.materials["shell"] = shellMaterial;
      // console.log("added material", material, system.driver.materials);

      const goombaMaterial = new CANNON.Material("goomba");
      // goombaMaterial.friction = -1;
      // goombaMaterial.restitution = -1;
      system.driver.materials["goomba"] = goombaMaterial;

      const bounceWallMaterial = new CANNON.Material("bounceWall");
      bounceWallMaterial.friction = 0.0;
      bounceWallMaterial.restitution = 1; // adjust bounce if needed
      system.driver.materials["bounceWall"] = bounceWallMaterial;

      sceneEl.addEventListener("shell-init", () => this.addContactMaterial(), {
        once: true,
      });
      sceneEl.addEventListener("world-meshes", this.onWorldMeshes.bind(this));
    }
  },
  onWorldMeshes: function (event) {
    const { planeMeshes, worldMeshes } = event.detail;
    console.log("onWorldMeshes", event.detail);

    const sceneEl = this.el.sceneEl;
    const system = sceneEl.systems.physics;
    const materials = system.driver.materials;

    planeMeshes.forEach((planeMesh) => {
      let material = planeMesh.components["static-body"].body.material;
      switch (planeMesh.dataset.worldMesh) {
        case "wall":
          material = materials["bounceWall"];
          break;
        default:
          break;
      }
      planeMesh.components["static-body"].body.material = material;
    });
    worldMeshes.forEach((worldMesh) => {
      let material = worldMesh.components["static-body"].body.material;
      switch (worldMesh.dataset.worldMesh) {
        case "table":
          material = materials["bounceWall"];
          break;
        default:
          break;
      }
      worldMesh.components["static-body"].body.material = material;
    });
  },
  addContactMaterial: function () {
    const sceneEl = this.el.sceneEl;
    const system = sceneEl.systems.physics;

    if (system && system.driver && system.driver.addMaterial) {
      const shellMaterial = system.driver.materials["shell"];

      const defaultContact = new CANNON.ContactMaterial(
        shellMaterial,
        system.driver.materials.defaultMaterial,
        { friction: 0, restitution: 0 }
      );
      system.driver.world.addContactMaterial(defaultContact);
      // console.log("added default contact material", defaultContact);

      const bounceWallMaterial = system.driver.materials["bounceWall"];
      const bounceWallContact = new CANNON.ContactMaterial(
        shellMaterial,
        bounceWallMaterial,
        { friction: 0, restitution: 1 }
      );
      system.driver.world.addContactMaterial(bounceWallContact);
      // console.log("added bounceWall contact material", bounceWallContact);

      const goombaMaterial = system.driver.materials["goomba"];
      const goombaBounceWallContact = new CANNON.ContactMaterial(
        goombaMaterial,
        bounceWallMaterial,
        { friction: 0.3, restitution: 0 }
      );
      system.driver.world.addContactMaterial(goombaBounceWallContact);
    }
  },
});
