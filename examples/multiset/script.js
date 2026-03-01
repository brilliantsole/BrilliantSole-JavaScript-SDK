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
