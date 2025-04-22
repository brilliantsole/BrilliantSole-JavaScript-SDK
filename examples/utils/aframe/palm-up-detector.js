AFRAME.registerComponent("palm-up-detector", {
  schema: {
    tolerance: { type: "number", default: 50 }, // degrees
  },

  init() {
    this.isPalmUp = false;
    this.el.addEventListener("controllermodelready", () => {
      this.bones = {};
      this.el.components["hand-tracking-controls"].bones.forEach((bone) => {
        this.bones[bone.name] = bone;
      });
    });
  },

  tick() {
    if (!this.bones) return;

    const wrist = this.bones["wrist"];
    const indexTip = this.bones["index-finger-tip"];
    const pinkyTip = this.bones["pinky-finger-tip"];

    if (!wrist || !indexTip || !pinkyTip) return;

    const wristPos = new THREE.Vector3().copy(wrist.position);
    const indexPos = new THREE.Vector3().copy(indexTip.position);
    const pinkyPos = new THREE.Vector3().copy(pinkyTip.position);

    // Get hand normal vector: cross product of vectors from wrist to index and pinky
    const v1 = indexPos.clone().sub(wristPos); // wrist → index
    const v2 = pinkyPos.clone().sub(wristPos); // wrist → pinky
    const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();

    // Palm is "up" if its normal is close to world up (0, 1, 0)
    const angleRad = normal.angleTo(new THREE.Vector3(0, -1, 0));
    const angleDeg = THREE.MathUtils.radToDeg(angleRad);

    // console.log({ angleRad, angleDeg });

    const wasPalmUp = this.isPalmUp;
    this.isPalmUp = angleDeg < this.data.tolerance;

    if (this.isPalmUp !== wasPalmUp) {
      this.el.emit(this.isPalmUp ? "palmupon" : "palmupoff");
    }
  },
});
