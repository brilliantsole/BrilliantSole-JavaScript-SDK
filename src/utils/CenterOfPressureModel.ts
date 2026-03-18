import { createConsole } from "./Console.ts";

/** NODE_START */ import * as tf from "@tensorflow/tfjs"; /** NODE_END */
import { isTensorFlowAvailable } from "./Tensorflow.ts";

import { Euler, PressureData } from "../BS.ts";
import { clamp } from "./MathUtils.ts";
import { PressureSensorEventDispatcher } from "../sensor/PressureSensorDataManager.ts";
import autoBind from "auto-bind";

const _console = createConsole("CenterOfPressureModel", { log: true });

export type CenterOfPressureModelData = {
  inputs: number[][];
  outputs: number[][];
};

export type CenterOfPressureModelDataHeatmap = {};

class CenterOfPressureModel {
  constructor() {
    autoBind(this);
  }

  eventDispatcher!: PressureSensorEventDispatcher;
  get dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }

  #model?: tf.Sequential;
  get model() {
    return this.#model;
  }

  #hiddenUnitScalars = [4, 2];
  #numberOfSensors = 0;
  get numberOfSensors() {
    return this.#numberOfSensors;
  }
  set numberOfSensors(newNumberOfSensors) {
    if (this.#numberOfSensors == newNumberOfSensors) {
      return;
    }
    this.#numberOfSensors = newNumberOfSensors;
    _console.log({ numberOfSensors: this.numberOfSensors });

    this.#createModel();
  }

  async #createModel() {
    if (!isTensorFlowAvailable()) {
      _console.warn("tensorflow is not available");
      return;
    }
    if (this.#model) {
      _console.log("disposing model", this.#model);
      this.#model.dispose();
      this.#data.inputs.length = this.#data.outputs.length = 0;
      this.#model = undefined;
      this.#isTrained;
    }
    if (this.numberOfSensors == 0) {
      _console.log("zero numberOfSensors - no model needed");
      return;
    }
    await tf.ready();
    const model = tf.sequential();
    model.name = "centerOfPressure";
    this.#hiddenUnitScalars.forEach((hiddenUnitScalar, index) => {
      const isFirst = index == 0;
      // first layer is sensor inputs, fully connected second layer
      model.add(
        tf.layers.dense({
          units: Math.round(this.numberOfSensors * hiddenUnitScalar),
          activation: "relu",
          inputShape: isFirst ? [this.numberOfSensors] : undefined,
        })
      );
    });

    model.add(tf.layers.dense({ units: 2 })); // output (x, y)
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "meanSquaredError",
    });

    this.#model = model;
    _console.log("created model", this.#model);
  }

  #maxDataLength = 1000;
  #data: CenterOfPressureModelData = { inputs: [], outputs: [] };
  get data() {
    return this.#data;
  }

  clearData() {
    _console.log("clearData");
    this.#data.outputs.length = 0;
    this.#data.inputs.length = 0;
    this.#dispatchRecordingProgress();
  }
  #dispatchRecordingProgress() {
    this.dispatchEvent("pressureCalibrationDataRecordingProgress", {
      numberOfSamples: this.numberOfSamples,
      data: this.data,
    });
  }
  #getInputs(pressureData: PressureData) {
    return pressureData.sensors.map((sensor) => sensor.truncatedScaledValue);
  }
  #getOutputs(euler: Euler) {
    return [-euler.roll, -euler.pitch];
  }
  onSensorData(pressureData: PressureData, euler: Euler) {
    this.addData(this.#getInputs(pressureData), this.#getOutputs(euler));
  }
  get numberOfSamples() {
    return this.#data.inputs.length;
  }
  #areDataInputsRedundant(inputs: number[]) {
    return false;
  }
  #dataOutputsThreshold = 0.005;
  #areDataOutputsRedundant(outputs: number[]) {
    if (this.#data.outputs.length == 0) {
      return false;
    }
    return this.#data.outputs.some((_outputs) => {
      const differences = outputs.map(
        (value, index) => value - _outputs[index]
      );
      let differencesSquareSum = 0;
      differences.forEach((difference) => {
        differencesSquareSum += difference ** 2;
      });
      const isRedundant = differencesSquareSum < this.#dataOutputsThreshold;
      return isRedundant;
    });
  }
  #isDataRedundant(inputs: number[], outputs: number[]) {
    const areDataInputsRedundant = this.#areDataInputsRedundant(inputs);
    const areDataOutputsRedundant = this.#areDataOutputsRedundant(outputs);
    //_console.log({ areDataInputsRedundant, areDataOutputsRedundant });
    return areDataInputsRedundant || areDataOutputsRedundant;
  }
  addData(inputs: number[], outputs: number[]) {
    if (!isTensorFlowAvailable()) {
      return;
    }
    // _console.log("addData", inputs, outputs);
    if (this.#isDataRedundant(inputs, outputs)) {
      // _console.log("data is redundant");
      return;
    }
    this.#data.inputs.push(inputs);
    this.#data.outputs.push(outputs);

    while (this.numberOfSamples > this.#maxDataLength) {
      this.#data.inputs.shift();
      this.#data.outputs.shift();
    }
    _console.log({
      numberOfSamples: this.numberOfSamples,
    });
    this.#dispatchRecordingProgress();
  }
  #isTrained = false;
  get isTrained() {
    return this.#isTrained;
  }
  #isTraining = false;
  get isTraining() {
    return this.#isTraining;
  }
  async train() {
    if (!isTensorFlowAvailable()) {
      return;
    }
    if (!this.#model) {
      _console.error("no model defined");
      return;
    }
    if (this.isTraining) {
      _console.warn("already training");
      return;
    }
    await tf.nextFrame();
    const { inputs, outputs } = this.#data;
    if (inputs.length == 0) {
      _console.log("no data to train on");
      return;
    }
    _console.log("train");
    const xs = tf.tensor2d(inputs);
    const ys = tf.tidy(() => {
      const ys = tf.tensor2d(outputs);
      const minYs = ys.min();
      const maxYs = ys.max();
      return ys.sub(minYs).div(maxYs.sub(minYs));
    });

    const epochs = 32;
    const batchSize = 32;

    this.#isTrained = false;
    this.dispatchEvent("pressureCalibrationTrainStart", {
      epochs,
      batchSize,
    });
    this.#isTraining = true;
    try {
      await this.#model.fit(xs, ys, {
        epochs,
        batchSize,
        shuffle: true,

        callbacks: {
          onTrainBegin: (logs) => {
            _console.log("onTrainBegin", logs);
            //this.dispatchEvent("pressureCalibrationTrainStart", {});
          },
          onTrainEnd: (logs) => {
            _console.log("onTrainEnd", logs);
            // this.dispatchEvent("pressureCalibrationTrainEnd", {});
          },
          onEpochBegin: (epoch, logs) => {
            _console.log("onEpochBegin", { epoch }, logs);
          },
          onEpochEnd: (epoch, logs) => {
            const { loss } = logs!;
            _console.log("onEpochEnd", { epoch, loss }, logs);

            this.dispatchEvent("pressureCalibrationTrainProgress", {
              pressureCalibrationTrainProgress: (epoch + 1) / epochs,
              epoch,
              epochs,
              batchSize,
              loss,
            });
          },
          onBatchBegin: (batch, logs) => {
            _console.log("onBatchBegin", { batch }, logs);
          },
          onBatchEnd: (batch, logs) => {
            const { size, loss } = logs!;
            _console.log("onBatchEnd", { batch, size, loss }, logs);
          },
          onYield: (epoch, batch, logs) => {
            _console.log("onYield", { epoch, batch }, logs);
          },
        },
      });
    } catch (error) {
      _console.error("error training", error);
    }

    xs.dispose();
    ys.dispose();
    this.#isTraining = false;

    _console.log("finished training");
    this.#onTrainedModel();
  }
  #onTrainedModel(wasLoaded = false) {
    this.#isTrained = true;
    this.dispatchEvent("calibratedPressureModel", {
      model: this.#model!,
      wasLoaded,
    });
  }

  predict(pressureData: PressureData) {
    if (!isTensorFlowAvailable()) {
      return;
    }
    if (!this.#model) {
      _console.log("no model defined");
      return;
    }
    if (!this.#isTrained) {
      //_console.log("model hasn't been trained");
      return;
    }

    const inputs = this.#getInputs(pressureData);
    _console.log("predict", inputs);

    const input = tf.tensor2d([inputs]);
    const prediction = this.#model.predict(input) as tf.Tensor;
    const [x, y] = prediction.dataSync().map((value) => clamp(value, 0, 1));

    _console.log({ x, y });

    input.dispose();
    prediction.dispose();

    return { x, y };
  }

  async saveModel(
    handlerOrURL: tf.io.IOHandler | string,
    config?: tf.io.SaveConfig
  ) {
    if (!isTensorFlowAvailable()) {
      return false;
    }
    await tf.ready();
    if (!this.model) {
      _console.error("model not found");
      return false;
    }
    if (!this.isTrained) {
      _console.error("model not trained");
      return false;
    }
    try {
      await this.model.save(handlerOrURL, config);
    } catch (error) {
      _console.error("failed to save model", error);
      return false;
    }
    return true;
  }
  async loadModel(
    pathOrIOHandlerOrFileList: string | tf.io.IOHandler | FileList,
    options?: tf.io.LoadOptions
  ) {
    if (!isTensorFlowAvailable()) {
      return false;
    }
    await tf.ready();
    if (!this.model) {
      _console.error("model not found");
      return false;
    }
    let pathOrIOHandler: string | tf.io.IOHandler;
    if (pathOrIOHandlerOrFileList instanceof FileList) {
      const fileList = Array.from(pathOrIOHandlerOrFileList);
      const jsonFile = fileList.find((f) => f.name.endsWith(".json"));
      const weightsFile = fileList.find((f) => f.name.endsWith(".bin"));

      if (!jsonFile) {
        _console.error("no model.json found");
        return false;
      }
      if (!weightsFile) {
        _console.error("no weights.bin found");
        return false;
      }

      pathOrIOHandler = tf.io.browserFiles([jsonFile, weightsFile]);
    } else {
      pathOrIOHandler = pathOrIOHandlerOrFileList;
    }

    let loadedModel: tf.LayersModel | undefined;
    try {
      loadedModel = await tf.loadLayersModel(pathOrIOHandler, options);
      _console.log("loadedModel", loadedModel);

      if (this.model.layers.length != loadedModel.layers.length) {
        throw Error("layer count mismatch");
      }

      for (let i = 0; i < this.model.layers.length; i++) {
        const weights = this.model.layers[i].getWeights();
        const loadedWeights = loadedModel.layers[i].getWeights();

        if (weights.length != loadedWeights.length) {
          throw Error(
            `weight count mismatch in layer ${i} (${this.model.layers[i].name})`
          );
        }

        for (let j = 0; j < weights.length; j++) {
          const shapeA = weights[j].shape;
          const shapeB = loadedWeights[j].shape;
          if (!shapeA.every((v, idx) => v === shapeB[idx])) {
            throw Error(`weight shape mismatch in layer ${i} weight ${j}`);
          }
        }
      }

      this.model.setWeights(loadedModel.getWeights());

      _console.log("weights successfully loaded into model");
      this.#onTrainedModel(true);
    } catch (error) {
      _console.error("error loading model", error);
      loadedModel?.dispose();
      return false;
    } finally {
      loadedModel?.dispose();
    }
    return true;
  }
}

export default CenterOfPressureModel;
