import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.2.4";

import { registerModel } from "./utils.js";

let classifier = undefined;
let isRunning = false;

const createClassifier = async () => {
  console.log("creating classifier");
  classifier = await pipeline(
    "audio-classification",
    "Xenova/wav2vec2-large-xlsr-53-gender-recognition-librispeech"
  );
  console.log("created classifier", classifier);
};

registerModel(
  "gender",
  () => {
    if (!classifier) {
      createClassifier();
    }
  },
  () => {},
  async (microphoneRecordingAudio, mediaResultsElement) => {
    if (!classifier) {
      console.error("classifier not created yet");
      return;
    }
    if (isRunning) {
      return;
    }
    isRunning = true;
    const output = await classifier(microphoneRecordingAudio.src);
    isRunning = false;

    console.log("output", output);
    let maxLabel, maxScore;
    output.forEach(({ label, score }) => {
      maxLabel ??= label;
      maxScore ??= score;
      if (score > maxScore) {
        maxScore = score;
        maxLabel = label;
      }
    });
    mediaResultsElement.innerText = `${maxLabel}: ${maxScore.toFixed(3)}`;
  }
);

const sampleOutput = [
  { label: "male", score: 0.9976564049720764 },
  { label: "female", score: 0.002343568252399564 },
];
