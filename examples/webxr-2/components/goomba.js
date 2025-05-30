AFRAME.registerComponent("goomba", {
  schema: {
    template: { default: "#goombaTemplate", type: "selector" },
    lookAt: { default: ".lookAt" },
    lookAtRaycast: { default: "[data-world-mesh]" },
    grabbable: { default: false },
    physics: { default: false },
  },

  collisionFilterGroup: 1 << 1,
  collisionFilterMask: (1 << 0) | (1 << 1),

  sides: ["left", "right"],

  showHitSphere: false,

  eyeScalesRange: 0.08,
  defaultEyeHeight: 1.69,

  staticBody: "shape: none;",
  dynamicBody: "shape: none;",
  bodyString: "type: dynamic; shape: none;",
  shapeMain: `shape: box;
          halfExtents: 0.1 0.091 0.09;
          offset: 0 0 0;`,

  init: function () {
    this.emotion = "default";

    this.lookAtPosition = new THREE.Vector3();
    this.lookAtRefocusVector = new THREE.Vector3();
    this.lookAtRefocusAxis = new THREE.Vector3();
    this.lookAtRefocusEuler = new THREE.Euler();

    this.forwardVector = new THREE.Vector3(0, 0, 1);
    this.upVector = new THREE.Vector3(0, 1, 0);
    this.rightVector = new THREE.Vector3(1, 0, 0);
    this.toVector = new THREE.Vector3();

    this.worldQuaternion = new THREE.Quaternion();
    this.playGrabSound = AFRAME.utils.throttle(
      this.playGrabSound.bind(this),
      500
    );
    this.playReleaseSound = AFRAME.utils.throttle(
      this.playReleaseSound.bind(this),
      500
    );

    this.playBounceSoundName = AFRAME.utils.throttle(
      this.playBounceSoundName.bind(this),
      200
    );

    this.lastTimePunched = 0;
    this.sphere = new THREE.Sphere();
    this.sphere.radius = 0.2;

    this.hands = {};

    this.collisionVector = new THREE.Vector3();

    this.lastPetTick = 0;
    this.petPosition = new THREE.Vector3();
    this.localPetPosition = new THREE.Vector3();

    this.lastTimeCollidedWhenWalking;

    this.el.shapeMain = this.shapeMain;

    this.pointToWalkFrom = new THREE.Vector3();
    this.pointToWalkTo = new THREE.Vector3();
    this.tempPointToWalkTo = new THREE.Vector3();
    this.clampedTempPointToWalkTo = new THREE.Vector3();
    this.quaternionToTurnFrom = new THREE.Quaternion();
    this.quaternionToTurnTo = new THREE.Quaternion();
    this.tempEuler = new THREE.Euler();

    this.lastTimeTurnedAround = 0;

    this.pointToWalkToOffset = new THREE.Vector3();
    this.pointToWalkToSphere = document.createElement("a-sphere");
    this.pointToWalkToSphere.setAttribute("color", "green");
    this.pointToWalkToSphere.setAttribute("visible", "false");
    this.pointToWalkToSphere.setAttribute("radius", "0.01");
    this.el.sceneEl.appendChild(this.pointToWalkToSphere);

    this.wallIntersectionSphere = document.createElement("a-sphere");
    this.wallIntersectionSphere.setAttribute("color", "green");
    this.wallIntersectionSphere.setAttribute("visible", "false");
    this.wallIntersectionSphere.setAttribute("radius", "0.01");
    this.el.sceneEl.appendChild(this.wallIntersectionSphere);

    this.lastWalkTick = 0;

    this.rollQuaternionFrom = new THREE.Quaternion();
    this.rollQuaternionTo = new THREE.Quaternion();
    this.rollTempEuler = new THREE.Euler();

    this.squashLookAtQuaternion1 = new THREE.Quaternion();
    this.squashLookAtQuaternion2 = new THREE.Quaternion();

    this.orientation = "upright";
    this.scale = 1;
    this.lastBlinkTick = 0;
    this.blinkInterval = 5000;

    const eyeScalesOffset =
      Math.random() * this.eyeScalesRange - this.eyeScalesRange / 2;
    this.eyesScales = {
      left: { height: 1 + eyeScalesOffset, width: 1 },
      right: { height: 1 - eyeScalesOffset, width: 1 },
    };

    this.hitSphere = document.createElement("a-sphere");
    this.hitSphere.setAttribute("color", "blue");
    this.hitSphere.setAttribute("visible", "false");
    this.hitSphere.setAttribute("radius", "0.05");
    this.el.sceneEl.appendChild(this.hitSphere);

    this.updateLookAtTargets();
    this.lookAtSelectorInterval = setInterval(
      () => this.updateLookAtTargets(),
      1000
    );
    this.updateLookAtRaycastTargets();
    this.lookAtRaycastSelectorInterval = setInterval(
      () => this.updateLookAtRaycastTargets(),
      1000
    );

    this.pointToLookAt = new THREE.Vector3();
    this.pointToLookAtDirection = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster();
    this.ray = new THREE.Vector3();
    this.rayEuler = new THREE.Euler();

    this.eyeControllers = {};
    this.eyeScales = {};
    this.eyePupils = {};
    this.eyeWhites = {};
    this.eyeRotators = {};

    this.el.classList.add("goomba");
    this.el.classList.add("lookAt");

    this.eyeTickInterval = 100;
    this.eyeRefocusInterval = 100;
    this.wanderEyesInterval = 2000;

    this.lookAtEuler = new THREE.Euler();
    this.tempLookAtEuler = new THREE.Euler();

    this.objectToLookAtDistance = 0;

    this.worldPosition = new THREE.Vector3();
    this.otherWorldPosition = new THREE.Vector3();

    this.legs = {};
    this.feet = {};

    this.lastEyeTick = 0;
    this.lastEyeRefocusTick = 0;
    this.lastWanderEyesTick = 0;

    this.lastChangeLookAtTick = 0;
    this.changeLookAtInterval = 100;

    this.status = "idle";

    window.goombas = window.goombas || [];
    window.goombas.push(this);

    this.el.addEventListener("collide", this.onCollide.bind(this));
    this.el.addEventListener(
      "obbcollisionstarted",
      this.onObbCollisionStarted.bind(this)
    );

    this.lastTimeLookedAt = 0;

    this.camera = document.querySelector("a-camera");

    this.el.addEventListener("loaded", () => {
      this.el.addEventListener("punch", this.onPunch.bind(this));
      this.el.addEventListener("shell", this.onShell.bind(this));

      this.el.addEventListener("kick", this.onKick.bind(this));
      this.el.addEventListener("stomp", this.onStomp.bind(this));

      this.el.addEventListener("body-loaded", this.onBodyLoaded.bind(this));

      const template = this.data.template.content
        .querySelector("a-entity")
        .cloneNode(true);
      template.classList.forEach((_class) => {
        // console.log(`adding class ${_class}`);
        this.el.classList.add(_class);
      });
      if (this.el.classList.contains("punchable")) {
        this.punchable = true;
      }
      Array.from(template.children).forEach((entity) => {
        this.el.appendChild(entity);
      });
      this.template = template;

      this.el.collider = this.el.querySelector(".collider").object3D;
      this.el.setAttribute("obb-collider", "trackedObject3D: collider");

      this.petEntity = this.el.querySelector(".pet");

      this.el.addEventListener("raycaster-intersected", (event) => {
        //console.log("looked at", event);
        this.isLookedAt = true;
      });
      this.el.addEventListener("raycaster-intersected-cleared", (event) => {
        //console.log("stopped looked at", event);
        this.isLookedAt = false;
        this.lastTimeLookedAt = this.latestTick;
      });

      this.squash = this.el.querySelector(".squash");
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
              this.eyePupils[side] = this.el.querySelector(
                `.${side}.eye .black`
              );
              this.eyeWhites[side] = this.el.querySelector(
                `.${side}.eye .white`
              );

              this.setEyeScale(side, this.eyesScales[side]);
            });
          }
          if (entity.classList.contains("leg")) {
            this.sides.forEach((side) => {
              this.legs[side] = this.el.querySelector(`.${side}.leg`);
              this.feet[side] = this.el.querySelector(`.${side}.leg .foot`);
            });
          }
        });
        entity.parentEl.appendChild(duplicate);
      });
      setTimeout(() => {
        if (this.data.grabbable) {
          this.el.setAttribute("grabbable", "");
        }
        if (this.data.physics) {
          this.el.setAttribute(
            "grabbable-physics-body",
            `type: dynamic; dynamic-body: "shape: none;";`
          );
        }

        if (window.goombas.indexOf(this) == window.goombas.length - 1) {
          const raycaster = this.camera.getAttribute("_raycaster");
          this.camera.removeAttribute("raycaster");
          this.camera.setAttribute("raycaster", raycaster);
        }

        Array.from(
          document.querySelectorAll("[hand-tracking-controls]")
        ).forEach((entity) => {
          const component = entity.components["hand-tracking-controls"];
          const side = component.data.hand;
          this.hands[side] = component;
        });

        this.el.emit("goomba-loaded");
      }, 1);
    });

    this.setGrabEnabled = AFRAME.utils.throttleLeadingAndTrailing(
      this.setGrabEnabled.bind(this),
      70
    );

    this.el.addEventListener("grabstarted", () => this.setGrabEnabled(true));
    this.el.addEventListener("grabended", () => this.setGrabEnabled(false));
  },

  // validFloorMeshTypes: ["floor", "table"],
  validFloorMeshTypes: ["floor", "table", "desk"],
  validHitWorldMeshTypes: [],
  //validHitWorldMeshTypes: ["floor", "table", "wall", "ceiling"],

  onPunch: function (event) {
    const { velocity, position } = event.detail;
    this.punch(velocity, position);
  },

  onKick: function (event) {
    const { velocity } = event.detail;
    //console.log("onKick", { velocity });
    this.punch(velocity);
  },

  onShell: function (event) {
    const { velocity, position } = event.detail;
    this.shellHit(velocity, position);
  },
  shellHit: function (velocity, position) {
    this.shellHitOptions = { velocity, position };
  },
  shellVelocityPitchRange: {
    min: THREE.MathUtils.degToRad(2),
    max: THREE.MathUtils.degToRad(0),
  },
  shellVelocityInterpolationRange: {
    min: 0.5,
    max: 4,
  },
  shellVelocityLengthRange: {
    min: 0.8,
    max: 1.1,
  },
  _shellHit: function (velocity, position) {
    if (this.ignorePunchStatuses.includes(this.status)) {
      return;
    }
    this.playShellHitSound();
    this.playPunchSqueakSound();

    this.setStatus("idle");
    this.lastTimePunched = this.latestTick;
    if (true) {
      this.shelled = true;
    } else {
      this.punched = true;
      this.punchedFloor = this.floor;
    }

    let pitch = 0;
    if (true) {
      pitch = THREE.MathUtils.lerp(
        this.shellVelocityPitchRange.min,
        this.shellVelocityPitchRange.max,
        Math.random()
      );
    }

    let _yaw = 0;
    if (false) {
      _yaw = Math.random() * Math.PI * 2;
    } else {
      _yaw = Math.atan2(velocity.x, velocity.z);
    }

    const velocityLength = velocity.length();
    let velocityInterpolation = THREE.MathUtils.inverseLerp(
      this.shellVelocityInterpolationRange.min,
      this.shellVelocityInterpolationRange.max,
      velocityLength
    );
    velocityInterpolation = THREE.MathUtils.clamp(velocityInterpolation, 0, 1);
    console.log("velocityInterpolation", velocityInterpolation);

    let newVelocityLength = THREE.MathUtils.lerp(
      this.shellVelocityLengthRange.min,
      this.shellVelocityLengthRange.max,
      velocityInterpolation
    );
    console.log("newVelocityLength", newVelocityLength);

    const newVelocity = new THREE.Vector3(0, newVelocityLength, 0);
    const euler = new THREE.Euler(pitch, _yaw, 0, "YXZ");
    newVelocity.applyEuler(euler);
    this.physicsOptions = { velocity: newVelocity };
    this.setPhysicsEnabled(true);
  },

  // adjust values as needed
  stompDistanceRange: { min: 0.3, max: 5 },
  stompDistanceInterpolationPower: 1,
  stompDelayRange: { min: 0, max: 350 },
  stompVelocityLengthRange: { min: 0.15, max: 1 },
  stompVelocityPitchRange: {
    min: THREE.MathUtils.degToRad(2),
    max: THREE.MathUtils.degToRad(0),
  },
  ignoreStompStatuses: ["getting up", "falling", "petting"],
  onStomp: function (event) {
    const { distance, yaw, kill } = event.detail;
    //console.log("onStomp", { distance, yaw, kill });
    this.stomp(distance, yaw, kill);
  },
  stomp: function (distance, yaw, kill) {
    this.stompOptions = { distance, yaw, kill };
  },
  _stomp: function (distance, yaw, kill) {
    if (!this.floor || this.ignoreStompStatuses.includes(this.status)) {
      return;
    }
    if (kill) {
      this.deathCollidedEntity = this.floor;
      this.shouldDie = true;
      this.deathVelocity = new THREE.Vector3(0, -1, 0);
      this.deathNormal = new THREE.Vector3(0, 1, 0);
    } else {
      if (false) {
        this.playPunchSqueakSound();
      }
      let distanceInterpolation = THREE.MathUtils.inverseLerp(
        this.stompDistanceRange.min,
        this.stompDistanceRange.max,
        distance
      );
      distanceInterpolation = THREE.MathUtils.clamp(
        distanceInterpolation,
        0,
        1
      );
      distanceInterpolation = Math.pow(
        distanceInterpolation,
        this.stompDistanceInterpolationPower
      );
      // console.log({ distanceInterpolation });
      const delay = THREE.MathUtils.lerp(
        this.stompDelayRange.min,
        this.stompDelayRange.max,
        distanceInterpolation
      );
      // console.log({ delay });
      const applyStomp = () => {
        this.setStatus("idle");
        // console.log("stomped", velocity);
        const velocityLength = THREE.MathUtils.lerp(
          this.stompVelocityLengthRange.min,
          this.stompVelocityLengthRange.max,
          1 - distanceInterpolation
        );
        let pitch = 0;
        if (true) {
          pitch = THREE.MathUtils.lerp(
            this.stompVelocityPitchRange.min,
            this.stompVelocityPitchRange.max,
            Math.random()
          );
        } else {
          pitch = THREE.MathUtils.lerp(
            this.stompVelocityPitchRange.min,
            this.stompVelocityPitchRange.max,
            distanceInterpolation
          );
        }

        let _yaw = 0;
        if (true) {
          _yaw = Math.random() * Math.PI * 2;
        } else {
          _yaw = yaw;
        }

        const velocity = new THREE.Vector3(0, velocityLength, 0);
        const euler = new THREE.Euler(pitch, _yaw, 0, "YXZ");
        velocity.applyEuler(euler);
        this.physicsOptions = { velocity };
        this.setPhysicsEnabled(true);
      };
      if (true) {
        applyStomp();
      } else {
        setTimeout(() => applyStomp(), delay);
      }
    }
  },

  setGrabEnabled: function (enabled) {
    if (enabled) {
      this.onGrabStarted();
    } else {
      this.onGrabEnded();
    }
  },

  ignorePunchStatuses: ["falling", "getting up"],

  punchDownPitchThreshold: THREE.MathUtils.degToRad(-40),
  punch: function (velocity, position) {
    this.punchOptions = { velocity, position };
  },
  _punch: function (velocity, position) {
    if (this.ignorePunchStatuses.includes(this.status)) {
      return;
    }
    this.playPunchSqueakSound();
    this.playPunchSound();
    const { x, y, z } = velocity;
    const pitch = Math.atan2(y, Math.sqrt(x * x + z * z));
    // console.log({ pitch, threshold: this.punchDownPitchThreshold });
    if (pitch < this.punchDownPitchThreshold && this.floor) {
      this.deathCollidedEntity = this.floor;
      //console.log("punching down on floor", this.deathCollidedEntity);
      this.shouldDie = true;
      this.deathVelocity = velocity.clone();
      this.deathNormal = new THREE.Vector3(0, 1, 0);
      return;
    }
    this.setStatus("idle");
    this.lastTimePunched = this.latestTick;
    this.punched = true;
    this.punchedFloor = this.floor;
    if (!position) {
      position = this.el.object3D.getWorldPosition(new THREE.Vector3());
    }
    // console.log("punched", velocity, position);
    this.physicsOptions = { velocity, position };
    this.setPhysicsEnabled(true);
  },

  velocityScalar: 4,

  onBodyLoaded: function (event) {
    const { body } = event.detail;
    body.collisionFilterGroup = this.collisionFilterGroup;
    body.collisionFilterMask = this.collisionFilterMask;
    //body.linearDamping = 0;
    //body.angularDamping = 0;
    this.physicsBody = body;
    body.material =
      this.el.sceneEl.systems["physics"].driver.getMaterial("goomba");
    // console.log(body.material);
    // console.log("onBodyLoaded");
    if (this.physicsOptions) {
      const { position, velocity } = this.physicsOptions;
      this.physicsOptions = undefined;

      const body = this.el.body;
      if (body) {
        body.wakeUp();
        setTimeout(() => {
          body.wakeUp();
          this.setStatus("falling");
          this.landed = false;
          this.floor = undefined;

          if (false) {
            console.log("applying impulse", velocity, position);
            body.applyImpulse(
              new CANNON.Vec3().copy(velocity.multiplyScalar(this.punchScalar)),
              new CANNON.Vec3().copy(position)
            );
          } else {
            // console.log("setting velocity", velocity);
            body.velocity.set(
              velocity.x * this.velocityScalar,
              velocity.y * this.velocityScalar,
              velocity.z * this.velocityScalar
            );

            const strength = velocity.length();
            const angularVelocity = new THREE.Vector3(strength * 20, 0, 0);
            const normalizedVelocity = velocity.clone().normalize();
            const angle = Math.atan2(
              normalizedVelocity.x,
              normalizedVelocity.z
            );
            const euler = new THREE.Euler(0, angle, 0);
            angularVelocity.applyEuler(euler);
            // console.log("setting angularVelocity", angularVelocity);
            body.angularVelocity.set(...angularVelocity.toArray());
          }
        }, 1);
      } else {
        console.error("body not found");
      }
    }
  },

  floorCollisionNormalThreshold: THREE.MathUtils.degToRad(10),
  onCollide: async function (event) {
    const collidedEntity = event.detail.body.el;
    // console.log("collided with", collidedEntity, event.detail);
    // console.log(this.physicsBody.material, event.detail.body.material);

    // FIX - make sure intersection from raycaster actually has intersection (e.g. hitting edge of table)
    if (
      this.punched &&
      collidedEntity.dataset.worldMesh &&
      (this.validHitWorldMeshTypes.length == 0 ||
        this.validHitWorldMeshTypes.includes(
          collidedEntity.dataset.worldMesh
        )) &&
      collidedEntity != this.punchedFloor
    ) {
      let didDie = false;
      if (true) {
        this.ray.copy(this.el.body.velocity);
        this.raycaster.set(this.el.object3D.position, this.ray);
        this.raycaster.near = 0;
        this.raycaster.far = 1;

        const intersectable =
          collidedEntity.components["occlude-mesh"]?.raycastMesh;
        if (intersectable) {
          const intersections = this.raycaster.intersectObjects(
            [intersectable],
            true
          );
          if (intersections[0]) {
            console.log("death intersection", intersections[0]);
            didDie = true;
          } else {
            console.log("no intersections found for death punch");
          }
        }
      } else {
        didDie = true;
      }

      if (didDie) {
        console.log("died colliding with", collidedEntity);
        this.deathCollidedEntity = collidedEntity;
        this.shouldDie = true;
        this.deathVelocity = this.el.body.velocity.clone();
        this.deathNormal = event.detail.contact.ni.clone();
      }
    }

    switch (this.status) {
      case "falling":
        if (
          this.validFloorMeshTypes.length == 0 ||
          this.validFloorMeshTypes.includes(collidedEntity.dataset.worldMesh)
        ) {
          const normal = event.detail.contact.ni;
          const upAngle = this.worldBasis.up.angleTo(
            new THREE.Vector3(normal.x, normal.y, normal.z)
          );
          if (upAngle <= this.floorCollisionNormalThreshold) {
            this.resetLegs();
            this.setFloor(collidedEntity);
          }
        }

        if (!this.punched) {
          const velocity = this.el.body.velocity;
          this.playBounceSound(velocity);
        }
        break;
    }
  },

  bounceThresholds: {
    strong: 4,
    medium: 2,
    weak: 0.2,
  },
  playBounceSound: function (velocity) {
    const length = velocity.length();

    let soundName;
    if (length > this.bounceThresholds.strong) {
      soundName = "bounceStrongSound";
    } else if (length > this.bounceThresholds.medium) {
      soundName = "bounceMediumSound";
    } else if (length > this.bounceThresholds.weak) {
      soundName = "bounceWeakSound";
    }

    // console.log("bounce", length, soundName);

    if (!soundName) {
      return;
    }

    this.playBounceSoundName(soundName);
  },
  playBounceSoundName: async function (soundName) {
    this.returnSound("bounceWeakSound");
    this.returnSound("bounceMediumSound");
    this.returnSound("bounceStrongSound");

    this.playSound(soundName);
  },

  remove: function () {
    if (window.goombas.includes(this)) {
      // console.log("removing goomba");
      window.goombas.splice(window.goombas.indexOf(this), 1);
    }

    clearInterval(this.lookAtSelectorInterval);
    clearInterval(this.lookAtRaycastSelectorInterval);
    clearInterval(this.floorInterval);

    if (this.status == "petting") {
      this.el.sceneEl.emit("stopPetting", { side: this.petSide });
    }
    if (this.purrSound) {
      this.stopPurrSound();
    }
  },

  pause: function () {
    if (this.status == "petting") {
      this.el.sceneEl.emit("stopPetting", { side: this.petSide });
    }

    if (this.purrSound) {
      this.stopPurrSound();
      this.playPurrFadeOutSound();
    }
  },

  debugColors: false,

  onObbCollisionStarted: async function (event) {
    const collidedEntity = event.detail.withEl;
    const otherGoomba = collidedEntity.components["goomba"];
    switch (this.status) {
      case "walking":
        if (otherGoomba) {
          if (
            otherGoomba.status == "walking" &&
            this.collidedWhenWalking &&
            otherGoomba.collidedWhenWalking
          ) {
            return;
          }
          if (
            this.lastTimeCollidedWhenWalking != undefined &&
            this.latestTick - this.lastTimeCollidedWhenWalking < 200
          ) {
            return;
          }
          if (
            otherGoomba.lastTimeCollidedWhenWalking != undefined &&
            otherGoomba.latestTick - otherGoomba.lastTimeCollidedWhenWalking <
              200
          ) {
            return;
          }
          if (
            this.lastCollisionGoomba == otherGoomba &&
            otherGoomba.lastCollisionGoomba == this
          ) {
            return;
          }

          if (this.debugColors) {
            this.body.setAttribute("color", "yellow");
            otherGoomba.body.setAttribute("color", "yellow");
          }

          this.collidedWhenWalking = true;
          otherGoomba.collidedWhenWalking = true;

          if (true) {
            if (true) {
              this.collisionVector.subVectors(
                otherGoomba.el.object3D.position,
                this.el.object3D.position
              );
              let angle = Math.atan2(
                this.collisionVector.x,
                this.collisionVector.z
              );
              angle = THREE.MathUtils.radToDeg(angle);

              let offset = 90;
              if (
                Math.abs(this.angle - (angle + offset)) >
                Math.abs(this.angle - (angle - offset))
              ) {
                offset = -90;
              }

              this.collidedNewAngle = angle + offset;
              otherGoomba.collidedNewAngle = angle + 180 + offset;
            } else {
              this.collidedNewAngle = this.angle + offset;
              otherGoomba.collidedNewAngle = otherGoomba.angle + offset;
            }
          } else {
            const sign = Math.round(Math.random()) ? 1 : -1;
            const offset = 90 * sign;
            this.collidedNewAngle = otherGoomba.angle;
            otherGoomba.collidedNewAngle = this.angle;
          }

          this.lastCollisionGoomba = otherGoomba;
          otherGoomba.lastCollisionGoomba = this;

          this.lastWalkTick = -this.walkInterval;
          otherGoomba.lastWalkTick = -otherGoomba.walkInterval;

          // console.log(
          //   "collided with other goomba",
          //   this.collidedNewAngle,
          //   otherGoomba.collidedNewAngle
          // );
        }
        break;
    }
  },

  isFlatOnOneSide: function () {
    this.checkOrientation();
    return this.orientation != "unknown";
  },

  setFloor: function (newFloor) {
    clearInterval(this.floor);
    if (this.floor == newFloor) {
      return;
    }
    this.floor = newFloor;
    // console.log("setting floor", newFloor);
    if (this.floor) {
      clearInterval(this.floorInterval);
      const checkIfStoppedMoving = () => {
        const stoppedMoving =
          this.el.components["dynamic-body"].body.velocity.length() < 0.01;
        const stoppedRotating =
          this.el.components["dynamic-body"].body.angularVelocity.length() <
          0.01;
        const isFlat = this.isFlatOnOneSide();
        const stopped = stoppedMoving && stoppedRotating && isFlat;
        // console.log({ stoppedMoving, stoppedRotating, isFlat });
        if (stopped) {
          // console.log("stopped");
          if (this.punched) {
            this.punched = false;
          }
          this.landed = true;
          clearInterval(this.floorInterval);
          this.setPhysicsEnabled(false);
          setTimeout(() => {
            this.setStatus("getting up");
          }, 1);
        }
      };
      this.floorInterval = setInterval(() => {
        checkIfStoppedMoving();
      }, 50);
      checkIfStoppedMoving();
    } else {
      this.setPhysicsEnabled(false);
    }
  },

  onGrabStarted: function () {
    // console.log("onGrabStarted");
    switch (this.status) {
      default:
        this.setStatus("grabbed");
        // if (this.data.physics) {
        //   this.setPhysicsEnabled(false);
        // }
        break;
    }
  },
  onGrabEnded: function () {
    // console.log("onGrabEnded");
    switch (this.status) {
      default:
        if (this.data.physics) {
          // this.setPhysicsEnabled(true);
          this.setStatus("falling");
        } else {
          this.setStatus("idle");
        }
        break;
    }
  },

  punchScalar: 5,

  setPhysicsEnabled: function (enabled) {
    this.updatePhysicsEnabledFlag = enabled;
  },
  updatePhysicsEnabled: function (enabled) {
    if (enabled) {
      this.el.removeAttribute("dynamic-body");
      this.el.removeAttribute("static-body");
      this.el.removeAttribute("shape__main");

      if (this.status == "walking") {
        this.el.setAttribute("static-body", this.staticBody);
        this.el.setAttribute("shape__main", this.shapeMain);
      } else {
        this.el.setAttribute("dynamic-body", this.dynamicBody);
        this.el.setAttribute("shape__main", this.shapeMain);
      }
    } else {
      this.el.removeAttribute("dynamic-body");
      this.el.removeAttribute("static-body");
      this.el.removeAttribute("shape__main");
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
    pitch: { min: -40, max: 40 },
    yaw: { min: -40, max: 40 },
  },

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
    this.resetEyesScale();
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
  setEyeScale: async function (
    side,
    scale,
    dur = 50,
    easing = "linear",
    loop = false,
    dir = "normal",
    wholeEye = false
  ) {
    let entity = this.eyeScales[side];
    if (!entity) {
      return;
    }
    if (scale.width == undefined) {
      scale.width = 1;
    }
    if (scale.height == undefined) {
      scale.height = 1;
    }
    let width = 1;
    let height = 1;
    if (wholeEye) {
      entity = entity.closest(".eye");
      width = scale.width;
      height = scale.height;
    } else {
      width = THREE.MathUtils.lerp(
        this.eyeScaleRange.width.min,
        this.eyeScaleRange.width.max,
        scale.width
      );
      height = THREE.MathUtils.lerp(
        this.eyeScaleRange.height.min,
        this.eyeScaleRange.height.max,
        scale.height
      );
    }

    this.clearEyeScaleAnimation(side, wholeEye);
    if (dur == 0) {
      entity.object3D.scale.set(width, height, 1);
    } else {
      entity.setAttribute("animation__scale", {
        property: "scale",
        to: `${width} ${height} 1`,
        from:
          dir == "alternate"
            ? `${this.eyesScales[side].width} ${this.eyesScales[side].height} 1`
            : undefined,
        dur: dur,
        easing,
        loop,
        dir,
      });
      return new Promise((resolve) => {
        entity.addEventListener("animationcomplete__scale", () => {
          resolve();
        });
      });
    }
  },
  setEyesScale: function (scale, dur, easing, loop, dir, wholeEye) {
    this.sides.forEach((side) => {
      this.setEyeScale(side, ...arguments);
    });
  },

  setWhiteEyeRoll: function (
    side,
    { roll },
    options = { dur: 100, easing: "easeInOutQuad" }
  ) {
    if (side == "left") {
      roll *= -1;
    }
    const eyeWhite = this.eyeWhites[side];
    eyeWhite.removeAttribute("animation__roll");
    eyeWhite.setAttribute("animation__roll", {
      property: "rotation",
      to: `0 0 ${roll}`,
      ...options,
    });
  },
  setWhiteEyesRoll: function () {
    this.sides.forEach((side) => {
      this.setWhiteEyeRoll(side, ...arguments);
    });
  },

  setEyelid: function (
    side,
    { upper, lower },
    options = { dur: 100, easing: "easeInOutQuad" }
  ) {
    lower = 1 - lower;
    lower = Math.max(lower, upper);

    let eyeHeight = lower - upper; // [0, 1]
    const thetaLength = eyeHeight * 180;

    let eyeYOffset = upper; // [0, 1]
    const thetaStart = eyeYOffset * 180;

    const eyeWhite = this.eyeWhites[side];

    eyeWhite.removeAttribute("animation__thetalength");
    eyeWhite.setAttribute("animation__thetalength", {
      property: "geometry.thetaLength",
      //from: eyeWhite.getAttribute("theta-length"),
      to: thetaLength.toString(),
      ...options,
    });

    eyeWhite.removeAttribute("animation__thetastart");
    eyeWhite.setAttribute("animation__thetastart", {
      property: "geometry.thetaStart",
      // from: eyeWhite.getAttribute("theta-start"),
      to: thetaStart.toString(),
      ...options,
    });
  },
  setEyelids: function () {
    this.sides.forEach((side) => {
      this.setEyelid(side, ...arguments);
    });
  },

  emotions: ["default", "happy", "angry", "sad"],
  setEmotion: function (newEmotion) {
    if (this.emotion == newEmotion) {
      return;
    }
    if (!this.emotions.includes(newEmotion)) {
      console.error(`invalid emotion "${newEmotion}"`);
      return;
    }
    this.emotion = newEmotion;

    this.blink();
    switch (this.emotion) {
      case "happy":
        this.setEyelids({ upper: 0, lower: 0.3 });
        this.setWhiteEyesRoll({ roll: 8 });
        break;
      case "sad":
        this.setEyelids({ upper: 0.3, lower: 0.0 });
        this.setWhiteEyesRoll({ roll: -15 });
        break;
      case "angry":
        this.setEyelids({ upper: 0.3, lower: 0.2 });
        this.setWhiteEyesRoll({ roll: 12 });
        break;
      case "default":
        this.setEyelids({ upper: 0, lower: 0 });
        this.setWhiteEyesRoll({ roll: 0 });
        break;
      default:
        break;
    }
  },

  resetEyesScale: function () {
    this.setEyeScale("left", this.eyesScales.left);
    this.setEyeScale("right", this.eyesScales.right);
    this.setEyesScale(
      { height: 1, width: 1 },
      100,
      undefined,
      undefined,
      undefined,
      true
    );
  },
  clearEyeScaleAnimation: function (side, wholeEye = false) {
    let entity = this.eyeScales[side];
    if (!entity) {
      return;
    }
    if (wholeEye) {
      entity = entity.closest(".eye");
    }
    entity.removeAttribute("animation__scale");
  },
  clearEyesScaleAnimation: function () {
    this.sides.forEach((side) => {
      this.clearEyeScaleAnimation(side);
    });
  },

  blinkIntervalRange: { min: 3000, max: 5000 },
  blink: async function (dur = 110, easing = "easeInBack", height = 0) {
    if (this.isBlinking) {
      return;
    }
    this.lastBlinkTick = this.latestTick;
    this.blinkInterval = THREE.MathUtils.lerp(
      this.blinkIntervalRange.min,
      this.blinkIntervalRange.max,
      Math.random()
    );
    this.isBlinking = true;
    const promises = this.sides.map(async (side) => {
      const firstSide = Math.round(Math.random()) ? "left" : "right";
      await this.setEyeScale(
        side,
        { height, width: 1 },
        side == firstSide ? dur : dur + 18,
        easing,
        1,
        "alternate",
        true
      );
    });
    await Promise.all(promises);
    this.isBlinking = false;
  },

  // EYE ROTATOR
  eyeRotatorsRange: {
    roll: { min: -50, max: 50 },
  },
  setEyeRoll: function (
    side,
    rotation,
    dur = 50,
    easing = "linear",
    loop = false,
    dir = "normal",
    invert = false
  ) {
    const entity = this.eyeRotators[side];
    if (!entity) {
      return;
    }

    let roll = THREE.MathUtils.lerp(
      this.eyeRotatorsRange.roll.min,
      this.eyeRotatorsRange.roll.max,
      invert ? 1 - rotation.roll : rotation.roll
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
  setEyesRoll: async function (rotation, dur, easing, loop, dir, invert) {
    this.sides.forEach((side) => {
      if (invert) {
        const invert = side == "left";
        return this.setEyeRoll(side, rotation, dur, easing, loop, dir, invert);
      } else {
        return this.setEyeRoll(side, ...arguments);
      }
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

  lookAtRefocusScalar: 0.025,
  lookAtRefocusScalarRange: { min: 0.0, max: 0.02 },

  eyeRefocusIntervalRange: { min: 100, max: 800 },
  wanderEyesIntervalRange: { min: 750, max: 2300 },
  wanderRefocusScalar: 3,
  pointToLookAtAngleThreshold: THREE.MathUtils.degToRad(60),

  wanderEyesEulerRange: {
    pitch: { min: -40, max: 10 },
    yaw: { min: -50, max: 50 },
  },

  lookAt: function (position, refocus = false, refocusScalar = 1) {
    this.lookAtPosition.copy(position);
    if (refocus) {
      if (true) {
        // this.el.object3D.getWorldQuaternion(this.worldQuaternion);

        const intervalInterpolation = THREE.MathUtils.inverseLerp(
          0,
          this.eyeRefocusIntervalRange.max,
          this.eyeRefocusInterval
        );
        const scalar = refocusScalar * (1 - intervalInterpolation);

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

        if (false) {
          const entity = this.squash;
          this.squashLookAtQuaternion1.copy(entity.object3D.quaternion);
          this.tempLookAtEuler.copy(entity.object3D.rotation);
          entity.object3D.lookAt(this.lookAtPosition);
          this.squashLookAtQuaternion2.copy(entity.object3D.quaternion);
          entity.object3D.rotation.copy(this.tempLookAtEuler);
          this.squashLookAtStartTime = this.latestTick;
          this.isRotatingSquash = true;
        }
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
        this.lookAtEuler.z = 0;
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

  distanceRange: { min: 0.15, max: 5 },
  angleThreshold: 0.75,

  angleThresholds: {
    pitch: { min: -0.1, max: 0.7 },
    yaw: { min: -0.7, max: 0.7 },
  },

  checkObjectToLookAt: function () {
    let closestEntity;
    let closestDistance = 1;
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
    this.lookAtTargets.forEach((entity) => {
      if (!entity.object3D.visible) {
        return;
      }
      if (!entity.isPlaying) {
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

      if (this.isLockedToCamera) {
        if (
          entity != this.camera &&
          !entity.components["hand-tracking-controls"]
        ) {
          return;
        }
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

      if (entity.components["hand-tracking-controls"]) {
        if (pitch < 0.01) {
          return;
        }
      }

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
    roll: { min: 50, max: -50 },
    yaw: { min: 50, max: -50 },
  },

  setLegRotation: async function (
    side,
    rotation,
    dur = 50,
    easing = "linear",
    loop = false,
    dir = "normal",
    invert = false,
    isFoot = false
  ) {
    let entity = this.legs[side];
    if (!entity) {
      return;
    }
    if (isFoot) {
      entity = this.feet[side];
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

    if (rotation.yaw == undefined) {
      rotation.yaw = 0.5;
    }
    let yaw = THREE.MathUtils.lerp(
      this.legRotationRange.yaw.min,
      this.legRotationRange.yaw.max,
      invert ? 1 - rotation.yaw : rotation.yaw
    );
    let yaw2 = 0;
    if (rotation.yaw2 != undefined) {
      yaw2 = THREE.MathUtils.lerp(
        this.legRotationRange.yaw.min,
        this.legRotationRange.yaw.max,
        invert ? 1 - rotation.yaw2 : rotation.yaw2
      );
    }

    if (rotation.roll == undefined) {
      rotation.roll = 0.5;
    }
    let roll = THREE.MathUtils.lerp(
      this.legRotationRange.roll.min,
      this.legRotationRange.roll.max,
      invert ? 1 - rotation.roll : rotation.roll
    );
    let roll2 = 0;
    if (rotation.roll2 != undefined) {
      roll2 = THREE.MathUtils.lerp(
        this.legRotationRange.roll.min,
        this.legRotationRange.roll.max,
        invert ? 1 - rotation.roll2 : rotation.roll2
      );
    }

    this.clearLegRotationAnimation(side, isFoot);
    if (dur == 0) {
      pitch = THREE.MathUtils.degToRad(pitch);
      yaw = THREE.MathUtils.degToRad(yaw);
      roll = THREE.MathUtils.degToRad(roll);
      entity.object3D.rotation.set(pitch, yaw, roll);
    } else {
      const options = {
        property: "rotation",
        to: `${pitch} ${yaw} ${roll}`,
        from: dir == "alternate" ? `${-pitch} ${-yaw} ${-roll}` : undefined,
        dur: dur,
        dir: dir,
        easing,
        loop,
      };
      if (pitch2 != undefined) {
        options.from = `${pitch2} ${yaw2} ${roll2}`;
      }
      entity.setAttribute("animation__rot", options);
      return new Promise((resolve) => {
        entity.addEventListener("animationcomplete__rot", () => {
          resolve();
        });
      });
    }
  },
  setLegsRotation: async function (
    rotation,
    dur,
    easing,
    loop,
    dir,
    invert = false,
    isFoot = false
  ) {
    const promises = this.sides.map((side) => {
      if (invert) {
        const invert = side == "left";
        return this.setLegRotation(
          side,
          rotation,
          dur,
          easing,
          loop,
          dir,
          invert,
          isFoot
        );
      } else {
        return this.setLegRotation(side, ...arguments);
      }
    });
    const x = Date.now();
    await Promise.all(promises);
  },

  resetLegs: function () {
    this.setLegsRotation({ pitch: 0.5 });
    this.setLegsRotation(
      { pitch: 0.5 },
      undefined,
      undefined,
      undefined,
      undefined,
      false,
      true
    );
  },
  clearLegRotationAnimation: function (side, isFoot) {
    let entity = this.legs[side];
    if (!entity) {
      return;
    }
    if (isFoot) {
      entity = this.feet[side];
    }
    entity.removeAttribute("animation__rot");
  },
  clearLegsRotationAnimation: function (isFoot = true) {
    this.sides.forEach((side) => {
      this.clearLegRotationAnimation(side, isFoot);
    });
  },

  squashLookAtInterval: 300,

  walkInterval: 100,
  walkSpeed: 0.0001,
  walkIntervalRange: { min: 100, max: 1200 },
  walkAngleRange: { min: -30, max: 30 },

  idleToWalkingTime: 1000,

  petInterval: { short: 50, long: 50 },
  petDistanceThreshold: { start: 0.03, end: 0.15 },
  petSquashRange: { min: -0.04, max: 0.02 },
  petSquashYRange: { min: 0.65, max: 1 },
  petSquashXZRange: { min: 1, max: 1.1 },
  petSquashEyesHeightRange: { min: 0.1, max: 1 },
  petSquashEyesHeightBiasRange: { min: -0.2, max: 0.2 },
  petSquashEyesRollRange: { min: 0.4, max: 0.6 },
  petEyeSquashRange: { min: -0.03, max: 0.01 },

  petSquashPurrRange: { min: 1, max: 0.08 },

  petBodyPitchRange: { min: -0.05, max: 0.05 },
  petSquashBodyPitchRange: { min: -10, max: 5 },

  petBodyRollRange: { min: -0.05, max: 0.05 },
  petSquashBodyRollRange: { min: 5, max: -5 },

  tick: function (time, timeDelta) {
    this.el.object3D.getWorldPosition(this.worldPosition);
    this.el.object3D.getWorldQuaternion(this.worldQuaternion);
    if (this.shouldDie) {
      this.el.emit("die");
      this.el.remove();
      const squashedGoomba =
        this.el.sceneEl.components["pool__squashedgoomba"].requestEntity();
      squashedGoomba.play();
      const position = new THREE.Vector3();
      // console.log(this.deathCollidedEntity);
      if (false) {
        this.deathCollidedEntity.components["obb-collider"].obb.clampPoint(
          this.worldPosition,
          position
        );
      } else {
        position.copy(this.worldPosition);

        if (false) {
          const ray = new THREE.Ray(this.worldPosition, this.deathVelocity);
          this.deathCollidedEntity.components["obb-collider"].aabb.intersectRay(
            ray,
            position
          );
        } else {
          this.ray.copy(this.deathVelocity);
          this.raycaster.set(this.worldPosition, this.ray);
          this.raycaster.near = 0;
          this.raycaster.far = 1;
          let intersectable =
            this.deathCollidedEntity.components["occlude-mesh"]?.raycastMesh;
          // console.log("intersectable", intersectable);
          const intersections = this.raycaster.intersectObjects(
            intersectable ? [intersectable] : this.lookAtRaycastTargetObjects,
            true
          );
          if (intersections[0]) {
            position.copy(intersections[0].point);
          } else {
            // console.log("no intersections found for death punch");
          }
        }
      }
      squashedGoomba.object3D.position.copy(position);
      {
        const { x, y, z } = this.deathNormal;

        const yaw = Math.atan2(x, z);
        const pitch = Math.atan2(y, Math.sqrt(x * x + z * z));
        // console.log("death", { yaw, pitch });
        squashedGoomba.object3D.rotation.set(-pitch, yaw, 0, "YXZ");
      }
      squashedGoomba.components["squashed-goomba"].start();
      return;
    }
    this.sphere.center.copy(this.worldPosition);

    if (this.shelled && this.status == "falling") {
      if (this.physicsBody.velocity.y < 0) {
        console.log("die");

        const coin = this.el.sceneEl.components["pool__coin"].requestEntity();
        coin.play();
        {
          const cameraToCoin = new THREE.Vector3().subVectors(
            this.camera.object3D.position,
            this.el.object3D.position
          );
          const yaw = Math.atan2(cameraToCoin.x, cameraToCoin.z);
          coin.object3D.rotation.set(0, yaw, 0, "YXZ");
          console.log("rotation", coin.object3D.rotation);
        }
        {
          const { x, y, z } = this.el.object3D.position;
          const position = new THREE.Vector3(x, y - 0.04, z);
          coin.object3D.position.copy(position);
          console.log("position", coin.object3D.position);
        }
        console.log("coin", coin);
        coin.components.coin.start();

        this.el.emit("die");
        this.el.remove();
      }
    }

    if (this.punchOptions) {
      const { velocity, position } = this.punchOptions;
      this.punchOptions = undefined;
      this._punch(velocity, position);
    }
    if (this.shellHitOptions) {
      const { velocity, position } = this.shellHitOptions;
      this.shellHitOptions = undefined;
      this._shellHit(velocity, position);
    }
    if (this.stompOptions) {
      const { distance, yaw, kill } = this.stompOptions;
      this.stompOptions = undefined;
      this._stomp(distance, yaw, kill);
    }

    if (this.punchSqueakSound) {
      this.punchSqueakSound.object3D.position.copy(this.worldPosition);
    }

    if ("updatePhysicsEnabledFlag" in this) {
      const enabled = this.updatePhysicsEnabledFlag;
      this.updatePhysicsEnabled(enabled);
      delete this.updatePhysicsEnabledFlag;
    }

    this.latestTick = time;

    if (this.latestTick - this.lastTimePunched < 10) {
      return;
    }

    if (this.status == "falling") {
      if (this.worldPosition.y < -40) {
        console.log("fell through floor");
        this.el.remove();
      }
    }

    if (
      this.status == "idle" ||
      this.status == "petting" ||
      this.status == "walking"
    ) {
      if (
        this.latestTick - this.lastPetTick >
        (this.status == "petting"
          ? this.petInterval.short
          : this.petInterval.long)
      ) {
        this.lastPetTick = this.latestTick;
        if (this.status == "idle" || this.status == "walking") {
          for (const side in this.hands) {
            const hand = this.hands[side];
            if (hand?.controllerPresent) {
              this.petEntity.object3D.getWorldPosition(this.petPosition);
              const distance = hand.indexTipPosition.distanceTo(
                this.petPosition
              );
              // console.log({ side, distance });
              if (distance < this.petDistanceThreshold.start) {
                this.petSide = side;
                this.setStatus("petting");
                this.isLockedToCamera = true;
                this.lookAtObject(this.camera);
                break;
              }
            }
          }
        }
        if (this.status == "petting") {
          const hand = this.hands[this.petSide];
          if (hand?.controllerPresent) {
            this.petEntity.object3D.getWorldPosition(this.petPosition);
            const distance = hand.indexTipPosition.distanceTo(this.petPosition);
            // console.log({ side, distance });
            if (distance > this.petDistanceThreshold.end) {
              this.setStatus("idle");
            } else {
              const easing = "linear";
              const dur = 40;

              this.localPetPosition.copy(hand.indexTipPosition);
              this.petEntity.object3D.worldToLocal(this.localPetPosition);

              let squashInterpolation = THREE.MathUtils.inverseLerp(
                this.petSquashRange.min,
                this.petSquashRange.max,
                this.localPetPosition.y
              );
              let clampedSquashInterpolation = THREE.MathUtils.clamp(
                squashInterpolation,
                0,
                1
              );
              if (this.purrSound) {
                const purrSoundInterpolation = THREE.MathUtils.lerp(
                  this.petSquashPurrRange.min,
                  this.petSquashPurrRange.max,
                  clampedSquashInterpolation
                );
                this.latestPurrVolume = purrSoundInterpolation;
                this.purrSound.components.sound.pool.children[0].setVolume(
                  purrSoundInterpolation
                );
              }
              const squashInterpolationY = THREE.MathUtils.lerp(
                this.petSquashYRange.min,
                this.petSquashYRange.max,
                clampedSquashInterpolation
              );
              const squashInterpolationXZ = THREE.MathUtils.lerp(
                this.petSquashXZRange.min,
                this.petSquashXZRange.max,
                1 - clampedSquashInterpolation
              );

              if (true) {
                this.squash.removeAttribute("animation__scale");
                this.squash.setAttribute("animation__scale", {
                  property: "scale",
                  to: `${squashInterpolationXZ} ${squashInterpolationY} ${squashInterpolationXZ}`,
                  dur: dur,
                  easing: easing,
                });
              } else {
                this.squash.object3D.scale.y = squashInterpolationY;
              }

              squashInterpolation = THREE.MathUtils.inverseLerp(
                this.petEyeSquashRange.min,
                this.petEyeSquashRange.max,
                this.localPetPosition.y
              );
              clampedSquashInterpolation = THREE.MathUtils.clamp(
                squashInterpolation,
                0,
                1
              );
              const eyesScaleHeight = THREE.MathUtils.lerp(
                this.petSquashEyesHeightRange.min,
                this.petSquashEyesHeightRange.max,
                clampedSquashInterpolation
              );

              squashInterpolation = THREE.MathUtils.inverseLerp(
                this.petBodyPitchRange.min,
                this.petBodyPitchRange.max,
                this.localPetPosition.z
              );
              clampedSquashInterpolation = THREE.MathUtils.clamp(
                squashInterpolation,
                0,
                1
              );
              const bodyPitch = THREE.MathUtils.lerp(
                this.petSquashBodyPitchRange.min,
                this.petSquashBodyPitchRange.max,
                clampedSquashInterpolation
              );

              squashInterpolation = THREE.MathUtils.inverseLerp(
                this.petBodyRollRange.min,
                this.petBodyRollRange.max,
                this.localPetPosition.x
              );
              clampedSquashInterpolation = THREE.MathUtils.clamp(
                squashInterpolation,
                0,
                1
              );
              const bodyRoll = THREE.MathUtils.lerp(
                this.petSquashBodyRollRange.min,
                this.petSquashBodyRollRange.max,
                clampedSquashInterpolation
              );

              if (true) {
                this.squash.removeAttribute("animation__rot");
                this.squash.setAttribute("animation__rot", {
                  property: "rotation",
                  to: `${bodyPitch} 0 ${bodyRoll}`,
                  dur: dur,
                  easing: easing,
                });
              } else {
                this.squash.object3D.rotation.x =
                  THREE.MathUtils.degToRad(bodyPitch);
                this.squash.object3D.rotation.z =
                  THREE.MathUtils.degToRad(bodyRoll);
              }

              if (true) {
                const dominantSide = bodyRoll > 0 ? "left" : "right";
                const otherSide = dominantSide == "left" ? "right" : "left";

                let rollEyeHeightBias = THREE.MathUtils.lerp(
                  this.petSquashEyesHeightBiasRange.min,
                  this.petSquashEyesHeightBiasRange.max,
                  clampedSquashInterpolation
                );
                rollEyeHeightBias = Math.abs(rollEyeHeightBias);

                this.setEyeScale(
                  dominantSide,
                  { height: eyesScaleHeight, width: 1 },
                  dur,
                  easing,
                  undefined,
                  undefined,
                  true
                );
                this.setEyeScale(
                  otherSide,
                  {
                    height: THREE.MathUtils.clamp(
                      eyesScaleHeight + rollEyeHeightBias,
                      0,
                      1
                    ),
                    width: 1,
                  },
                  dur,
                  easing,
                  undefined,
                  undefined,
                  true
                );
              } else {
                this.setEyesScale(
                  { height: eyesScaleHeight, width: 1 },
                  dur,
                  easing,
                  undefined,
                  undefined,
                  true
                );
              }

              if (false) {
                const eyesRoll = THREE.MathUtils.lerp(
                  this.petSquashEyesRollRange.min,
                  this.petSquashEyesRollRange.max,
                  clampedSquashInterpolation
                );
                this.setEyesRoll(
                  { roll: eyesRoll },
                  dur,
                  easing,
                  false,
                  undefined,
                  true
                );
              }
            }
          } else {
            this.setStatus("idle");
          }
        }
      }
    }

    if (this.status == "walking" && this.floor) {
      if (!this.slowDown) {
        this.slowDown =
          this.slowDown ||
          (this.objectToLookAt == this.camera && this.isLookedAt);
        if (this.slowDown) {
          //this.walkInterval *= 2;
        }
      }

      if (time - this.lastWalkTick > this.walkInterval) {
        this.lastWalkTick = time;
        this.walkInterval = THREE.MathUtils.lerp(
          this.walkIntervalRange.min,
          this.walkIntervalRange.max,
          Math.random()
        );

        let angleOffset = 0;

        angleOffset = THREE.MathUtils.lerp(
          this.walkAngleRange.min,
          this.walkAngleRange.max,
          Math.random()
        );

        let isAngleRelative = true;
        if (this.collidedWhenWalking) {
          if (this.debugColors) {
            this.body.setAttribute("color", "#a14e00");
          }

          this.collidedWhenWalking = false;
          this.lastTimeCollidedWhenWalking = this.latestTick;
          if (this.collidedNewAngle != undefined) {
            isAngleRelative = false;
            angleOffset = this.collidedNewAngle;
            this.collidedNewAngle = undefined;
          } else {
            angleOffset = 180;
          }
          this.walkInterval = 300;
          // console.log("collided angleOffset", angleOffset);
        }

        const distance = this.walkInterval * this.walkSpeed;

        let attempts = -1;
        const turnSections = 12;
        const turnAngle = 360 / turnSections;
        const turnScalar = Math.round(Math.random()) ? 1 : -1;
        let didIntersectGoomba = false;
        let didIntersectMesh = false;
        let didIntersectWall = false;
        this.tempPointToWalkTo2 =
          this.tempPointToWalkTo2 || new THREE.Vector3();
        this.pointToWalkToOffset2 =
          this.pointToWalkToOffset2 || new THREE.Vector3();

        do {
          attempts++;
          let angle = turnAngle * turnScalar * attempts + angleOffset;
          let shouldBreak = false;
          if (attempts == turnSections) {
            angle = 180;
            isAngleRelative = true;
            shouldBreak = true;
          }
          this.pointToWalkToOffset.set(0, 0, distance);
          this.pointToWalkToOffset.applyAxisAngle(
            this.worldBasis.up,
            THREE.MathUtils.degToRad(angle)
          );
          if (isAngleRelative) {
            this.pointToWalkToOffset.applyQuaternion(this.worldQuaternion);
          }
          // console.log({ attempts });

          this.tempPointToWalkTo.copy(this.worldPosition);
          this.tempPointToWalkTo.add(this.pointToWalkToOffset);
          this.pointToWalkToOffset2
            .copy(this.pointToWalkToOffset)
            .setLength(0.25);
          this.tempPointToWalkTo2
            .copy(this.worldPosition)
            .add(this.pointToWalkToOffset2);
          this.floor.components["my-obb-collider"].obb.clampPoint(
            this.tempPointToWalkTo2,
            this.clampedTempPointToWalkTo
          );
          if (shouldBreak) {
            break;
          }

          didIntersectGoomba = this.doesPointIntersectAnyGoombas(
            this.tempPointToWalkTo2
          );
          if (!didIntersectGoomba) {
            didIntersectWall = this.doesDirectionIntersectAnyWalls(
              this.pointToWalkToOffset.clone().normalize()
            );
          }
          if (!didIntersectGoomba && !didIntersectWall) {
            didIntersectMesh = this.doesPointIntersectAnyMeshes(
              this.tempPointToWalkTo2
            );
          }
        } while (
          didIntersectWall ||
          didIntersectMesh ||
          didIntersectGoomba ||
          Math.abs(
            this.clampedTempPointToWalkTo.x - this.tempPointToWalkTo2.x
          ) > 0.001 ||
          Math.abs(
            this.clampedTempPointToWalkTo.z - this.tempPointToWalkTo2.z
          ) > 0.001
        );

        this.pointToWalkTo.copy(this.tempPointToWalkTo);
        this.pointToWalkFrom.copy(this.el.object3D.position);

        this.pointToWalkToSphere.object3D.position.copy(this.pointToWalkTo);

        let angle = Math.atan2(
          this.pointToWalkToOffset.x,
          this.pointToWalkToOffset.z
        );

        this.quaternionToTurnFrom.copy(this.el.object3D.quaternion);
        this.tempEuler.set(0, angle, 0);
        this.quaternionToTurnTo.setFromEuler(this.tempEuler);

        if (this.slowDown) {
          this.setStatus("idle");
          this.slowDown = false;
          this.isLockedToCamera = true;
          this.lookAtObject(this.camera);
        }
        this.angle = THREE.MathUtils.radToDeg(angle);
      }

      let interpolation = THREE.MathUtils.inverseLerp(
        this.lastWalkTick,
        this.lastWalkTick + this.walkInterval,
        this.latestTick
      );
      this.el.object3D.position.lerpVectors(
        this.pointToWalkFrom,
        this.pointToWalkTo,
        interpolation
      );

      interpolation = THREE.MathUtils.inverseLerp(
        this.lastWalkTick,
        this.lastWalkTick + 200,
        this.latestTick
      );
      if (interpolation <= 1) {
        this.el.object3D.quaternion.slerpQuaternions(
          this.quaternionToTurnFrom,
          this.quaternionToTurnTo,
          interpolation
        );
      }
    }

    if (
      this.status == "idle" &&
      this.floor &&
      this.landed &&
      !this.isLookedAt &&
      time - this.lastTimeLookedAt > this.idleToWalkingTime
    ) {
      this.setStatus("walking");
    }

    if (this.isRolling) {
      if (this.latestTick - this.startRollingTime < this.rollDuration) {
        const enitity = this.el;
        let interpolation = THREE.MathUtils.inverseLerp(
          this.startRollingTime,
          this.startRollingTime + this.rollDuration,
          this.latestTick
        );
        interpolation = this.easeInOutElastic(interpolation);
        enitity.object3D.quaternion.slerpQuaternions(
          this.rollQuaternionFrom,
          this.rollQuaternionTo,
          interpolation
        );
      } else {
        this.isRolling = false;
      }
    }
    if (
      this.status == "idle" ||
      this.status == "grabbed" ||
      this.status == "falling" ||
      this.status == "walking" ||
      this.status == "getting up" ||
      this.status == "petting"
    ) {
      if (
        this.status != "petting" &&
        time - this.lastBlinkTick > this.blinkInterval
      ) {
        this.blink();
      }
      if (this.isBlinking) {
        return;
      }
      if (this.isRotatingSquash) {
        if (
          this.latestTick - this.squashLookAtStartTime <
          this.squashLookAtInterval
        ) {
          const enitity = this.squash;
          let interpolation = THREE.MathUtils.inverseLerp(
            this.squashLookAtStartTime,
            this.squashLookAtStartTime + this.squashLookAtInterval,
            this.latestTick
          );
          const t = interpolation;
          interpolation = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          enitity.object3D.quaternion.slerpQuaternions(
            this.squashLookAtQuaternion1,
            this.squashLookAtQuaternion2,
            interpolation
          );
        } else {
          this.isRotatingSquash = false;
        }
      }

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
          this.forwardVector
            .set(0, 0, 1)
            .applyQuaternion(this.worldQuaternion)
            .normalize();
          this.pointToLookAtDirection
            .subVectors(this.pointToLookAt, this.worldPosition)
            .normalize();
          let angle = this.forwardVector.angleTo(this.pointToLookAtDirection);
          if (false)
            console.log(
              `angle from ${this.forwardVector
                .toArray()
                .map((value) => value.toFixed(3))
                .join(",")} to ${this.pointToLookAtDirection
                .toArray()
                .map((value) => value.toFixed(3))
                .join(",")}: ${THREE.MathUtils.radToDeg(angle)}}`
            );
          changeFocus =
            this.hasPointToLookAt && angle > this.pointToLookAtAngleThreshold;
          if (
            changeFocus ||
            time - this.lastWanderEyesTick > this.wanderEyesInterval
          ) {
            changeFocus = true;
            this.lastWanderEyesTick = time;
            this.wanderEyesInterval = THREE.MathUtils.lerp(
              this.wanderEyesIntervalRange.min,
              this.wanderEyesIntervalRange.max,
              Math.random()
            );

            this.ray.set(0, 0, 1);
            const pitch = THREE.MathUtils.lerp(
              this.wanderEyesEulerRange.pitch.min,
              this.wanderEyesEulerRange.pitch.max,
              Math.random()
            );
            const yaw = THREE.MathUtils.lerp(
              this.wanderEyesEulerRange.yaw.min,
              this.wanderEyesEulerRange.yaw.max,
              Math.random()
            );
            //console.log({ pitch, yaw });

            this.rayEuler.set(
              THREE.MathUtils.degToRad(pitch),
              THREE.MathUtils.degToRad(yaw),
              0,
              "YXZ"
            );
            this.ray.applyEuler(this.rayEuler);
            this.ray.applyQuaternion(this.worldQuaternion).normalize();
            this.raycaster.set(this.worldPosition, this.ray);
            this.raycaster.far = 10;

            const intersections = this.raycaster.intersectObjects(
              this.lookAtRaycastTargetObjects,
              true
            );

            let hasPointToLookAt = intersections.length > 0;
            hasPointToLookAt = true; // just set some arbitrary distance

            if (this.hasPointToLookAt != hasPointToLookAt) {
              this.hasPointToLookAt = hasPointToLookAt;
              if (!this.hasPointToLookAt) {
                this.resetEyes();
              }
              if (this.hasPointToLookAt && this.showHitSphere) {
                this.hitSphere.object3D.visible = this.hasPointToLookAt;
              }
            }

            if (this.hasPointToLookAt) {
              const intersection = intersections[0];
              if (intersection) {
                //console.log("Hit:", intersection, intersection.point);
                this.pointToLookAt.copy(intersection.point);
              } else {
                this.pointToLookAt
                  .copy(this.ray)
                  .setLength(4)
                  .add(this.worldPosition);
              }
              this.hitSphere.object3D.position.copy(this.pointToLookAt);
            }
          }
          if (this.hasPointToLookAt) {
            this.lookAt(this.pointToLookAt, refocus, this.wanderRefocusScalar);
          }
        }
      }
    }
  },

  doesPointIntersectAnyGoombas: function (point) {
    const index = window.goombas.indexOf(this);
    return window.goombas
      .filter((goomba, _index) => _index < index)
      .filter((goomba) => goomba != this)
      .some((goomba) => {
        return goomba.sphere.containsPoint(point);
      });
  },

  wallIntersectionThreshold: 0.2,
  doesDirectionIntersectAnyWalls: function (direction) {
    this.wallRay = this.wallRay || new THREE.Ray();
    this.wallRay.set(this.worldPosition, direction);
    this.wallIntersection = this.wallIntersection || new THREE.Vector3();
    this.wallDistance = this.wallDistance || new THREE.Vector3();
    return this.lookAtRaycastTargets
      .filter(
        (entity) =>
          entity.getAttribute("mixin") == "realWorldMeshMixin" ||
          entity.dataset.worldMesh == "wall"
      )
      .some((entity) => {
        const wallIntersection = entity.components[
          "my-obb-collider"
        ].obb.intersectRay(this.wallRay, this.wallIntersection);
        let intersectsWall = false;
        if (wallIntersection) {
          //this.wallIntersectionSphere.object3D.position.copy(wallIntersection);
          //this.wallIntersectionSphere.object3D.visible = true;
          const distanceToPoint =
            this.worldPosition.distanceTo(wallIntersection);
          intersectsWall = distanceToPoint < this.wallIntersectionThreshold;
          // console.log({ distanceToPoint });
        } else {
          //this.wallIntersectionSphere.object3D.visible = false;
        }
        if (intersectsWall) {
          // console.log(
          //   "intersects wall",
          //   entity.getAttribute("data-world-mesh")
          // );
        }
        return intersectsWall;
      });
  },

  doesPointIntersectAnyMeshes: function (point) {
    return this.lookAtRaycastTargets
      .filter((entity) => entity.getAttribute("mixin") == "realWorldMeshMixin")
      .filter((entity) => entity != this.floor)
      .some((entity) => {
        const containsPoint =
          entity.components["my-obb-collider"].obb.containsPoint(point);
        if (containsPoint) {
          // console.log(
          //   "congtains point with",
          //   entity.getAttribute("data-world-mesh")
          // );
        }
        return containsPoint;
      });
  },

  orientations: [
    "upright",
    "leftSide",
    "rightSide",
    "frontSide",
    "backSide",
    "upsideDown",
    "unknown",
  ],
  worldBasis: {
    forward: new THREE.Vector3(0, 0, 1),
    up: new THREE.Vector3(0, 1, 0),
    right: new THREE.Vector3(1, 0, 0),
  },
  orientationAngleThreshold: THREE.MathUtils.degToRad(10),
  checkOrientation: function () {
    if (!this.orientationVectors) {
      this.orientationVectors = {
        forward: new THREE.Vector3(),
        up: new THREE.Vector3(),
        right: new THREE.Vector3(),
      };
    }
    const { forward, up, right } = this.orientationVectors;
    // this.el.object3D.getWorldQuaternion(this.worldQuaternion);
    forward.set(0, 0, 1).applyQuaternion(this.worldQuaternion).normalize();
    up.set(0, 1, 0).applyQuaternion(this.worldQuaternion).normalize();
    right.set(1, 0, 0).applyQuaternion(this.worldQuaternion).normalize();

    const upAngle = this.worldBasis.up.angleTo(up);
    const rightAngle = this.worldBasis.up.angleTo(right);
    const forwardAngle = this.worldBasis.up.angleTo(forward);

    let newOrientation = "unknown";
    if (Math.abs(forwardAngle - Math.PI) < this.orientationAngleThreshold) {
      newOrientation = "frontSide";
    } else if (forwardAngle < this.orientationAngleThreshold) {
      newOrientation = "backSide";
    } else if (
      Math.abs(rightAngle - Math.PI) < this.orientationAngleThreshold
    ) {
      newOrientation = "leftSide";
    } else if (rightAngle < this.orientationAngleThreshold) {
      newOrientation = "rightSide";
    } else if (Math.abs(upAngle - Math.PI) < this.orientationAngleThreshold) {
      newOrientation = "upsideDown";
    } else if (upAngle < this.orientationAngleThreshold) {
      newOrientation = "upright";
    }

    this.setOrientation(newOrientation);
  },
  setOrientation: function (newOrientation) {
    if (!this.orientations.includes(newOrientation)) {
      console.error(`invalid orientation ${newOrientation}`);
      return;
    }
    if (newOrientation == this.orientation) {
      return;
    }
    this.orientation = newOrientation;
    // console.log(`updated orientation to "${this.orientation}"`);
  },
  rollDistance: 0.15,
  easeInOutElastic: function (x) {
    const c5 = (2 * Math.PI) / 4.5;

    return x === 0
      ? 0
      : x === 1
      ? 1
      : x < 0.5
      ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
  },
  getUp: async function (dur = 1500, easing = "easeInOutElastic") {
    // this.el.object3D.getWorldQuaternion(this.worldQuaternion);

    this.checkOrientation();

    if (this.orientation == "upright") {
      return;
    }

    setTimeout(() => {
      this.playGetUpSound();
    }, dur * 0.36);

    this.el.removeAttribute("grabbable");
    setTimeout(() => {
      this.el.setAttribute("grabbable", "");
    }, dur);

    this.getUpEuler = this.getUpEuler || new THREE.Euler();
    // let reorder = "XYZ";
    // switch (this.orientation) {
    //   case "rightSide":
    //   case "leftSide":
    //     reorder = "XYZ";
    //     break;
    //   case "frontSide":
    //   case "backSide":
    //     reorder = "YZX";
    //     break;
    //   case "upsideDown":
    //     reorder = "XYZ";
    //     break;
    // }
    // this.getUpEuler.copy(this.el.object3D.rotation).reorder(reorder);
    // let yaw = THREE.MathUtils.radToDeg(this.getUpEuler.y);

    let yaw = this.getEntityYaw();

    let from = [0, yaw, 0];
    switch (this.orientation) {
      case "rightSide":
        from[2] = 90;
        break;
      case "leftSide":
        from[2] = -90;
        break;
      case "upsideDown":
        from[0] = 180;
        //from[1] *= -1;
        //yaw *= -1;
        break;
      case "frontSide":
        from[0] = 90;
        break;
      case "backSide":
        from[0] = -90;
        break;
      default:
        break;
    }
    const to = [0, yaw, 0];
    from = from;

    if (true) {
      if (true) {
        this.rollTempEuler.set(
          ...from.map((value) => THREE.MathUtils.degToRad(value)),
          "YXZ"
        );
        // console.log(this.rollTempEuler);
        this.rollQuaternionFrom.setFromEuler(this.rollTempEuler);
      } else {
        this.rollQuaternionFrom.copy(this.el.object3D.quaternion);
      }

      this.rollTempEuler.set(
        ...to.map((value) => THREE.MathUtils.degToRad(value))
      );

      this.rollQuaternionTo.setFromEuler(this.rollTempEuler);

      this.isRolling = true;
      this.startRollingTime = this.latestTick;
      this.rollDuration = dur;
    } else {
      const components = ["x", "y", "z"];
      components.forEach((component, index) => {
        const attribute = `animation__rollUpright${component}`;
        this.el.removeAttribute(attribute);
        if (to[index] == from[index]) {
          console.log("direct assignment", component, to[index]);
          //this.el.object3D.rotation[component] = to[index];
        } else {
          console.log("interpolating", component, from[index], to[index]);
          this.el.setAttribute(attribute, {
            property: `object3D.rotation.${component}`,
            to: to[index],
            from: from[index],
            dur,
            easing,
          });
        }
      });
    }

    let rollScalar = 1;
    switch (this.orientation) {
      case "frontSide":
        rollScalar = -1;
        break;
      case "leftSide":
        rollScalar = -1;
        break;
      case "upsideDown":
        rollScalar = -1;
        break;
    }

    this.getUpPosition = this.getUpPosition || new THREE.Vector3();
    switch (this.orientation) {
      case "frontSide":
      case "backSide":
        this.getUpPosition.set(0, 0, rollScalar * this.rollDistance);
        break;
      case "rightSide":
      case "leftSide":
        this.getUpPosition.set(rollScalar * this.rollDistance, 0, 0);
        break;
      case "upsideDown":
        this.getUpPosition.set(0, 0, rollScalar * this.rollDistance);
        break;
    }
    this.getUpEuler.set(0, THREE.MathUtils.degToRad(yaw), 0);
    this.getUpPosition.applyEuler(this.getUpEuler);
    this.getUpPosition.add(this.worldPosition);
    this.el.setAttribute("animation__moveUpright", {
      property: "position",
      to: this.getUpPosition.toArray().join(" "),
      from: this.worldPosition
        .toArray()
        .map((value) => (Math.abs(value) < 0.001 ? 0 : value))
        .join(" "),
      dur,
      easing,
    });

    let dominantSide = "right";
    switch (this.orientation) {
      case "leftSide":
        dominantSide = "right";
        break;
      case "rightSide":
        dominantSide = "left";
        break;
      default:
        dominantSide = Math.round(Math.random()) ? "left" : "right";
        break;
    }
    this.sides.forEach((side) => {
      let offsetDur = 1;
      switch (this.orientation) {
        case "leftSide":
        case "rightSide":
          offsetDur = 1;
          break;
        default:
          offsetDur = side != dominantSide ? 1.0 : 1.1;
          break;
      }

      setTimeout(async () => {
        let pitch = 0.5;
        let roll = 0.5;
        switch (this.orientation) {
          case "frontSide":
            pitch = 0;
            break;
          case "rightSide":
            roll = 0.2;
            break;
          case "leftSide":
            roll = 0.8;
            break;
          default:
            pitch = 1;
            break;
        }
        await this.setLegRotation(
          side,
          { pitch, roll },
          dur * 0.1,
          "easeInOutQuad"
        );
        pitch = 0.5;
        roll = 0.5;
        switch (this.orientation) {
          case "frontSide":
            pitch = 0.7;
            break;
          case "rightSide":
            roll = 0.8;
            break;
          case "leftSide":
            roll = 0.2;
            break;
          default:
            pitch = 0.3;
            break;
        }
        await this.setLegRotation(
          side,
          { pitch, roll },
          dur * 0.1,
          "easeInOutQuad"
        );
        await this.setLegRotation(
          side,
          { pitch: 0.5, roll: 0.5 },
          dur * 0.1,
          "easeInOutQuad"
        );
      }, dur * 0.3 * offsetDur);
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, dur);
    });
  },

  getEntityYaw: function () {
    const forward = new THREE.Vector3(0, 0, -1); // Local forward
    switch (this.orientation) {
      case "upright":
        forward.set(0, 0, -1);
        break;
      case "leftSide":
        forward.set(0, 0, 1);
        break;
      case "rightSide":
        forward.set(0, 0, 1);
        break;
      case "upsideDown":
        forward.set(0, 0, -1);
        break;
      case "backSide":
        forward.set(0, -1, 0);
        break;
      case "frontSide":
        forward.set(0, 1, 0);
        break;
    }
    forward.applyQuaternion(this.worldQuaternion); // Transform it into world space

    forward.y = 0; // Flatten onto XZ plane
    forward.normalize();

    let yaw = Math.atan2(forward.x, forward.z); // X first, then Z
    yaw = THREE.MathUtils.radToDeg(yaw); // In radians
    return yaw;
  },

  walkingStepScalar: 0.5,
  startWalking: async function (
    dur = 320,
    pitch = 0.7,
    easing = "easeInOutQuad"
  ) {
    const legPromise = new Promise(async (resolve) => {
      if (this.status != "walking") {
        return;
      }
      await this.setLegsRotation({ pitch }, dur, easing, false, "normal", true);
      if (this.status != "walking") {
        return;
      }
      await this.setLegsRotation(
        { pitch: 1 - pitch, pitch2: pitch },
        dur,
        easing,
        true,
        "alternate",
        true
      );
      resolve();
    });
    const footPromise = new Promise((resolve) => {
      const footEasing = "easeInCubic";
      const footPitches = [0.2, 0.7];
      const footRolls = [0.4, 0.6];
      const footDur = dur;
      setTimeout(async () => {
        const promises = this.sides.map(async (side) => {
          let footPitch, footPitch2;
          if (side == "right") {
            footPitch = footPitches[0];
            footPitch2 = footPitches[1];
          } else {
            footPitch = footPitches[0];
            footPitch2 = footPitches[1];
          }

          let footRoll, footRoll2;
          if (side == "right") {
            footRoll = footRolls[1];
            footRoll2 = footRolls[0];
          } else {
            footRoll = footRolls[0];
            footRoll2 = footRolls[1];
          }
          if (side == "left") {
            if (this.status != "walking") {
              return;
            }
            await this.setLegRotation(
              side,
              { pitch: footPitch, roll: footRoll },
              footDur,
              footEasing,
              false,
              "normal",
              false,
              true
            );
          }
          if (this.status != "walking") {
            return;
          }
          await this.setLegRotation(
            side,
            {
              pitch: footPitch,
              pitch2: footPitch2,
              roll: footRoll,
              roll2: footRoll2,
            },
            footDur,
            footEasing,
            true,
            "alternate",
            false,
            true
          );
        });
        await Promise.all(promises);
        resolve();
      }, dur * 0.2);
    });

    this.squash.removeAttribute("animation__rot");
    this.squash.setAttribute("animation__rot", {
      property: "rotation",
      to: "0 0 1",
      from: "0 0 -1",
      dur: dur,
      easing,
      loop: true,
      dir: "alternate",
    });

    this.squash.removeAttribute("animation__scale");
    this.squash.setAttribute("animation__scale", {
      property: "scale",
      to: "1 0.98 1",
      from: "1 1 1",
      dur: dur / 2,
      easing: "easeInOutQuad",
      loop: true,
      dir: "alternate",
    });

    await Promise.all([legPromise, footPromise]);
  },

  stopWalking: async function () {
    this.squash.removeAttribute("animation__scale");
    this.squash.removeAttribute("animation__rot");
    this.resetLegs();
  },

  statuses: ["idle", "grabbed", "falling", "getting up", "walking", "petting"],

  resetSquashRotation: function () {
    this.squash.removeAttribute("animation__rot");
    this.squash.setAttribute("animation__rot", {
      property: "rotation",
      to: `0 0 0`,
      dur: 300,
      easing: "easeOutQuad",
    });
  },

  setStatus: async function (newStatus) {
    if (this.status == newStatus) {
      return;
    }
    if (!this.statuses.includes(newStatus)) {
      console.error(`invalid status "${newStatus}"`);
      return;
    }
    this.isLockedToCamera = false;
    if (this.status == "walking") {
      this.stopWalking();
    }
    if (this.status == "grabbed") {
      this.playReleaseSound();
    }
    if (false && this.status == "getting up") {
      //this.returnGetUpSound();
    }
    if (this.status == "petting") {
      this.el.sceneEl.emit("stopPetting", { side: this.petSide });
      if (this.purrSound) {
        this.stopPurrSound();
        this.playPurrFadeOutSound();
      }
    }

    if (this.status == "petting") {
      this.blink();
      setTimeout(() => {
        this.setEmotion("default");
      }, 200);
    }

    this.status = newStatus;
    // console.log(`new status "${this.status}"`);

    if (this.status == "petting") {
      this.el.sceneEl.emit("startPetting", { side: this.petSide });
      this.playPurrSound();
    }

    if (this.status == "petting") {
      this.setEmotion("happy");
    }

    if (this.status == "grabbed") {
      this.playGrabSound();
    }

    this.el.removeAttribute("animation__turn");

    if (this.squash.hasAttribute("animation__rot")) {
      this.squash.removeAttribute("animation__rot");
      this.squash.setAttribute("animation__rot", {
        property: "rotation",
        to: `0 0 0`,
        dur: 200,
        easing: "easeOutQuad",
      });
    }
    if (this.squash.hasAttribute("animation__scale")) {
      this.squash.removeAttribute("animation__scale");
      this.squash.setAttribute("animation__scale", {
        property: "scale",
        to: `1 1 1`,
        dur: 200,
        easing: "easeOutQuad",
      });
    }

    this.clearEyesRotationAnimation();
    this.clearEyesRollAnimation();
    this.clearEyesScaleAnimation();
    this.clearLegsRotationAnimation();
    this.clearLegsRotationAnimation(true);

    this.resetEyesScale();

    this.resetLegs();

    this.resetSquashRotation();

    this.pointToWalkToSphere.setAttribute("visible", false);

    if (this.punchable) {
      if (this.ignorePunchStatuses.includes(this.status)) {
        this.el.classList.remove("punchable");
      } else {
        this.el.classList.add("punchable");
      }
    }

    switch (this.status) {
      case "grabbed":
        //this.setScale(1, 500);
        const easing = "easeInOutQuad";
        const dur1 = 900;
        const durDelay = 0.5;
        let rightDominant = Math.round(Math.random());
        rightDominant = true;
        this.setLegRotation(
          !rightDominant ? "right" : "left",
          { pitch: 0.5, pitch2: 0.7 },
          dur1,
          easing,
          true,
          "alternate",
          true
        );
        setTimeout(async () => {
          if (this.status != "grabbed") {
            return;
          }
          await this.setLegRotation(
            !rightDominant ? "right" : "left",
            { pitch: 0.4 },
            dur1,
            easing,
            0,
            "normal",
            true,
            true
          );
          if (this.status != "grabbed") {
            return;
          }
          await this.setLegRotation(
            !rightDominant ? "right" : "left",
            { pitch: 0.5, pitch2: 0.4 },
            dur1,
            easing,
            true,
            "alternate",
            true,
            true
          );
        }, dur1 * durDelay);

        const dur2 = 920;
        this.setLegRotation(
          rightDominant ? "right" : "left",
          { pitch: 0.3, pitch2: 0.8 },
          dur2,
          easing,
          true,
          "alternate",
          true
        );
        setTimeout(async () => {
          if (this.status != "grabbed") {
            return;
          }
          await this.setLegRotation(
            rightDominant ? "right" : "left",
            { pitch: 0.4 },
            dur2,
            easing,
            0,
            "normal",
            true,
            true
          );
          if (this.status != "grabbed") {
            return;
          }
          await this.setLegRotation(
            rightDominant ? "right" : "left",
            { pitch: 0.5, pitch2: 0.4 },
            dur2,
            easing,
            true,
            "alternate",
            true,
            true
          );
        }, dur2 * durDelay);
        this.setFloor();
        break;
      case "getting up":
        await this.getUp();
        this.lastChangeLookAtTick = 0;
        this.lastEyeRefocusTick = 0;
        this.setStatus("walking");
        break;
      case "idle":
        break;
      case "falling":
        this.setLegsRotation(
          { pitch: 0, pitch2: 1 },
          200,
          "easeInOutQuad",
          true,
          "alternate",
          true
        );
        //this.setScale(1.5, 1000);
        break;
      case "walking":
        // this.setPhysicsEnabled(true);
        //this.pointToWalkToSphere.setAttribute("visible", true);
        this.startWalking();
        break;
      default:
        break;
    }
  },

  setScale: function (scale, dur, easing = "easeOutQuad") {
    this.scale = scale;
    const entity = this.el;
    if (dur == 0) {
      entity.object3D.scale.set(scale, scale, scale);
    } else {
      entity.setAttribute("animation__scale", {
        property: "scale",
        to: `${scale} ${scale} ${scale}`,
        from: "1 1 1",
        dur,
        easing,
      });
    }
  },

  waitForSoundToLoad: async function (entity) {
    return new Promise((resolve) => {
      if (entity.components.sound) {
        resolve();
      } else {
        let onComponentInitialized = (event) => {
          if (event.detail.name == "sound") {
            entity.removeEventListener(
              "componentinitialized",
              onComponentInitialized
            );
            resolve();
          }
        };
        onComponentInitialized = onComponentInitialized.bind(this);

        entity.addEventListener("componentinitialized", onComponentInitialized);
      }
    });
  },

  playGetUpSound: function () {
    this.playSound("getUpSound");
  },

  playPurrSound: function () {
    this.playSound("purrSound");
  },
  stopPurrSound: function () {
    this.returnSound("purrSound");
  },

  playPurrFadeOutSound: function () {
    this.playSound("purrSoundFadeOut");
  },

  playGrabSound: function () {
    this.returnSound("releaseSound");
    this.playSound("grabSound");
  },
  playReleaseSound: function () {
    this.returnSound("grabSound");
    this.playSound("releaseSound");
  },

  playSound: async function (name) {
    this.returnSound(name);
    const poolName = `pool__${name.toLowerCase()}`;
    const sound = (this[name] =
      this.el.sceneEl.components[poolName].requestEntity());
    sound.poolName = poolName;
    this.el.object3D.getWorldPosition(sound.object3D.position);
    sound.play();
    await this.waitForSoundToLoad(sound);
    sound.components.sound.playSound();
    sound.addEventListener("sound-ended", () => this.returnSound(name), {
      once: true,
    });
  },
  returnSound: function (name) {
    const sound = this[name];
    if (sound) {
      sound.components["sound"].stopSound();
      this.el.sceneEl.components[sound.poolName].returnEntity(sound);
      this[name] = undefined;
    }
  },

  playShellHitSound: function () {
    this.playSound("shellHitSound");
  },

  playPunchSound: function () {
    this.playSound("punchSound");
  },
  playPunchSqueakSound: function () {
    this.playSound("punchSqueakSound");
  },

  updateLookAtTargets() {
    this.lookAtTargets = Array.from(
      this.el.sceneEl.querySelectorAll(this.data.lookAt)
    );
  },
  updateLookAtRaycastTargets() {
    this.lookAtRaycastTargets = Array.from(
      this.el.sceneEl.querySelectorAll(this.data.lookAtRaycast)
    );
    this.lookAtRaycastTargetObjects = this.lookAtRaycastTargets.map(
      (entity) => entity.object3D
    );
    if (this.lookAtRaycastTargetObjects.length > 0) {
      clearInterval(this.lookAtRaycastSelectorInterval);
    }
  },
});
