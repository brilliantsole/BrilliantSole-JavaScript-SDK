/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas[data-depth-estimator]");
const context = canvas.getContext("2d");

/** @type {HTMLImageElement} */
const image = document.querySelector("img[data-depth-estimator]");

/**
 *  @typedef {{
 *    closestDepth: number;
 *}} DepthAnything3Result
 */
/** @typedef {{depthAnything3Result:DepthAnything3Result}} DepthAnything3ResultEventDetail */

/** @type {WebSocket} */
let ws;
const connectToWs = () => {
  // console.log("connectToWs");
  ws = new WebSocket("ws://localhost:8765");
  ws.binaryType = "arraybuffer";
  ws.addEventListener("open", (event) => {
    console.log("ws.open");
  });
  ws.addEventListener("close", (event) => {
    console.log("ws.close");
    setTimeout(() => {
      connectToWs();
    }, 2000);
  });
  ws.addEventListener("error", (event) => {
    console.log("ws.error", event);
  });
  ws.addEventListener("message", async (event) => {
    console.log("ws.message", event);

    const data = event.data;
    const view = new DataView(data);

    // -----------------------
    // parse header
    // -----------------------
    const closestDepth = view.getFloat32(0, true);
    // console.log({ closestDepth });

    const size = view.getUint32(4, true);

    // -----------------------
    // extract JPEG
    // -----------------------
    const jpgBytes = new Uint8Array(data, 8, size);

    const blob = new Blob([jpgBytes], { type: "image/jpeg" });
    const bitmap = await createImageBitmap(blob);
    const { width, height } = bitmap;
    canvas.width = width;
    canvas.height = height;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    /** @type {DepthAnything3Result} */
    const depthAnything3Result = { closestDepth };
    window.dispatchEvent(
      new CustomEvent("depthanything3result", {
        detail: { depthAnything3Result },
      }),
    );

    isBusy = false;
    if (waitUntilDone) {
      waitUntilDone = false;
      estimateDepth();
    }
  });
  return ws;
};
connectToWs();

const isWsConnected = () => {
  return ws.readyState == ws.OPEN;
};

let isBusy = false;
let waitUntilDone = false;
let estimateDepth = async () => {
  if (!isWsConnected()) {
    return;
  }
  if (isBusy) {
    waitUntilDone = true;
    return;
  }
  isBusy = true;
  console.log("sending image to server...");
  const response = await fetch(image.src);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  ws.send(arrayBuffer);
};

image.addEventListener("load", () => {
  estimateDepth();
});

export default {};
