import {
  HandLandmarker,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

import { registerModel } from "./utils.js";

let handLandmarker = undefined;
let runningMode = "VIDEO";

registerModel(
  "hand landmark",
  () => {
    if (!handLandmarker) {
      createHandLandmarker();
    }
  },
  async (image, canvas, context) => {
    if (!handLandmarker) {
      console.error("handLandmarker not created yet");
      return;
    }

    const handLandmarkerResult = handLandmarker.detectForVideo(
      image,
      performance.now()
    );

    for (const landmarks of handLandmarkerResult.landmarks) {
      drawConnectors(context, landmarks, HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5,
      });
      drawLandmarks(context, landmarks, { color: "#FF0000", lineWidth: 1 });
    }
  }
);

const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: runningMode,
    numHands: 1,
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
  console.log("created handLandmarker", handLandmarker);
};
