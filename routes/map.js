var { query } = require("express");
var express = require("express");
var router = express.Router();
var connection = require("../models/dbconfig");

const fetch = require("isomorphic-fetch");
// const apiKey = require('./config')
const apiKey = "AIzaSyBDJEju6o6dXOPZRE3-gaF4VJbrWywkyk8";

async function getDrivingDistance(origin, destination, apiKey) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&mode=driving&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.status === "OK") {
    const distance = data.rows[0].elements[0].distance.value;
    return distance;
  } else {
    throw new Error("Unable to retrieve driving distance.");
  }
}

const origin =
  "Ký túc xá Khu B Đại học Quốc gia TP.HCM, Tô Vĩnh Diện, Đông Hoà, Dĩ An, Bình Dương, Việt Nam";
const destination =
  "337 Đ. Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, Thành phố Hồ Chí Minh, Việt Nam";

router.get("/", (req, res) => {
  var result;
  getDrivingDistance(origin, destination, apiKey)
    .then((distance) => {
      result = `The driving distance between ${origin} and ${destination} is ${distance} meters.`;
      console.log(result);
    })
    .catch((error) => {
      console.error(error);
    });
  res.send(result);
});

module.exports = router;
