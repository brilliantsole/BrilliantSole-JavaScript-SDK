{
  const parseCamelCase = (string) => {
    return string.split(/(?=[A-Z])/).map((s) => s.toLowerCase());
  };
  const splitCamelCase = (string) => {
    const index = string.search(/[A-Z]/);
    const remainder = string.slice(index);
    return remainder.charAt(0).toLowerCase() + remainder.slice(1);
  };
  // console.log(document.currentScript);
  ["navigator", "screen"].forEach((windowProperty) => {
    Object.entries(document.currentScript.dataset).forEach(([key, value]) => {
      const property = key.startsWith(windowProperty)
        ? splitCamelCase(key)
        : "";
      // console.log({ key, property, value });
      Object.defineProperty(
        property ? window[windowProperty] : window,
        property ? property : key,
        {
          get: function () {
            if (key != "navigatorUserAgent") {
              //console.log({ key, value });
            }
            return isNaN(value) ? value : +value;
          },
        }
      );
    });
  });
}
