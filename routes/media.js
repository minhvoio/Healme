var express = require('express')
var router = express.Router();
const multer = require('multer');
const path = require('path');
var connection = require("../models/dbconfig");

var storage = multer.diskStorage({
  destination: function (req, file, callBack) {
    callBack(null, 'public/images')
  },
  filename: function (req, file, callBack) {
    callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})
 
var upload = multer({ 
  storage: storage 
})

router.get('/', function(req, res){
  res.sendFile(__dirname + '/media.html')
})

router.post('/upload/photo', upload.single('image'), function(req, res) {
  if (!req.file) return res.send('No file was uploaded');

  console.log(req.file.filename)
  var image_url = 'https://healme.azurewebsites.net/images/' + req.file.filename;
  var query = "call sp_add_media(?, ?, ?, null)";
  var params = [req.body?.business_id, image_url, 2];

  connection.query(query, params, (err, result) => {
    if (err)  return res.send(err);
    res.send(result);
  });
});

router.post('/upload/certificate', upload.single('image'), function(req, res) {
  if (!req.file) return res.send('No file was uploaded');

  console.log(req.file.filename)
  var image_url = 'https://healme.azurewebsites.net/images/' + req.file.filename;
  var query = "call sp_add_media(?, ?, ?, ?)";
  var params = [req.body?.business_id, image_url, 3, req.body?.expiration_date];
  connection.query(query, params, (err, result) => {
    if (err)  return res.send(err);
    res.send(result);
  });
});

module.exports = router;