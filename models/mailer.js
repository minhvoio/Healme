var nodemailer =  require('nodemailer'); 

var importer = nodemailer.createTransport({ // config mail server
    service: 'Gmail',
    auth: {
        user: 'healme.vn',
        pass: 'dyqmfrwlwmfavqwz'
    }
});

module.exports = importer;