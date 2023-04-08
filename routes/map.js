const express = require("express");
const router = express.Router();
const fetch = require("isomorphic-fetch");
const { resume } = require("../models/dbconfig");

const apiKey = "e4nfa7XKkjnievOvAzkTLp4ve4fABWfds4aLFgZa";
const destination =
  "Trường Đại học Bách khoa - Đại học Quốc gia TP.HCM, Lý Thường Kiệt, phường 14, Quận 10, Thành phố Hồ Chí Minh|337 Đ. Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, Thành phố Hồ Chí Minh, Việt Nam|40BD Trung Hòa, Cầu Giấy, Hà Nội|55A, Trần Ngọc Diện, Phường Thảo Điền, Thành phố Thủ Đức, Thành phố Hồ Chí Minh";
const target = [
  `Trường Đại học Bách khoa - Đại học Quốc gia TP.HCM, Lý Thường Kiệt, phường 14, Quận 10, Thành phố Hồ Chí Minh`,
  `
  337 Đ. Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, Thành phố Hồ Chí Minh, Việt Nam`,
  `
  55A, Trần Ngọc Diện, Phường Thảo Điền, Thành phố Thủ Đức, Thành phố Hồ Chí Minh`,
];

// const destination =
//   "40BD Trung Hòa, Cầu Giấy, Hà Nội|55A, Trần Ngọc Diện, Phường Thảo Điền, Thành phố Thủ Đức, Thành phố Hồ Chí Minh";
const origin = "Ký túc xá Khu B Đại học Quốc gia TP.HCM";
// const destination =
//   "21.031011,105.783206|21.022328,105.790480|21.016665,105.788774";

async function getCoordinates(targets, apiKey) {
  const coordinates = [];

  for (let i = 0; i < targets.length; i++) {
    const url = `https://rsapi.goong.io/Geocode?address=${targets[i]}&api_key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status !== "OK") {
      console.log(data.status);
      return data;
    }
    const coordinate = `${data.results[0].geometry.location.lat},${data.results[0].geometry.location.lng}`;
    coordinates.push(coordinate);
  }

  return arrayToReadableAPI(coordinates);
}

function arrayToReadableAPI(array) {
  return array.join("|");
}

async function getDrivingDistance(origin, destination, apiKey) {
  const url = `https://rsapi.goong.io/DistanceMatrix?origins=${origin}&destinations=${destination}&vehicle=car&api_key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.rows[0] != null) {
    return data.rows[0].elements;
  } else console.log(`Can't find the place`);
}

router.get("/", async (req, res) => {
  try {
    const ori = await getCoordinates(origin, apiKey);
    const dest = await getCoordinates(target, apiKey);

    const result = await getDrivingDistance(ori, dest, apiKey);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.get("/coordinate", (req, res) => {
  getCoordinates(target, apiKey)
    .then((origin) => {
      console.log(origin);
      res.send(origin);
    })
    .catch((err) => console.log(err));
});

router.get("/test", async (req, res) => {
  const target = `Trường Đại học Bách khoa - Đại học Quốc gia TP.HCM, Lý Thường Kiệt, phường 14, Quận 10, Thành phố Hồ Chí Minh|
    337 Đ. Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, Thành phố Hồ Chí Minh, Việt Nam|
    55A, Trần Ngọc Diện, Phường Thảo Điền, Thành phố Thủ Đức, Thành phố Hồ Chí Minh`;
  const addresses = target.split("|");

  for (let i = 0; i < addresses.length; i++) {
    const coordinate = await getCoordinate(addresses[i], apiKey);
    console.log(coordinate);
  }
});

module.exports = router;
