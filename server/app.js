const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

app.use(express.static(path.join(__dirname, './../web/')));

app.post('/ping', (req, res) => {
  res.status(200).send('Pong');
});

app.post('/send_reminder', (req, res) => {
  const payload = req.body;

  const currentUser =
    payload.base.collaboratorsById[payload.base.currentUserId];

  const config = payload.config[payload.viewId];

  const recordOwner = payload.record[config.ownerField];
  const recipients = Array.isArray(recordOwner) ? recordOwner : [recordOwner];
  console.log(recipients);

  const recordSubject = payload.record[config.subjectField];

  let text = `Hello ${(recipients.length &&
    recipients.name &&
    recipients.name.split()[0]) ||
    'there'},\n\n`;
  text += `This is a reminder sent from the "${payload.base.name}" AirTable regarding...`;

  const msg = {
    to: recipients.map(_ => _.email),
    from: 'AirRemind<support@snooze-bot.com>',
    subject: `[${payload.base.name}] ${
      currentUser.name.split()[0]
    } is reminding you of "${recordSubject}"`,
    text: text,
    html: makeHtml(payload, config, recipients)
  };

  try {
    sgMail.send(msg);
    res.status(200).send('Success');
  } catch (e) {
    console.error(e);
    res.status(500).send('Server hit error sending email');
  }
});

// Test duration -> text conversion
// console.log(moment.duration(-10, "seconds").humanize());

app.listen(process.env.PORT || 8082);
console.log('Server running on http://localhost:' + (process.env.PORT || 8082));

let makeHtml = function(payload, config, recipients) {
  const currentUser =
    payload.base.collaboratorsById[payload.base.currentUserId];
  const tableId = payload.tableId;
  const recordId = payload.recordId;
  const message = payload.message;
  const recordSubject = payload.record[config.subjectField];
  const recordDetails = payload.record[config.detailsField];
  const recordDueDate = payload.record[config.dueDateField];

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html
    style="width:100%;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;"
  >
    <head>
      <meta charset="UTF-8" />
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <meta name="x-apple-disable-message-reformatting" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta content="telephone=no" name="format-detection" />
      <title>AirRemind</title>
    </head>
    <body
      style="width:100%;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;"
    >
      <div style="width: 100%; text-align: center; font-size: 1.3em">
        <div
          style="background-color: #fafafa;
      display: inline-block;
      padding: 10px;
      border-radius: 5px;
      margin: 10px;
      text-align: left;
      max-width: 500px;
      border: solid 1px #eee;"
        >
          <div style="padding-top: 10px"></div>
          <div style="padding-left: 10px;">Hey Shaun,</div>
          <div style="padding-top: 10px"></div>
          <div style="padding-left: 10px;">
            ${currentUser.name.split()[0]} wanted to remind you...
          </div>

          ${
            message
              ? `
              <div style="padding-top: 25px"></div>
              <div style="padding-left: 10px; font-style: italic;">
                ${message}
              </div>
              <div style="padding-top: 25px"></div>
              `
              : ''
          }
          
          <div style="padding-left: 10px;">
            <b>Subject: </b>${recordSubject}
          </div>

          ${
            recordDetails
              ? `
              <div style="padding-top: 7px"></div>
              <div style="padding-left: 10px;">
                <b>Details: </b>${recordDetails} (4 days ago)
              </div>
              `
              : ''
          }

          <div style="padding-top: 7px"></div>
          <div style="padding-left: 10px;">
            <b>Owner: </b>${recipients.map(_ => _.name).join()} (that's you!)
          </div>

          ${
            recordDueDate
              ? `
              <div style="padding-top: 7px"></div>
              <div style="padding-left: 10px;">
                <b>Due Date: </b>${
                  'June 30th, 2020' /*recordDueDate */
                } (4 days ago)
              </div>
              `
              : ''
          }

          <div style="text-align: center;">
            <a href="https://airtable.com/${tableId}/${recordId}">
              <div
                style="margin-top: 20px;
              padding: 10px 20px;
              background-color: #03AADB;
              color: white;
              display: inline-block;
              border-radius: 15px;
              font-weight: bold;
              font-size: 1.2em;
              cursor: pointer;
              border: solid 2px #039ACB;
              box-shadow: 1px 1px 5px 1px rgba(136,136,136,1);"
              >
                Update in Airtable
              </div>
            </a>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
};
