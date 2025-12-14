import { registerModel } from "./utils.js";

let barcodeDetector;
let drawBarcode = false;

registerModel(
  "barcode detector",
  () => {
    if (!barcodeDetector) {
      BarcodeDetector.getSupportedFormats().then((supportedFormats) => {
        console.log({ supportedFormats });
        // create new detector
        barcodeDetector = new BarcodeDetector({
          formats: supportedFormats,
        });
        console.log("barcodeDetector", barcodeDetector);
      });
    }
  },
  async (image, canvas, context, modelResultsElement) => {
    if (!barcodeDetector) {
      console.log("barcodeDetector not created");
      return;
    }

    const barcodes = await barcodeDetector.detect(image);

    console.log("barcodes", barcodes);

    const barcode = barcodes[0];
    if (barcode) {
      //const { boundingBox, cornerPoints, rawValue, format } = sampleBarcodes[0];
      const { boundingBox, cornerPoints, rawValue, format } = barcode;

      modelResultsElement.innerText = `${format}: ${rawValue}`;

      const { x, y, width, height, top, right, bottom, left } = boundingBox;

      const _x = (x / image.naturalWidth) * canvas.width;
      const _y = (y / image.naturalHeight) * canvas.height;

      const _width = (width / image.naturalWidth) * canvas.width;
      const _height = (height / image.naturalHeight) * canvas.height;

      if (drawBarcode) {
        context.fillStyle = "rgba(0, 191, 255, 0.4)";
        context.fillRect(_x, _y, _width, _height);

        context.strokeStyle = "white";
        context.lineWidth = 2;
        context.strokeRect(_x, _y, _width, _height);
      }

      context.beginPath();
      cornerPoints.forEach((cornerPoint, index) => {
        const { x, y } = cornerPoint;

        const _x = (x / image.naturalWidth) * canvas.width;
        const _y = (y / image.naturalHeight) * canvas.height;

        if (drawBarcode) {
          if (index == 0) {
            context.moveTo(_x, _y);
          } else {
            context.lineTo(_x, _y);
          }
        }
      });

      context.closePath();
      context.fillStyle = "rgba(0, 191, 255, 0.4)";
      context.fill();
    }
  }
);

const sampleBarcodes = [
  {
    boundingBox: {
      x: 155.0115203857422,
      y: 288.3844299316406,
      width: 301.869873046875,
      height: 298.4500427246094,
      top: 288.3844299316406,
      right: 456.8813934326172,
      bottom: 586.83447265625,
      left: 155.0115203857422,
    },
    cornerPoints: [
      {
        x: 384.11309814453125,
        y: 288.3844299316406,
      },
      {
        x: 456.8813781738281,
        y: 512.93701171875,
      },
      {
        x: 213.1260986328125,
        y: 586.83447265625,
      },
      {
        x: 155.0115203857422,
        y: 341.5698547363281,
      },
    ],
    format: "qr_code",
    rawValue: "http://en.m.wikipedia.org",
  },
];
