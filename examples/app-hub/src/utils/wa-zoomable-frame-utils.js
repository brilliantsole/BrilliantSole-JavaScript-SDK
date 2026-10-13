const promise = new Promise((resolve) => {
  const intervalId = setInterval(() => {
    if (window.BW) {
      clearInterval(intervalId);
      resolve();
    }
  }, 100);
});
await promise;

const onWaZoomableFrame = (el) => {
  // console.log("onWaZoomableFrame", el);
  BW.WindowManagerServer.addIframe(el);
};
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;

      if (node.matches("wa-zoomable-frame")) {
        // console.log("Found wa-zoomable-frame:", node);
        onWaZoomableFrame(node);
      }

      for (const el of node.querySelectorAll?.("wa-zoomable-frame") ?? []) {
        // console.log("Found wa-zoomable-frame:", el);
        onWaZoomableFrame(el);
      }
    }
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

document.querySelectorAll("wa-zoomable-frame").forEach((el) => {
  onWaZoomableFrame(el);
});
