/** @type {HTMLAudioElement} */
const microphoneRecordingAudio = document.getElementById("microphoneRecording");

/** @type {HTMLAudioElement} */
const microphoneStreamAudio = document.getElementById("microphoneStream");

const modelResultsElement = document.getElementById("modelResults");

/** @type {HTMLSelectElement} */
const modelTypeSelect = document.getElementById("modelType");
/** @type {HTMLOptGroupElement} */
const modelTypeOptgroup = modelTypeSelect.querySelector("optgroup");

const modelTypeSelectedCallbacks = {};
const modelTypeDeselectedCallbacks = {};

let modelType = modelTypeSelect.value;
modelTypeSelect.addEventListener("input", () => {
  modelTypeDeselectedCallbacks[modelType]?.();
  modelType = modelTypeSelect.value;
  console.log({ modelType });
  modelTypeSelectedCallbacks[modelType]?.(
    microphoneStreamAudio,
    modelResultsElement
  );
});

const audioCallbacks = {};
microphoneRecordingAudio.addEventListener("loadeddata", () => {
  modelResultsElement.innerHTML = "";
  audioCallbacks[modelType]?.(microphoneRecordingAudio, modelResultsElement);
});

/**
 * @param {string} name
 * @param {(microphoneStreamAudio: HTMLAudioElement, modelResultsElement: HTMLElement) => void} onSelect
 * @param {() => void} onDeselect
 * @param {(microphoneRecordingAudio: HTMLAudioElement, modelResultsElement: HTMLElement) => void} onAudio
 */
export function registerModel(name, onSelect, onDeselect, onAudio) {
  modelTypeOptgroup.appendChild(new Option(name));
  modelTypeSelectedCallbacks[name] = onSelect;
  modelTypeDeselectedCallbacks[name] = onDeselect;
  audioCallbacks[name] = onAudio;
}
