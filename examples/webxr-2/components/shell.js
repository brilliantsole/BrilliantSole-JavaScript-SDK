AFRAME.registerComponent("shell", {
  schema: {
    template: { default: "#shellTemplate", type: "selector" },
  },

  shapeMain: `shape: cylinder;
  radiusTop: 0.12;
  radiusBottom: 0.12;
  height: 0.12;
  offset: 0 0.01 0;
  `,

  init: function () {
    this.el.sceneEl.emit("shell-init");
    this.el.shapeMain = this.shapeMain;

    this.el.addEventListener("body-loaded", this.onBodyLoaded.bind(this));
    this.el.addEventListener("loaded", () => {
      const template = this.data.template.content
        .querySelector("a-entity")
        .cloneNode(true);
      this.el.setAttribute("scale", template.getAttribute("scale"));
      template.classList.forEach((_class) => {
        //console.log(`adding class ${_class}`);
        this.el.classList.add(_class);
      });
      Array.from(template.children).forEach((entity) => {
        this.el.appendChild(entity);
      });
      setTimeout(() => {
        this.el.setAttribute("grabbable", "");
        this.el.setAttribute(
          "grabbable-physics-body",
          `type: dynamic; enable-angular-velocity: false;`
        );
      }, 1);
    });
  },

  onBodyLoaded: function (event) {
    const { body } = event.detail;
    console.log("body", body);
    //body.fixedRotation = true;
    body.linearDamping = 0;
    body.angularDamping = 0;
    body.material =
      this.el.sceneEl.systems["physics"].driver.getMaterial("shell");
    body.angularVelocity.set(0, 10, 0);
  },

  start: function () {
    // FILL - request sound
  },

  removeSelf: function () {
    // FILL - return sound
  },

  tick: function (time, timeDelta) {
    // FILL
  },

  remove: function () {
    this.removeSelf();
  },
});
