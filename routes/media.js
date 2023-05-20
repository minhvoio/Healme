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

router.get('/', async function(req, res){
  res.sendFile(__dirname + '/media.html')
})

router.get('/get/id/:id', async function(req, res) {
  var query = 'call sp_get_media(?)';
  connection.query(query, req.params.id, async function(err, queryResult) {
    if (err) return res.send(err);
    if (queryResult[0][0]?.url != null) queryResult[0][0].url = imageUrl + queryResult[0][0].url;
    res.send(queryResult);
  });
});

router.post('/upload/photo', uploadStrategy, async function(req, res) {
  if (!req.file) return res.send('No file was uploaded');

  const blobName = getBlobName(req.file.originalname);
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
  var params = [req.body?.business_id, blobName, 2];
  connection.query(query, params, (err, result) => {
    if (err)  return res.send(err);
    return res.send(result);
  });
});

router.post('/upload/certificate', uploadStrategy, async function(req, res) {
  if (!req.file) return res.send('No file was uploaded');

  console.log(req.file.filename);
  
  const blobName = getBlobName(req.file.originalname);
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
  var params = [req.body?.business_id, blobName, 3, req.body?.expiration_date];
  connection.query(query, params, (err, result) => {
    if (err)  return res.send(err);
    return res.send(result);
  });
});

router.post('/upload/logo', uploadStrategy, async function(req, res) {
  if (!req.file) return res.send('No file was uploaded');

  const blobName = getBlobName(req.file.originalname);
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
  var params = [req.body?.business_id, blobName, 1];
  connection.query(query, params, (err, result) => {
    if (err)  return res.send(err);
    return res.send(result);
  });
});

router.post('/delete/id/:id', async function(req, res)
{
  var query = 'call sp_get_media(?)';
  connection.query(query, req.params.id, async function(err, result) {
    if (err) return res.send(err);

    var blobName = result[0][0]?.url;
    const blobService = new BlockBlobClient(process.env.AZURE_STORAGE_CONNECTION_STRING, containerName, blobName);
    const options = {
      deleteSnapshots: 'include' // or 'only'
    };

    await blobService.deleteIfExists(options);

    var deleteQuery = 'call sp_delete_media(?)';
    connection.query(deleteQuery, req.params.id, async function(err, deleteResult) {
      if (err) return res.send(err);
      console.log(`deleted blob ${blobName}`);
      res.send(result);
    });
  })
})

module.exports = router;