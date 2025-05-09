AFRAME.registerSystem("init-shell-material", {
  waitForPhysics: async function () {
    return new Promise((resolve) => {
      let interval = setInterval(() => {
        const sceneEl = this.el.sceneEl;
        const system = sceneEl.systems.physics;
        if (system) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  },
  init: async function () {
    await this.waitForPhysics();
    const sceneEl = this.el.sceneEl;
    const system = sceneEl.systems.physics;

    if (system && system.driver && system.driver.addMaterial) {
      // system.driver.world.defaultContactMaterial.contactEquationStiffness = 1e9;
      // system.driver.world.defaultContactMaterial.contactEquationRelaxation = 4;

      system.driver.world.addMaterial(system.driver.materials.defaultMaterial);
      system.driver.world.addMaterial(system.driver.materials.staticMaterial);

      // Add a frictionless material if not defined already
      const shellMaterial = new CANNON.Material("shell");
      shellMaterial.friction = 0.0;
      shellMaterial.restitution = 1; // adjust bounce if needed
      system.driver.materials["shell"] = shellMaterial;
      system.driver.world.addMaterial(shellMaterial);

      const goombaMaterial = new CANNON.Material("goomba");
      goombaMaterial.friction = -1;
      goombaMaterial.restitution = -1;
      system.driver.materials["goomba"] = goombaMaterial;
      system.driver.world.addMaterial(goombaMaterial);

      const bounceWallMaterial = new CANNON.Material("bounceWall");
      bounceWallMaterial.friction = 0.0;
      bounceWallMaterial.restitution = 1; // adjust bounce if needed
      system.driver.materials["bounceWall"] = bounceWallMaterial;
      system.driver.world.addMaterial(bounceWallMaterial);

      this.addContactMaterial();

      sceneEl.addEventListener("world-meshes", this.onWorldMeshes.bind(this));

      const testFloor = document.getElementById("testFloor");
      if (testFloor) {
        testFloor.components["static-body"].body.material = bounceWallMaterial;
        testFloor.addEventListener("body-loaded", (event) => {
          const { body } = event.detail;
          console.log(body);
          body.material = bounceWallMaterial;
        });
      }
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
      const defaultMaterial = system.driver.materials["defaultMaterial"];
      const staticMaterial = system.driver.materials["staticMaterial"];

      const defaultContactMaterial = {
        friction: 0.01,
        restitution: 0.3,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3,
        frictionEquationStiffness: 1e8,
        frictionEquationRegularization: 3,
      };

      console.log("shellMaterial", shellMaterial);

      const shellDefaultContact = new CANNON.ContactMaterial(
        shellMaterial,
        defaultMaterial,
        { friction: 0, restitution: 0 }
      );
      system.driver.world.addContactMaterial(shellDefaultContact);
      // console.log("added shellDefaultContact", shellDefaultContact);

      const shellStaticContact = new CANNON.ContactMaterial(
        shellMaterial,
        staticMaterial,
        { friction: 0, restitution: 0 }
      );
      system.driver.world.addContactMaterial(shellStaticContact);
      // console.log("added shellStaticContact", shellStaticContact);

      const bounceWallMaterial = system.driver.materials["bounceWall"];
      const bounceWallContact = new CANNON.ContactMaterial(
        shellMaterial,
        bounceWallMaterial,
        {
          friction: 0,
          restitution: 1,
          contactEquationStiffness: 1e9,
          contactEquationRelaxation: 4,
        }
      );
      system.driver.world.addContactMaterial(bounceWallContact);
      // console.log("added bounceWallContact", bounceWallContact);

      const defaultBounceWallContact = new CANNON.ContactMaterial(
        defaultMaterial,
        bounceWallMaterial,
        { ...defaultContactMaterial }
      );
      system.driver.world.addContactMaterial(defaultBounceWallContact);
      // console.log("added defaultBounceWallContact", defaultBounceWallContact);

      const goombaMaterial = system.driver.materials["goomba"];
      const goombaBounceWallContact = new CANNON.ContactMaterial(
        goombaMaterial,
        bounceWallMaterial,
        { ...defaultContactMaterial }
      );
      system.driver.world.addContactMaterial(goombaBounceWallContact);
      // console.log("added goombaBounceWallContact", goombaBounceWallContact);

      const goombaStaticContact = new CANNON.ContactMaterial(
        goombaMaterial,
        system.driver.materials.staticMaterial,
        { ...defaultContactMaterial }
      );
      system.driver.world.addContactMaterial(goombaStaticContact);
      // console.log("added goombaStaticContact", goombaStaticContact);

      const goombaDefaultContact = new CANNON.ContactMaterial(
        goombaMaterial,
        system.driver.materials.defaultMaterial,
        { ...defaultContactMaterial }
      );
      system.driver.world.addContactMaterial(goombaDefaultContact);
      // console.log("added goombaDefaultContact", goombaDefaultContact);
    }
  },
});
