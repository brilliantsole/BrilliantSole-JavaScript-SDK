AFRAME.registerComponent("platter", {
  schema: {},

  init: function () {
    this.auxMatrix = new THREE.Matrix4();
    this.goombaTransform = {
      position: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      scale: new THREE.Vector3(1, 1, 1),
    };
    this.addGoomba();

    this.isOpen = false;

    this.el.setAttribute("grow-shrink", "");
    this.hand = this.el.closest("[hand-tracking-controls]");

    this.hand.setAttribute("palm-up-detector", "");
    this.hand.addEventListener("palmupon", () => {
      this.isGrabbed = false;
      this.isOpen = true;
      if (this.goomba) {
        this.goomba.setAttribute("visible", "true");
      }
      setTimeout(() => {
        if (!this.isOpen) {
          return;
        }
        this.addGoomba();
        if (this.goomba && !this.isGrabbed) {
          this.goomba.setAttribute("grabbable", "");
          this.goomba.play();
        }
      }, 200);
      this.el.emit("grow");
      this.hand.setAttribute("occlude-hand-tracking-controls", {
        enabled: false,
      });
    });
    this.hand.addEventListener("palmupoff", () => {
      this.isOpen = false;
      if (this.goomba && !this.isGrabbed) {
        this.goomba.removeAttribute("grabbable");
        this.goomba.pause();
      }
      this.el.emit("shrink");
      this.hand.setAttribute("occlude-hand-tracking-controls", {
        enabled: true,
      });
      this.isGrabbed = false;
    });
  },

  addGoomba: function () {
    if (!this.goomba) {
      this.goomba = document.createElement("a-entity");
      console.log("creating goomba", this.goomba);
      this.goomba.addEventListener("loaded", () => {
        this.setOwner(this.el.object3D);
        setTimeout(() => {
          this.goomba.setAttribute("position", "0 0.1 0");
          this.goomba.setAttribute("scale", "1 1 1");
          this.goomba.setAttribute("rotation", "0 180 0");
          this.goomba.pause();
        }, 1);
      });
      this.goomba.setAttribute("goomba", "");
      this.goomba.addEventListener(
        "grabstarted",
        (event) => {
          this.isGrabbed = true;
          console.log("grabstarted goomba");
          event.detail.grab.originalParent = this.el.sceneEl.object3D;
        },
        { once: true }
      );
      this.goomba.addEventListener(
        "grabended",
        () => {
          this.isGrabbed = false;
          console.log("grabended goomba");
          console.log("adding goomba to scene", this.goomba);
          this.goomba.play();
          this.goomba.setAttribute("grabbable", "");
          this.goomba = undefined;
          this.addGoomba();
          this.goomba.setAttribute("visible", "false");
        },
        { once: true }
      );
      this.el.sceneEl.appendChild(this.goomba);
    }
  },

  setOwner: function (newParent) {
    var child = this.goomba.object3D;
    var parent = child.parent;
    child.applyMatrix4(parent.matrixWorld);
    child.applyMatrix4(this.auxMatrix.copy(newParent.matrixWorld).invert());
    parent.remove(child);
    newParent.add(child);
  },
});
