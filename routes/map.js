var express = require("express");
var router = express.Router();
const fetch = require("isomorphic-fetch");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "local.env" });
var connection = require("../models/dbconfig");
const apiKey = process.env.MAP_API_KEY;

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
            const dest = await getCoordinates(req.body.destinations, apiKey);

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

module.exports = router;
