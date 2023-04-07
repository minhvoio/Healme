const express = require("express");
const router = express.Router();
const fetch = require("isomorphic-fetch");
const { resume } = require("../models/dbconfig");

const apiKey = "e4nfa7XKkjnievOvAzkTLp4ve4fABWfds4aLFgZa";
const destination =
  "91 Ngõ 43 Trung Kính|337 Đ. Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, Thành phố Hồ Chí Minh, Việt Nam|40BD Trung Hòa, Cầu Giấy, Hà Nội";
const origin = "91 Ngõ 43 Trung Kính";
// const destination =
//   "21.031011,105.783206|21.022328,105.790480|21.016665,105.788774";

async function getCoordinate(target, apiKey) {
  const url = `https://rsapi.goong.io/Geocode?address=${target}&api_key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.status === "OK") {
    // const coordinate =
    // data.results[0].geometry.location.lat +
    // "," +
    // data.results[0].geometry.location.lng;
    const coordinate = [];
    for (let i = 0; i < data.results.length; ++i) {
      coordinate.push(
        data.results[i].geometry.location.lat +
          "," +
          data.results[i].geometry.location.lng
      );
    }
    // const coordinate = data;
    return arrayToReadableAPI(coordinate);
  } else console.log(data.status);
  return data;
}

async function getDrivingDistance(origin, destination, apiKey) {
  const url = `https://rsapi.goong.io/DistanceMatrix?origins=${origin}&destinations=${destination}&vehicle=car&api_key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.rows[0] != null) {
    return data.rows[0].elements;
  } else console.log(`Can't find the place`);
}

function arrayToReadableAPI(array) {
  let string = "";
  for (let i = 0; i < array.length; ++i) {
    if (i == array.length - 1) string += array[i];
    else string += array[i] + "|";
  }
  return string;
}

router.get("/", async (req, res) => {
  try {
    const ori = await getCoordinate(origin, apiKey);
    const dest = await getCoordinate(destination, apiKey);

    const result = await getDrivingDistance(ori, dest, apiKey);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.get("/coordinate", (req, res) => {
  getCoordinate(target, apiKey)
    .then((origin) => {
      console.log(origin);
      res.send(origin);
    })
    .catch((err) => console.log(err));
});

module.exports = router;
