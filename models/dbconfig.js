const mysql = require('mysql');
const { connect } = require('../routes');

const connection = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "tfb6zna1hnt_ezb9KWE",
    database: "healthcare"
  });

module.exports = connection;