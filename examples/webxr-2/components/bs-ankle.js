import * as BS from "../../../build/brilliantsole.module.js";

AFRAME.registerComponent("bs-ankle", {
  schema: {
    type: {
      default: "generic",
      oneOf: BS.DeviceTypes.slice(),
    },
    name: { default: "" },
    angleThreshold: { default: THREE.MathUtils.degToRad(40) },
    distanceThreshold: { default: 0.3 },
    stompDistanceThreshold: { default: 0.2 },
    velocityLength: { default: 2 },
    velocityHeight: { default: 1 },
    kickSoundSelector: { default: "#kickAudio" },
    stompSoundSelector: { default: "#stompAudio" },
  },

  init() {
    this.raycaster = new THREE.Raycaster();
    this.ray = new THREE.Vector3(0, -1, 0);

    this.camera = this.el.sceneEl.querySelector("a-camera");
    this.cameraDirection = new THREE.Vector3();
    this.cameraToGoomba = new THREE.Vector3();

    this.onDeviceIsConnected = this.onDeviceIsConnected.bind(this);
    this.onTfliteInference = this.onTfliteInference.bind(this);

    BS.DeviceManager.AddEventListener(
      "deviceIsConnected",
      this.onDeviceIsConnected
    );

    this.kickSound = document.createElement("a-entity");
    this.kickSound.setAttribute("sound", `src: ${this.data.kickSoundSelector}`);
    this.el.sceneEl.appendChild(this.kickSound);

    this.stompSound = document.createElement("a-entity");
    this.stompSound.setAttribute(
      "sound",
      `src: ${this.data.stompSoundSelector}`
    );
    this.el.sceneEl.appendChild(this.stompSound);
  },

  playKickSound: function (position) {
    this.kickSound.object3D.position.copy(position);
    this.kickSound.components.sound.playSound();
  },
  playStompSound: function (position) {
    this.stompSound.object3D.position.copy(position);
    this.stompSound.components.sound.playSound();
  },

  remove: function () {
    BS.DeviceManager.RemoveEventListener(
      "deviceIsConnected",
      this.onDeviceIsConnected
    );
  },

  /** @param {BS.DeviceManagerEventMap["deviceIsConnected"]} event */
  onDeviceIsConnected(event) {
    const device = event.message.device;
    if (device.type != this.data.type) {
      return;
    }
    if (this.data.name && device.name != this.data.name) {
      return;
    }
    this.device = device;
    // console.log("listening to inferences");
    device.addEventListener("tfliteInference", this.onTfliteInference);
  },

  /** @param {BS.DeviceEventMap["tfliteInference"]} event */
  onTfliteInference: function (event) {
    const { maxClass } = event.message.tfliteInference;
    switch (maxClass) {
      case "kick":
        this.kick();
        break;
      case "stomp":
        this.stomp();
        break;
      default:
        console.log(`uncaught class "${maxClass}"`);
        break;
    }
  },

  getFloorMetadata: function () {
    const floorEntities = Array.from(
      this.el.sceneEl.querySelectorAll(`[data-world-mesh="floor"]`)
    ).filter(Boolean);
    const floorObjects = floorEntities.map((entity) => entity.object3D);

    this.raycaster.set(this.camera.object3D.position, this.ray);
    this.raycaster.near = 0;
    this.raycaster.far = 2;
    const intersections = this.raycaster.intersectObjects(floorObjects, true);
    const intersection = intersections[0];
    if (!intersection) {
      return;
    }
    const { point, object } = intersection;
    const { el: floor } = object;

    const goombasOnFloor = window.goombas.filter(
      (goomba) => goomba.floor == floor
    );
    console.log("goombasOnFloor", goombasOnFloor);

    return { point, floor, goombasOnFloor };
  },

  kick: function () {
    const metadata = this.getFloorMetadata();
    if (!metadata) {
      return;
    }
    const { point, floor, goombasOnFloor } = metadata;

    const kickPosition = new THREE.Vector3()
      .addVectors(point, this.camera.object3D.position)
      .multiplyScalar(0.5);
    this.playKickSound(kickPosition);

    if (goombasOnFloor.length == 0) {
      return;
    }

    this.cameraDirection.set(0, 0, -1);
    this.cameraDirection.applyQuaternion(this.camera.object3D.quaternion);
    this.cameraDirection.y = 0;
    this.cameraDirection.normalize();

    const goombasToKick = goombasOnFloor.filter((goomba) => {
      this.cameraToGoomba.subVectors(
        goomba.el.object3D.position,
        this.camera.object3D.position
      );
      this.cameraToGoomba.y = 0;
      const distance = this.cameraToGoomba.length();
      console.log({ distance });
      if (distance > this.data.distanceThreshold) {
        return false;
      }
      this.cameraToGoomba.normalize();

      const angle = this.cameraDirection.angleTo(this.cameraToGoomba);
      console.log({ angle });
      if (angle > this.data.angleThreshold) {
        return false;
      }

      const velocity = this.cameraToGoomba.clone();
      velocity.y = this.data.velocityHeight;
      velocity.setLength(this.data.velocityLength);
      goomba.el.emit("kick", { velocity });

      return true;
    });
    console.log("goombasToKick", goombasToKick);

    if (goombasToKick.length > 0) {
      /** @type {BS.VibrationWaveformEffect} */
      let waveformEffect = "strongClick100";
      this.vibrate(waveformEffect);
    }
  },
  stomp: function () {
    /** @type {BS.VibrationWaveformEffect} */
    let waveformEffect = "transitionRampDownMediumSmooth1_100";
    this.vibrate(waveformEffect);

    const metadata = this.getFloorMetadata();
    if (!metadata) {
      return;
    }
    let goombas = window.goombas.filter((goomba) => goomba.floor);
    const { point, floor, goombasOnFloor } = metadata;
    if (false) {
      goombas = goombasOnFloor;
    }
    console.log(point);
    this.playStompSound(point);

    goombas.forEach((goomba) => {
      this.cameraToGoomba.subVectors(
        goomba.el.object3D.position,
        this.camera.object3D.position
      );
      this.cameraToGoomba.y = 0;
      const direction = this.cameraToGoomba;
      const distance = direction.length();
      direction.normalize();
      const yaw = Math.atan2(direction.x, direction.z);
      let kill = false;
      if (goombasOnFloor.includes(goomba)) {
        kill = distance <= this.data.stompDistanceThreshold;
      }
      goomba.el.emit("stomp", { distance, yaw, kill });
    });
  },

  vibrate: function (waveformEffect) {
    /** @type {BS.Device?} */
    const device = this.device;
    if (!device?.isConnected) {
      // console.log(
      //   `${this.side} ${this.type} not connected`,
      //   device,
      //   this.devicePair
      // );
      return;
    }

    device.triggerVibration([
      {
        type: "waveformEffect",
        locations: ["rear"],
        segments: [{ effect: waveformEffect }],
      },
    ]);
  },
});
