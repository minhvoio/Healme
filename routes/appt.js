const express = require("express");
const router = express.Router();
const requestPromise = require("request-promise");
const jwt = require("jsonwebtoken");
const connection = require('../models/dbconfig');
const transporter = require('../models/mailer');
const app_email = 'lenamthaisonts@gmail.com';
const { route } = require(".");
const verifyToken = require("../middlewares/verifyToken");
require("dotenv").config();

const payload = {
  iss: process.env.API_KEY, //your API KEY
  exp: new Date().getTime() + 5000,
};
const token = jwt.sign(payload, process.env.API_SECRET); //your API SECRET HERE

async function createMeeting(email) {
  
};

router.get('/pt/:id', function(req,res) {
  var query = "select * from doctor_appointment where pt_id = ?";
  var params = req.params.id;
  connection.query(query, params, function(err, result) {
    if (err) throw err;
    res.send(result);
  });
});

router.get('/sched/:id', function(req,res) {
  var query = "select * from doctor_appointment where sched_id = ?";
  var params = req.params.id;
  connection.query(query, params, function(err, result) {
    if (err) throw err;
    res.send(result);
  });
});

router.get('/time/:id', function(req, res) {
  var query = "select * from appt_hour where time_id = ?";
  if (req.params.id == 0) query = "select * from appt_hour";
  connection.query(query, req.params.id, function(err, result) {
    if (err) throw err;
    res.send(result);
  });
});

router.post('/api/create', verifyToken, function(req, res) {
  var appt_query = 'call sp_doctor_appointment(?,?,?,?)';
  var appt_params = [req.body.pt_id, req.body.doc_id, req.body.sched_id, req.body.hour_id];
  connection.query(appt_query, appt_params, function(err, result) {
    if (err) {
      throw err;
      return;
    }
    console.log(result);
    res.send(result)
    
    if (result[0][0]?.error_message != null) 
    {
      res.send(result)
      return;
    }

    var appt_id = result[0][0]?.id;

    var biz_email, biz_name, appt_day, appt_hour;
    var doc_query = 'call sp_appt_info(?)';
    connection.query(doc_query, appt_id, async function(err, result) {
      if(err) {
        throw err;
        return;
      }
      biz_name = result[0][0].business_name;
      biz_email = result[0][0].email;
      appt_day = result[0][0].workday;
      appt_hour = result[0][0].appt_hour;

      var options = {
        method: "POST",
        uri: "https://api.zoom.us/v2/users/" + app_email + "/meetings",
        body: {
          topic: "Zoom Meeting", //meeting title
          type: 1,
          settings: {
            host_video: "true",
            participant_video: "true",
          },
        },
        auth: {
          bearer: token,
        },
        headers: {
          "User-Agent": "Zoom-api-Jwt-Request",
          "content-type": "application/json",
        },
        json: true, //Parse the JSON string in the response
      };
    
      requestPromise(options)
        .then(function (response) {
          console.log(response.start_url);
          var meeting_url = response.start_url;

          var update_query = "update doctor_appointment set meeting_url = ? where id = ?";
          var update_params = [meeting_url, appt_id];
          connection.query(update_query, update_params, function(err, result) {
            if(err) throw err;
          });

          var pt_email;
          var pt_query = 'call sp_patient_email(?)';
          connection.query(pt_query, req.body.pt_id, function(err, result) {
            if (err) throw err;
            pt_email = result[0][0].email;

            var mailOptions = { 
              from: 'noreply@domain.com',
              to: [pt_email, biz_email].join(', '), 
              subject: 'Xác nhận đặt lịch thành công',
              text: 'Confirmation Notice',
              html: '<p>Xác nhận đặt lịch khám thành công</b>' 
                + '<ul><li>Phòng khám: ' + biz_name + '</li><li>Email: ' + biz_email 
                + '</li><li>Link: ' + meeting_url + '</li>' 
                + '<li>Thời gian: ' + appt_hour + ' Ngày: ' + appt_day + '</li></ul>'
            }
            transporter.sendMail(mailOptions, function(err, result){
                if (err) {
                    console.log(err);
                } else {
                    console.log('Message sent: ' +  result.response);
                }
            });
          });
        })
        .catch(function (err) {
          console.log("API call failed, reason ", err);
        });
    });
  });
});

router.post("/api/delete/:appt_id", verifyToken, function(req, res) {
  var query = 'call sp_cancel_appointment(?)';
  var params = req.params.appt_id;
  connection.query(query, params, function(err, result) {
    if (err) throw err;

    var pt_id = result[0][0].pt_id;
    var sched_id = result[0][0].sched_id;
    var pt_query = "call sp_patient_email(?)";
    connection.query(pt_query, pt_id, function(err, pt_result) {
      if (err) throw err;
      
      var pt_email = pt_result[0][0].user_email;
      var appt_query = "call sp_appt_info(?)";
      connection.query(appt_query, sched_id, function(err, appt_result) {
        if (err) throw err;

        var biz_name = appt_result[0][0]?.business_name;
        var biz_email = appt_result[0][0]?.email;
        var appt_day = appt_result[0][0]?.workday;
        var appt_hour = appt_result[0][0]?.appt_hour;

        var mailOptions = { 
          from: 'noreply@domain.com',
          to: [pt_email, biz_email].join(', '), 
          subject: 'Thông báo hủy lịch khám',
          text: 'Cancellation Notice',
          html: '<p>Thông báo hủy lịch khám</b>' 
            + '<ul><li>Phòng khám: ' + biz_name + '</li><li>Email: ' + biz_email 
            + '</li><li>Thời gian: ' + appt_hour + ' Ngày: ' + appt_day + '</li></ul>'
        }
        transporter.sendMail(mailOptions, function(err, result){
            if (err) {
                console.log(err);
            } else {
                console.log('Message sent: ' +  result.response);
            }
        });
      });
    });

    res.send("Success");
  });
});

router.post("/:id/diagnose", verifyToken, function(req, res) {
  var query =  "call sp_diagnose(?, ?, ?, ?)";
  var params = [req.params.id, req.body.appt, req.body.pres, req.body.diagnosis];
  connection.query(query, params, function(err, result) {
    if (err) throw err;
    res.send(result);
  });
});

module.exports = router;