import * as BS from "../../../build/brilliantsole.module.js";

AFRAME.registerComponent("hand-punch", {
  schema: {
    punchable: { default: ".punchable" },
    velocityThreshold: { default: 1.2 },
    velocityScalar: { default: 1 },
    punchTimeout: { default: 50 },
  },

  dependencies: [
    "hand-tracking-controls",
    "hand-tracking-grab-controls",
    "obb-collider",
  ],

  init() {
    this.hand = this.el.components["hand-tracking-controls"];
    this.side = this.hand.data.hand;

    this.lastTimePunched = 0;
    this.positionHistory = [];

    if (true) {
      this.collider = document.createElement("a-box");
      this.collider.setAttribute("visible", "false");

      let trackedObject3DVariable;
      if (this.side === "right") {
        trackedObject3DVariable =
          "parentEl.components.hand-tracking-controls.bones.11";
      } else {
        trackedObject3DVariable =
          "parentEl.components.hand-tracking-controls.bones.13";
      }

      this.collider.addEventListener("loaded", () => {
        this.collider.setAttribute("obb-collider", {
          trackedObject3D: trackedObject3DVariable,
          size: 0.12,
        });
      });

      this.el.appendChild(this.collider);
    } else {
      this.collider = this.el;
    }
    this.onCollisionStarted = this.onCollisionStarted.bind(this);
    this.onCollisionEnded = this.onCollisionEnded.bind(this);
    this.collider.addEventListener(
      "obbcollisionstarted",
      this.onCollisionStarted
    );
    this.collider.addEventListener("obbcollisionended", this.onCollisionEnded);
  },

  onCollisionStarted: function (event) {
    // console.log(this, event);
    const now = Date.now();
    if (now - this.lastTimePunched < this.data.punchTimeout) {
      //return;
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
    const object = this.collider.object3D;
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
