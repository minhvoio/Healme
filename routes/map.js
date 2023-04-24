var express = require("express");
var router = express.Router();
const fetch = require("isomorphic-fetch");
const { resume } = require("../models/dbconfig");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "local.env" });

var connection = require("../models/dbconfig");

const apiKey = process.env.MAP_API_KEY;
const destination =
  "Trường Đại học Bách khoa - Đại học Quốc gia TP.HCM, Lý Thường Kiệt, phường 14, Quận 10, Thành phố Hồ Chí Minh|337 Đ. Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, Thành phố Hồ Chí Minh, Việt Nam|40BD Trung Hòa, Cầu Giấy, Hà Nội|55A, Trần Ngọc Diện, Phường Thảo Điền, Thành phố Thủ Đức, Thành phố Hồ Chí Minh";
const addresses = [
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

router.post("/", async (req, res) => {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer") ||
      !req.headers.authorization.split(" ")[1]
    ) {
      return res.status(422).json({
        message: "Please provide the token",
      });
    }
    const theToken = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(theToken, "the-super-strong-secret");

    const userId = decoded.id; // Get the user ID from the decoded token

    var getUserQuery = "SELECT * FROM users WHERE id = ?";
    var getUserParams = userId; // Use the user ID in the query parameters
    connection.query(getUserQuery, getUserParams, function (err, result) {
      if (err) {
        return res.status(400).send({
          msg: err,
        });
      }
      if (!result.length) {
        return res.status(401).send({
          msg: "User not found!",
        });
      }

      var userRoleQuery = "call sp_get_user_role_id(?, ?)";
      var userRoleParams = [result[0].id, result[0].role_id];
      connection.query(
        userRoleQuery,
        userRoleParams,
        function (userRoleErr, userRoleResult) {
          if (userRoleErr) return res.send(userRoleErr);
          result[0].user_role_id = userRoleResult[0][0]?.user_role_id;
          result[0].business_type = userRoleResult[0][0]?.business_type;
          result[0].fulladdress = userRoleResult[0][0]?.fulladdress;
          result[0].ward_id = userRoleResult[0][0]?.ward_id;

          var updateQuery = `UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`;
          connection.query(updateQuery, async (updateErr, updateRes) => {
            if (updateErr) return res.send(updateErr);
            const address = result[0].fulladdress;
            const ori = await getCoordinates(address, apiKey);
            const dest = await getCoordinates(req.body.addresses, apiKey);

            const output = await getDrivingDistance(ori, dest, apiKey);
            return res.status(200).send(output);
          });
        }
      );
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.post("/api/get-user-address", (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer") ||
    !req.headers.authorization.split(" ")[1]
  ) {
    return res.status(422).json({
      message: "Please provide the token",
    });
  }
  const theToken = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(theToken, "the-super-strong-secret");

  const userId = decoded.id; // Get the user ID from the decoded token

  var getUserQuery = "SELECT * FROM users WHERE id = ?";
  var getUserParams = userId; // Use the user ID in the query parameters
  connection.query(getUserQuery, getUserParams, function (err, result) {
    if (err) {
      return res.status(400).send({
        msg: err,
      });
    }
    if (!result.length) {
      return res.status(401).send({
        msg: "User not found!",
      });
    }

    var userRoleQuery = "call sp_get_user_role_id(?, ?)";
    var userRoleParams = [result[0].id, result[0].role_id];
    connection.query(
      userRoleQuery,
      userRoleParams,
      function (userRoleErr, userRoleResult) {
        if (userRoleErr) return res.send(userRoleErr);
        result[0].user_role_id = userRoleResult[0][0]?.user_role_id;
        result[0].business_type = userRoleResult[0][0]?.business_type;
        result[0].fulladdress = userRoleResult[0][0]?.fulladdress;
        result[0].ward_id = userRoleResult[0][0]?.ward_id;

        var updateQuery = `UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`;
        connection.query(updateQuery, (updateErr, updateRes) => {
          if (updateErr) return res.send(updateErr);
          return res.status(200).send({
            address: result[0].fulladdress, // Return the user's address
          });
        });
      }
    );
  });
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
