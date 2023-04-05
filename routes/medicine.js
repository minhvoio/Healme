var { query } = require("express");
var express = require("express");
var router = express.Router();

var connection = require("../models/dbconfig");

router.get("/", (req, res) => {
  res.send("Medicine page");
});

router.get("/search/:search_text", (req, res) => {
  var query = "SELECT * FROM healthcare.medicine WHERE search_text = ?";
  connection.query(query, req.params.search_text, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

module.exports = router;
