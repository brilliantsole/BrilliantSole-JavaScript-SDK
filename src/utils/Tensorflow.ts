/** NODE_START */ import * as tf from "@tensorflow/tfjs"; /** NODE_END */

import { isInBrowser } from "./environment.ts";

function isTensorFlowAvailable() {
  if (isInBrowser) {
    // @ts-expect-error
    return Boolean(window.tf);
  }
  return Boolean(tf);
}

async function listTensorflowModels() {
  if (isTensorFlowAvailable()) {
    return {};
  }
  const models = await tf.io.listModels();
  return models;
}

async function getTensorFlowModel(url: string) {
  const models = await listTensorflowModels();
  const model = models[url];
  if (model) {
    return model;
  }
}

async function isTensorFlowModelAvailable(url: string) {
  const model = await getTensorFlowModel(url);
  return Boolean(model);
}

export {
  isTensorFlowAvailable,
  listTensorflowModels,
  getTensorFlowModel,
  isTensorFlowModelAvailable,
};
