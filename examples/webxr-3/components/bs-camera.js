import * as BS from "../../../build/brilliantsole.module.js";

AFRAME.registerComponent("bs-camera", {
  schema: {
    image: { type: "selector" },
  },

  init() {
    this.onDeviceIsConnected = this.onDeviceIsConnected.bind(this);
    this.onCameraImage = this.onCameraImage.bind(this);

    BS.DeviceManager.AddEventListener(
      "deviceIsConnected",
      this.onDeviceIsConnected
    );
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
    if (!device.hasCamera) {
      return;
    }
    this.device = device;
    // console.log("listening to inferences");
    device.addEventListener("cameraImage", this.onCameraImage);
  },

  /** @param {BS.DeviceEventMap["cameraImage"]} event */
  onCameraImage: function (event) {
    const { url, blob } = event.message;
    let imageEntity = this.data.image;
    if (!imageEntity) {
      if (this.el.nodeName.toLowerCase() == "a-image") {
        imageEntity = this.el;
      }
    }

    if (!imageEntity) {
      console.error("no imageEntity defined");
      return;
    }

    // Create an Image element
    const img = new Image();
    img.onload = function () {
      // Create a texture from the loaded image
      const texture = new THREE.Texture(img);
      texture.needsUpdate = true;

      imageEntity.getObject3D("mesh").material.map = texture;
      imageEntity.getObject3D("mesh").material.needsUpdate = true;
    };

    // Set the src to the Blob URL
    img.src = URL.createObjectURL(blob);
  },
});
