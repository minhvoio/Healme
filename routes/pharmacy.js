var express = require('express');
const connection = require('../models/dbconfig');
var router = express.Router();

/* GET pharmacy list. */
router.get('/', function(req, res, next) {
  var query = "select * from business where type_id = 2";
  connection.query(query, function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      res.send(result);
  });
});
router.get('/:pharmacyID', function(req, res, next) {
  var query = "select * from business where id = ?";
  var params = req.params.pharmacyID;
  connection.query(query, params, function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      res.send(result);
  });
});
router.get('/:pharmacyID/branch', function(req, res, next) {
  var query = "call sp_branch_by_pharmacy(?)";
  var params = req.params.pharmacyID;
  connection.query(query, params, function (err, result, fields) {
      if (err) throw err;
      res.send(result);
  });
});
router.post('/search', function(req, res) {
  var query = "call sp_filter_pharmacies(nullif(?, 0), nullif(?, 0), nullif(?, 0))";
  var params = [req.body.ward, req.body.district, req.body.proviince];
  connection.query(query, params, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});
module.exports = router;