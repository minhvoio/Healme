var express = require('express');
var router = express.Router();
var connection = require('../models/dbconfig')

router.get('/province', function(req, res) {
    var query = "select id, name from province";
    connection.query(query, function(err, result) {
        if (err) return res.send(err);
        res.send(result);
    });
});

router.get('/province/:provinceid', function(req, res) {
    var query = "select id, name from province where id = ?";
    var params = [req.params.provinceid];
    connection.query(query, params, function(err, result) {
        if(err) return res.send(err);
        res.send(result);
    });
});

router.get('/province/:provinceid/district', function(req, res) {
    var query = "call sp_dist_by_province(?)";
    var params = [req.params.provinceid];
    connection.query(query, params, function(err, result) {
        if(err) return res.send(err);
        res.send(result);
    });
});

router.get('/district/:districtid', function(req, res) {
    var query = "select id, title from district where id = ?";
    var params = req.params.districtid;
    connection.query(query, params, function(err, result) {
        if(err) return res.send(err);
        res.send(result);
    });
});

router.get('/district/:districtid/ward', function(req, res) {
    var query = "call sp_ward_by_dist(?)";
    var params = req.params.districtid;
    connection.query(query, params, function(err, result) {
        if(err) return res.send(err);
        res.send(result);
    });
});

router.get('/ward/:wardid', function(req, res) {
    var query = "call sp_get_ward(?);";
    var params = req.params.wardid;
    connection.query(query, params, function(err, result) {
        if(err) return res.send(err);
        res.send(result);
    });
});

router.get('/address/:address_id', function(req, res) {
    var query = "call sp_address_details(?);"
    var params = req.params.address_id;
    connection.query(query, params, function(err, result) {
        if (err) return res.send(err);
        res.send(result);
    });
});

module.exports = router;