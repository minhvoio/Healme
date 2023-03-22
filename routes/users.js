var express = require('express');
var router = express.Router();
var connection = require('../models/dbconfig')

/* GET users listing. */
router.get('/', function(req, res) {
    var query = "select * from users";
    connection.query(query, function(err, result) {
        if (err) throw err;
        res.send(result);
    });
});

router.get('/:userid', function(req, res) {
    var query = "call sp_view_profile(?)"
    connection.query(query, req.params.userid, function(err, result) {
        if (err) throw err;
        res.send(result);
    });
});

router.post('/register', function(req, res) {
    var query = "call sp_register(?, ?, ?, ?)"
    var params = [req.body.username, req.body.password, req.body.email, req.body.phone];
    connection.query(query, params, function(err, result) {
        if(err) throw err;
        res.send(result);
    })
})

router.post('/:userid/update', function(req, res) {
    var query = "call sp_update_profile(?, ?, ?, ?)"
    var params = [req.params.userid, req.body.username, req.body.email, req.body.phone];
    connection.query(query, params, function(err, result) {
        if(err) throw err;
        res.send(result);
    })
})

module.exports = router;
