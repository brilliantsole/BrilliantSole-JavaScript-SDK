AFRAME.registerComponent("squashed-goomba", {
  schema: {
    template: { default: "#squashedGoombaTemplate", type: "selector" },
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
        this.el.setAttribute("animation__scale", {
          property: "scale",
          to: "1 1 0.7",
          dur: 120,
          easing: "easeInOutSine",
          loop: 3,
          dir: "alternate",
        });
      }, 1);
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
    // FILL
  },

  remove() {
    // FILL
  },
});
