var express = require('express');
var router = express.Router();
var connection = require('../models/dbconfig')

/* GET users listing. */
router.get('/', function(req, res) {
    var fields = "usr.*";
    var source = "users usr";
    var query = "select " + fields + " from "
        + source;
    connection.query(query, function(err, result) {
        if (err) throw err;
        res.send(result);
    });
});

router.get('/:userid', function(req, res) {
    var fields = "usr.*";
    var source = "users usr"
    var condition = "usr.id = ?";
    var query = "select " + fields + " from "
        + source + " where " + condition;
    connection.query(query, req.params.userid, function(err, result) {
        if (err) throw err;
        res.send(result);
    });
});

module.exports = router;
