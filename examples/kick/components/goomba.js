AFRAME.registerComponent("goomba", {
  schema: {
    template: { default: "#goombaTemplate", type: "selector" },
    lookAt: { default: ".lookAt", type: "selectorAll" },
  },

  sides: ["left", "right"],

  init: function () {
    window.g = this;
    this.el.addEventListener("loaded", () => {
      const template = this.data.template.content.cloneNode(true);
      Array.from(template.children).forEach((entity) => {
        console.log("appending", entity);
        this.el.appendChild(entity);
      });
      this.goomba = this.el.querySelector(".goomba");
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
                `.${side}.eye .white`
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
  setEyesRotation: function (rotation, dur, easing, loop) {
    this.sides.forEach((side) => {
      this.setEyeRotation(side, ...arguments);
    });
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
  setEyesScale: function (scale, dur, easing, loop) {
    this.sides.forEach((side) => {
      this.setEyeScale(side, ...arguments);
    });
  },

  // EYE ROTATOR
  eyeRotatorsRange: {
    roll: { min: -50, max: 50 },
  },
  eyeRotators: {},
  setEyeRoll: function (
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

    if (dur == 0) {
      roll = THREE.MathUtils.degToRad(roll);
      console.log("rot", roll, entity);
      entity.object3D.rotation.set(0, 0, roll);
    } else {
      entity.removeAttribute("animation__rot");
      entity.setAttribute("animation__rot", {
        property: "rotation",
        to: `0 0 ${roll}`,
        dur: dur,
        easing,
        loop,
      });
    }
  },
  setEyesRoll: function (rotation, dur, easing, loop) {
    this.sides.forEach((side) => {
      this.setEyeRoll(side, ...arguments);
    });
  },

  lookAtPosition: new THREE.Vector3(),
  lookAtRefocusVector: new THREE.Vector3(),
  lookAtRefocusAxis: new THREE.Vector3(),
  lookAtRefocusEuler: new THREE.Euler(),
  lookAtRefocusScalar: 0.01,
  lookAtRefocusScalarRange: { min: 0.0, max: 0.02 },

  eyeTickInterval: 100,

  eyeRefocusIntervalRange: { min: 100, max: 800 },
  eyeRefocusInterval: 100,
  wanderEyesIntervalRange: { min: 2000, max: 5000 },
  wanderEyesInterval: 2000,

  lookAt: function (position, refocus = false) {
    this.lookAtPosition.copy(position);
    if (refocus) {
      if (true) {
        this.goomba.object3D.getWorldQuaternion(this.worldQuaternion);

        const scalar = THREE.MathUtils.inverseLerp(
          0,
          this.eyeRefocusIntervalRange.max,
          this.eyeRefocusInterval
        );

        const randomX =
          THREE.MathUtils.lerp(
            -this.lookAtRefocusScalar,
            this.lookAtRefocusScalar,
            Math.random()
          ) * scalar;
        const randomY =
          THREE.MathUtils.lerp(
            -this.lookAtRefocusScalar,
            this.lookAtRefocusScalar,
            Math.random()
          ) * scalar;

        this.lookAtRefocusVector.set(randomX, randomY, 0);
        this.lookAtRefocusVector.applyQuaternion(this.worldQuaternion);
      } else {
        const scalar = THREE.MathUtils.lerp(
          this.lookAtRefocusScalarRange.min,
          this.lookAtRefocusScalarRange.max,
          Math.random()
        );
        this.lookAtRefocusVector.set(scalar, 0, 0);
        this.lookAtRefocusAxis
          .set(Math.random(), Math.random(), Math.random())
          .normalize();
        const angle = Math.random() * Math.PI * 2;
        this.lookAtRefocusVector.applyAxisAngle(this.lookAtRefocusAxis, angle);
      }

      this.lookAtPosition.add(this.lookAtRefocusVector);
    }
    this.sides.forEach((side) => {
      this.eyeControllers[side].object3D.lookAt(this.lookAtPosition);
    });
  },
  lookAtObject: function (object) {
    if (object == this.objectToLookAt) {
      return;
    }
    console.log("lookAt", object);
    this.objectToLookAt = object;
  },
  stopLookingAtObject: function () {
    this.objectToLookAt = undefined;
  },

  worldPosition: new THREE.Vector3(),
  otherWorldPosition: new THREE.Vector3(),
  distanceRange: { min: 0.15, max: 4 },

  forwardVector: new THREE.Vector3(0, 0, 1),
  upVector: new THREE.Vector3(0, 1, 0),
  rightVector: new THREE.Vector3(1, 0, 0),
  toVector: new THREE.Vector3(),
  worldQuaternion: new THREE.Quaternion(),
  angleThreshold: 0.75,

  angleThresholds: {
    pitch: { min: -0.7, max: 0.7 },
    yaw: { min: -0.7, max: 0.7 },
  },

  checkObjectToLookAt: function () {
    let closestEntity;
    let closestDistance = 1;
    this.goomba.object3D.getWorldPosition(this.worldPosition);
    this.goomba.object3D.getWorldQuaternion(this.worldQuaternion);
    this.forwardVector
      .set(0, 0, 1)
      .applyQuaternion(this.worldQuaternion)
      .normalize();
    this.upVector
      .set(0, 1, 0)
      .applyQuaternion(this.worldQuaternion)
      .normalize();
    this.rightVector
      .set(1, 0, 0)
      .applyQuaternion(this.worldQuaternion)
      .normalize();
    this.data.lookAt.forEach((entity) => {
      if (!entity.object3D.visible) {
        return;
      }
      if (entity.components["hand-tracking-controls"]) {
        if (!entity.components["hand-tracking-controls"].controllerPresent) {
          return;
        }
        this.otherWorldPosition.copy(
          entity.components["hand-tracking-controls"].indexTipPosition
        );
      } else {
        entity.object3D.getWorldPosition(this.otherWorldPosition);
      }

      this.toVector.subVectors(this.otherWorldPosition, this.worldPosition);

      const distance = this.toVector.length();
      if (
        distance < this.distanceRange.min ||
        distance > this.distanceRange.max
      ) {
        return;
      }
      if (distance > closestDistance) {
        return;
      }

      this.toVector.normalize();

      const angle = this.forwardVector.dot(this.toVector);
      if (angle < this.angleThreshold) {
        return;
      }

      const cosYaw = THREE.MathUtils.clamp(
        this.rightVector.dot(this.toVector),
        -1,
        1
      );
      let yaw =
        Math.sign(this.forwardVector.dot(this.toVector)) >= 0
          ? Math.acos(cosYaw) // point is above the horizon
          : -Math.acos(cosYaw); // below – give negative yaw
      yaw -= Math.PI / 2;

      const pitch = Math.asin(this.upVector.dot(this.toVector)); // between −π/2 and π/2

      if (
        pitch < this.angleThresholds.pitch.min ||
        pitch > this.angleThresholds.pitch.max
      ) {
        return;
      }
      if (
        yaw < this.angleThresholds.yaw.min ||
        yaw > this.angleThresholds.yaw.max
      ) {
        return;
      }

      closestEntity = entity;
      closestDistance = distance;
    });
    if (closestEntity) {
      this.lookAtObject(closestEntity);
    }
  },

  // LEG
  legRotationRange: {
    pitch: { min: 50, max: -50 },
  },
  legs: {},
  setLegRotation: function (
    side,
    rotation,
    dur = 50,
    easing = "linear",
    loop = false,
    invert = false
  ) {
    console.log({ invert });
    const entity = this.legs[side];
    if (!entity) {
      return;
    }

    let pitch = THREE.MathUtils.lerp(
      this.legRotationRange.pitch.min,
      this.legRotationRange.pitch.max,
      invert ? 1 - rotation.pitch : rotation.pitch
    );

    if (dur == 0) {
      pitch = THREE.MathUtils.degToRad(pitch);
      entity.object3D.rotation.set(pitch, 0, 0);
    } else {
      entity.removeAttribute("animation__rot");
      entity.setAttribute("animation__rot", {
        property: "rotation",
        to: `${pitch} 0 0`,
        dur: dur,
        easing,
        loop,
      });
    }
  },
  setLegsRotation: function (rotation, dur, easing, loop, invert = false) {
    this.sides.forEach((side) => {
      if (invert) {
        const invert = side == "left";
        this.setLegRotation(side, rotation, dur, easing, loop, invert);
      } else {
        this.setLegRotation(side, ...arguments);
      }
    });
  },

  lastEyeTick: 0,
  lastEyeRefocusTick: 0,
  lastWanderEyesTick: 0,

  lastChangeLookAtTick: 0,
  changeLookAtInterval: 100,

  tick: function (time, timeDelta) {
    if (time - this.lastChangeLookAtTick > this.changeLookAtInterval) {
      this.lastChangeLookAtTick = time;
      this.checkObjectToLookAt();
    }

    if (time - this.lastEyeTick > this.eyeTickInterval) {
      this.lastEyeTick = time;

      let refocus = false;
      if (time - this.lastEyeRefocusTick > this.eyeRefocusInterval) {
        refocus = true;
        this.lastEyeRefocusTick = time;
        this.eyeRefocusInterval = THREE.MathUtils.lerp(
          this.eyeRefocusIntervalRange.min,
          this.eyeRefocusIntervalRange.max,
          Math.random()
        );
      }

      if (this.objectToLookAt) {
        if (this.objectToLookAt.components["hand-tracking-controls"]) {
          this.lookAt(
            this.objectToLookAt.components["hand-tracking-controls"]
              .indexTipPosition,
            refocus
          );
        } else {
          this.lookAt(
            this.objectToLookAt.object3D.getWorldPosition(
              this.otherWorldPosition
            ),
            refocus
          );
        }
      } else {
        let changeFocus = false;
        if (time - this.lastWanderEyesTick > this.wanderEyesInterval) {
          changeFocus = true;
          this.lastWanderEyesTick = time;
          this.wanderEyesInterval = THREE.MathUtils.lerp(
            this.wanderEyesIntervalRange.min,
            this.wanderEyesIntervalRange.max,
            Math.random()
          );
        }
        // FILL - change point to look at (raycast from eyes)
        // FILL - wander around
      }
    }
  },
});
