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
import axios from "axios";
import bonjour from "bonjour";

process.on("warning", (e) => console.warn(e.stack));

// BS.setAllConsoleLevelFlags({ log: true });
// BS.setConsoleLevelFlagsForType("UDPServer", { log: true });

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
app.post("/bottango", async (req, res) => {
  const { port, identifier, value } = req.body;

  if (
    typeof port !== "number" ||
    typeof identifier !== "string" ||
    typeof value !== "number"
  ) {
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
