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
        this.el.appendChild(entity);
      });
      this.goomba = this.el.querySelector(".goomba");
      this.goomba.addEventListener("grabstarted", () => this.onGrabStarted());
      this.goomba.addEventListener("grabended", () => this.onGrabEnded());
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

  onGrabStarted: function () {
    switch (this.status) {
      default:
        this.setStatus("grabbed");
        break;
    }
  },
  onGrabEnded: function () {
    switch (this.status) {
      default:
        this.setStatus("idle");
        break;
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
    loop = false,
    dir = "normal"
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

    this.clearEyeRotationAnimation(side);
    if (dur == 0) {
      pitch = THREE.MathUtils.degToRad(pitch);
      yaw = THREE.MathUtils.degToRad(yaw);
      entity.object3D.rotation.set(pitch, yaw, 0);
    } else {
      entity.setAttribute("animation__rot", {
        property: "rotation",
        to: `${pitch} ${yaw} 0`,
        from: dir == "alternate" ? `${-pitch} ${-yaw} 0` : undefined,
        dur: dur,
        easing,
        loop,
        dur,
        dir,
      });
    }
  },
  setEyesRotation: function (rotation, dur, easing, loop) {
    this.sides.forEach((side) => {
      this.setEyeRotation(side, ...arguments);
    });
  },
  resetEyes: function () {
    this.setEyesRotation({ pitch: 0.5, yaw: 0.5 });
    this.setEyesRoll({ roll: 0.5 });
    this.setEyesScale({ width: 1, height: 1 });
  },
  clearEyeRotationAnimation: function (side) {
    const entity = this.eyeControllers[side];
    if (!entity) {
      return;
    }
    entity.removeAttribute("animation__rot");
  },
  clearEyesRotationAnimation: function () {
    this.sides.forEach((side) => {
      this.clearEyeRotationAnimation(side);
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
    loop = false,
    dir = "normal"
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

    this.clearEyeScaleAnimation(side);
    if (dur == 0) {
      entity.object3D.scale.set(width, height, 1);
    } else {
      entity.setAttribute("animation__scale", {
        property: "scale",
        to: `${width} ${height} 1`,
        from: dir == "alternate" ? `1 1 1` : undefined,
        dur: dur,
        easing,
        loop,
        dir,
      });
    }
  },
  setEyesScale: function (scale, dur, easing, loop, dir) {
    this.sides.forEach((side) => {
      this.setEyeScale(side, ...arguments);
    });
  },

  resetEyesScale: function () {
    this.setEyesScale({ width: 1, height: 1 });
  },
  clearEyeScaleAnimation: function (side) {
    const entity = this.eyeScales[side];
    if (!entity) {
      return;
    }
    entity.removeAttribute("animation__scale");
  },
  clearEyesScaleAnimation: function () {
    this.sides.forEach((side) => {
      this.clearEyeScaleAnimation(side);
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
    loop = false,
    dir = "normal"
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

    this.clearEyeRollAnimation(side);
    if (dur == 0) {
      roll = THREE.MathUtils.degToRad(roll);
      entity.object3D.rotation.set(0, 0, roll);
    } else {
      entity.setAttribute("animation__rot", {
        property: "rotation",
        to: `0 0 ${roll}`,
        from: dir == "alternate" ? `0 0 ${-roll}` : undefined,
        dur: dur,
        easing,
        loop,
        dir,
      });
    }
  },
  setEyesRoll: function (rotation, dur, easing, loop, dir) {
    this.sides.forEach((side) => {
      this.setEyeRoll(side, ...arguments);
    });
  },

  resetEyesRoll: function () {
    this.setEyesRoll({ roll: 0.5 });
  },
  clearEyeRollAnimation: function (side) {
    const entity = this.eyeRotators[side];
    if (!entity) {
      return;
    }
    entity.removeAttribute("animation__rot");
  },
  clearEyesRollAnimation: function () {
    this.sides.forEach((side) => {
      this.clearEyeRollAnimation(side);
    });
  },

  // LookAt

  lookAtPosition: new THREE.Vector3(),
  lookAtRefocusVector: new THREE.Vector3(),
  lookAtRefocusAxis: new THREE.Vector3(),
  lookAtRefocusEuler: new THREE.Euler(),
  lookAtRefocusScalar: 0.025,
  lookAtRefocusScalarRange: { min: 0.0, max: 0.02 },

  eyeTickInterval: 100,

  eyeRefocusIntervalRange: { min: 100, max: 800 },
  eyeRefocusInterval: 100,
  wanderEyesIntervalRange: { min: 2000, max: 5000 },
  wanderEyesInterval: 2000,

  lookAtEuler: new THREE.Euler(),
  tempLookAtEuler: new THREE.Euler(),
  lookAt: function (position, refocus = false) {
    this.lookAtPosition.copy(position);
    if (refocus) {
      if (true) {
        this.goomba.object3D.getWorldQuaternion(this.worldQuaternion);

        const intervalInterpolation = THREE.MathUtils.inverseLerp(
          0,
          this.eyeRefocusIntervalRange.max,
          this.eyeRefocusInterval
        );
        const scalar = 1 - intervalInterpolation;

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
      const entity = this.eyeControllers[side];
      if (true) {
        this.tempLookAtEuler.copy(entity.object3D.rotation);
        entity.object3D.lookAt(this.lookAtPosition);
        this.lookAtEuler.copy(entity.object3D.rotation);
        entity.object3D.rotation.copy(this.tempLookAtEuler);
        entity.setAttribute("animation__rot", {
          property: "rotation",
          to: this.lookAtEuler
            .toArray()
            .slice(0, 3)
            .map((value) => THREE.MathUtils.radToDeg(value))
            .join(" "),
          dur: 100,
          easing: "easeOutCubic",
        });
      } else {
        entity.object3D.lookAt(this.lookAtPosition);
      }
    });
  },
  lookAtObject: function (object) {
    if (object == this.objectToLookAt) {
      return;
    }
    this.objectToLookAt = object;
    if (!this.objectToLookAt) {
      this.resetEyes();
    }
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

  objectToLookAtDistance: 0,
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
    this.objectToLookAtDistance = closestDistance;
    this.lookAtObject(closestEntity);
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
    dir = "normal",
    invert = false
  ) {
    const entity = this.legs[side];
    if (!entity) {
      return;
    }

    let pitch = THREE.MathUtils.lerp(
      this.legRotationRange.pitch.min,
      this.legRotationRange.pitch.max,
      invert ? 1 - rotation.pitch : rotation.pitch
    );
    let pitch2;
    if (rotation.pitch2 != undefined) {
      pitch2 = THREE.MathUtils.lerp(
        this.legRotationRange.pitch.min,
        this.legRotationRange.pitch.max,
        invert ? 1 - rotation.pitch2 : rotation.pitch2
      );
    }

    this.clearLegRotationAnimation(side);
    if (dur == 0) {
      pitch = THREE.MathUtils.degToRad(pitch);
      entity.object3D.rotation.set(pitch, 0, 0);
    } else {
      const options = {
        property: "rotation",
        to: `${pitch} 0 0`,
        from: dir == "alternate" ? `${-pitch} 0 0` : undefined,
        dur: dur,
        dir: dir,
        easing,
        loop,
      };
      if (pitch2 != undefined) {
        options.from = `${pitch2} 0 0`;
      }
      entity.setAttribute("animation__rot", options);
    }
  },
  setLegsRotation: function (rotation, dur, easing, loop, dir, invert = false) {
    this.sides.forEach((side) => {
      if (invert) {
        const invert = side == "left";
        this.setLegRotation(side, rotation, dur, easing, loop, dir, invert);
      } else {
        this.setLegRotation(side, ...arguments);
      }
    });
  },

  resetLegs: function () {
    this.setLegsRotation({ pitch: 0.5 });
  },
  clearLegRotationAnimation: function (side) {
    const entity = this.legs[side];
    if (!entity) {
      return;
    }
    entity.removeAttribute("animation__rot");
  },
  clearLegsRotationAnimation: function () {
    this.sides.forEach((side) => {
      this.clearLegRotationAnimation(side);
    });
  },

  lastEyeTick: 0,
  lastEyeRefocusTick: 0,
  lastWanderEyesTick: 0,

  lastChangeLookAtTick: 0,
  changeLookAtInterval: 100,

  tick: function (time, timeDelta) {
    if (this.status == "idle" || this.status == "grabbed") {
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
    }
  },

  statuses: [
    "idle",
    "grabbed",
    "falling",
    "walking",
    "kicked",
    "wall",
    "stomp",
    "shocked",
  ],
  status: "idle",
  setStatus: function (newStatus) {
    if (this.status == newStatus) {
      return;
    }
    if (!this.statuses.includes(newStatus)) {
      console.error(`invalid status "${newStatus}"`);
      return;
    }
    this.status = newStatus;

    this.clearEyesRotationAnimation();
    this.clearEyesRollAnimation();
    this.clearEyesScaleAnimation();
    this.clearLegsRotationAnimation();

    this.resetLegs();
    this.resetEyes();

    switch (this.status) {
      case "grabbed":
        this.setLegRotation(
          "left",
          { pitch: 0.5, pitch2: 0.7 },
          900,
          "easeInOutCirc",
          true,
          "alternate",
          true
        );
        this.setLegRotation(
          "right",
          { pitch: 0.3, pitch2: 0.8 },
          920,
          "easeInOutCirc",
          true,
          "alternate",
          true
        );
        break;
      default:
        // FILL - reset eyes/legs
        break;
    }
  },
});
