var express = require('express');
var router = express.Router();
var connection = require('../models/dbconfig');
const verifyToken = require('../middlewares/verifyToken');

router.get('/doc/:id', function(req, res) {
    var query = "call sp_get_schedule(?)";
    var params = req.params.id;
    connection.query(query, params, function(err, result) {
        if (err) throw err;
        res.send(result);
    });
})

router.post('/api/create', verifyToken, function(req, res) {
    var query = "call sp_doctor_schedule(?,?,?)";
    var params = [req.body.doc_id, req.body.date, req.body.time_id];
    connection.query(query, params, function(err, result) {
        if (err) throw err;
        res.send(result);
    });
});

router.post('api/update/:id', verifyToken, function(req, res) {
    var query = "call sp_update_schedule(?,?)";
    var params = [req.params.id, req.body.time_id];
    connection.query(query, params, function(err, result) {
        if (err) throw err;
        res.send(result);
    });
});

router.post('api/delete/:id', verifyToken, function(req, res) {
    var query = "call sp_delete_schedule(?,?)";
    var params = req.params.id;
    connection.query(query, params, function(err, result) {
        if (err) throw err;
        res.send(result);
    });
});

module.exports = router;