var express = require('express');
var router = express.Router();
const { signupValidation, loginValidation } = require('../models/validation');
const { validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

router.post('/api/login', loginValidation, (req, res) => {
  var params = [req.body.email];
    var query = 'SELECT * FROM users WHERE email = ?'
    var params = [req.body.email, req.body.password];
    connection.query(query, params, function(err, result){
        if(err) {
          // throw err;
          return res.status(400).send({
            msg: err,
          });
        }
        if (!result.length) {
          return res.status(401).send({
            msg: "Email or password is incorrect!",
          });
        }
        // check password
        bcrypt.compare(
        req.body.password,
        result[0]["pass"], (bErr, bResult) => {
          if (bErr) {
            // throw bErr;
            return res.status(401).send({
                msg: "Email or password is incorrect!",
            });
          }
          if (bResult) {
            const token = jwt.sign(
                { id: result[0].id },
                "the-super-strong-secrect",
                { expiresIn: "1h" }
            );
            connection.query(
                `UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`
            );
            return res.status(200).send({
                msg: "Logged in!",
                token,
                user: result[0],
            });
            }
          return res.status(401).send({
              msg: "Username or password is incorrect!",
          });
        })
    })
});
  
//signupValidation
router.post("/api/get-user", (req, res, next) => {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer") ||
      !req.headers.authorization.split(" ")[1]
    ) {
      return res.status(422).json({
        message: "Please provide the token",
      });
    }
    const theToken = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(theToken, "the-super-strong-secrect");

    connection.query(
      "SELECT * FROM users where id = ?",
      decoded.id,
      function (error, results, fields) {
        if (error) throw error;
        connection.query("SELECT * FROM roles WHERE id = ?", results[0].role_id, (roleErr, roleRes) => {
          if (roleErr) throw roleErr;
          const roleTitle = roleRes[0].title;
          results[0].role = roleTitle;
          return res.send({
            error: false,
            data: results[0],
            message: "Fetch Successfully.",
          });
        })
      }
    );
  });

module.exports = router;
