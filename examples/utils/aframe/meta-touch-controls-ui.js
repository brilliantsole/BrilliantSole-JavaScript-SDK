{
  AFRAME.registerSystem("meta-touch-controls-ui", {
    schema: {
      dominantSide: { oneOf: ["left", "right"], default: "right" },
      dominantText: { type: "string", default: "" },
      nonDominantText: { type: "string", default: "" },
    },

    init: function () {
      this.components = [];
      this.controllers = {};
    },

    getNonDominantSide: function () {
      return this.data.dominantSide == "left" ? "right" : "left";
    },
    getDominantController: function () {
      return this.controllers[this.data.dominantSide];
    },
    getNonDominantController: function () {
      return this.controllers[this.getNonDominantSide()];
    },

    update: function (oldData) {
      const diff = AFRAME.utils.diff(oldData, this.data);

      const diffKeys = Object.keys(diff);
      //console.log("diffKeys", diffKeys);

      diffKeys.forEach((diffKey) => {
        if (this.data[diffKey] == undefined) {
          // return;
        }
        // console.log("update", { [diffKey]: this.data[diffKey] });
        switch (diffKey) {
          case "dominantSide":
            this._updateText();
            break;
          case "dominantText":
            this.getDominantController()?._updateText();
            break;
          case "nonDominantText":
            this.getNonDominantController()?._updateText();
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
      this.controllers[component.side] = component;
    },
    _remove: function (component) {
      if (this.components.includes(component)) {
        //console.log("_remove", component);
        this.components.splice(this.components.indexOf(component), 1);
      }
      delete this.controllers[component.side];
    },
    // COMPONENT END

    _updateText: function () {
      this.components.forEach((component) => component._updateText());
    },
  });

  AFRAME.registerComponent("meta-touch-controls-ui", {
    schema: {},
    dependencies: ["meta-touch-controls"],

    getIsDominantHand: function () {
      return this.side == this.system.data.dominantSide;
    },
    getDominantController: function () {
      return this.system.controller;
    },

    init: function () {
      this.touchControls = this.el.components["meta-touch-controls"];
      const { hand } = this.touchControls.data;
      this.side = hand;

      this.textContainer = this.el.querySelector(".text");
      this.textContainer.setAttribute("visible", "false");
      this.textEntity = this.textContainer.querySelector("a-text");
      this.textBackgroundEntity =
        this.textContainer.querySelector(".background");
      this.textContainer.object3D.position.z = -0.05;
      this.textContainer.object3D.position.x =
        this.side == "left" ? -0.05 : 0.05;

      this._initVr();

      this._initController();
      this._updateText();

      this.system._add(this);
    },
    remove: function () {
      this.system._remove(this);
    },

    _setTextVisible: function (textVisible) {
      this.textContainer.object3D.visible = textVisible;
    },
    _textPrefixes: [
      "T",
      {
        left: "Y",
        right: "B",
      },
      {
        left: "X",
        right: "A",
      },
      "G",
    ],
    _updateText: function () {
      const string =
        this.system.data[
          this.getIsDominantHand() ? "dominantText" : "nonDominantText"
        ];

      console.log("updateText\n", string, {
        side: this.side,
        isDominantHand: this.getIsDominantHand(),
      });
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
      this.el.addEventListener("abuttonup", this.onAButtonUp.bind(this));

      this.el.addEventListener("bbuttondown", this.onBButtonDown.bind(this));
      this.el.addEventListener("bbuttonup", this.onBButtonUp.bind(this));

      this.el.addEventListener("xbuttondown", this.onXButtonDown.bind(this));
      this.el.addEventListener("xbuttonup", this.onXButtonUp.bind(this));

      this.el.addEventListener("ybuttondown", this.onYButtonDown.bind(this));
      this.el.addEventListener("ybuttonup", this.onYButtonUp.bind(this));

      this.el.addEventListener("triggerdown", this.onTriggerDown.bind(this));
      this.el.addEventListener("triggerup", this.onTriggerUp.bind(this));

      this.el.addEventListener("gripdown", this.onGripDown.bind(this));
      this.el.addEventListener("gripup", this.onGripUp.bind(this));

      this.thumbstick = { x: 0, y: 0 };
      this.el.addEventListener(
        "thumbstickmoved",
        this.onThumbstickMoved.bind(this)
      );
    },

    tick: function (time, timeDelta) {
      const timeDeltaScaler = timeDelta / 1000;

      let { x, y } = this.thumbstick;
      if (x != 0 || y != 0) {
        x *= timeDeltaScaler;
        y *= timeDeltaScaler;

        const detail = {
          isDominant: this.getIsDominantHand(),
          side: this.side,
          x,
          y,
          timeDelta,
        };

        this.el.emit("controller-thumbstick-tick", detail);
      }
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
      this.onUpperButton(event, true);
    },
    onBButtonUp: function (event) {
      // console.log("onBButtonUp");
      this.onUpperButton(event, false);
    },
    onAButtonDown: function (event) {
      // console.log("onAButtonDown");
      this.onLowerButton(event, true);
    },
    onAButtonUp: function (event) {
      // console.log("onAButtonUp");
      this.onLowerButton(event, false);
    },
    onYButtonDown: function (event) {
      // console.log("onYButtonDown");
      this.onUpperButton(event, true);
    },
    onYButtonUp: function (event) {
      // console.log("onYButtonUp");
      this.onUpperButton(event, false);
    },
    onXButtonDown: function (event) {
      // console.log("onXButtonDown");
      this.onLowerButton(event, true);
    },
    onXButtonUp: function (event) {
      // console.log("onXButtonUp");
      this.onLowerButton(event, false);
    },
    onGripDown: function (event) {
      console.log("onGripDown");
      this.onGrip(event, true);
    },
    onGripUp: function (event) {
      console.log("onGripUp");
      this.onGrip(event, false);
    },
    onTriggerDown: function (event) {
      console.log("onTriggerDown");
      this.onTrigger(event, true);
    },
    onTriggerUp: function (event) {
      console.log("onTriggerUp");
      this.onTrigger(event, false);
    },
    onThumbstickMoved: function (event) {
      const { x, y } = event.detail;
      Object.assign(this.thumbstick, { x, y });
      const detail = {
        isDominant: this.getIsDominantHand(),
        side: this.side,
        x,
        y,
      };
      // console.log("onThumbstickMoved", this.thumbstick);
      this.el.emit("controller-thumbstick", detail);
    },
    onUpperButton: function (event, pressed) {
      this.onButton(event, pressed, true);
    },
    onLowerButton: function (event, pressed) {
      this.onButton(event, pressed, false);
    },
    onButton: function (event, pressed, isUpper) {
      const detail = {
        isDominant: this.getIsDominantHand(),
        side: this.side,
        pressed,
        isUpper,
      };
      this.el.emit("controller-button", detail);
    },
    onGrip: function (event, pressed) {
      const detail = {
        isDominant: this.getIsDominantHand(),
        side: this.side,
        pressed,
      };
      this.el.emit("controller-grip", detail);
    },
    onTrigger: function (event, pressed) {
      const detail = {
        isDominant: this.getIsDominantHand(),
        side: this.side,
        pressed,
      };
      this.el.emit("controller-trigger", detail);
    },
    // CONTROLLER END
  });
}
