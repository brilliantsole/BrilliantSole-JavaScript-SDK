/**
 * @param {string} key
 * @param {() => (any)} getValue
 * @param {(any) => void} onValue
 */
const setupLocalStorage = (key, getValue, onValue) => {
  let originalValueString;
  const load = () => {
    const valueString = localStorage.getItem(key);
    originalValueString = valueString;
    console.log({ valueString });
    if (!valueString) {
      return;
    }
    try {
      const value = JSON.parse(valueString);
      onValue(value);
    } catch (error) {
      console.error(`failed to parse ${key} value ${valueString}`, error);
    }
  };
  const save = () => {
    const string = JSON.stringify(getValue());
    console.log({ string, originalValueString });
    if (string == originalValueString) {
      return;
    }
    localStorage.setItem(key, string);
  };
  window.addEventListener("pagehide", (event) => {
    event.preventDefault();
    try {
      save();
    } catch (error) {
      console.error(error);
      event.preventDefault();
    }
  });
  load();

  const clear = () => {
    localStorage.removeItem(key);
    onValue();
  };
  const download = () => {
    const value = getValue();
    const json = JSON.stringify(value, null, 2); // pretty format
    const blob = new Blob([json], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "download";

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  /** @param {File} file */
  const upload = async (file) => {
    try {
      const text = await file.text();
      const _value = JSON.parse(text);
      const value = getValue();
      if (Array.isArray(value) && Array.isArray(_value)) {
        onValue([...value, ..._value]);
      } else {
        onValue(_value);
      }
    } catch (error) {
      console.error("failed to upload file", error);
    }
  };

  return { clear, download, upload };
};

export { setupLocalStorage };
