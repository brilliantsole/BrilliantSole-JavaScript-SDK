{
  /** @type {import("three")} */
  const THREE = window.THREE;

  AFRAME.registerSystem("meta-touch-controls-ui", {
    schema: {
      hand: { oneOf: ["left", "right"], default: "right" },
    },

    init: function () {
      this.components = [];
    },

    update: function (oldData) {
      const diff = AFRAME.utils.diff(oldData, this.data);

      const diffKeys = Object.keys(diff);
      //console.log("diffKeys", diffKeys);

      diffKeys.forEach((diffKey) => {
        if (this.data[diffKey] == undefined) {
          // return;
        }
        //console.log("update", { [diffKey]: this.data[diffKey] });
        switch (diffKey) {
          case "hand":
            break;
          default:
            console.warn(`uncaught diffKey "${diffKey}"`);
            break;
        }
      });
    },

    // COMPONENT START
    _add: function (component) {
      //console.log("_add", component);
      this.components.push(component);
    },
    _remove: function (component) {
      if (this.components.includes(component)) {
        //console.log("_remove", component);
        this.components.splice(this.components.indexOf(component), 1);
      }
    },
    // COMPONENT END
  });

  AFRAME.registerComponent("meta-touch-controls-ui", {
    schema: {},
    dependencies: ["meta-touch-controls"],

    getIsDominantHand: function () {
      return this.hand == this.system.data.hand;
    },
    getDominantController: function () {
      return this.system.controller;
    },

    init: function () {
      this.touchControls = this.el.components["meta-touch-controls"];
      const { hand } = this.touchControls.data;
      this.hand = hand;
      this.isDominantHand = this.getIsDominantHand();

      this.textContainer = this.el.querySelector(".text");
      this.textContainer.setAttribute("visible", "false");
      this.textEntity = this.textContainer.querySelector("a-text");
      this.textBackgroundEntity =
        this.textContainer.querySelector(".background");
      this.textContainer.object3D.position.z = -0.05;
      this.textContainer.object3D.position.x =
        this.hand == "left" ? -0.05 : 0.05;

      this._initVr();

      this._initController();
      if (this.isDominantHand) {
        this.system.controller = this;
      }

      this._updateText();

      this.system._add(this);
    },
    remove: function () {
      this.system._remove(this);
    },

    _setTextVisible: function (textVisible) {
      this.textContainer.object3D.visible = textVisible;
    },
    _updateText: function () {
      let strings = [];
      if (this.hand == "right") {
        strings.push("B: ", "A: ");
      } else {
        strings.push("Y: ", "X: ");
      }
      strings.push("left/right: ");
      strings.push("up/down: ");

      if (this.isDominantHand) {
        // FILL
      } else {
        // FILL
      }
      strings = strings.filter(Boolean);
      const string = strings.join("\n");
      console.log(
        "updateText",
        { hand: this.hand, isDominantHand: this.isDominantHand },
        strings
      );
      this.textEntity.setAttribute("value", string);
    },

    // VR START
    _initVr: function () {
      this.el.sceneEl.addEventListener("enter-vr", this.onEnterXr.bind(this));
      this.el.sceneEl.addEventListener("exit-vr", this.onExitXr.bind(this));
    },
    onEnterXr: function (event) {
      // console.log(event);
      this.isInXr = true;
    },
    onExitXr: function (event) {
      this.isInXr = true;
    },
    // VR END

    // CONTROLLER START
    _initController: function () {
      this.el.addEventListener(
        "controllerconnected",
        this.onControllerConnected.bind(this)
      );
      this.el.addEventListener(
        "controllerdisconnected",
        this.onControllerDisconnected.bind(this)
      );
      this.el.addEventListener(
        "controllermodelready",
        this.onControllerModelReady.bind(this)
      );

      this.el.addEventListener("abuttondown", this.onAButtonDown.bind(this));
      this.el.addEventListener("bbuttondown", this.onBButtonDown.bind(this));
      this.el.addEventListener("xbuttondown", this.onXButtonDown.bind(this));
      this.el.addEventListener("ybuttondown", this.onYButtonDown.bind(this));

      this.thumbstick = { x: 0, y: 0 };
      this.el.addEventListener(
        "thumbstickmoved",
        this.onThumbstickMoved.bind(this)
      );
    },

    onControllerConnected: function (event) {
      // console.log(event);
      this._setTextVisible(true);
    },
    onControllerDisconnected: function (event) {
      // console.log(event);
      this._setTextVisible(false);
    },
    onControllerModelReady: function (event) {
      // console.log(event);
    },
    onBButtonDown: function (event) {
      // console.log("onBButtonDown");
      this.onUpperButton(event);
    },
    onAButtonDown: function (event) {
      // console.log("onAButtonDown");
      this.onLowerButton(event);
    },
    onYButtonDown: function (event) {
      // console.log("onYButtonDown");
      this.onUpperButton(event);
    },
    onXButtonDown: function (event) {
      // console.log("onXButtonDown");
      this.onLowerButton(event);
    },
    onThumbstickMoved: function (event) {
      const { x, y } = event.detail;
      Object.assign(this.thumbstick, { x, y });
      // console.log("onThumbstickMoved", this.thumbstick);
    },
    onUpperButton: function (event) {
      if (this.isDominantHand) {
        // FILL
      } else {
        // FILL
      }
    },
    onLowerButton: function (event) {
      if (this.isDominantHand) {
        // FILL
      } else {
        // FILL
      }
    },
    // CONTROLLER END
  });
}
