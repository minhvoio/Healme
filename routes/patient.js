var express = require('express');
const connection = require('../models/dbconfig');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
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
