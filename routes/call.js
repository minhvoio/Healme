var express = require("express");
var router = express.Router();

const { google } = require("googleapis");

const YOUR_CLIENT_ID =
  "1087827160444-kaiddg72l726t47vsf9jgbh8bkodm88i.apps.googleusercontent.com";
const YOUR_CLIENT_SECRET = "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";

const YOUR_REDIRECT_URL =
  "https://healme.azurewebsites.net/call/googleCallBack";

const oauth2Client = new google.auth.OAuth2(
  YOUR_CLIENT_ID,
  YOUR_CLIENT_SECRET,
  YOUR_REDIRECT_URL
);

const scopes = ["https://www.googleapis.com/auth/calendar.events"];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
});

console.log(authUrl);

const handleGoogleCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const eventStartTime = new Date();
    eventStartTime.setDate(eventStartTime.getDate() + 1);
    eventStartTime.setHours(10);
    eventStartTime.setMinutes(0);

    const eventEndTime = new Date();
    eventEndTime.setDate(eventEndTime.getDate() + 1);
    eventEndTime.setHours(11);
    eventEndTime.setMinutes(0);

    const event = {
      summary: "My Meeting",
      location: "Online",
      description: "A description of my meeting",
      start: {
        dateTime: eventStartTime.toISOString(),
        timeZone: "Asia/Ho_Chi_Minh",
      },
      end: {
        dateTime: eventEndTime.toISOString(),
        timeZone: "Asia/Ho_Chi_Minh",
      },
      conferenceData: {
        createRequest: {
          requestId: "1234567890",
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
          status: {
            statusCode: "success",
          },
        },
      },
      reminders: {
        useDefault: true,
      },
    };

    calendar.events.insert(
      {
        calendarId: "primary",
        resource: event,
        sendUpdates: "all",
      },
      (err, res) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`Event created: ${res.data.htmlLink}`);
      }
    );
    // rest of your code
  } catch (err) {
    console.error(err);
  }
};

/* GET call page. */
router.get("/", function (req, res, next) {
  res.render("call", { authUrl: authUrl });
});

router.get("/googleCallBack", handleGoogleCallback, function (req, res, next) {
  res.send("Google Call Back");
});

module.exports = router;
