var express = require("express");
var router = express.Router();

const connection = require("../models/dbconfig");

/* GET clinics list. */
router.get("/", function (req, res, next) {
  var query = "select * from business where type_id = 1";
  connection.query(query, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

router.get("/:id", function(req, res) {
  var query = "call sp_get_clinic(?)";
  connection.query(query, req.params.id, function(err, result) {
    if(err) throw err;
    res.send(result);
  });
});

router.get("/dept/:deptid", function (req, res) {
  var query = "call sp_filter_by_department(?)";
  var params = req.params.deptid;
  if (params == 0) {
    query = "select * from business where type_id = 1";
  }
  connection.query(query, params, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

router.post("/search", function (req, res) {
  var query =
    "call sp_filter_clinics(nullif(?, 0), nullif(?, 0), nullif(?, 0), nullif(?, 0))";
  var params = [req.body.dept, req.body.ward, req.body.district, req.body.proviince];
  connection.query(query, params, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

module.exports = router;
