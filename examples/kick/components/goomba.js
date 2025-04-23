AFRAME.registerComponent("goomba", {
  schema: {
    template: { default: "#goombaTemplate", type: "selector" },
  },

  sides: ["left", "right"],

  legs: {},

  init: function () {
    window.g = this;
    this.el.addEventListener("loaded", () => {
      const template = this.data.template.content.cloneNode(true);
      Array.from(template.children).forEach((entity) => {
        this.el.appendChild(entity);
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
            this.sides.forEach((side) => {
              this.eyeControllers[side] = this.el.querySelector(
                `.${side}.eye .controller`
              );
              this.eyeRotators[side] = this.el.querySelector(
                `.${side}.eye .scalar`
              );
              this.eyeScales[side] = this.el.querySelector(
                `.${side}.eye .white`
              );
            });
          }
          if (entity.classList.contains("leg")) {
            this.sides.forEach((side) => {
              this.legs[side] = this.el.querySelector(`.${side}.leg`);
            });
          }
        });
        entity.parentEl.appendChild(duplicate);
      });
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

  // EYE CONTROLLER
  eyeControllersRange: {
    pitch: { min: -50, max: 50 },
    yaw: { min: -50, max: 50 },
  },
  eyeControllers: {},
  setEyeRotation: function (
    side,
    rotation,
    dur = 50,
    easing = "linear",
    loop = false
  ) {
    const entity = this.eyeControllers[side];
    if (!entity) {
      return;
    }

    let pitch = THREE.MathUtils.lerp(
      this.eyeControllersRange.pitch.min,
      this.eyeControllersRange.pitch.max,
      rotation.pitch
    );
    let yaw = THREE.MathUtils.lerp(
      this.eyeControllersRange.yaw.min,
      this.eyeControllersRange.yaw.max,
      rotation.yaw
    );

    if (dur == 0) {
      pitch = THREE.MathUtils.degToRad(pitch);
      yaw = THREE.MathUtils.degToRad(yaw);
      entity.object3D.rotation.set(pitch, yaw, 0);
    } else {
      entity.removeAttribute("animation__rot");
      entity.setAttribute("animation__rot", {
        property: "rotation",
        to: `${pitch} ${yaw} 0`,
        dur: dur,
        easing,
        loop,
      });
    }
  },

  // EYE SCALE
  eyeScaleRange: {
    width: { min: 0, max: 1 },
    height: { min: 0, max: 1 },
  },
  eyeScales: {},
  setEyeScale: function (
    side,
    scale,
    dur = 50,
    easing = "linear",
    loop = false
  ) {
    const entity = this.eyeScales[side];
    if (!entity) {
      return;
    }

    const width = THREE.MathUtils.lerp(
      this.eyeScaleRange.width.min,
      this.eyeScaleRange.width.max,
      scale.width
    );
    const height = THREE.MathUtils.lerp(
      this.eyeScaleRange.height.min,
      this.eyeScaleRange.height.max,
      scale.height
    );

    if (dur == 0) {
      entity.object3D.scale.set(width, height, 1);
    } else {
      entity.removeAttribute("animation__scale");
      entity.setAttribute("animation__scale", {
        property: "scale",
        to: `${width} ${height} 1`,
        dur: dur,
        easing,
        loop,
      });
    }
  },

  // EYE ROTATOR
  eyeRotatorsRange: {
    roll: { min: -50, max: 50 },
  },
  eyeRotators: {},
  setEyeRotation: function (
    side,
    rotation,
    dur = 50,
    easing = "linear",
    loop = false
  ) {
    const entity = this.eyeRotators[side];
    if (!entity) {
      return;
    }

    let roll = THREE.MathUtils.lerp(
      this.eyeRotatorsRange.roll.min,
      this.eyeRotatorsRange.roll.max,
      rotation.roll
    );

    console.log({ roll });

    if (dur == 0) {
      roll = THREE.MathUtils.degToRad(roll);
      console.log("rot", roll, entity);
      entity.object3D.rotation.set(0, 0, roll);
    } else {
      entity.removeAttribute("animation__rot");
      console.log({ roll });
      entity.setAttribute("animation__rot", {
        property: "rotation",
        to: `0 0 ${roll}`,
        dur: dur,
        easing,
        loop,
      });
    }
  },
});
