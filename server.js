import express from "express";
import https from "https";
import http from "http";
const app = express();
import fs from "fs";
import ip from "ip";
import * as BS from "./build/brilliantsole.node.module.js";
import { WebSocketServer } from "ws";
import * as dgram from "dgram";
import nocache from "nocache";
import bonjour from "bonjour";
import osc from "osc";

process.on("warning", (e) => console.warn(e.stack));

// BS.setAllConsoleLevelFlags({ log: true });
// BS.setConsoleLevelFlagsForType("EventDispatcher", { log: false });
// BS.setConsoleLevelFlagsForType("NobleScanner", { log: true });
// BS.setConsoleLevelFlagsForType("SensorConfigurationManager", { log: true });
// BS.setConsoleLevelFlagsForType("FileTransferManager", { log: true });
// BS.setConsoleLevelFlagsForType("BaseServer", { log: true });

// HTTPS SERVER
app.use(nocache());
app.use(function (req, res, next) {
  //res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  //res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  //res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // Add CORS headers
  res.header("Access-Control-Allow-Origin", "https://localhost"); // Adjust this to your allowed origin
  res.header("Access-Control-Allow-Origin", "http://bs.local"); // Adjust this to your allowed origin
  res.header("Access-Control-Allow-Origin", "https://bs.local"); // Adjust this to your allowed origin
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS"); // Allowed HTTP methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allowed headers
  res.setHeader("Access-Control-Allow-Credentials", "true"); // Allow cookies or other credentials if needed

  // Handle preflight requests (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // No Content
  }

  next();
});
app.use((req, res, next) => {
  const host = req.headers.host;
  if (false && host.endsWith(".local")) {
    return res.redirect(301, `https://${ip.address()}${req.url}`);
  }
  if (false && req.protocol !== "https") {
    return res.redirect(301, "https://" + req.headers.host + req.url); // Always redirect to HTTPS
  }
  next();
});
app.use(express.static("./"));
app.use(express.json());

let serverOptions;
if (true) {
  serverOptions = {
    key: fs.readFileSync("./sec/key.pem"),
    cert: fs.readFileSync("./sec/cert.pem"),
  };
} else {
  serverOptions = {
    key: fs.readFileSync("./sec/bs.local-key.pem"),
    cert: fs.readFileSync("./sec/bs.local.pem"),
  };
}

const httpServer = http.createServer(app);
httpServer.listen(80);
const httpsServer = https.createServer(serverOptions, app);
httpsServer.listen(443, () => {
  console.log(`server listening on https://${ip.address()}`);

  const bonjourService = bonjour();
  bonjourService.publish({
    name: "Brilliant Sole Server",
    type: "https",
    port: 443,
    host: "bs.local",
  });

  console.log("Advertised as bs.local");
});

// WEBSOCKET
const wss = new WebSocketServer({ server: httpsServer });
const webSocketServer = new BS.WebSocketServer();
webSocketServer.server = wss;

// UDP
const udpSocket = dgram.createSocket("udp4");
const udpServer = new BS.UDPServer();
udpServer.socket = udpSocket;
udpSocket.bind(3000);

// VRChat OSC

const vrChatSendPort = 9000;
const vrChatReceivePort = 9001;
let vrChatAddress = "192.168.4.162"; // replace with your vrchat device's ip

const vrChatOscServer = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: vrChatReceivePort,
  metadata: true,
});
vrChatOscServer.on("error", function (error) {
  //console.error(error);
});
vrChatOscServer.on("message", function (oscMsg, timeTag, info) {
  console.log("received vrchat message", oscMsg);
  const address = oscMsg.address.split("/").filter(Boolean);
  const { args } = oscMsg; // [...{type, value}]
  switch (address[0]) {
    // FILL
    default:
      console.log(`uncaught address ${address[0]}`);
      break;
  }
});
vrChatOscServer.open();

/** @typedef {{type: "getAddress"}} GetAddressVRChatMessage */
/** @typedef {{type: "setAddress", message: {address: string}}} SetAddressVRChatMessage */
/** @typedef {{type: "getLookHorizontal"}} GetLookHorizontalVRChatMessage */
/** @typedef {{type: "setLookHorizontal", message: {lookHorizontal: number}}} SetLookHorizontalVRChatMessage */
/** @typedef {{type: "get2DInput"}} Get2DInputVRChatMessage */
/** @typedef {{type: "set2DInput", message: {vertical?: number, horizontal?: number}}} Set2DInputVRChatMessage */
/** @typedef { GetAddressVRChatMessage | SetAddressVRChatMessage | GetLookHorizontalVRChatMessage | SetLookHorizontalVRChatMessage | Get2DInputVRChatMessage | Set2DInputVRChatMessage } VRChatMessage */

const vrChatControls = {
  vertical: 0,
  horizontal: 0,
  lookHorizontal: 0,
};
const setVRChat2DInput = (horizontal, vertical) => {
  // console.log("setVRChat2DInput", { horizontal, vertical });
  Object.assign(vrChatControls, { horizontal, vertical });
  vrChatOscServer.send(
    {
      timeTag: osc.timeTag(0),
      packets: [
        {
          address: "/input/Vertical",
          args: [
            {
              type: "f",
              value: vertical ?? 0,
            },
          ],
        },
        {
          address: "/input/Horizontal",
          args: [
            {
              type: "f",
              value: horizontal ?? 0,
            },
          ],
        },
      ],
    },
    vrChatAddress,
    vrChatSendPort,
  );
  if (horizontal != 0 || vertical != 0) {
    debouncedReset2DInput();
  }
};
const debouncedReset2DInput = BS.ThrottleUtils.debounce(() => {
  // console.log("debouncedReset2DInput");
  setVRChat2DInput(0, 0);
}, 200);
const setVRChatLookHorizontal = (lookHorizontal) => {
  Object.assign(vrChatControls, { lookHorizontal });
  // console.log("setVRChatLookHorizontal", { lookHorizontal });
  vrChatOscServer.send(
    {
      timeTag: osc.timeTag(0),
      packets: [
        {
          address: "/input/LookHorizontal",
          args: [
            {
              type: "f",
              value: lookHorizontal,
            },
          ],
        },
      ],
    },
    vrChatAddress,
    vrChatSendPort,
  );
  if (lookHorizontal != 0) {
    debouncedResetLookHorizontalInput();
  }
};
const debouncedResetLookHorizontalInput = BS.ThrottleUtils.debounce(() => {
  // console.log("debouncedResetLookHorizontalInput");
  setVRChatLookHorizontal(0);
}, 200);

app.post("/vrchat", async (req, res) => {
  /** @type {VRChatMessage} */
  const vrChatMessage = req.body;

  if (!vrChatMessage.type) {
    return res.status(400).json({
      error: "no VRChat message type found",
    });
  }

  let returnType = vrChatMessage.type;
  let returnMessage;

  // console.log("vrChatMessage", vrChatMessage);

  switch (vrChatMessage.type) {
    case "getAddress":
      returnMessage = { address: vrChatAddress };
      break;
    case "setAddress":
      vrChatAddress = vrChatMessage.message?.address;
      console.log({ vrChatAddress });
      returnMessage = { address: vrChatAddress };
      returnType = "getAddress";
      break;
    case "get2DInput":
      {
        const { horizontal, vertical } = vrChatControls;
        returnMessage = { horizontal, vertical };
      }
      break;
    case "set2DInput":
      {
        let { horizontal, vertical } = vrChatMessage.message;
        setVRChat2DInput(horizontal, vertical);
        ({ horizontal, vertical } = vrChatControls);
        returnMessage = { horizontal, vertical };
        returnType = "get2DInput";
      }
      break;
    case "getLookHorizontal":
      {
        const { lookHorizontal } = vrChatControls;
        returnMessage = { lookHorizontal };
      }
      break;
    case "setLookHorizontal":
      {
        let { lookHorizontal } = vrChatMessage.message;
        setVRChatLookHorizontal(lookHorizontal);
        ({ lookHorizontal } = vrChatControls);
        returnMessage = { lookHorizontal };
        returnType = "getLookHorizontal";
      }
      break;
    default:
      return res.status(400).json({
        error: `invalid VRChat message type "${vrChatMessage.type}"`,
      });
  }
  return res.status(200).json({ type: returnType, message: returnMessage });
});
