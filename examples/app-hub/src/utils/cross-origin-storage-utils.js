// https://github.com/WICG/cross-origin-storage#appendixb-blob-hash-with-the-web-crypto-api
export async function getBlobHash(blobOrUrl) {
  let blob;
  console.log("getBlobHash", { blobOrUrl });
  if (typeof blobOrUrl == "string") {
    blob = await fetch(blobOrUrl).then((response) => response.blob());
  } else {
    blob = blobOrUrl;
  }
  console.log("blob", blob);
  const hashAlgorithmIdentifier = "SHA-256";

  // Get the contents of the blob as binary data contained in an ArrayBuffer.
  const arrayBuffer = await blob.arrayBuffer();

  // Hash the arrayBuffer using SHA-256.
  const hashBuffer = await crypto.subtle.digest(
    hashAlgorithmIdentifier,
    arrayBuffer,
  );

  // Convert the ArrayBuffer to a hex string.
  const hashBytes = new Uint8Array(hashBuffer);
  const hashArray = Array.from(hashBytes);
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const hashBase64 = btoa(String.fromCharCode(...hashBytes));

  const result = {
    algorithm: hashAlgorithmIdentifier,
    value: hashHex,
    hashBase64,
  };
  console.log("result", result);
  return result;
}

// Example usage:
// const fileBlob = await fetch("./src/brilliantwear/brilliantwear.min.js").then(
//   (response) => response.blob(),
// );
// getBlobHash(fileBlob).then((hash) => {
//   console.log("Hash:", hash);
// });

export async function waitForWindowValue(value) {
  if (window[value]) {
    return;
  }
  // console.log("waitForWindowValue", { value });
  return new Promise((resolve) => {
    window.addEventListener(
      `${value}-loaded`,
      (event) => resolve(event.detail),
      { once: true },
    );
  });
}

export async function waitForGlobals() {
  if (!globalThis.URLPattern) {
    await import("https://cdn.jsdelivr.net/npm/urlpattern-polyfill@10.1.0/+esm");
  }

  const values = await Promise.all([
    waitForWindowValue("lit"),
    waitForWindowValue("litRouter"),
    waitForWindowValue("litContext"),
    waitForWindowValue("litKeyed"),
    waitForWindowValue("litRef"),
    waitForWindowValue("litRepeat"),
    waitForWindowValue("litSignals"),
    waitForWindowValue("BW"),
  ]);
  // console.log("values", values);

  /** @type {import("lit")} */
  const lit = window.lit;
  /** @type {import("lit/directives/keyed.js")} */
  const litKeyed = window.litKeyed;
  /** @type {import("lit/directives/style-map.js")} */
  const litStyleMap = window.litStyleMap;
  /** @type {import("lit/directives/ref.js")} */
  const litRef = window.litRef;
  /** @type {import("@lit-labs/router")} */
  const litRouter = window.litRouter;
  /** @type {import("@lit-labs/signals")} */
  const litSignals = window.litSignals;
  /** @type {import("@lit/context")} */
  const litContext = window.litContext;
  /** @type {import("lit/directives/repeat.js")} */
  const litRepeat = window.litRepeat;
  /** @type {import("../brilliantwear/brilliantwear.module.min.js")} */
  /** @type {import("../../../../build/brilliantwear.module.min.js")} */
  const BW = window.BW;

  // console.log({ lit, litRouter,litContext, BW });
  return {
    lit,
    litRouter,
    litContext,
    BW,
    litKeyed,
    litRef,
    litRepeat,
    litStyleMap,
    litSignals,
  };
}
