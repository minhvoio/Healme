var nodemailer =  require('nodemailer'); 

var importer = nodemailer.createTransport({ // config mail server
    service: 'Gmail',
    auth: {
        user: 'healme.vn@gmail.com',
        pass: 'ung-HTN0teq*auz.nkt'
    }
});

module.exports = importer;