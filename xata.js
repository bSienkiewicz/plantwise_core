require("dotenv").config();
const database_uri = process.env.XATA_DB_URL;
const database_key = process.env.XATA_API_KEY;
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const mqtt = require("mqtt");

function insertData(readingData) {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${database_key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(readingData),
  };

  fetch(`${database_uri}:main/tables/Readings/data?columns=id`, options)
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));
}

function getDevices() {
  const options = {
    method: 'POST',
    headers: {Authorization: `Bearer ${database_key}`, 'Content-Type': 'application/json'},
    body: '{"page":{"size":15}}'
  };
  
  return fetch(`${database_uri}:main/tables/Devices/query`, options)
    .then(response => response.json())
    .catch(err => console.error(err));
}

function testJSON(message) {
  try {
    let readingData = JSON.parse(message);
    if (
      readingData.hasOwnProperty("irrigating") &&
      readingData.hasOwnProperty("moisture") &&
      readingData.hasOwnProperty("device-id")
    ) {
      return true;
    } else {
      console.log("Message does not contain the required keys");
      return false;
    }
  } catch (e) {
    console.log("Message is not a valid JSON");
    return false;
  }
}
module.exports = {
  insertData,
  getDevices,
  testJSON,
};
