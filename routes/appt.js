const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const connection = require("../models/dbconfig");
const transporter = require("../models/mailer");
const app_email = "healme.vn@gmail.com";
const request = require('request');
const verifyToken = require("../middlewares/verifyToken");
require("dotenv").config();

const payload = {
  iss: process.env.API_KEY, //your API KEY
  exp: new Date().getTime() + 5000,
};
const token = jwt.sign(payload, process.env.API_SECRET); //your API SECRET HERE

router.get("/api/create-meeting/", function(req, res){
  const clientID = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const accountID = process.env.ACCOUNT_ID
  var options = {
    method: 'POST',
    url: 'https://zoom.us/oauth/token',
    qs: {
      grant_type: 'account_credentials',
      account_id: accountID,
    },
    headers: {
      Authorization: 'Basic ' + Buffer.from(clientID + ':' + clientSecret).toString('base64'),
    },
    json: true
  };
  request(options, function (error, response, body) {
    if (error) return error;
      console.log(body);
      var accessToken = body.access_token;
      var meeting_options = {
        method: 'POST',
        headers: {
          authorization: 'Bearer ' + accessToken,
        },
        uri: "https://api.zoom.us/v2/users/" + app_email + "/meetings",
        body: {
          topic: "Zoom Meeting", //meeting title
          type: 1,
          settings: {
            join_before_host: true,
            waiting_room: false,
            mute_upon_entry: false,
            participant_video: true,
            host_video: true,
          },
        },
        json: true
      };

      request(meeting_options, function (error, response, body) {
        if (error) return new Error(error);
        console.log(body.join_url);
        res.send(body);
      });
  });
});

router.get("/:id", function (req, res) {
  var query = "call sp_get_appt(?)";
  var params = req.params.id;
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

router.get("/pt/:id", function (req, res) {
  var query = "call sp_patient_appt(?)";
  var params = req.params.id;
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

router.get("/sched/:id", function (req, res) {
  var query = "call sp_schedule_appt(?)";
  var params = req.params.id;
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

router.get("/time/:id", function (req, res) {
  var query = "select * from appt_hour where time_id = ?";
  if (req.params.id == 0) query = "select * from appt_hour";
  connection.query(query, req.params.id, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

router.post("/api/create", verifyToken, function (req, res) {
  var appt_query = "call sp_doctor_appointment(?,?,?,?)";
  var appt_params = [
    req.body.pt_id,
    req.body.doc_id,
    req.body.sched_id,
    req.body.hour_id,
  ];
  connection.query(appt_query, appt_params, function (err, result) {
    if (err) return res.send(err);

    if (result[0][0]?.error_message != null) return res.send(result);

    var appt_id = result[0][0]?.id;

    var biz_email, biz_name, appt_day, appt_hour;

    var doc_query = "call sp_appt_info(?)";
    connection.query(doc_query, appt_id, async function (err, infoResult) {
      if (err) return res.send(err);

      biz_name = infoResult[0][0].business_name;
      biz_email = infoResult[0][0].email;
      appt_day = infoResult[0][0].workday;
      appt_hour = infoResult[0][0].appt_hour;

      const clientID = process.env.CLIENT_ID;
      const clientSecret = process.env.CLIENT_SECRET;
      const accountID = process.env.ACCOUNT_ID

      var options = {
        method: 'POST',
        url: 'https://zoom.us/oauth/token',
        qs: {
          grant_type: 'account_credentials',
          account_id: accountID,
        },
        headers: {
          Authorization: 'Basic ' + Buffer.from(clientID + ':' + clientSecret).toString('base64'),
        },
        json: true
      };
      request(options, function (error, response, body) {
        if (error) return res.send(error);

        var accessToken = body.access_token;

        var meeting_options = {
          method: 'POST',
          headers: {
            authorization: 'Bearer ' + accessToken,
          },
          uri: "https://api.zoom.us/v2/users/" + app_email + "/meetings",
          body: {
            topic: "Zoom Meeting", //meeting title
            type: 1,
            settings: {
              join_before_host: true,
              waiting_room: false,
              mute_upon_entry: false,
              participant_video: true,
              host_video: true,
            },
          },
          json: true
        };
        request(meeting_options, function (error, response, body) {
          if (error) return res.send(error);
          
          result[0][0].meeting = {
            start_url: body.start_url,
            join_url: body.join_url,
            topic: body.topic,
            timezone: body.timezone
          };
          var meeting_url = body.start_url;

          var update_query = "update doctor_appointment set meeting_url = ? where id = ?";
          var update_params = [meeting_url, appt_id];
          connection.query(update_query, update_params, function (err, updateResult) {
            if (err) return res.send(err);
          });

          var pt_email;
          var pt_query = "call sp_patient_email(?)";
          connection.query(pt_query, req.body.pt_id, function (err, queryResult) {
            if (err) return res.send(err);
            pt_email = queryResult[0][0].email;

            var mailOptions = {
              from: "noreply@domain.com",
              to: [pt_email, biz_email].join(", "),
              subject: "Xác nhận đặt lịch thành công",
              text: "Confirmation Notice",
                html:
                  "<p>Xác nhận đặt lịch khám thành công</b>" +
                  "<ul><li>Phòng khám: " + biz_name +
                  "</li><li>Email: " + biz_email +
                  "</li><li>Link: " + meeting_url +
                  "</li>" +
                  "<li>Thời gian: " + appt_hour + " Ngày: " + appt_day +
                  "</li></ul>",
            };
            transporter.sendMail(mailOptions, function (mailErr, mailResult) {
              if (err) return mailErr;
              else console.log('Message Sent: ', mailResult.response);
            });
          });

          res.send(result);
        });
      });
    });
  });
});

router.post("/api/delete/:appt_id", verifyToken, function (req, res) {
  var query = "call sp_cancel_appointment(?)";
  var params = req.params.appt_id;
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);

    var pt_id = result[0][0].pt_id;
    var sched_id = result[0][0].sched_id;
    var pt_query = "call sp_patient_email(?)";
    connection.query(pt_query, pt_id, function (err, pt_result) {
      if (err) return res.send(err);

      var pt_email = pt_result[0][0].user_email;
      var appt_query = "call sp_appt_info(?)";
      connection.query(appt_query, sched_id, function (err, appt_result) {
        if (err) return res.send(err);

        var biz_name = appt_result[0][0]?.business_name;
        var biz_email = appt_result[0][0]?.email;
        var appt_day = appt_result[0][0]?.workday;
        var appt_hour = appt_result[0][0]?.appt_hour;

        var mailOptions = {
          from: "noreply@domain.com",
          to: [pt_email, biz_email].join(", "),
          subject: "Thông báo hủy lịch khám",
          text: "Cancellation Notice",
          html:
            "<p>Thông báo hủy lịch khám</b>" +
            "<ul><li>Phòng khám: " +
            biz_name +
            "</li><li>Email: " +
            biz_email +
            "</li><li>Thời gian: " +
            appt_hour +
            " Ngày: " +
            appt_day +
            "</li></ul>",
        };
        transporter.sendMail(mailOptions, function (err, result) {
          if (err) {
            console.log(err);
          } else {
            console.log("Message sent: " + result.response);
          }
        });
      });
    });

    res.send("Success");
  });
});

router.post("/:id/diagnose", verifyToken, function (req, res) {
  var query = "call sp_diagnose(?, ?, ?, ?)";
  var params = [
    req.params.id,
    req.body.appt,
    req.body.pres,
    req.body.diagnosis,
  ];
  connection.query(query, params, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

module.exports = router;
