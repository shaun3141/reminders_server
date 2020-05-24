const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const db = require('./models/db.js');

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

app.use(express.static(path.join(__dirname, './../web/')));

app.post('/ping', (req, res) => {
  res.status(200).send('Pong');
});

app.post('/send_reminder', (req, res) => {
  console.log(req.body);
  res.status(200).send('Pong2');
});

// const msg = {
//   to: 'shaun.t.vanweelden@gmail.com',
//   from: 'shaun@snooze-bot.com',
//   templateId: process.env.SENDGRID_TEMPLATE_ON_ERROR,
//   dynamic_template_data: {
//     action_text: 're-open a conversation for you',
//     error_text: 'User is no longer authenticated to SnoozeBot, please re-connect SnoozeBot to Help Scout in Help Scout',
//     helpscout_link: `https://secure.helpscout.net/conversation/${snooze.id}/`,
//   },
// };

// sgMail.send(msg);

// helpscout.addConversationTag("326808", "883799877", "snoozing");
// helpscout.removeConversationTag("326808", "883799877", "snoozing");

// Test duration -> text conversion
// console.log(moment.duration(-10, "seconds").humanize());

app.listen(process.env.PORT || 8082);
console.log('Server running on http://localhost:' + (process.env.PORT || 8082));
