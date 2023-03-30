var express = require("express");
const mqtt = require("mqtt");
const client = mqtt.connect(
  "mqtt://test.mosquitto.org",
  { port: 1883 },
  { reconnectPeriod: 5000 }
);
const app = express();

client.on("connect", function () {
  console.log("connected " + client.connected);
  client.subscribe("device/led");
});
client.on("message", function (topic, message) {
  console.log(topic + " -> " + message.toString());
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

var server = app.listen(3000, function () {
  console.log("app running on port.", server.address().port);
});
