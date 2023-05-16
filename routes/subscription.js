var express = require('express');
var router = express.Router();
var connection = require('../models/dbconfig');

router.get('/get-list', function(req, res) {
    var query = "call sp_get_list_subscription()";
    connection.query(query, function(err, result) {
        if (err) return res.send(err);
        res.send(result);
    });
});

router.get('/get/business/:biz_id', function(req, res) {
    var query = "call sp_get_subscription(?, null)";
    var params = req.params.biz_id;
    connection.query(query, params, function(err, result) {
        if (err) return res.send(err);
        res.send(result);
    });
})

router.get('/get/id/:subs_id', function(req, res) {
    var query = "call sp_get_subscription(null, ?)";
    var params = req.params.subs_id;
    connection.query(query, params, function(err, result) {
        if (err) return res.send(err);
        res.send(result);
    });
})