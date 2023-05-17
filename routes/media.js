var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
var connection = require("../models/dbconfig");

const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('image');
const { BlockBlobClient } = require('@azure/storage-blob');
const getStream = require('into-stream');

const containerName = 'images';;
const imageUrl = 'https://healme.blob.core.windows.net/images/';

const getBlobName = originalName => {
  return `image-${Date.now()}` + path.extname(originalName);
};

router.get('/', function(req, res){
  res.sendFile(__dirname + '/media.html')
})

router.post('/upload/photo', uploadStrategy, function(req, res) {
  if (!req.file) return res.send('No file was uploaded');

  console.log(req.file.filename);
  
  const blobName = getBlobName(req.file.originalname);
  const imageSrc = imageUrl + blobName;
  const blobService = new BlockBlobClient(process.env.AZURE_STORAGE_CONNECTION_STRING, containerName, blobName);
  const stream = getStream(req.file.buffer);
  const streamLength = req.file.buffer.length;

  blobService.uploadStream(stream, streamLength)
    .then(() => {
      console.log('File uploaded to Azure Blob storage:', blobName);
    })
    .catch((err) => { 
      if (err) return res.send(err); 
    });

  var query = "call sp_add_media(?, ?, ?, null)";
  var params = [req.body?.business_id, imageSrc, 2];
  connection.query(query, params, (err, result) => {
    if (err)  return res.send(err);
    return res.send(result);
  });
});

router.post('/upload/certificate', uploadStrategy, function(req, res) {
  if (!req.file) return res.send('No file was uploaded');

  console.log(req.file.filename);
  
  const blobName = getBlobName(req.file.originalname);
  const imageSrc = imageUrl + blobName;
  const blobService = new BlockBlobClient(process.env.AZURE_STORAGE_CONNECTION_STRING, containerName, blobName);
  const stream = getStream(req.file.buffer);
  const streamLength = req.file.buffer.length;

  blobService.uploadStream(stream, streamLength)
    .then(() => {
      console.log('File uploaded to Azure Blob storage:', blobName);
    })
    .catch((err) => { 
      if (err) return res.send(err); 
    });

  var query = "call sp_add_media(?, ?, ?, ?)";
  var params = [req.body?.business_id, imageSrc, 3, req.body?.expiration_date];
  connection.query(query, params, (err, result) => {
    if (err)  return res.send(err);
    return res.send(result);
  });
});

router.post('/upload/logo', uploadStrategy, function(req, res) {
  if (!req.file) return res.send('No file was uploaded');

  console.log(req.file.filename);

  const blobName = getBlobName(req.file.originalname);
  const imageSrc = imageUrl + blobName;
  const blobService = new BlockBlobClient(process.env.AZURE_STORAGE_CONNECTION_STRING, containerName, blobName);
  const stream = getStream(req.file.buffer);
  const streamLength = req.file.buffer.length;

  blobService.uploadStream(stream, streamLength)
    .then(() => {
      console.log('File uploaded to Azure Blob storage:', blobName);
    })
    .catch((err) => {
      if (err) return res.send(err); 
    });

  var query = "call sp_add_media(?, ?, ?, null)";
  var params = [req.body?.business_id, imageSrc, 1];
  connection.query(query, params, (err, result) => {
    if (err)  return res.send(err);
    return res.send(result);
  });
});

module.exports = router;