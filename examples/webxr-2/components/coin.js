AFRAME.registerComponent("coin", {
  schema: {
    template: { default: "#coinTemplate", type: "selector" },
    lifetime: { default: 800 },
  },
  init: function () {
    this.el.addEventListener("loaded", () => {
      const template = this.data.template.content
        .querySelector("a-entity")
        .cloneNode(true);
      template.classList.forEach((_class) => {
        //console.log(`adding class ${_class}`);
        this.el.classList.add(_class);
      });
      Array.from(template.children).forEach((entity) => {
        this.el.appendChild(entity);
      });
      this.rotationEntity = this.el.querySelector(".rotation");
      this.positionEntity = this.el.querySelector(".position");
      this.scaleEntity = this.el.querySelector(".scale");
      this.template = template;

      this.originalRotation = this.rotationEntity.object3D.rotation.clone();
      this.originalPosition = this.rotationEntity.object3D.position.clone();
      this.originalScale = this.rotationEntity.object3D.scale.clone();
    });
  },

  start: function () {
    this.sound = this.el.sceneEl.components["pool__coinsound"].requestEntity();
    this.sound.play();
    this.sound.object3D.position.copy(this.el.object3D.position);
    this.sound.components.sound.playSound();

    this.rotationEntity.object3D.rotation.copy(this.originalRotation);
    this.rotationEntity.removeAttribute("animation__rot");
    this.rotationEntity.setAttribute("animation__rot", {
      property: "rotation",
      to: `0 180 0`,
      dur: this.data.lifetime * 0.7,
      easing: "easeInOutBack",
    });

    const offset = new THREE.Vector3(0, 0.14, 0);
    this.positionEntity.object3D.position.copy(this.originalPosition);
    this.positionEntity.removeAttribute("animation__pos");
    this.positionEntity.setAttribute("animation__pos", {
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
    this.scaleEntity.object3D.scale.copy(this.originalScale);
    this.scaleEntity.removeAttribute("animation__scale");
    this.scaleEntity.setAttribute("animation__scale", {
      property: "scale",
      from: `0 0 0`,
      to: `1 1 1`,
      dur: this.data.lifetime * 0.2,
      easing: "easeOutBack",
    });

    setTimeout(() => {
      this.removeSelf();
    }, this.data.lifetime);
  },

  removeSelf: function () {
    this.rotationEntity.removeAttribute("animation__rot");
    this.positionEntity.removeAttribute("animation__pos");
    this.scaleEntity.removeAttribute("animation__scale");
    this.el.sceneEl.components["pool__coinsound"].returnEntity(this.sound);
    this.el.sceneEl.components["pool__coin"].returnEntity(this.el);
  },

  remove: function () {
    this.removeSelf();
  },
});
