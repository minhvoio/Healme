var { query } = require("express");
var express = require("express");
var router = express.Router();

var connection = require("../models/dbconfig");
const verifyToken = require("../middlewares/verifyToken");

router.get("/", (req, res) => {
  res.send("Medicine page");
});

router.get("/search", verifyToken, (req, res) => {
  var query = "call sp_search_medicine(?)";
  console.log(req.body.search_text);
  // res.send(req.body.search_text);
  connection.query(query, req.body.search_text, (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

module.exports = router;
