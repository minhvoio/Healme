var express = require("express");
var router = express.Router();

const connection = require("../models/dbconfig");

/* GET clinics list. */
router.get("/", function (req, res, next) {
  var query = "select * from business where type_id = 1";
  connection.query(query, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

router.get("/:id", function (req, res) {
  var query = "call sp_get_clinic(?)";
  connection.query(query, req.params.id, function (err, result) {
    if (err) return res.send(err);
    var biz_id = result[0][0]?.id;
    var dept_query = "call sp_department_by_clinic(?);";
    connection.query(dept_query, biz_id, function (deptErr, deptResult) {
      if (deptErr) return res.send(deptErr);
      // console.log(deptResult[0]);
      result[0][0].departments = deptResult[0];
      res.send(result);
    });
  });
});

router.get("/dept/:deptid", function (req, res) {
  var query = "call sp_filter_by_department(?)";
  var params = req.params.deptid;
  if (params == 0) {
    query = "select * from business where type_id = 1";
  }
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

router.post("/search", function (req, res) {
  var query =
    "call sp_filter_clinics(nullif(?, 0), nullif(?, 0), nullif(?, 0), nullif(?, 0))";
  var params = [req.body.dept, req.body.ward, req.body.district, req.body.province];
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

module.exports = router;
