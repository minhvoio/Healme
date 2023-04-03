const { query } = require('express');
var express = require('express');
var router = express.Router();

var connection = require('../models/dbconfig');

/* GET medicine listing. */
router.get('/:branchID', function(req, res, next) {
  var fields = "med.title, bm.stock, bm.price";
  var source = "branch_medicine bm join medicine med on bm.medicine_id = med.id"
  var condition = "bm.branch_id = ?";
  var query = "select " + fields + " from "
    + source + " where " + condition;
  connection.query(query, req.params.branchID, 
    function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      res.send(result);
  });
});

module.exports = router;