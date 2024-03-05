import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });

const insole = new BS.Device();
console.log({ insole });
window.insole = insole;
