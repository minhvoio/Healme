const mysql = require('mysql');
const { connect } = require('../routes');

const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "ThaiSon-2001",
    database: "healthcare"
  });

module.exports = connection;