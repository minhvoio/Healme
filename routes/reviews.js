var express = require("express");
var router = express.Router();

const connection = require("../models/dbconfig");

router.get("/:business_id", function (req, res, next) {
  var countQuery = "call sp_ratings_count(?)";
  connection.query(countQuery, req.params.business_id, function (err, countResult) {
    if (err) return res.send(err);
    
    var detailsQuery = "call sp_get_reviews_by_business(?)";
    connection.query(detailsQuery, req.params.business_id, function(err, detailsResult) {
        if (err) res.send(err);

        res.send({
          count: countResult[0], 
          details: detailsResult[0]
        });
    });
  });
});

router.post("/create", function(req, res) {
  var query = "call sp_add_reviews(?, ?, ?, ?)";
  var params = [req.body.user_id, req.body.business_id, req.body.rating, req.body.comment];
  connection.query(query, params, function(err, result) {
    if(err) return res.send(err);
    res.send(result);
  });
});

router.post("/update/:id", function (req, res) {
  var query = "call sp_update_review(?, ?, ?)";
  var params = [req.params.id, req.body.rating, req.body.comment];
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

router.post("/delete/:id", function (req, res) {
  var query = "call sp_delete_comment(?)";
  var params = req.params.id;
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

module.exports = router;
