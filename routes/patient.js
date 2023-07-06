var express = require("express");
const connection = require("../models/dbconfig");
const verifyToken = require("../middlewares/verifyToken");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/:patientid", verifyToken, function (req, res) {
  var query = "call sp_patient_profile(?)";
  connection.query(query, req.params.patientid, function (err, result) {
    if (err) {
      return res.send(err);
    }
    res.send(result);
  });
});

router.post("/api/create", function (req, res) {
  var query = "call sp_create_patient(?,?,?,?,?,?)";
  var params = [
    req.body.userid,
    req.body.fullname,
    req.body.birthdate,
    req.body.gender,
    req.body.address,
    req.body.ward,
  ];
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

router.get("/:id/prescription", function (req, res) {
  var query = "call sp_view_prescription(?)";
  var params = req.params.id;
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

router.post("/:id/api/update", verifyToken, function (req, res) {
  var query =
    "call sp_pt_update_profile(nullif(?, ''), nullif(?, ''), nullif(?, ''), nullif(?, ''))";
  var params = [
    req.params.id,
    req.body.fullname,
    req.body.dob,
    req.body.gender,
  ];
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

module.exports = router;
