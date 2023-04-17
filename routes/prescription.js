var express = require('express');
const connection = require('../models/dbconfig');
const verifyToken = require('../middlewares/verifyToken');
var router = express.Router();

router.get('/:pres_id', verifyToken, function(req, res, next) {
  var query = "call sp_prescription_details(?)";
  var params = req.params.pres_id
  connection.query(query, params, function (err, result, fields) {
      if (err) return res.send(err);
      console.log(result);
      res.send(result);
  });
});

router.get('/appt/:appt_id', verifyToken, function(req, res, next) {
  var query = "call sp_prescription_by_appt(?)";
  var params = [req.params.appt_id];
  connection.query(query, params, function (err, result, fields) {
      if (err) return res.send(err);
      console.log(result);
      res.send(result);
  });
});

router.post('/api/create', verifyToken, function(req, res, next) {
  var query = "call sp_prescribe(?, ?, ?, ?)";
  var params = [req.body.pt_id, req.body.doc_id, req.body.appt_id, req.body.diagnosis];
  connection.query(query, params, function (err, result, fields) {
      if (err) return res.send(err);
      console.log(result);
      res.send(result);
  });
});

router.post('/:pres_id/api/add', verifyToken, function(req, res, next) {
  var query = "call sp_add_prescription_details(?, ?, ?)";
  var params = [req.params.pres_id, req.body.med_id, req.body.note];
  connection.query(query, params, function (err, result, fields) {
      if (err) return res.send(err);
      console.log(result);
      res.send(result);
  });
});

router.post('/:pres_id/api/update', function(req,res) {
  var clear_query = 'call sp_clear_prescription(?)';
  connection.query(clear_query, req.params.pres_id, function(clearErr, clearResult) {
    if (clearErr) return res.send(clearErr);
    console.log(clearResult);
    var pd_id = [];
    var pres_details = req.body.details;
    if (pres_details) {
      pres_details?.forEach(element => {
        var add_query = 'call sp_add_prescription_details(?, ?, ?)';
        var add_params = [req.params.pres_id, element.med_id, element.note];
        connection.query(add_query, add_params, function(addErr, addResult) {
          if (addErr) res.send(addErr);
          console.log(addResult[0][0]);
        });
      });
      res.send("Success");
    }
    else res.send("No Data");
  });
});

router.post('/api/update/:pd_id', verifyToken, function(req, res, next) {
  var query = "call sp_update_prescription_details(?, ?, ?)";
  var params = [req.params.pd_id, req.body.med_id, req.body.note];
  connection.query(query, params, function (err, result, fields) {
      if (err) return res.send(err);
      res.send(result);
  });
});

router.post('/api/delete/:pd_id', verifyToken, function(req, res) {
  var query = "call sp_delete_prescription_details(?)";
  var params = req.body.pd_id;
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

module.exports = router;