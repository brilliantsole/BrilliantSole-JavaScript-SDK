var express = require("express");
var https = require("https");
var http = require("http");
var app = express();
var fs = require("fs");
const _ = require("lodash");
var ip = require("ip");

var options = {
    key: fs.readFileSync("./sec/key.pem"),
    cert: fs.readFileSync("./sec/cert.pem"),
};

app.use(function (req, res, next) {
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    res.header("x-frame-options", "same-origin");

    next();
});
app.use(express.static("./"));

const httpServer = http.createServer(app);
httpServer.listen(80);
const httpsServer = https.createServer(options, app);
httpsServer.listen(443, () => {
    console.log(`server listening on https://${ip.address()}`);
});
