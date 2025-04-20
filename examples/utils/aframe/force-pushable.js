/**
 * Force Pushable component.
 *
 * Applies behavior to the current entity such that cursor clicks will apply a
 * strong impulse, pushing the entity away from the viewer.
 *
 * Requires: physics
 */
AFRAME.registerComponent("force-pushable", {
  schema: {
    force: { default: 100 },
  },
  init: function () {
    if (this.el.sceneEl.getAttribute("physics").driver === "ammo") {
      this.driver = "ammo";
    } else {
      this.driver = "cannon";
    }

    this.pStart = new THREE.Vector3();
    this.sourceEl = this.el.sceneEl.querySelector("[camera]");

    if (this.driver === "cannon") {
      this.el.addEventListener("click", this.forcePushCannon.bind(this));
    } else {
      this.el.addEventListener("click", this.forcePushAmmo.bind(this));

      this.force = new THREE.Vector3();
      this.pos = new THREE.Vector3();

      this.el.addEventListener("body-loaded", (e) => {
        this.impulseBtVector = new Ammo.btVector3();
        this.posBtVector = new Ammo.btVector3();
      });
    }
  },

  forcePushCannon: function () {
    var force,
      el = this.el,
      pStart = this.pStart.copy(this.sourceEl.getAttribute("position"));

    // Compute direction of force, normalize, then scale.
    force = el.body.position.vsub(pStart);
    force.normalize();
    force.scale(this.data.force, force);

    if (window.force) {
      force = window.force;
    }

    el.body.applyImpulse(force, el.body.position);
  },

  forcePushAmmo: function (e) {
    if (!this.impulseBtVector) return;

    const el = this.el;
    const force = this.force;
    const impulseBt = this.impulseBtVector;
    const pusher = e.detail.cursorEl.object3D;
    force.copy(pusher.position);
    pusher.localToWorld(force);
    force.copy(el.object3D.position.sub(force));
    force.normalize();

    force.multiplyScalar(this.data.force);
    impulseBt.setValue(force.x, force.y, force.z);

    // use data from intersection to determine point at which to apply impulse.
    const pos = this.pos;
    const posBt = this.posBtVector;
    pos.copy(e.detail.intersection.point);
    el.object3D.worldToLocal(pos);
    posBt.setValue(pos.x, pos.y, pos.z);

    el.body.activate();
    el.body.applyImpulse(impulseBt, posBt);
  },
});
