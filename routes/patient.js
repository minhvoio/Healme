var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:patientid', function(req, res) {
  var fields = "pt.*";
  var source = "patient pt"
  var condition = "pt.id = ?";
  var query = "select " + fields + " from "
      + source + " where " + condition;
  connection.query(query, req.params.patientid, function(err, result) {
      if (err) throw err;
      res.send(result);
  })
});

module.exports = router;
