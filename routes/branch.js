const { query } = require('express');
var express = require('express');
var router = express.Router();

var connection = require('../models/dbconfig');

/* GET medicine listing. */
router.get('/:branchID', function(req, res, next) {
  var query = "call sp_branch_details(?, ?)";
  var params = [req.params.pharmacyID, req.params.branchID];
  connection.query(query, params, function (err, result) {
      if (err) throw err;
      console.log(result);
      res.send(result);
  });
});

module.exports = router;