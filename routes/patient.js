var express = require('express');
const connection = require('../models/dbconfig');
var router = express.Router();

var connection = require("../models/dbconfig");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});


router.get("/:patientid", function (req, res) {
  var fields = "pt.*";
  var source = "patient pt";
  var condition = "pt.id = ?";
  var query = "select " + fields + " from " + source + " where " + condition;
  connection.query(query, req.params.patientid, function (err, result) {
    if (err) throw err;
    res.send(result);
  });

router.post('/api/create', function(req, res) {
  var query = "call sp_create_patient(?,?,?,?,?,?)";
  var params = [
    req.body.userid, req.body.fullname, 
    req.body.birthdate, req.body.gender, 
    req.body.address, req.body.ward
  ];
  connection.query(query, params, function(err, result) {
      if (err) throw err;
      res.send(result);
  })

});

module.exports = router;
