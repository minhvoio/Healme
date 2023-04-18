var express = require('express');
const connection = require('../models/dbconfig');
var router = express.Router();

/* GET business list. */
router.get('/', function(req, res, next) {
  var query = "select * from business";
  connection.query(query, function (err, result, fields) {
      if (err) return res.send(err);
      console.log(result);
      res.send(result);
  });
});

router.post('/api/create', function(req, res) {
  var query = "call sp_create_business_profile(?, ?, ?, ?, ?, ?, ?)";
  var params = [
    req.body.user_id,
    req.body.business_name,
    req.body.business_type,
    req.body.descr,
    req.body.address,
    req.body.ward,
    req.body.branch_of
  ];
  connection.query(query, params, function(err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

router.post("/:biz_id/api/update", function(req, res) {
  var query = "call sp_update_business(?, ?, ?, ?)";
  var params = [req.params.biz_id, req.body.business_name, req.body.descr, req.body.branch_of];
  connection.query(query, params, function(err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

module.exports = router;