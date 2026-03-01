import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;

const device = new BS.Device();
window.device = device;

// CONNECTION START
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () =>
  device.toggleConnection()
);
device.addEventListener("connectionStatus", () => {
  let disabled = false;
  let innerText = device.connectionStatus;
  switch (device.connectionStatus) {
    case "notConnected":
      innerText = "connect";
      break;
    case "connected":
      innerText = "disconnect";
      break;
  }
  toggleConnectionButton.disabled = disabled;
  toggleConnectionButton.innerText = innerText;
});
// CONNECTION END

// MULTISET CREDENTIALS START
const multiSetCredentials = {
  clientSecret: "",
  clientSecretLength: 64,

  clientId: "",
  clientIdLength: 36,
};
window.multiSetCredentials = multiSetCredentials;

const setupMultiSetCredentialsInput = (name) => {
  const length = multiSetCredentials[`${name}Length`];
  const input = document.querySelector(`[data-multiset-credential="${name}"]`);
  //console.log(name, input);
  multiSetCredentials[`${name}Input`] = input;
  const setValue = (value, didLoad) => {
    value = value.trim();
    const isValidLength = value.length == length;
    if (isValidLength) {
      //console.log({ [name]: value });
      multiSetCredentials[name] = value;
      input.value = value;
      if (!didLoad) {
        saveToLocalStorage();
      }
    } else {
      //console.log("invalid length", { value, name, length });
    }
  };
  input.addEventListener("input", (event) => {
    const value = event.target.value;
    setValue(value);
  });
  const localStorageKey = ["multiset", name].join(".");
  const saveToLocalStorage = () => {
    //console.log("saveToLocalStorage", { name, localStorageKey });
    localStorage.setItem(localStorageKey, multiSetCredentials[name]);
  };
  const loadFromLocalStorage = () => {
    //console.log("loadFromLocalStorage", { name, localStorageKey });
    const value = localStorage.getItem(localStorageKey);
    if (!value) {
      return;
    }
    setValue(value, true);
  };
  loadFromLocalStorage();
};
setupMultiSetCredentialsInput("clientId");
setupMultiSetCredentialsInput("clientSecret");
// MULTISET CREDENTIALS END

// MULTISET START
const multiSetApiBaseEndpoint = "https://api.multiset.ai/v1/";

const generateMultiSetToken = async () => {
  const { clientId, clientSecret } = multiSetCredentials;
  const authorization = "Basic " + btoa(`${clientId}:${clientSecret}`);
  const path = multiSetApiBaseEndpoint + "m2m/token";
  console.log({ authorization, path });

  const response = await fetch(path, {
    method: "POST",
    headers: {
      Authorization: authorization,
      Username: clientId,
      Password: clientSecret,
      "Content-Type": "text/plain",
    },
  });

  const json = await response.json();
  console.log("json", json);
};
window.generateMultiSetToken = generateMultiSetToken;
// FILL
// MULTISET END

// CAMERA START
// FILL
// CAMERA END

// A-FRAME START
// FILL
// A-FRAME END
