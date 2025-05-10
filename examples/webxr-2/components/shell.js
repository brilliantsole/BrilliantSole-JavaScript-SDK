AFRAME.registerComponent("shell", {
  schema: {
    template: { default: "#shellTemplate", type: "selector" },
    kickSoundSelector: { default: "#shellKickAudio" },
    bounceSoundSelector: { default: "#shellBounceAudio" },
  },

  collisionFilterGroup: 1 << 2,
  collisionFilterMask: (1 << 0) | (1 << 2),

  shapeMain: `shape: cylinder;
  radiusTop: 0.12;
  radiusBottom: 0.12;
  height: 0.12;
  offset: 0 0.01 0;
  `,

  init: function () {
    this.yaw = 0;
    window.shells = window.shells || [];
    window.shells.push(this);

    this.el.classList.add("lookAt");

    this.camera = document.querySelector("a-camera");

    this.el.shapeMain = this.shapeMain;

    this.kickVelocity = new THREE.Vector3();
    this.kickEuler = new THREE.Euler();

    this.collisionNormal = new THREE.Vector3();
    this.velocityVector = new THREE.Vector3();

    this.velocity2D = new THREE.Vector3();

    this.quaternion = new THREE.Quaternion();
    this.euler = new THREE.Euler();
    this.releaseEuler = new THREE.Euler();
    this.releaseQuaternion = new THREE.Quaternion();

    this.spinQuaternion = new THREE.Quaternion();
    this.spinEuler = new THREE.Euler();

    this.targetEuler = new THREE.Quaternion();
    this.targetQuaternion = new THREE.Quaternion();

    this.el.addEventListener("kick", this.onKick.bind(this));
    this.el.addEventListener("stomp", this.onStomp.bind(this));

    this.setGrabEnabled = AFRAME.utils.throttleLeadingAndTrailing(
      this.setGrabEnabled.bind(this),
      70
    );

    this.checkVelocity = AFRAME.utils.throttleLeadingAndTrailing(
      this.checkVelocity.bind(this),
      100
    );

    this.el.addEventListener("grabstarted", () => this.setGrabEnabled(true));
    this.el.addEventListener("grabended", () => this.setGrabEnabled(false));

    this.el.addEventListener("collide", this.onCollide.bind(this));
    this.el.addEventListener(
      "obbcollisionstarted",
      this.onObbCollisionStarted.bind(this)
    );

    this.el.addEventListener("toss", this.onToss.bind(this));

    this.el.addEventListener("body-loaded", this.onBodyLoaded.bind(this));
    this.el.addEventListener("loaded", () => {
      const template = this.data.template.content
        .querySelector("a-entity")
        .cloneNode(true);
      this.el.setAttribute("scale", template.getAttribute("scale"));

      template.classList.forEach((_class) => {
        //console.log(`adding class ${_class}`);
        this.el.classList.add(_class);
      });
      Array.from(template.children).forEach((entity) => {
        this.el.appendChild(entity);
      });
      setTimeout(() => {
        this.bodyEl = this.el.querySelector(".body");
        this.bodyEl.addEventListener(
          "animationcomplete",
          this.onAnimationComplete.bind(this)
        );
        this.el.setAttribute("grabbable", "");
        this.el.setAttribute(
          "grabbable-physics-body",
          `type: dynamic; enable-angular-velocity: false;`
        );
      }, 1);
    });

    this.kickSound = document.createElement("a-entity");
    this.kickSound.setAttribute("sound", `src: ${this.data.kickSoundSelector}`);
    this.el.sceneEl.appendChild(this.kickSound);

    this.bounceSound = document.createElement("a-entity");
    this.bounceSound.setAttribute(
      "sound",
      `src: ${this.data.bounceSoundSelector}`
    );
    this.el.sceneEl.appendChild(this.bounceSound);

    this.playBounceSound = AFRAME.utils.throttleLeadingAndTrailing(
      this.playBounceSound.bind(this),
      50
    );
  },

  onAnimationComplete: function (event) {},

  onToss: function (event) {
    // console.log("toss", event);
    const { velocity, angularVelocity } = event.detail;
  },

  setGrabEnabled: function (enabled) {
    if (enabled) {
      this.onGrabStarted();
    } else {
      this.onGrabEnded();
    }
  },
  onGrabStarted: function () {
    // console.log("onGrabStarted");
    this.isGrabbed = true;
  },
  onGrabEnded: function () {
    // console.log("onGrabEnded");
    this.isGrabbed = false;
  },

  worldBasis: {
    forward: new THREE.Vector3(0, 0, 1),
    up: new THREE.Vector3(0, 1, 0),
    right: new THREE.Vector3(1, 0, 0),
  },

  collisionAngleThreshold: THREE.MathUtils.degToRad(20),
  collisionVelocityThreshold: 0.1,
  onCollide: async function (event) {
    const { contact } = event.detail;
    const collidedEntity = event.detail.body.el;
    //console.log("collided with", collidedEntity);
    const worldMesh = collidedEntity.dataset.worldMesh;
    if (worldMesh) {
      let playBounce = false;
      if (worldMesh == "wall") {
        playBounce = true;
      } else {
        this.collisionNormal.copy(contact.ni);
        if (contact.bi != this.body) {
          this.collisionNormal.multiplyScalar(-1);
        }
        this.velocityVector.copy(this.body.velocity);
        const angle = this.collisionNormal.angleTo(this.velocityVector);
        const velocityLength = this.velocityVector.length();
        playBounce =
          angle < this.collisionAngleThreshold &&
          velocityLength > this.collisionVelocityThreshold;
        if (!playBounce) {
          // console.log({ angle, velocityLength, playBounce });
        }
      }

      if (playBounce) {
        this.playBounceSound();
      }
    }
  },

  playBounceSound: function () {
    this.bounceSound.object3D.position.copy(this.el.object3D.position);
    this.bounceSound.components.sound.playSound();
  },
  playKickSound: function () {
    this.kickSound.object3D.position.copy(this.el.object3D.position);
    this.kickSound.components.sound.playSound();
  },

  onKick: function (event) {
    if (this.isGrabbed || !this.body) {
      return;
    }
    const { velocity, yaw } = event.detail;
    // console.log("onKick", yaw);
    this.playKickSound();
    this.kickVelocity.set(0, 1, -3.5);
    this.kickEuler.set(0, yaw, 0);
    this.kickVelocity.applyEuler(this.kickEuler);
    this.body.velocity.copy(this.kickVelocity);
  },
  onStomp: function (event) {
    if (this.isGrabbed || !this.body) {
      return;
    }

    const { distance, yaw, kill } = event.detail;
    // console.log("onStomp", { distance, yaw, kill });

    this.playKickSound();

    this.kickVelocity.set(0, 3, 0);
    this.kickEuler.set(0, -yaw, 0);
    this.kickVelocity.applyEuler(this.kickEuler);
    this.body.velocity.copy(this.kickVelocity);
    //this.body.velocity.set(0, 2, 0);

    this.isStomped = true;
    this.stompStartTime = this.latestTick;
    this.stompFinishTime = this.stompStartTime + this.stompDuration;
  },

  onObbCollisionStarted: async function (event) {
    if (!this.body) {
      return;
    }
    const collidedEntity = event.detail.withEl;
    const goomba = collidedEntity.components["goomba"];
    if (goomba) {
      goomba.el.emit("shell", {
        velocity: this.body.velocity.clone(),
        position: this.el.object3D.position,
      });
    }
  },

  onBodyLoaded: function (event) {
    const { body } = event.detail;
    body.collisionFilterGroup = this.collisionFilterGroup;
    body.collisionFilterMask = this.collisionFilterMask;
    // console.log("body", body);
    this.body = body;
    if (this.manualRotate) {
      body.fixedRotation = true;
      body.updateMassProperties();
    }
    body.linearDamping = 0;
    body.angularDamping = 0;
    body.material =
      this.el.sceneEl.systems["physics"].driver.getMaterial("shell");
    if (!this.manualRotate) {
      body.angularVelocity.set(0, 10, 0);
    }

    this.releaseQuaternion.copy(this.el.object3D.quaternion);
    this.releaseEuler.copy(this.el.object3D.rotation);
    this.releaseTime = this.latestTick;
    this.restoredRotationTime = this.releaseTime + this.restoreRotationDuration;
    this.didRestoreRotation = false;
  },

  spinScalar: 0.01,
  manualRotate: true,
  restoreRotationDuration: 200,

  speedMax: 5,

  checkVelocity: function () {
    if (this.body.velocity.length() > this.speedMax) {
      console.log("speed too fast");
      this.velocityVector.copy(this.body.velocity);
      this.velocityVector.setLength(this.speedMax - 1);
      this.body.velocity.copy(this.velocityVector);
    }
  },

  stompScalars: { pitch: 0.4, roll: 0.4 },
  stompDelay: { pitch: 0, roll: 0 },
  stompInterpolationOffsets: { pitch: 0, roll: 0.25 },
  stompInterpolationScalars: { pitch: 1.75, roll: 1.75 },
  stompDuration: 700,

  tick: function (time, timeDelta) {
    this.latestTick = time;

    if (!this.isGrabbed && this.body) {
      this.checkVelocity();
    }

    if (!this.isGrabbed && this.body && this.manualRotate) {
      this.velocity2D.copy(this.body.velocity);
      this.velocity2D.y = 0;
      const spinSpeed = this.velocity2D.length() * this.spinScalar;
      this.yaw += timeDelta * spinSpeed;
      this.yaw %= 2 * Math.PI;
      this.spinEuler.set(0, this.yaw, 0);
      //this.spinQuaternion.setFromEuler(this.spinEuler);

      if (!this.didRestoreRotation) {
        let interpolation = THREE.MathUtils.inverseLerp(
          this.releaseTime,
          this.restoredRotationTime,
          this.latestTick
        );
        interpolation = THREE.MathUtils.clamp(interpolation, 0, 1);
        this.quaternion.slerpQuaternions(
          this.releaseQuaternion,
          this.targetQuaternion,
          interpolation
        );
        if (interpolation >= 1) {
          this.didRestoreRotation = true;
        }
      }

      if (this.manualRotate && !this.isStomped) {
        this.bodyEl.object3D.rotation.copy(this.spinEuler);
        //this.quaternion.multiply(this.spinQuaternion);
        this.body.quaternion.copy(this.quaternion);
      }

      if (this.isStomped) {
        let interpolation = THREE.MathUtils.inverseLerp(
          this.stompStartTime,
          this.stompFinishTime,
          this.latestTick
        );
        interpolation = THREE.MathUtils.clamp(interpolation, 0, 1);

        let pitchInterpolation =
          this.stompInterpolationScalars.pitch * interpolation +
          this.stompInterpolationOffsets.pitch;
        pitchInterpolation = THREE.MathUtils.clamp(pitchInterpolation, 0, 1);

        let rollInterpolation =
          this.stompInterpolationScalars.roll * interpolation +
          this.stompInterpolationOffsets.roll;
        rollInterpolation = THREE.MathUtils.clamp(rollInterpolation, 0, 1);

        const pitch =
          Math.sin(pitchInterpolation * 2 * Math.PI) *
          this.stompScalars.pitch *
          (1 - interpolation);
        const roll =
          Math.sin(rollInterpolation * 2 * Math.PI) *
          this.stompScalars.roll *
          (1 - interpolation);

        console.log({ pitch, roll });

        this.spinEuler.set(pitch, this.yaw, roll);
        this.bodyEl.object3D.rotation.copy(this.spinEuler);

        if (interpolation >= 1) {
          console.log("finished stomp animation");
          this.isStomped = false;
        }
      }

      if (this.el.object3D.position.y < -10) {
        console.log("fell through floor");
        this.body.velocity.set(0, 0, 0);
        this.body.position.copy(this.camera.object3D.position);
      }
    }
  },

  remove: function () {
    this.removeSelf();
  },
});
