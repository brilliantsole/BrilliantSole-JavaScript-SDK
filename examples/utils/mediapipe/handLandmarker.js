import { vision, visionBundle } from "./vision.js";
const { HandLandmarker, FilesetResolver, DrawingUtils, GestureRecognizer } =
  visionBundle;

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas[data-hand-landmarker]");
const context = canvas.getContext("2d");
const drawingUtils = new DrawingUtils(context);

/** @type {HTMLImageElement} */
const image = document.querySelector("img[data-hand-landmarker]");

image.addEventListener("load", () => {
  if (!handLandmarker) {
    console.log("handLandmarker not created yet");
    return;
  }

  const handLandmarkerResult = handLandmarker.detectForVideo(
    image,
    performance.now(),
  );
  // console.log("handLandmarkerResult", handLandmarkerResult);

  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const landmarks of handLandmarkerResult.landmarks) {
    drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 3,
    });
    drawingUtils.drawLandmarks(landmarks, {
      color: "#FF0000",
      lineWidth: 0,
      radius: 3,
    });
  }

  window.dispatchEvent(
    new CustomEvent("handlandmarkerresult", {
      detail: { handLandmarkerResult, HAND_LANDMARKS_MAP, HAND_LANDMARKS },
    }),
  );
});

console.log("creating handLandmarker...");
const handLandmarker = await HandLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath:
      "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
    delegate: navigator.gpu ? "GPU" : "CPU",
  },
  // https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker#configurations_options
  numHands: 2,
  runningMode: "LIVE_STREAM",

  /**
   * The minimum confidence score for the hand detection to be considered successful in palm detection model.
   */
  minHandDetectionConfidence: 0.5,
  /**
   * The minimum confidence score for the hand presence score in the hand landmark detection model.
   * In Video mode and Live stream mode, if the hand presence confidence score from the hand landmark model is below this threshold,
   * Hand Landmarker triggers the palm detection model.
   * Otherwise, a lightweight hand tracking algorithm determines the location of the hand(s) for subsequent landmark detections.
   */
  minHandPresenceConfidence: 0.5,
  /**
   * The minimum confidence score for the hand tracking to be considered successful.
   * This is the bounding box IoU threshold between hands in the current frame and the last frame.
   * In Video mode and Stream mode of Hand Landmarker, if the tracking fails, Hand Landmarker triggers hand detection.
   * Otherwise, it skips the hand detection.
   */
  minTrackingConfidence: 0.5,
});

window.handLandmarker = handLandmarker;
console.log("created handLandmarker", handLandmarker);

window.dispatchEvent(
  new CustomEvent("createdhandlandmarker", {
    detail: { handLandmarker },
  }),
);

/** @typedef {{x:number,y:number,z:number}} Vector3 */
/**
 *  @typedef {{
 *    landmarks: Vector3[][];
 *    worldLandmarks: Vector3[][];
 *    handednesses: {
 *       score: number;
 *       index: number;
 *       categoryName: "Left"|"Right";
 *       displayName: "Left"|"Right";
 *    }[][];
 *}} HandLandmarkerResult
 */

/**
 * MediaPipe Hand landmark names (21 points)
 * @typedef {(
 *  | "WRIST"
 *  | "THUMB_CMC"
 *  | "THUMB_MCP"
 *  | "THUMB_IP"
 *  | "THUMB_TIP"
 *  | "INDEX_FINGER_MCP"
 *  | "INDEX_FINGER_PIP"
 *  | "INDEX_FINGER_DIP"
 *  | "INDEX_FINGER_TIP"
 *  | "MIDDLE_FINGER_MCP"
 *  | "MIDDLE_FINGER_PIP"
 *  | "MIDDLE_FINGER_DIP"
 *  | "MIDDLE_FINGER_TIP"
 *  | "RING_FINGER_MCP"
 *  | "RING_FINGER_PIP"
 *  | "RING_FINGER_DIP"
 *  | "RING_FINGER_TIP"
 *  | "PINKY_MCP"
 *  | "PINKY_PIP"
 *  | "PINKY_DIP"
 *  | "PINKY_TIP"
 * )} HAND_LANDMARK
 */

/** @typedef {HAND_LANDMARK[]} HAND_LANDMARKS */
/** @type {HAND_LANDMARKS} */
const HAND_LANDMARKS = [
  "WRIST",
  "THUMB_CMC",
  "THUMB_MCP",
  "THUMB_IP",
  "THUMB_TIP",
  "INDEX_FINGER_MCP",
  "INDEX_FINGER_PIP",
  "INDEX_FINGER_DIP",
  "INDEX_FINGER_TIP",
  "MIDDLE_FINGER_MCP",
  "MIDDLE_FINGER_PIP",
  "MIDDLE_FINGER_DIP",
  "MIDDLE_FINGER_TIP",
  "RING_FINGER_MCP",
  "RING_FINGER_PIP",
  "RING_FINGER_DIP",
  "RING_FINGER_TIP",
  "PINKY_MCP",
  "PINKY_PIP",
  "PINKY_DIP",
  "PINKY_TIP",
];
/** @typedef {Record<HAND_LANDMARK, number>} HAND_LANDMARKS_MAP */
/** @type {HAND_LANDMARKS_MAP} */
const HAND_LANDMARKS_MAP = {};
HAND_LANDMARKS.forEach((HAND_LANDMARK, index) => {
  HAND_LANDMARKS_MAP[HAND_LANDMARK] = index;
});
console.log("HAND_LANDMARKS", HAND_LANDMARKS);
console.log("HAND_LANDMARKS_MAP", HAND_LANDMARKS_MAP);

/** @type {[HAND_LANDMARK, HAND_LANDMARK][]} */
const JOINT_CONNECTIONS = [
  ["WRIST", "THUMB_CMC"],
  ["THUMB_CMC", "THUMB_MCP"],
  ["THUMB_MCP", "THUMB_IP"],
  ["THUMB_IP", "THUMB_TIP"],

  //   ["WRIST", "INDEX_FINGER_MCP"],
  //   ["THUMB_CMC", "INDEX_FINGER_MCP"],
  ["THUMB_MCP", "INDEX_FINGER_MCP"],
  ["INDEX_FINGER_MCP", "INDEX_FINGER_PIP"],
  ["INDEX_FINGER_PIP", "INDEX_FINGER_DIP"],
  ["INDEX_FINGER_DIP", "INDEX_FINGER_TIP"],

  ["MIDDLE_FINGER_MCP", "MIDDLE_FINGER_PIP"],
  ["MIDDLE_FINGER_PIP", "MIDDLE_FINGER_DIP"],
  ["MIDDLE_FINGER_DIP", "MIDDLE_FINGER_TIP"],

  ["RING_FINGER_MCP", "RING_FINGER_PIP"],
  ["RING_FINGER_PIP", "RING_FINGER_DIP"],
  ["RING_FINGER_DIP", "RING_FINGER_TIP"],

  ["WRIST", "PINKY_MCP"],
  ["PINKY_MCP", "PINKY_PIP"],
  ["PINKY_PIP", "PINKY_DIP"],
  ["PINKY_DIP", "PINKY_TIP"],

  ["INDEX_FINGER_MCP", "MIDDLE_FINGER_MCP"],
  ["MIDDLE_FINGER_MCP", "RING_FINGER_MCP"],
  ["RING_FINGER_MCP", "PINKY_MCP"],
];

window.HAND_LANDMARKS = HAND_LANDMARKS;
window.HAND_LANDMARKS_MAP = HAND_LANDMARKS_MAP;

/** @typedef {{handLandmarkerResult:HandLandmarkerResult, HAND_LANDMARKS:HAND_LANDMARKS, HAND_LANDMARKS_MAP:HAND_LANDMARKS_MAP}} HandLandmarkerResultEventDetail */
