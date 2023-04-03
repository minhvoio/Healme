const express = require("express");
const router = express.Router();
const requestPromise = require("request-promise");
const jwt = require("jsonwebtoken");
const connection = require('../models/dbconfig');
require("dotenv").config();

const payload = {
  iss: process.env.API_KEY, //your API KEY
  exp: new Date().getTime() + 5000,
};
const token = jwt.sign(payload, process.env.API_SECRET); //your API SECRET HERE

router.get("/meeting", (req, res) => {
  var email = "healme.vn@gmail.com"; // your zoom developer email account
  if (req.body.biz_id != null) {
    var query = "call sp_business_email(?)";
    var params = req.body.biz_id;
    connection.query(query, params, function(err, result) {
      if (err) throw err;
      email = result.email;
    });
  }
  var options = {
    method: "POST",
    uri: "https://api.zoom.us/v2/users/" + email + "/meetings",
    body: {
      topic: "Zoom Meeting", //meeting title
      type: 1,
      settings: {
        host_video: "true",
        participant_video: "true",
      },
    },
    auth: {
      bearer: token,
    },
    headers: {
      "User-Agent": "Zoom-api-Jwt-Request",
      "content-type": "application/json",
    },
    json: true, //Parse the JSON string in the response
  };

  requestPromise(options)
    .then(function (response) {
      console.log(response);
      url = response.start_url;
      res.send(response);
    })
    .catch(function (err) {
      // API call failed...
      console.log("API call failed, reason ", err);
    });
});

module.exports = router;