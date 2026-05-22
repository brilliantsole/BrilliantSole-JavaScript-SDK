import * as visionBundle from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs";

console.log("visionBundle", visionBundle);

const { FilesetResolver } = visionBundle;

const vision = await FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
);

export { vision, visionBundle };
