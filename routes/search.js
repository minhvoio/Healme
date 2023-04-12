var express = require('express');
var router = express.Router();
var connection = require('../models/dbconfig')

router.get("/api/dept", function(req, res) {
    var query = "call sp_search_department(?)";
    var params = req.body.search_text;
    connection.query(query, params, function(err, result) {
        if (err) throw err;
        res.send(result);
    })
});

router.get("/api/dist", function(req, res) {
    var query = "call sp_search_district(?)";
    var params = req.body.search_text;
    connection.query(query, params, function(err, result) {
        if (err) throw err;
        res.send(result);
    })
});

router.get("/api/wrd", function(req, res) {
    var query = "call sp_search_ward(?)";
    var params = req.body.search_text;
    connection.query(query, params, function(err, result) {
        if (err) throw err;
        res.send(result);
    })
});

router.get("/api/prvn", function(req, res) {
    var query = "call sp_search_province(?)";
    var params = req.body.search_text;
    connection.query(query, params, function(err, result) {
        if (err) throw err;
        res.send(result);
    })
});

module.exports = router;