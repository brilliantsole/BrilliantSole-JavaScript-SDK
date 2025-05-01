import * as BS from "../../../build/brilliantsole.module.js";

AFRAME.registerComponent("bs-vibration", {
  schema: {
    type: {
      default: "insole",
      oneOf: ["glove", "insole"],
    },
    side: {
      default: "right",
      oneOf: ["left", "right"],
    },
  },

  dependencies: ["hand-tracking-controls"],

  init() {
    this.type = this.data.type;
    this.side = this.data.side;

    this.hand = this.el.components["hand-tracking-controls"];
    if (this.hand) {
      this.side = this.hand.data.hand;
      this.type = "glove";
    }

    switch (this.type) {
      case "glove":
        this.devicePair = BS.DevicePair.gloves;

        this.el.addEventListener("grabstarted", this.onGrabStarted.bind(this));
        this.el.addEventListener("grabended", this.onGrabEnded.bind(this));

        this.el.sceneEl.addEventListener(
          "startPetting",
          this.onStartPetting.bind(this)
        );
        this.el.sceneEl.addEventListener(
          "stopPetting",
          this.onStopPetting.bind(this)
        );
        break;
      case "insole":
        this.devicePair = BS.DevicePair.insoles;
        break;
    }

    this.el.sceneEl.addEventListener(
      "bs-trigger-vibration",
      this.onVibrate.bind(this)
    );
  },

  onGrabStarted: function (event) {
    /** @type {BS.VibrationWaveformEffect} */
    const waveformEffect = "sharpClick100";
    this.vibrate(waveformEffect);
  },
  onGrabEnded: function (event) {
    /** @type {BS.VibrationWaveformEffect} */
    const waveformEffect = "shortDoubleSharpTick100";
    this.vibrate(waveformEffect);
  },

  onStartPetting: function (event) {
    const { side } = event.detail;
    if (side != this.side) {
      return;
    }
    /** @type {BS.VibrationWaveformEffect} */
    const waveformEffect = "transitionHum40";
    this.vibrate(waveformEffect, true);
  },
  onStopPetting: function (event) {
    const { side } = event.detail;
    if (side != this.side) {
      return;
    }
    /** @type {BS.VibrationWaveformEffect} */
    const waveformEffect = "none";
    this.vibrate(waveformEffect);
  },

  onVibrate: function (event) {
    const { side, type, waveformEffect } = event.detail;
    if (side != this.side || type != this.type) {
      return;
    }
    this.vibrate(waveformEffect);
  },

  vibrate: function (waveformEffect, loop = false) {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
    }
    if (!this.devicePair) {
      console.log("devicePair not defined");
      return;
    }
    /** @type {BS.Device?} */
    const device = this.devicePair[this.side];
    if (!device?.isConnected) {
      console.log(
        `${this.side} ${this.type} not connected`,
        device,
        this.devicePair
      );
      return;
    }

    if (loop) {
      const trigger = () => {
        device.triggerVibration([
          {
            type: "waveformEffect",
            locations: ["rear"],
            segments: new Array(
              BS.MaxNumberOfVibrationWaveformEffectSegments
            ).fill({ effect: waveformEffect }),
          },
        ]);
      };
      this.loopInterval = setInterval(() => trigger(), 4000);
      trigger();
    } else {
      device.triggerVibration([
        {
          type: "waveformEffect",
          locations: ["rear"],
          segments: [{ effect: waveformEffect }],
        },
      ]);
    }
  },
});
