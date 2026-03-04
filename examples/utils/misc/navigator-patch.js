Object.entries(window.navigatorPatch ?? {}).forEach(([key, value]) => {
  Object.defineProperty(navigator, key, {
    get: function () {
      //console.log({ key, value });
      return value;
    },
  });
});
