var express = require('express');
var router = express.Router();
var connection = require('../models/dbconfig')

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

router.post('/create/monthly', function(req, res) {
    var expiration_date = new Date();
    expiration_date.setMonth(expiration_date.getMonth() + 1);

    var planQuery = 'call sp_get_plan(?)';
    connection.query(planQuery, req.body.plan_id, function(err, planResult) {
        if (err) return res.send(err);

        var name = req.body.biz_id.toString() + '_' + 
            planResult[0][0]?.details.replace(' ','').toLowerCase() + '_' + expiration_date.toISOString().split('T')[0];

        var subsQuery = "call sp_create_subscription(?, ?, ?, ?)";
        var subsParams = [req.body.biz_id, req.body.plan_id, name, expiration_date];
        connection.query(subsQuery, subsParams, function(err, subsResult) {
            if (err) return res.send(subsResult);
            res.send(subsResult);
        });
    });
});

router.post('/create/yearly', function(req, res) {
    var expiration_date = new Date();
    expiration_date.setFullYear(expiration_date.getFullYear() + 1);

    var planQuery = 'call sp_get_plan(?)';
    connection.query(planQuery, req.body.plan_id, function(err, planResult) {
        if (err) return res.send(err);

        var name = req.body.biz_id.toString() + '_' + 
            planResult[0][0]?.details.replace(' ','').toLowerCase() + '_' + expiration_date.toISOString().split('T')[0];

        var subsQuery = "call sp_create_subscription(?, ?, ?, ?)";
        var subsParams = [req.body.biz_id, name, req.body.plan_id, expiration_date];
        connection.query(subsQuery, subsParams, function(err, subsResult) {
            if (err) return res.send(subsResult);
            res.send(subsResult);
        });
    });
});

router.post('/update/monthly', function(req, res) {
    var expireQuery = "call sp_get_subscription(?, null)";
    connection.query(expireQuery, req.body.biz_id, function(err, expireResult) {
        if (err) return res.send(err);

        var expiration_date = expireResult[0][0]?.expiration_date;
        expiration_date.setMonth(expiration_date.getMonth() + 1);

        var plan_id = req.body.plan_id == null ? expireResult[0][0]?.plan_id : req.body.plan_id;

        var planQuery = 'call sp_get_plan(?)';
        connection.query(planQuery, plan_id, function(err, planResult) {
            if (err) return res.send(err);

            var name = req.body.biz_id.toString() + '_' + 
                planResult[0][0]?.details.replace(' ','').toLowerCase() + '_' + expiration_date.toISOString().split('T')[0];
            
            var subsQuery = "call sp_update_subscription(?, ?, ?, ?, ?)";
            var subsParams = [req.body.biz_id, req.body.subs_id, name, req.body.plan_id, expiration_date];
            connection.query(subsQuery, subsParams, function(err, subsResult) {
                if (err) return res.send(subsResult);
                res.send(subsResult);
            });
        });
    });
});

router.post('/update/yearly', function(req, res) {
    var expireQuery = "call sp_get_subscription(?, null)";
    connection.query(expireQuery, req.body.biz_id, function(err, expireResult) {
        if (err) return res.send(err);

        var expiration_date = expireResult[0][0]?.expiration_date;
        expiration_date.setFullYear(expiration_date.getFullYear() + 1);

        var plan_id = req.body.plan_id == null ? expireResult[0][0]?.plan_id : req.body.plan_id;

        var planQuery = 'call sp_get_plan(?)';
        connection.query(planQuery, plan_id, function(err, planResult) {
            if (err) return res.send(err);

            var name = req.body.biz_id.toString() + '_' + 
                planResult[0][0]?.details.replace(' ','').toLowerCase() + '_' + expiration_date.toISOString().split('T')[0];
            
            var subsQuery = "call sp_update_subscription(?, ?, ?, ?, ?)";
            var subsParams = [req.body.biz_id, req.body.subs_id, req.body.plan_id, name, expiration_date];
            connection.query(subsQuery, subsParams, function(err, subsResult) {
                if (err) return res.send(subsResult);
                res.send(subsResult);
            });
        });
    });
});

router.post('/delete', function(req, res) {
    var query = 'call sp_delete_subscription(?, ?)';
    var params = [req.body.biz_id, req.body.subs_id];
    connection.query(query, params, function(err, result) {
        if (err) return res.send(err);
        res.send('Sucess');
    })
});

module.exports = router