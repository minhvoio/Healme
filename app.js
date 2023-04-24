var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var patientRouter = require("./routes/patient");
var clinicRouter = require("./routes/clinic");
var pharmacyRouter = require("./routes/pharmacy");
var businessRouter = require("./routes/business");

var areaRouter = require("./routes/area");
var apptRouter = require("./routes/appt");

var medicineRouter = require("./routes/medicine");
var scheduleRouter = require("./routes/schedule");
var searchRouter = require("./routes/search");
var prescriptionRouter = require("./routes/prescription");
var mapRouter = require("./routes/map");
var chatbotRouter = require("./routes/chatbot");
var callRouter = require("./routes/call");

const { config } = require("process");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/patient", patientRouter);
app.use("/clinic", clinicRouter);
app.use("/pharmacy", pharmacyRouter);
app.use("/area", areaRouter);
app.use("/appt", apptRouter);
app.use("/medicine", medicineRouter);
app.use("/schedule", scheduleRouter);
app.use("/prescription", prescriptionRouter);
app.use("/search", searchRouter);
app.use("/map", mapRouter);
app.use("/chatbot", chatbotRouter);
app.use("/business", businessRouter);
app.use("/call", callRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
