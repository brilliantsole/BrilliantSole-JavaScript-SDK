const _DeviceMotionEvent_requestPermission =
  DeviceMotionEvent.requestPermission;
Object.defineProperty(DeviceMotionEvent, "requestPermission", {
  get: function () {
    // console.log("DeviceMotionEvent.requestPermission");
    return (
      window.DeviceMotionEvent_requestPermission ??
      _DeviceMotionEvent_requestPermission
    );
  },
});

const _DeviceOrientationEvent_requestPermission =
  DeviceOrientationEvent.requestPermission;
Object.defineProperty(DeviceOrientationEvent, "requestPermission", {
  get: function () {
    // console.log("DeviceOrientationEvent.requestPermission");
    return (
      window.DeviceOrientationEvent_requestPermission ??
      _DeviceOrientationEvent_requestPermission
    );
  },
});
