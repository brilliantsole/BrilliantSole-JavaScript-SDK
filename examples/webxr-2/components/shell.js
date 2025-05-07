AFRAME.registerComponent("shell", {
  schema: {
    template: { default: "#shellTemplate", type: "selector" },
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
    });
  },

  start: function () {
    // FILL - request sound
  },

  removeSelf: function () {
    // FILL - return sound
  },

  remove: function () {
    this.removeSelf();
  },
});
