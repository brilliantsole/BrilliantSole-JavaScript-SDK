/** @type {"__BRILLIANTSOLE__DEV__" | "__BRILLIANTSOLE__PROD__"} */
const __BRILLIANTSOLE__ENVIRONMENT__ = "__BRILLIANTSOLE__DEV__";

const isInProduction = __BRILLIANTSOLE__ENVIRONMENT__ == "__BRILLIANTSOLE__PROD__";
const isInDev = __BRILLIANTSOLE__ENVIRONMENT__ == "__BRILLIANTSOLE__DEV__";

// https://github.com/flexdinesh/browser-or-node/blob/master/src/index.ts
const isInBrowser = typeof window !== "undefined" && window?.document !== "undefined";
const isInNode = typeof process !== "undefined" && process?.versions?.node != null;

const isInBluefy = isInBrowser && navigator.userAgent.includes("Bluefy");
const isInWebBLE = isInBrowser && navigator.userAgent.includes("WebBLE");

const isAndroid = isInBrowser && navigator.userAgent.includes("Android");

export { isInDev, isInProduction, isInBrowser, isInNode, isAndroid, isInBluefy, isInWebBLE };
