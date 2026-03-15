const _getUserMedia = navigator.mediaDevices.getUserMedia.bind(
  navigator.mediaDevices
);

Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
  get: function () {
    return window.getUserMedia ?? _getUserMedia;
  },
});
