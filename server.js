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
import cors from "cors";
import axios from "axios";

process.on("warning", (e) => console.warn(e.stack));

//BS.setAllConsoleLevelFlags({ log: true });
//BS.setConsoleLevelFlagsForType("UDPServer", { log: true });
BS.setConsoleLevelFlagsForType("NobleScanner", { log: true });
BS.setConsoleLevelFlagsForType("BaseScanner", { log: true });
BS.setConsoleLevelFlagsForType("Scanner", { log: true });
BS.setConsoleLevelFlagsForType("BaseConnectionManager", { log: true });
BS.setConsoleLevelFlagsForType("NobleConnectionManager", { log: true });
BS.setConsoleLevelFlagsForType("BluetoothConnectionManager", { log: true });
BS.setConsoleLevelFlagsForType("Device", { log: true });
BS.setConsoleLevelFlagsForType("DeviceInformationManager", { log: true });
BS.setConsoleLevelFlagsForType("BaseServer", { log: true });

// HTTPS SERVER
app.use(nocache());
app.use(function (req, res, next) {
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  res.header("x-frame-options", "same-origin");

  // Add CORS headers
  res.header("Access-Control-Allow-Origin", "https://localhost"); // Adjust this to your allowed origin
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS"); // Allowed HTTP methods
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allowed headers
  res.header("Access-Control-Allow-Credentials", "true"); // Allow cookies or other credentials if needed

  // Handle preflight requests (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // No Content
  }

  next();
});
app.use(express.static("./"));
app.use(express.json());
app.post("/bottango", async (req, res) => {
  const { port, identifier, value } = req.body;

  if (typeof port !== "number" || typeof identifier !== "string" || typeof value !== "number") {
    return res.status(400).send("Invalid request data");
  }

  try {
    // Make the PUT request to the ControlInput endpoint
    const putUrl = `http://localhost:${port}/ControlInput/`;
    const putData = { identifier, value };

    await axios.put(putUrl, putData);

    // Respond back to the client after the PUT request succeeds
    res.status(200).send("Request forwarded successfully");
  } catch (error) {
    console.error("Error making PUT request:", error.message);
    res.status(500).send("Failed to forward request");
  }
});

const serverOptions = {
  key: fs.readFileSync("./sec/key.pem"),
  cert: fs.readFileSync("./sec/cert.pem"),
};

const httpServer = http.createServer(app);
httpServer.listen(80);
const httpsServer = https.createServer(serverOptions, app);
httpsServer.listen(443, () => {
  console.log(`server listening on https://${ip.address()}`);
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
