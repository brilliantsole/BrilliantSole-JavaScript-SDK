AFRAME.registerComponent("hand-punch", {
  schema: {
    punchable: { default: ".punchable" },
    velocityThreshold: { default: 1.5 },
    velocityScalar: { default: 1 },
    punchTimeout: { default: 500 },
  },

  dependencies: ["hand-tracking-grab-controls"],

  init() {
    this.lastTimePunched = 0;
    this.positionHistory = [];

    this.onCollisionStarted = this.onCollisionStarted.bind(this);
    this.el.addEventListener("obbcollisionstarted", this.onCollisionStarted);

    this.onCollisionEnded = this.onCollisionEnded.bind(this);
    this.el.addEventListener("obbcollisionended", this.onCollisionEnded);
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
