import * as BS from "../../../build/brilliantsole.module.js";

AFRAME.registerComponent("bs-ankle", {
  schema: {
    type: {
      default: "generic",
      oneOf: BS.DeviceTypes.slice(),
    },
    name: { default: "" },
    angleThreshold: { default: THREE.MathUtils.degToRad(30) },
    kickDistanceLowerThreshold: { default: 0.4 },
    kickDistanceUpperThreshold: { default: 1 },
    stompDistanceThreshold: { default: 0.3 },
    velocityLength: { default: 2 },
    velocityPitch: { default: THREE.MathUtils.degToRad(40) },
    kickSoundSelector: { default: "#kickAudio" },
    stompSoundSelector: { default: "#stompAudio" },
  },

  init() {
    this.kickEuler = new THREE.Euler(0, 0, 0, "YXZ");

    this.debugCone = this.el.sceneEl.querySelector("#debugCone");
    this.debugText = this.el.sceneEl.querySelector("#debugText");
    this.debug = false;
    this.debugStomp = false;
    this.debugKick = false;
    this.debugGesture = false;
    if (this.debug) {
      this.debugText.setAttribute("visible", "true");
      if (this.debugKick) {
        setInterval(() => {
          this.kick(true);
        }, 100);
      }
    }

    this.raycaster = new THREE.Raycaster();
    this.ray = new THREE.Vector3(0, -1, 0);

    this.cameraQuaternion = new THREE.Quaternion();
    this.cameraEuler = new THREE.Euler(0, 0, 0, "YXZ");
    this.cameraPosition = new THREE.Vector3();

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
      `src: ${this.data.stompSoundSelector}; volume: 0.8;`
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
    const { maxClass, maxValue, timestamp } = event.message.tfliteInference;
    if (this.debug && this.debugGesture) {
      this.debugText.setAttribute("visible", "true");
      this.debugText.setAttribute(
        "value",
        `${maxClass}\n${maxValue.toFixed(3)}`
      );
    }
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

    this.camera.object3D.getWorldPosition(this.cameraPosition);

    this.raycaster.set(this.cameraPosition, this.ray);
    this.raycaster.near = 0;
    this.raycaster.far = 5;
    const intersections = this.raycaster.intersectObjects(floorObjects, true);
    const intersection = intersections[0];
    if (!intersection) {
      return;
    }
    // console.log("intersection", intersection);
    const { point, object } = intersection;
    const floor = object.el || object.parent.el;
    if (!floor) {
      return;
    }

    const goombasOnFloor = window.goombas.filter(
      (goomba) => goomba.floor == floor
    );
    // console.log("goombasOnFloor", goombasOnFloor);

    return { point, floor, goombasOnFloor };
  },

  kick: function (isDebug) {
    const metadata = this.getFloorMetadata();
    if (!metadata) {
      return;
    }
    const { point, floor, goombasOnFloor } = metadata;

    this.camera.object3D.getWorldQuaternion(this.cameraQuaternion);
    this.cameraEuler.setFromQuaternion(this.cameraQuaternion);

    let cameraYaw = this.cameraEuler.y;
    while (cameraYaw < 0) {
      cameraYaw += 2 * Math.PI;
    }

    const kickOffsetEuler = new THREE.Euler(0, cameraYaw, 0);
    const kickOffset = new THREE.Vector3(0, 0, -0.3);
    kickOffset.applyEuler(kickOffsetEuler);

    const kickPosition = new THREE.Vector3()
      .addVectors(point, this.cameraPosition)
      .multiplyScalar(0.5)
      .add(kickOffset);

    if (goombasOnFloor.length == 0) {
      //return;
    }
    if (!window.shells[0].body && !window.soccerBalls[0].body) {
      //return;
    }

    const goombaPosition = new THREE.Vector3();

    const goombasToKick = [
      ...goombasOnFloor,
      ...window.shells,
      ...window.soccerBalls,
    ].filter((goomba) => {
      goomba.el.object3D.getWorldPosition(goombaPosition);
      //   const v = new THREE.Vector3();
      //   v.copy(goombaPosition);
      //   this.camera.object3D.worldToLocal(v);
      this.cameraToGoomba.subVectors(this.cameraPosition, goombaPosition);
      this.cameraToGoomba.y = 0;
      const distance = this.cameraToGoomba.length();
      if (distance > this.data.kickDistanceUpperThreshold) {
        if (this.debugKick) {
          this.debugText.setAttribute("value", `far ${distance.toFixed(2)}`);
        }
        return false;
      }
      this.cameraToGoomba.normalize();
      let goombaYaw = Math.atan2(this.cameraToGoomba.x, this.cameraToGoomba.z);
      while (goombaYaw < 0) {
        goombaYaw += 2 * Math.PI;
      }

      if (distance > this.data.kickDistanceLowerThreshold) {
        const angle = Math.abs(cameraYaw - goombaYaw);
        if (this.debugKick) {
          this.debugText.setAttribute(
            "value",
            [
              `d: ${distance.toFixed(3)}`,
              `c: ${THREE.MathUtils.radToDeg(cameraYaw).toFixed(0)}`,
              `g: ${THREE.MathUtils.radToDeg(goombaYaw).toFixed(0)}`,
              `a: ${THREE.MathUtils.radToDeg(angle).toFixed(0)}`,
            ].join("\n")
          );
        }
        if (angle > this.data.angleThreshold) {
          return false;
        }
      } else {
        if (this.debugKick) {
          this.debugText.setAttribute("value", `${distance.toFixed(2)}`);
        }
      }

      this.kickEuler.set(0, 0, 0);
      this.kickEuler.x = this.data.velocityPitch;
      if (false) {
        this.kickEuler.y = goombaYaw;
      } else {
        this.kickEuler.y = cameraYaw;
      }
      const velocity = new THREE.Vector3(0, 0, -this.data.velocityLength);
      velocity.applyEuler(this.kickEuler);
      if (this.debugKick) {
        this.debugCone.setAttribute("visible", "true");
        this.debugCone.object3D.position.copy(goombaPosition);
        this.debugCone.object3D.rotation.copy(this.kickEuler);
      }
      if (isDebug) {
        return false;
      }
      goomba.el.emit("kick", { velocity, yaw: this.kickEuler.y });

      return true;
    });
    // console.log("goombasToKick", goombasToKick);

    if (!isDebug) {
      if (goombasToKick.length > 0) {
        /** @type {BS.VibrationWaveformEffect} */
        let waveformEffect = "strongClick100";
        this.vibrate(waveformEffect);
      } else {
        this.playKickSound(kickPosition);
      }
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
    // console.log(point);
    this.playStompSound(point);

    [...goombas, ...window.shells, ...window.soccerBalls].forEach((goomba) => {
      this.cameraToGoomba.subVectors(
        goomba.el.object3D.position,
        this.cameraPosition
      );
      this.cameraToGoomba.y = 0;
      const direction = this.cameraToGoomba;
      const distance = direction.length();
      direction.normalize();
      const yaw = Math.atan2(direction.x, direction.z);
      let kill = false;
      if (this.debugStomp) {
        this.debugText.setAttribute("value", `${distance.toFixed(2)}`);
      }
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
