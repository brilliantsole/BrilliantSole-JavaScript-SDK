import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.2.4";

import { registerModel } from "./utils.js";

let transcriber = undefined;
let isRunning = false;

const createTranscriber = async () => {
  console.log("creating transcriber");
  transcriber = await pipeline(
    "automatic-speech-recognition",
    "Xenova/whisper-tiny.en"
  );
  console.log("created transcriber", transcriber);
};

let chunks = [];
let _microphoneRecordingAudio;

const updateChunks = () => {
  const { currentTime } = _microphoneRecordingAudio;
  chunks.forEach(({ span, timestamp }) => {
    const [from, to] = timestamp;
    const isHighlighted = currentTime >= from && currentTime <= to;
    if (isHighlighted) {
      span.classList.add("highlighted");
    } else {
      span.classList.remove("highlighted");
    }
  });
};

registerModel(
  "whisper",
  () => {
    if (!transcriber) {
      createTranscriber();
    }
  },
  () => {},
  async (microphoneRecordingAudio, mediaResultsElement) => {
    if (!transcriber) {
      console.error("transcriber not created yet");
      return;
    }
    if (isRunning) {
      return;
    }
    isRunning = true;
    const transcriberResult = await transcriber(microphoneRecordingAudio.src, {
      return_timestamps: "word",
    });
    isRunning = false;

    console.log("transcriberResult", transcriberResult);
    chunks.length = 0;
    if (true) {
      if (!_microphoneRecordingAudio) {
        _microphoneRecordingAudio = microphoneRecordingAudio;
        microphoneRecordingAudio.addEventListener("timeupdate", () => {
          updateChunks();
        });

        let intervalId;

        microphoneRecordingAudio.addEventListener("playing", () => {
          intervalId = setInterval(() => {
            updateChunks();
          }, 100);
        });

        microphoneRecordingAudio.addEventListener("pause", () =>
          clearInterval(intervalId)
        );
        microphoneRecordingAudio.addEventListener("ended", () =>
          clearInterval(intervalId)
        );
        microphoneRecordingAudio.addEventListener("waiting", () =>
          clearInterval(intervalId)
        );
      }

      transcriberResult.chunks.forEach(({ text, timestamp }, index) => {
        const span = document.createElement("span");
        span.innerText = text;
        span.timestamp = timestamp;
        mediaResultsElement.appendChild(span);
        chunks.push({ span, text, timestamp });
      });
    } else {
      mediaResultsElement.innerText = transcriberResult.text;
    }
  }
);

const sampleResult = {
  text: " Testing 1, 2, 3, this is a test.",
  chunks: [
    {
      text: " Testing",
      timestamp: [0.28, 1.14],
    },
    {
      text: " 1,",
      timestamp: [1.14, 1.52],
    },
    {
      text: " 2,",
      timestamp: [1.78, 1.8],
    },
    {
      text: " 3,",
      timestamp: [1.86, 1.96],
    },
    {
      text: " this",
      timestamp: [2.02, 2.24],
    },
    {
      text: " is",
      timestamp: [2.24, 2.42],
    },
    {
      text: " a",
      timestamp: [2.42, 2.54],
    },
    {
      text: " test.",
      timestamp: [2.54, 3.02],
    },
  ],
};
