AFRAME.registerComponent("soccer-ball", {
  schema: {
    template: { default: "#soccerTemplate", type: "selector" },
    kickSoundSelector: { default: "#soccerKickAudio" },
    bounceSoundSelector: { default: "#soccerBounceAudio" },
  },

  collisionFilterGroup: 1 << 2,
  collisionFilterMask: (1 << 0) | (1 << 2),

  shapeMain: `shape: sphere; radius: 0.112;`,

  init: function () {
    window.soccerBalls = window.soccerBalls || [];
    window.soccerBalls.push(this);

    this.el.shapeMain = this.shapeMain;

    this.el.classList.add("lookAt");

    this.camera = document.querySelector("a-camera");

    this.kickVelocity = new THREE.Vector3();
    this.kickEuler = new THREE.Euler();

    this.collisionNormal = new THREE.Vector3();
    this.velocityVector = new THREE.Vector3();

    this.el.addEventListener("kick", this.onKick.bind(this));
    this.el.addEventListener("stomp", this.onStomp.bind(this));

    this.setGrabEnabled = AFRAME.utils.throttleLeadingAndTrailing(
      this.setGrabEnabled.bind(this),
      70
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
        this.el.setAttribute("grabbable", "");
        this.el.setAttribute("grabbable-physics-body", `type: dynamic; `);
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

    this.playBounceSound = AFRAME.utils.throttle(
      this.playBounceSound.bind(this),
      200
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
  collisionVelocityThreshold: 0.4,
  collisionVelocityVolumeScalar: 1,
  onCollide: async function (event) {
    const { contact } = event.detail;
    const collidedEntity = event.detail.body.el;
    //console.log("collided with", collidedEntity);
    const worldMesh = collidedEntity.dataset.worldMesh;
    let volume = 1;
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
        if (playBounce) {
          volume = velocityLength * this.collisionVelocityVolumeScalar;
        }
      }

      if (playBounce) {
        this.playBounceSound(volume);
      }
    }
  },

  playBounceSound: function (volume = 1) {
    this.bounceSound.components.sound.stopSound();
    this.bounceSound.components.sound.pool.children[0].setVolume(volume);
    this.bounceSound.object3D.position.copy(this.el.object3D.position);
    this.bounceSound.components.sound.playSound();
  },
  playKickSound: function () {
    this.kickSound.components.sound.stopSound();
    this.kickSound.components.sound.pool.children[0].setVolume(4);
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
    this.kickVelocity.set(0, 1, -5);
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

    this.kickVelocity.set(0, 4, 0);
    this.kickEuler.set(0, -yaw, 0);
    this.kickVelocity.applyEuler(this.kickEuler);
    this.body.velocity.copy(this.kickVelocity);

    const strength = this.kickVelocity.length();
    const angularVelocity = new THREE.Vector3(strength * 1, 0, 0);
    const normalizedVelocity = this.kickVelocity.clone().normalize();
    const angle = Math.atan2(normalizedVelocity.x, normalizedVelocity.z);
    const euler = new THREE.Euler(0, angle, 0);
    angularVelocity.applyEuler(euler);
    this.body.angularVelocity.set(...angularVelocity.toArray().slice(0, 3));
  },

  onObbCollisionStarted: async function (event) {
    if (!this.body) {
      return;
    }
    if (this.isGrabbed) {
      return;
    }
    // FILL - game mechanics, etc
  },

  onBodyLoaded: function (event) {
    const { body } = event.detail;
    // body.mass = 1;
    body.collisionFilterGroup = this.collisionFilterGroup;
    body.collisionFilterMask = this.collisionFilterMask;
    // console.log("body", body);
    this.body = body;
    body.linearDamping = 0.15;
    body.angularDamping = 0.4;
    body.material =
      this.el.sceneEl.systems["physics"].driver.getMaterial("soccerBall");
  },

  tick: function (time, timeDelta) {
    this.latestTick = time;

    if (!this.isGrabbed && this.body) {
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
