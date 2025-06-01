import {
  AutoTokenizer,
  AutoProcessor,
  WhisperForConditionalGeneration,
  TextStreamer,
  full,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.2.4";

import { registerModel } from "./utils.js";

const WHISPER_SAMPLING_RATE = 16_000;
const MAX_AUDIO_LENGTH = 30; // seconds
const MAX_SAMPLES = WHISPER_SAMPLING_RATE * MAX_AUDIO_LENGTH;
const MAX_NEW_TOKENS = 64;

/** @type {HTMLAudioElement} */
let _microphoneStreamAudio;
/** @type {MediaStream} */
let stream;

/** @type {MediaRecorder} */
let mediaRecorder;

let model_id = null;
let tokenizer = null;
let processor = null;
let model = null;
let loadedModel = false;
let isProcessing = false;
let chunks = [];
let isRunning = false;

const progress_callback = (progress) => {
  //console.log("progress_callback", progress);
};

const loadModel = async () => {
  console.log("creating model");
  model_id = "onnx-community/whisper-base";

  tokenizer = await AutoTokenizer.from_pretrained(model_id, {
    progress_callback,
  });
  processor = await AutoProcessor.from_pretrained(model_id, {
    progress_callback,
  });

  model = await WhisperForConditionalGeneration.from_pretrained(model_id, {
    dtype: {
      encoder_model: "fp32", // 'fp16' works too
      decoder_model_merged: "q4", // or 'fp32' ('fp16' is broken)
    },
    device: "webgpu",
    progress_callback,
  });

  console.log(model);

  await model.generate({
    input_features: full([1, 80, 3000], 0.0),
    max_new_tokens: 1,
  });
  loadedModel = true;
  console.log("created model", model);
};

registerModel(
  "whisper realtime",
  async (microphoneStreamAudio, modelResultsElement) => {
    if (!loadedModel) {
      await loadModel();
    }
    if (!_microphoneStreamAudio) {
      _microphoneStreamAudio = microphoneStreamAudio;
      stream = _microphoneStreamAudio.srcObject;
      console.log({ stream });
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        // console.log("ondataavailable", e);
        if (e.data.size > 0) {
          chunks = [...chunks, e.data];

          if (chunks.length > 0) {
            // Generate from data
            const blob = new Blob(chunks, { type: "wav" });

            const fileReader = new FileReader();

            fileReader.onloadend = async () => {
              const arrayBuffer = fileReader.result;
              const decoded = await audioContext.decodeAudioData(arrayBuffer);
              let audio = decoded.getChannelData(0);
              if (audio.length > MAX_SAMPLES) {
                // Get last MAX_SAMPLES
                audio = audio.slice(-MAX_SAMPLES);
              }

              if (isProcessing) return;
              isProcessing = true;

              let startTime;
              let numTokens = 0;
              const callback_function = (output) => {
                startTime ??= performance.now();

                let tps;
                if (numTokens++ > 0) {
                  tps = (numTokens / (performance.now() - startTime)) * 1000;
                }
                //console.log({ output, tps, numTokens });
              };

              const streamer = new TextStreamer(tokenizer, {
                skip_prompt: true,
                skip_special_tokens: true,
                callback_function,
              });

              const inputs = await processor(audio);

              const outputs = await model.generate({
                ...inputs,
                max_new_tokens: MAX_NEW_TOKENS,
                language: "en",
                streamer,
              });

              const outputText = tokenizer.batch_decode(outputs, {
                skip_special_tokens: true,
              });

              console.log("outputText", outputText);

              modelResultsElement.innerText = outputText;

              isProcessing = false;
            };
            fileReader.readAsArrayBuffer(blob);
          } else {
            mediaRecorder.requestData();
          }
        } else {
          // Empty chunk received, so we request new data after a short timeout
          setTimeout(() => {
            mediaRecorder.requestData();
          }, 25);
        }
      };
      mediaRecorder.onstart = () => {
        isRunning = true;
        console.log({ isRunning });
        chunks = [];
      };
      mediaRecorder.onstop = () => {
        isRunning = false;
        console.log({ isRunning });
      };
      console.log("starting mediaRecorder", mediaRecorder);
    }
    mediaRecorder.start(500);
  },
  () => {
    mediaRecorder.stop();
  },
  async (microphoneRecordingAudio, mediaResultsElement) => {}
);
