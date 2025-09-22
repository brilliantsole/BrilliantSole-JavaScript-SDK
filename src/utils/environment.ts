type ENVIRONMENT_FLAG = "__BRILLIANTSOLE__DEV__" | "__BRILLIANTSOLE__PROD__";
const __BRILLIANTSOLE__ENVIRONMENT__: ENVIRONMENT_FLAG =
  "__BRILLIANTSOLE__DEV__";

//@ts-expect-error
const isInProduction =
  __BRILLIANTSOLE__ENVIRONMENT__ == "__BRILLIANTSOLE__PROD__";
const isInDev = __BRILLIANTSOLE__ENVIRONMENT__ == "__BRILLIANTSOLE__DEV__";

// https://github.com/flexdinesh/browser-or-node/blob/master/src/index.ts
const isInBrowser =
  typeof window !== "undefined" && typeof window?.document !== "undefined";
const isInNode =
  typeof process !== "undefined" && process?.versions?.node != null;

const userAgent = (isInBrowser && navigator.userAgent) || "";

let isBluetoothSupported = false;
if (isInBrowser) {
  isBluetoothSupported = Boolean(navigator.bluetooth);
} else if (isInNode) {
  isBluetoothSupported = true;
}

const isInBluefy = isInBrowser && /Bluefy/i.test(userAgent);
const isInWebBLE = isInBrowser && /WebBLE/i.test(userAgent);

const isAndroid = isInBrowser && /Android/i.test(userAgent);
const isSafari =
  isInBrowser && /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);

const isIOS = isInBrowser && /iPad|iPhone|iPod/i.test(userAgent);
const isMac = isInBrowser && /Macintosh/i.test(userAgent);

// @ts-expect-error
const isInLensStudio =
  !isInBrowser &&
  !isInNode &&
  typeof global !== "undefined" &&
  typeof Studio !== "undefined";

export {
  isInDev,
  isInProduction,
  isInBrowser,
  isInNode,
  isAndroid,
  isInBluefy,
  isInWebBLE,
  isSafari,
  isInLensStudio,
  isIOS,
  isMac,
  isBluetoothSupported,
};
