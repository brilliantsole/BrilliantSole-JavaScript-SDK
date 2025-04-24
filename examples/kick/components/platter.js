AFRAME.registerComponent("platter", {
  schema: {},

  init: function () {
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
      this.isOpen = true;
      this.addGoomba();
      this.goomba.setAttribute("grabbable", "");
      this.el.emit("grow");
      this.goomba.components["goomba"].dontTick = false;
      this.hand.setAttribute("occlude-hand-tracking-controls", {
        enabled: false,
      });
    });
    this.hand.addEventListener("palmupoff", () => {
      this.isOpen = false;
      this.goomba.removeAttribute("grabbable");
      this.el.emit("shrink");
      this.goomba.components["goomba"].dontTick = true;
      this.hand.setAttribute("occlude-hand-tracking-controls", {
        enabled: true,
      });
    });
  },

  addGoomba: function () {
    if (this.didAddGoomba) {
      return;
    }
    if (!this.goomba) {
      console.log("creating goomba");
      this.goomba = document.createElement("a-entity");
      this.goomba.setAttribute("goomba", "grabbable: true;");
      this.goomba.addEventListener(
        "loaded",
        (event) => {
          if (event.target != this.goomba) {
            return;
          }
          this.goomba.components["goomba"].dontTick = true;
        },
        { once: true }
      );
      this.goomba.addEventListener("grabstarted", (event) => {
        if (event.target != this.goomba) {
          console.log("fuck", this.goomba, event.target, event);
          return;
        }
        // FILL - add him to the scene, and remove self
        // FILL - set newParent
        console.log(event.detail.grab);
        event.detail.grab.newParent = this.sceneEl;
      });
      this.goomba.addEventListener("grabended", () => {
        if (event.target != this.goomba) {
          return;
        }
        // FILL - add him to the scene, and remove self
        console.log("adding goomba to scene");
        const { goomba } = this;

        if (!goomba) {
          return;
        }

        goomba.components["goomba"].dontTick = false;
        this.goomba = undefined;
      });
      this.el.appendChild(this.goomba);
    }

    this.goomba.setAttribute("position", "0 0.1 0");
    this.goomba.setAttribute("rotation", "0 180 0");
  },
});
