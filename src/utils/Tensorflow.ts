/** NODE_START */ import * as tf from "@tensorflow/tfjs"; /** NODE_END */

import { isInBrowser } from "./environment.ts";

function isTensorFlowAvailable() {
  if (isInBrowser) {
    // @ts-expect-error
    return Boolean(window.tf);
  }
  return Boolean(tf);
}

export { isTensorFlowAvailable };
