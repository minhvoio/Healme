var express = require('express');
const connection = require('../models/dbconfig');
var router = express.Router();

router.get('/:pres_id', function(req, res, next) {
  var query = "call sp_prescription_details(?)";
  var params = req.params.pres_id
  connection.query(query, params, function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      res.send(result);
  });
});

router.post('/api/create', function(req, res, next) {
  var query = "call sp_prescribe(?, ?)";
  var params = [req.body.pt_id, req.body.doc_id];
  connection.query(query, params, function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      res.send(result);
  });
});

router.post('/:pres_id/api/add', function(req, res, next) {
  var query = "call sp_add_prescription_details(?, ?, ?)";
  var params = [req.params.pres_id, req.body.med_id, req.body.note];
  connection.query(query, params, function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      res.send(result);
  });
});

router.post('/api/update/:pd_id', function(req, res, next) {
  var query = "call sp_update_prescription_details(?, ?, ?)";
  var params = [req.params.pd_id, req.body.med_id, req.body.note];
  connection.query(query, params, function (err, result, fields) {
      if (err) throw err;
      res.send(result);
  });
});

router.post('/api/delete/:pd_id', function(req, res) {
  var query = "call sp_delete_prescription_details(?)";
  var params = req.body.pd_id;
  connection.query(query, params, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

module.exports = router;