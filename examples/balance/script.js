import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
BS.setAllConsoleLevelFlags({ log: true });

const devicePair = new BS.DevicePair();
console.log({ devicePair });
window.devicePair = devicePair;
