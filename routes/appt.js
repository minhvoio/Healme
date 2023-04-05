const express = require("express");
const router = express.Router();
const requestPromise = require("request-promise");
const jwt = require("jsonwebtoken");
const connection = require('../models/dbconfig');
const transporter = require('../models/mailer');
const app_email = 'lenamthaisonts@gmail.com';
const { route } = require(".");
require("dotenv").config();

const payload = {
  iss: process.env.API_KEY, //your API KEY
  exp: new Date().getTime() + 5000,
};
const token = jwt.sign(payload, process.env.API_SECRET); //your API SECRET HERE

async function createMeeting(email) {
  
};

router.post('/api/create', function(req, res) {
  var appt_query = 'call sp_doctor_appointment(?,?,?)';
  var appt_params = [req.body.pt_id, req.body.sched_id, req.body.hour_id];
  connection.query(appt_query, appt_params, function(err, result) {
    if (err) {
      throw err;
      return;
    }
    console.log(result);
    
    if (result[0][0].error_message != null) 
    {
      res.send(result[0][0].error_message)
      return;
    }

    var biz_email, biz_name, appt_day, appt_hour;
    var doc_query = 'call sp_appt_info(?)';
    connection.query(doc_query, req.body.sched_id, async function(err, result) {
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

          var pt_email;
          var pt_query = 'call sp_patient_email(?)';
          connection.query(pt_query, req.body.pt_id, function(err, result) {
            if (err) throw err;
            pt_email = result[0][0].user_email;

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
      res.send()
    });
  });
});

module.exports = router;