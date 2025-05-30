import {
  FaceDetector,
  FilesetResolver,
  DrawingUtils,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

import { registerModel } from "./utils.js";

let faceDetector = undefined;
let runningMode = "VIDEO";

registerModel(
  "face detector",
  () => {
    if (!faceDetector) {
      createFaceDetector();
    }
  },
  async (image, canvas, context) => {
    if (!faceDetector) {
      console.error("faceDetector not created yet");
      return;
    }

    const faceDetectorResult = faceDetector.detectForVideo(
      image,
      performance.now()
    );

    //console.log("faceDetectorResult", faceDetectorResult);

    context.save();
    for (const detection of faceDetectorResult.detections) {
      const { boundingBox, keypoints } = detection;

      const { originX, originY, width, height } = boundingBox;
      const _originX = (originX / image.naturalWidth) * canvas.width;
      const _originY = (originY / image.naturalHeight) * canvas.height;

      const _width = (width / image.naturalWidth) * canvas.width;
      const _height = (height / image.naturalHeight) * canvas.height;

      context.fillStyle = "rgba(0, 191, 255, 0.4)";
      context.fillRect(_originX, _originY, _width, _height);

      context.strokeStyle = "white";
      context.lineWidth = 2;
      context.strokeRect(_originX, _originY, _width, _height);

      keypoints.forEach((keypoint, index) => {
        const { x, y, score, label } = keypoint;

        const _x = x * canvas.width;
        const _y = y * canvas.height;

        context.beginPath();
        context.arc(_x, _y, 5, 0, 2 * Math.PI);

        context.fillStyle = "red";
        context.fill();
      });
    }
    context.restore();
  }
);

const createFaceDetector = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  faceDetector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
      delegate: "GPU",
    },
    runningMode: runningMode,
    minDetectionConfidence: 0.5,
    minSuppressionThreshold: 0.3,
  });
  console.log("created faceDetector", faceDetector);
};

const sampleResult = {
  detections: [
    {
      categories: [
        {
          score: 0.9460012316703796,
          index: 0,
          categoryName: "",
          displayName: "",
        },
      ],
      boundingBox: {
        originX: 196,
        originY: 284,
        width: 290,
        height: 290,
      },
      keypoints: [
        {
          x: 0.3776719570159912,
          y: 0.48935234546661377,
          score: 0,
          label: "",
        },
        {
          x: 0.5415752530097961,
          y: 0.48879799246788025,
          score: 0,
          label: "",
        },
        {
          x: 0.4468824565410614,
          y: 0.5775673985481262,
          score: 0,
          label: "",
        },
        {
          x: 0.4519948363304138,
          y: 0.6720198392868042,
          score: 0,
          label: "",
        },
        {
          x: 0.3088231682777405,
          y: 0.5479761958122253,
          score: 0,
          label: "",
        },
        {
          x: 0.6484290957450867,
          y: 0.549033522605896,
          score: 0,
          label: "",
        },
      ],
    },
  ],
};
