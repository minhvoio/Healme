var express = require('express');
var router = express.Router();
var connection = require('../models/dbconfig')

router.post('/api/create', function(req, res) {
    var query = "call sp_doctor_schedule(?,?,?)";
    var params = [req.body.doc_id, req.body.date, req.body.time_id];
    connection.query(query, params, function(err, result) {
        if (err) throw err;
        res.send(result);
    });
});

module.exports = router;