import {
  AutoModel,
  AutoProcessor,
  RawImage,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2";

import {
  drawBox,
  drawColorImage,
  drawGreyscaleImage,
  registerModel,
} from "./utils.js";

let model = undefined;
let processor = undefined;
let isRunning = false;

const createProcessor = async () => {
  console.log("creating model...");
  // Load model
  model = await AutoModel.from_pretrained("Xenova/yolov9-c", {
    // quantized: true,    // (Optional) Use unquantized version.
  });
  console.log("created model", model);

  // Load processor
  processor = await AutoProcessor.from_pretrained("Xenova/yolov9-c");
  processor.feature_extractor.do_resize = true; // (Optional) Disable resizing
  processor.feature_extractor.size = { width: 128, height: 128 }; // (Optional) Update resize value

  console.log("created processor", processor);
};

registerModel(
  "yolo",
  () => {
    if (!processor) {
      createProcessor();
    }
  },
  async (
    image,
    canvas,
    context,
    mediaResultsElement,
    generatedImageCanvas,
    generatedImageContext
  ) => {
    if (!processor) {
      console.error("processor not created yet");
      return;
    }
    if (isRunning) {
      return;
    }
    isRunning = true;

    try {
      console.log("running processor...");

      const rawImage = await RawImage.read(image.src);
      const { pixel_values } = await processor(rawImage);

      // Run object detection
      const { outputs } = await model({ images: pixel_values });
      const predictions = outputs.tolist();

      console.log("predictions", predictions);

      let labelsObject = [];
      for (const [xmin, ymin, xmax, ymax, score, id] of predictions) {
        let originX = xmin;
        let originY = ymin;
        let width = xmax - xmin;
        let height = ymax - ymin;
        if (processor.feature_extractor.do_resize) {
          const { width: _width, height: _height } =
            processor.feature_extractor.size;

          originX = (originX / _width) * image.naturalWidth;
          originY = (originY / _height) * image.naturalHeight;

          width = (width / _width) * image.naturalWidth;
          height = (height / _height) * image.naturalHeight;
        }
        drawBox(
          {
            originX,
            originY,
            width,
            height,
          },
          image,
          canvas,
          context
        );

        const label = model.config.id2label[id];

        // const bbox = [xmin, ymin, xmax, ymax]
        //   .map((x) => x.toFixed(2))
        //   .join(", ");
        // console.log(
        //   `Found "${
        //     model.config.id2label[id]
        //   }" at [${bbox}] with score ${score.toFixed(2)}.`
        // );

        labelsObject.push({ label, score: score.toFixed(2) });
      }

      mediaResultsElement.textContent = JSON.stringify(labelsObject, null, 2);
    } catch (error) {
      console.error("error running processor", error);
    } finally {
      isRunning = false;
    }
  }
);
