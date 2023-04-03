const { query } = require('express');
var express = require('express');
var router = express.Router();

var connection = require('../models/dbconfig');

router.get('/:pharmacyID/branch/:branchID', function(req, res, next) {
  var query = "call sp_branch_details(?, ?)";
  var params = [req.params.pharmacyID, req.params.branchID];
  connection.query(query, params, function (err, result) {
      if (err) throw err;
      res.send(result);
  });
});

module.exports = router;