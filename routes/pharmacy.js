const { query } = require('express');
var express = require('express');
var router = express.Router();

var connection = require('../models/dbconfig');

/* GET branch listing. */
router.get('/:pharmacyID', function(req, res, next) {
  var fields = "br.*";
  var source = "pharmacy_branch br"
  var condition = "br.business_id = ?";
  var query = "select " + fields + " from "
    + source + " where " + condition;
  connection.query(query, req.params.pharmacyID, 
    function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      res.send(result);
  });
});

module.exports = router;