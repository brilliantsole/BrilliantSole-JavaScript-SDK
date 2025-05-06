import * as BS from "../../../build/brilliantsole.module.js";

AFRAME.registerComponent("hand-punch", {
  schema: {
    punchable: { default: ".punchable" },
    velocityThreshold: { default: 1.2 },
    velocityScalar: { default: 1 },
    punchTimeout: { default: 500 },
    soundSelector: { default: "#punchAudio" },
  },

  dependencies: ["hand-tracking-controls", "hand-tracking-grab-controls"],

  init() {
    this.hand = this.el.components["hand-tracking-controls"];
    this.side = this.hand.data.hand;

    this.lastTimePunched = 0;
    this.positionHistory = [];

    this.onCollisionStarted = this.onCollisionStarted.bind(this);
    this.el.addEventListener("obbcollisionstarted", this.onCollisionStarted);

    this.onCollisionEnded = this.onCollisionEnded.bind(this);
    this.el.addEventListener("obbcollisionended", this.onCollisionEnded);

    this.sound = document.createElement("a-entity");
    this.sound.setAttribute("sound", `src: ${this.data.soundSelector}`);
    this.el.sceneEl.appendChild(this.sound);

    this.el.components["obb-collider"].showCollider();
  },

  playSound: function (punchedEntity) {
    punchedEntity.object3D.getWorldPosition(this.sound.object3D.position);
    this.sound.components.sound.playSound();
  },

  onCollisionStarted: function (event) {
    const now = Date.now();
    if (now - this.lastTimePunched < this.data.punchTimeout) {
      return;
    }
    this.lastTimePunched = now;
    const { withEl, trackedObject3D } = event.detail;
    if (!trackedObject3D) {
      return;
    }
    const position = trackedObject3D.position.clone();
    if (withEl.classList.contains("punchable")) {
      // Compute velocity from position history
      const velocity = new THREE.Vector3();
      const history = this.positionHistory;
      if (history.length >= 2) {
        const first = history[0];
        const last = history[history.length - 1];
        const dt = (last.time - first.time) / 1000;
        if (dt > 0) {
          velocity.copy(last.pos).sub(first.pos).divideScalar(dt);
        }
      }

      velocity.multiplyScalar(this.data.velocityScalar);

      const length = velocity.length();
      if (length < this.data.velocityThreshold) {
        return;
      }

      withEl.emit("punch", { velocity, position });

      this.playSound(withEl);

      /** @type {BS.VibrationWaveformEffect} */
      let waveformEffect = "strongClick100";
      this.el.sceneEl.emit("bs-trigger-vibration", {
        side: this.side,
        type: "glove",
        waveformEffect,
      });
    }
  },

  onCollisionEnded: function () {},

  tick: function (time, delta) {
    const object =
      this.el.components?.["hand-tracking-controls"]?.wristObject3D;
    if (!object) {
      return;
    }
    // Track recent positions (with timestamp)

    const pos = new THREE.Vector3();
    object.getWorldPosition(pos);
    this.positionHistory.push({ pos, time });

    // Keep only recent entries (e.g. last 100ms or 10 positions)
    while (this.positionHistory.length > 10) {
      this.positionHistory.shift();
    }
  },
});
