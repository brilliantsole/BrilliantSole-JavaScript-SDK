AFRAME.registerComponent("squashed-goomba", {
  schema: {
    template: { default: "#squashedGoombaTemplate", type: "selector" },
    duration: { default: 1000 },
    originalScale: { default: 1 },
    amplitude: { default: 0.8 },
    frequency: { default: 5 },
    damping: { default: 4 },
    lifetime: { default: 1000 },
  },

  bodyScaleRange: {
    x: { min: 0.7, max: 1.2 },
    y: { min: 0.7, max: 1.2 },
  },
  bodyRotationRange: {
    z: { min: -0.7, max: 0.7 },
  },

  eyeRotationRange: {
    z: { min: -1.0, max: 1.0 },
  },
  eyePositionRange: {
    x: { min: 0, max: 0.04 },
    y: { min: 0, max: 0.06 },
  },

  footRotationRange: {
    z: { min: -1.0, max: 1.0 },
  },
  footPositionRange: {
    x: { min: 0, max: 0.04 },
    y: { min: -0.01, max: 0.06 },
  },

  sides: ["left", "right"],

  valueInRange: function (value, range) {
    return THREE.MathUtils.lerp(range.min, range.max, value);
  },
  randomRange: function (range) {
    return THREE.MathUtils.lerp(range.min, range.max, Math.random());
  },

  init: function () {
    this.camera = document.querySelector("a-camera");

    this.eyes = [];
    this.feet = [];

    this.el.addEventListener("loaded", () => {
      const template = this.data.template.content
        .querySelector("a-entity")
        .cloneNode(true);
      template.classList.forEach((_class) => {
        // console.log(`adding class ${_class}`);
        this.el.classList.add(_class);
      });
      Array.from(template.children).forEach((entity) => {
        this.el.appendChild(entity);
      });
      this.template = template;

      this.body = this.el.querySelector(".body");

      this.el.querySelectorAll(".left").forEach((entity) => {
        const duplicate = entity.cloneNode(true);
        duplicate.addEventListener("loaded", () => {
          this.flip(duplicate);
          duplicate.classList.remove("left");
          duplicate.classList.add("right");
          duplicate
            .querySelectorAll("[position], [rotation]")
            .forEach((entity) => this.flip(entity));

          if (entity.classList.contains("eye")) {
            this.eyes.push(entity, duplicate);
            this.eyePositions = this.eyes.map((entity) =>
              entity.object3D.position.clone()
            );
          }
          if (entity.classList.contains("foot")) {
            this.feet.push(entity, duplicate);
            this.feetPositions = this.feet.map((entity) =>
              entity.object3D.position.clone()
            );
          }
        });
        entity.parentEl.appendChild(duplicate);
      });
    });
  },

  randomize: function () {
    this.el.object3D.rotation.z = this.randomRange(this.bodyRotationRange.z);

    {
      const value = Math.random();
      this.body.object3D.scale.x = this.valueInRange(
        value,
        this.bodyScaleRange.x
      );
      this.body.object3D.scale.y = this.valueInRange(
        1 - value,
        this.bodyScaleRange.y
      );
    }

    {
      const value = Math.random();
      this.eyes.forEach((entity, index) => {
        entity.object3D.rotation.z = this.randomRange(this.eyeRotationRange.z);
        entity.object3D.position.copy(this.eyePositions[index]);
        if (true) {
          entity.object3D.position.y += this.randomRange(
            this.eyePositionRange.y
          );
        } else {
          entity.object3D.position.y += this.valueInRange(
            index == 0 ? value : 1 - value,
            this.eyePositionRange.y
          );
        }
      });

      this.eyes[0].object3D.position.x -= this.randomRange(
        this.eyePositionRange.x
      );
      this.eyes[1].object3D.position.x += this.randomRange(
        this.eyePositionRange.x
      );
    }

    {
      const value = Math.random();
      this.feet.forEach((entity, index) => {
        entity.object3D.position.copy(this.feetPositions[index]);
        entity.object3D.rotation.z = this.randomRange(this.footRotationRange.z);
        if (true) {
          entity.object3D.position.y += this.randomRange(
            this.footPositionRange.y
          );
        } else {
          entity.object3D.position.y += this.valueInRange(
            index == 0 ? value : 1 - value,
            this.footPositionRange.y
          );
        }
      });

      this.feet[0].object3D.position.x -= this.randomRange(
        this.footPositionRange.x
      );
      this.feet[1].object3D.position.x += this.randomRange(
        this.footPositionRange.x
      );
    }
  },

  flip: function (entity) {
    const position = entity.getAttribute("position");
    position.x *= -1;
    entity.setAttribute("position", position);
    const rotation = entity.getAttribute("rotation");
    rotation.y *= -1;
    rotation.z *= -1;
    entity.setAttribute("rotation", rotation);
  },

  tick: function (time, timeDelta) {
    if (this.startTime == undefined) {
      this.startTime = time;
    }
    if (this.isDone) {
      return;
    }
    const t = (time - this.startTime) / 1000; // seconds
    const dampingFactor = Math.exp(-this.data.damping * t);
    const scaleY =
      this.data.originalScale +
      this.data.amplitude *
        Math.sin(this.data.frequency * t * Math.PI * 2) *
        dampingFactor;
    this.el.object3D.scale.z = scaleY;
    if (dampingFactor < 0.01) {
      this.isDone = true;
    }
  },

  start: function () {
    this.randomize();

    this.startTime = undefined;
    this.isDone = false;

    this.sound = this.el.sceneEl.components["pool__splatsound"].requestEntity();
    this.sound.object3D.position.copy(this.el.object3D.position);
    this.sound.play();
    this.sound.components.sound.playSound();

    setTimeout(() => {
      const coin = this.el.sceneEl.components["pool__coin"].requestEntity();
      coin.play();
      let pitch = this.el.object3D.rotation.reorder("YXZ").x;
      let flip = false;
      {
        const { x, y, z } = this.el.object3D.position;
        const position = new THREE.Vector3(x, y - 0.04, z);
        if (pitch < THREE.MathUtils.degToRad(-80)) {
          position.y += 0.1;
        } else if (pitch > THREE.MathUtils.degToRad(80)) {
          if (false) {
            position.y -= 0.15;
          } else {
            flip = true;
            position.y += 0.05;
          }
        }
        coin.object3D.position.copy(position);
      }
      {
        if (true) {
          const { x, y, z } = this.camera.object3D.rotation;
          const cameraToCoin = new THREE.Vector3().subVectors(
            this.camera.object3D.position,
            this.el.object3D.position
          );
          const yaw = Math.atan2(cameraToCoin.x, cameraToCoin.z);
          coin.object3D.rotation.set(flip ? Math.PI : 0, yaw, 0, "YXZ");
        } else {
          const { x, y, z } = this.el.getAttribute("rotation");
          coin.setAttribute("rotation", [0, y, 0].join(" "));
        }
      }
      coin.components.coin.start();

      this.removeSelf();
    }, this.data.lifetime);
  },

  remove: function () {
    this.removeSelf();
  },

  removeSelf: function () {
    this.el.sceneEl.components["pool__squashedgoomba"].returnEntity(this.el);
    this.el.sceneEl.components["pool__splatsound"].returnEntity(this.sound);
  },
});
