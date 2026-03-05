console.log(document.currentScript);
Object.entries(document.currentScript.dataset)
  .filter(([key, value]) => key.startsWith("navigator"))
  .forEach(([key, value]) => {
    const index = key.search(/[A-Z]/);
    const remainder = key.slice(index);
    const property = remainder.charAt(0).toLowerCase() + remainder.slice(1);
    //console.log({ key, property, value });
    Object.defineProperty(navigator, property, {
      get: function () {
        //console.log({ key, value });
        return value;
      },
    });
  });
