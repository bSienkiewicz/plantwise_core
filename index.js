require("dotenv").config();
var express = require("express");
const mqtt = require("mqtt");
const xata = require("./xata.js");
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const client = mqtt.connect(
  "mqtt://test.mosquitto.org",
  { port: 1883 },
  { reconnectPeriod: 5000 }
);
const app = express();
const database_uri = process.env.XATA_DB_URL;
const database_key = process.env.XATA_API_KEY;
app.use(cors());

client.on("connect", function () {
  console.log("connected " + client.connected);
  client.subscribe("device/led");
});
client.on("message", function (topic, message) {
  console.log("-> " + topic + " -> " + message.toString());
  try {
    let readingData = JSON.parse(message);
    if (xata.testJSON(message)) {
      xata.insertData(readingData);
    }
  } catch (e) {
    console.log(e);
  } finally {
  }
});

client.on("error", function (err) {
  console.log("Błąd połączenia z brokerem MQTT:", err);
});

client.on("reconnect", function () {
  console.log("Próba ponownego połączenia z brokerem MQTT...");
});

client.on("close", function () {
  console.log("Połączenie z brokerem MQTT zostało zamknięte");
});

// Routes
app.get("/send", function (req, res) {
  client.publish("device/led", "1", { retain: true });
  res.send("Message sent");
});

app.get("/devices", function (req, res) {
  xata.getDevices()
    .then((response) => res.send(response))
});

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

var server = app.listen(3000, function () {
  console.log("app running on port.", server.address().port);
});
