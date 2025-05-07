AFRAME.registerComponent("platter", {
  schema: {
    fadeInSoundSelector: { default: "#platterFadeInAudio" },
    fadeOutSoundSelector: { default: "#platterFadeOutAudio" },
    fadeInSoundVolume: { default: 0.3 },
    fadeOutSoundVolume: { default: 0.3 },
  },

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
      this.hand.components["hand-tracking-grab-controls"].setDisabled(true);
      this.setGrabEnabled(false);
      this.isGrabbed = false;
      this.isOpen = true;
      this.playFadeInSound();
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
      this.hand.components["hand-tracking-grab-controls"].setDisabled(false);
      this.setGrabEnabled(true);
      this.isOpen = false;
      this.playFadeOutSound();
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

    this.fadeInSound = document.createElement("a-entity");
    this.fadeInSound.setAttribute(
      "sound",
      `src: ${this.data.fadeInSoundSelector}; volume: ${this.data.fadeInSoundVolume}`
    );
    this.el.sceneEl.appendChild(this.fadeInSound);

    this.fadeOutSound = document.createElement("a-entity");
    this.fadeOutSound.setAttribute(
      "sound",
      `src: ${this.data.fadeOutSoundSelector};  volume: ${this.data.fadeOutSoundVolume}`
    );
    this.el.sceneEl.appendChild(this.fadeOutSound);
  },

  setGrabEnabled: function (enabled) {
    if (!this.originalObbColliderAttribute) {
      this.originalObbColliderAttribute = Object.assign(
        {},
        this.hand.getAttribute("obb-collider")
      );
    }
    if (enabled) {
      this.hand.setAttribute("obb-collider", this.originalObbColliderAttribute);
    } else {
      this.hand.removeAttribute("obb-collider");
    }
  },

  playFadeInSound: function () {
    this.stopFadeOutSound();
    this.el.object3D.getWorldPosition(this.fadeInSound.object3D.position);
    this.fadeInSound.components.sound.playSound();
  },
  stopFadeInSound: function () {
    this.fadeInSound.components.sound.stopSound();
  },
  playFadeOutSound: function () {
    this.stopFadeInSound();
    this.el.object3D.getWorldPosition(this.fadeOutSound.object3D.position);
    this.fadeOutSound.components.sound.playSound();
  },
  stopFadeOutSound: function () {
    this.fadeOutSound.components.sound.stopSound();
  },

  addGoomba: function () {
    if (!this.goomba) {
      this.goomba = document.createElement("a-entity");
      const goomba = this.goomba;
      goomba.addEventListener(
        "die",
        () => {
          if (this.goomba == goomba) {
            this.goomba = undefined;
            this.addGoomba();
          }
        },
        { once: true }
      );
      this.goomba.platter = this;
      console.log("adding goomba", this.goomba);
      this.goomba.addEventListener("loaded", () => {
        this.setOwner(this.el.object3D);
        setTimeout(() => {
          this.goomba.setAttribute("position", "0 0.1 0");
          this.goomba.setAttribute("scale", "1 1 1");
          this.goomba.setAttribute("rotation", "0 180 0");
          this.goomba.pause();
        }, 1);
      });
      this.goomba.setAttribute("goomba", "physics: true;");
      this.goomba.addEventListener(
        "grabstarted",
        (event) => {
          this.isGrabbed = true;
          //console.log("grabstarted goomba");
          event.detail.grab.originalParent = this.el.sceneEl.object3D;
        },
        { once: true }
      );
      this.goomba.addEventListener(
        "grabended",
        () => {
          this.isGrabbed = false;
          //console.log("grabended goomba");
          this.goomba.play();
          this.goomba.setAttribute("grabbable", "");
          this.goomba.components["goomba"].punchable = true;
          this.goomba.platter = undefined;
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
