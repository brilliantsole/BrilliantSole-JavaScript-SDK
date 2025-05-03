AFRAME.registerComponent("coin", {
  schema: {
    template: { default: "#coinTemplate", type: "selector" },
    lifetime: { default: 800 },
  },
  init: function () {
    this.sound = this.el.sceneEl.components["pool__coinsound"].requestEntity();
    this.sound.play();
    this.sound.object3D.position.copy(this.el.object3D.position);
    this.sound.components.sound.playSound();

    this.el.addEventListener("loaded", () => {
      const template = this.data.template.content
        .querySelector("a-entity")
        .cloneNode(true);
      template.classList.forEach((_class) => {
        // console.log(`adding class ${_class}`);
        this.el.classList.add(_class);
      });
      Array.from(template.children).forEach((entity) => {
        this.el.appendChild(entity);
      });
      this.template = template;

      this.el.querySelector(".rotation").setAttribute("animation__rot", {
        property: "rotation",
        to: `0 180 0`,
        dur: this.data.lifetime * 0.7,
        easing: "easeInOutBack",
      });

      const offset = new THREE.Vector3(0, 0.14, 0);
      this.el.querySelector(".position").setAttribute("animation__pos", {
        property: "position",
        to: offset
          .toArray()
          .map((value) => (value < 0.0001 ? 0 : value))
          .join(" "),
        dur: this.data.lifetime * 0.9,
        loop: 0,
        dir: "alternate",
        easing: "easeOutBack",
      });
      this.el.querySelector(".scale").setAttribute("animation__scale", {
        property: "scale",
        from: `0 0 0`,
        to: `1 1 1`,
        dur: this.data.lifetime * 0.2,
        easing: "easeOutBack",
      });

      setTimeout(() => {
        this.el.remove();
      }, this.data.lifetime);
    });
  },

  remove: function () {
    this.el.sceneEl.components["pool__coinsound"].returnEntity(this.sound);
  },
});
