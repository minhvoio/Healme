const mysql = require("mysql");
const { connect } = require("../routes");
const fs = require("fs");
// const connection = mysql.createPool({
//     host: "127.0.0.1",
//     user: "root",
//     password: "tfb6zna1hnt_ezb9KWE",
//     database: "healthcare"
//   });

var connection = mysql.createConnection({
  host: "healme-be.mysql.database.azure.com",
  user: "healme",
  password: "wym!fxg-rev0nyk-DFC",
  database: "healthcare",
  port: 3306,
  ssl: { ca: fs.readFileSync("SSL/DigiCertGlobalRootCA.crt.pem") },
  multipleStatements: true
});

module.exports = connection;
