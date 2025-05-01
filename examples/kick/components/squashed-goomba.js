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

    this.el.addEventListener("loaded", () => {
      this.el.object3D.rotation.z = this.randomRange(this.bodyRotationRange.z);

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
      this.body.addEventListener("loaded", () => {
        const value = Math.random();
        this.body.object3D.scale.x = this.valueInRange(
          value,
          this.bodyScaleRange.x
        );
        this.body.object3D.scale.y = this.valueInRange(
          1 - value,
          this.bodyScaleRange.y
        );
      });

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
            const value = Math.random();
            [entity, duplicate].forEach((entity, index) => {
              entity.object3D.rotation.z = this.randomRange(
                this.eyeRotationRange.z
              );
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

            entity.object3D.position.x -= this.randomRange(
              this.eyePositionRange.x
            );
            duplicate.object3D.position.x += this.randomRange(
              this.eyePositionRange.x
            );
          }
          if (entity.classList.contains("foot")) {
            const value = Math.random();
            [entity, duplicate].forEach((entity, index) => {
              entity.object3D.rotation.z = this.randomRange(
                this.footRotationRange.z
              );
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

            entity.object3D.position.x -= this.randomRange(
              this.footPositionRange.x
            );
            duplicate.object3D.position.x += this.randomRange(
              this.footPositionRange.x
            );
          }
        });
        entity.parentEl.appendChild(duplicate);
      });
      setTimeout(() => {
        const coin = document.createElement("a-entity");
        coin.setAttribute("coin", "");
        let pitch = this.el.object3D.rotation.reorder("XYZ").x;
        let flip = false;
        {
          const { x, y, z } = this.el.object3D.position;
          const position = new THREE.Vector3(x, y - 0.07, z);
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
          coin.setAttribute("position", position.toArray().join(" "));
        }
        {
          if (true) {
            const { x, y, z } = this.camera.object3D.rotation;
            coin.setAttribute(
              "rotation",
              [flip ? 180 : 0, THREE.MathUtils.radToDeg(y), 0].join(" ")
            );
          } else {
            const { x, y, z } = this.el.getAttribute("rotation");
            coin.setAttribute("rotation", [0, y, 0].join(" "));
          }
          const { x, y, z } = this.camera.object3D.rotation;
        }
        this.el.sceneEl.appendChild(coin);

        this.el.remove();
      }, this.data.lifetime);
    });
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
});
