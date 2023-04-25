var express = require("express");
var router = express.Router();
const { signupValidation, loginValidation } = require("../models/validation");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var connection = require("../models/dbconfig");

/* GET users listing. */
router.get("/", function (req, res) {
  var query = "call sp_all_users()";
  connection.query(query, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

router.get("/api/get/:user_id", function (req, res) {
  var query = "call sp_get_user_info(?)";
  var params = [req.params.user_id];
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

router.post("/api/create", function (req, res) {
  var password = req.body.password;
  bcrypt.hash(password, 10, function (err, hash) {
    if (err) return res.send(err);

    var query = "call sp_create_user(?, ?, ?, ?, ?)";
    var params = [
      req.body.username,
      hash,
      req.body.role_id,
      req.body.email,
      req.body.phone,
    ];
    connection.query(query, params, function (err, result) {
      if (err) return res.send(err);
      res.send(result);
    });
  });
});

router.get("/api/view/:userid", function (req, res) {
  var query = "call sp_view_profile(?)";
  connection.query(query, req.params.userid, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

router.post("/api/register", function (req, res) {
  var password = req.body.password;
  bcrypt.hash(password, 10, function (err, hash) {
    if (err) return res.send(err);
    var query = "call sp_register(?, ?, ?, ?)";
    var params = [req.body.username, hash, req.body.email, req.body.phone];
    connection.query(query, params, function (err, result) {
      if (err) return res.send(err);
      res.send(result);
    });
  });
});

router.post("/:user_id/api/add-address", function (req, res) {
  var query = "call sp_add_address(?, ?, ?);";
  var params = [req.params.user_id, req.body.address, req.body.ward];
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

router.post("/api/update/:userid", function (req, res) {
  var query = "call sp_update_profile(?, ?, ?, ?)";
  var params = [
    req.params.userid,
    req.body.username,
    req.body.email,
    req.body.phone,
  ];
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

router.post("/api/login", loginValidation, (req, res) => {
  var query = "SELECT * FROM users WHERE username = ? AND account_status = 1;";
  var params = req.body.username;
  connection.query(query, params, function (err, result) {
    if (err) {
      // return res.send(err);
      return res.status(400).send({
        msg: err,
      });
    }
    if (!result.length) {
      return res.status(401).send({
        msg: "Username or password is incorrect!",
      });
    }
    // check password
    bcrypt.compare(req.body.password, result[0]["pass"], (bErr, bResult) => {
      if (bErr) {
        // throw bErr;
        return res.status(401).send({
          msg: "Username or password is incorrect!",
        });
      }
      if (!bResult) {
        // throw bErr;
        return res.status(401).send({
          msg: "Username or password is incorrect!",
        });
      }

      var roleQuery = "SELECT * FROM roles WHERE id = ?";
      var roleParams = result[0].role_id;
      connection.query(roleQuery, roleParams, (roleErr, roleRes) => {
        if (roleErr) return res.send(roleErr);
        const roleTitle = roleRes[0].title;
        result[0].role = roleTitle;
        const token = jwt.sign(
          { id: result[0].id },
          "the-super-strong-secret",
          { expiresIn: "120d" }
        );

        var userRoleQuery = "call sp_get_user_role_id(?, ?)";
        var userRoleParams = [result[0].id, result[0].role_id];
        connection.query(
          userRoleQuery,
          userRoleParams,
          function (userRoleErr, userRoleResult) {
            if (userRoleErr) return res.send(userRoleErr);
            result[0].user_role_id = userRoleResult[0][0]?.user_role_id;
            result[0].business_type = userRoleResult[0][0]?.business_type;
            result[0].fulladdress = userRoleResult[0][0]?.fulladdress;
            result[0].ward_id = userRoleResult[0][0]?.ward_id;

            var updateQuery = `UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`;
            connection.query(updateQuery, (updateErr, updateRes) => {
              if (updateErr) return res.send(updateErr);
              return res.status(200).send({
                msg: "Logged in!",
                token,
                user: result[0],
              });
            });
          }
        );
      });
    });
  });
});

//get current user
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
  const decoded = jwt.verify(theToken, "the-super-strong-secret");

  const userId = decoded.id; // Get the user ID from the decoded token

  var getUserQuery = "SELECT * FROM users WHERE id = ?";
  var getUserParams = userId; // Use the user ID in the query parameters
  connection.query(getUserQuery, getUserParams, function (err, result) {
    if (err) {
      return res.status(400).send({
        msg: err,
      });
    }
    if (!result.length) {
      return res.status(401).send({
        msg: "User not found!",
      });
    }

    var roleQuery = "SELECT * FROM roles WHERE id = ?";
    var roleParams = result[0].role_id;
    connection.query(roleQuery, roleParams, (roleErr, roleRes) => {
      if (roleErr) return res.send(roleErr);
      const roleTitle = roleRes[0].title;
      result[0].role = roleTitle;

      var userRoleQuery = "call sp_get_user_role_id(?, ?)";
      var userRoleParams = [result[0].id, result[0].role_id];
      connection.query(
        userRoleQuery,
        userRoleParams,
        function (userRoleErr, userRoleResult) {
          if (userRoleErr) return res.send(userRoleErr);
          result[0].user_role_id = userRoleResult[0][0]?.user_role_id;
          result[0].business_type = userRoleResult[0][0]?.business_type;
          result[0].fulladdress = userRoleResult[0][0]?.fulladdress;
          result[0].ward_id = userRoleResult[0][0]?.ward_id;

          var updateQuery = `UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`;
          connection.query(updateQuery, (updateErr, updateRes) => {
            if (updateErr) return res.send(updateErr);
            return res.status(200).send({
              msg: "User info retrieved!",
              user: result[0], // Return the user info
            });
          });
        }
      );
    });
  });
});

router.post("/:user_id/api/change-password", function (req, res) {
  old_pass = req.body.old_pass;
  new_pass = req.body.new_pass;
  var pass_query = "select pass from users where id = ?;";
  connection.query(pass_query, req.params.user_id, function (err, result) {
    if (err) return res.send(err);
    bcrypt.compare(old_pass, result[0].pass, function (bErr, bResult) {
      if (bErr) throw bErr;
      if (!bResult) {
        return res.status(401).send({
          msg: "Password is incorrect!",
        });
      }

      bcrypt.hash(new_pass, 10, function (err, hash) {
        var query = "call sp_change_password(?, ?)";
        var params = [req.params.user_id, hash];
        connection.query(query, params, function (err, result) {
          if (err) return res.send(err);
          res.send(result);
        });
      });
    });
  });
});

router.post("/api/delete/:userid", function (req, res) {
  var query = "call sp_deactivate_user(?)";
  var params = req.params.userid;
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

module.exports = router;
