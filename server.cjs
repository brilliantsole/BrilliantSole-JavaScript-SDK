const express = require("express");
const https = require("https");
const http = require("http");
const app = express();
const fs = require("fs");
const _ = require("lodash");
const ip = require("ip");
const BS = require("./");
//BS.setAllConsoleLevelFlags({ log: true, warn: true });

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

const insole = new BS.Device();
insole.addEventListener("connectionStatus", () => {
    console.log("connectionStastus", insole.connectionStatus);
    if (insole.isConnected) {
        insole.setSensorConfiguration({ pressure: 20 });
    }
});
//insole.connect();
insole.addEventListener("pressure", (event) => {
    console.log(event.message);
});
