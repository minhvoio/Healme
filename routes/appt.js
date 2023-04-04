const express = require("express");
const router = express.Router();
const requestPromise = require("request-promise");
const jwt = require("jsonwebtoken");
const connection = require('../models/dbconfig');
const transporter = require('../models/mailer');
const { route } = require(".");
require("dotenv").config();

const payload = {
  iss: process.env.API_KEY, //your API KEY
  exp: new Date().getTime() + 5000,
};
const token = jwt.sign(payload, process.env.API_SECRET); //your API SECRET HERE

function createMeeting(email) {
  var meeting_url;
  var options = {
    method: "POST",
    uri: "https://api.zoom.us/v2/users/" + email + "/meetings",
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
      console.log(response);
      meeting_url = response.start_url;
      return meeting_url;
    })
    .catch(function (err) {
      // API call failed...
      console.log("API call failed, reason ", err);
    });
};

route.post('/create', function(req, res) {
  var appt_query = 'call sp_doctor_appointment(?,?,?)';
  var appt_params = [req.body.pt_id, req.body.sched_id, req.body.hour_id];
  connection.query(appt_query, appt_params, function(err, result) {
    if (err) throw err;
    console.log(result);
    if (result.id == null) return;
  });

  var pt_email;
  var pt_query = 'call sp_patient_email(?)';
  connection.query(pt_query, req.pt_id, function(err, result) {
    if (err) throw err;
    pt_email = result.email;
  });

  var biz_email, biz_name, appt_day, appt_hour;
  var doc_query = 'call sp_appt_info(?)';
  connection.query(doc_query, req.body.sched_id, function(err, result) {
    if(err) throw err;
    biz_name = result.business_name;
    biz_email = result.email;
    appt_day = result.workday;
    appt_hour = result.appt_hour;
  });

  var meeting_url = createMeeting(biz_id);

  var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
    from: 'Heal Me',
    to: pt_email,
    subject: 'Xác nhận đặt lịch thành công',
    text: 'Confirmation Notice',
    html: '<p>Xác nhận đặt lịch khám thành công</b><ul><li>Phòng khám:' + biz_name + '</li><li>Email: ' + biz_email 
      + '</li><li>Thời gian: ' + appt_hour + ' Ngày ' + appt_day + '</li><li>Link Meeting: ' + meeting_url + '</li></ul>'
}
transporter.sendMail(mainOptions, function(err, result){
    if (err) {
        console.log(err);
    } else {
        console.log('Message sent: ' +  result.response);
    }
});
});

module.exports = router;