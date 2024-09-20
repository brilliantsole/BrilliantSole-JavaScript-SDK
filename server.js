import express from "express";
import https from "https";
import http from "http";
const app = express();
import fs from "fs";
import ip from "ip";
import * as BS from "./build/brilliantsole.node.module.js";
import { WebSocketServer } from "ws";
import * as dgram from "dgram";
//BS.setAllConsoleLevelFlags({ log: true, warn: true });

// HTTPS SERVER
app.use(function (req, res, next) {
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  res.header("x-frame-options", "same-origin");

  next();
});
app.use(express.static("./"));

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

udpSocket.bind(1234);
