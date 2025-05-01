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
        dur: this.data.lifetime * 0.9,
        easing: "easeInOutBack",
      });
      this.el.querySelector(".position").setAttribute("animation__pos", {
        property: "position",
        to: `0 ${0.14} 0`,
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
});
