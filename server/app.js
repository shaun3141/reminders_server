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
  // console.log(req.body);

  const payload = req.body;

  const currentUser =
    payload.base.collaboratorsById[payload.base.currentUserId];

  const recordOwner = payload.record[payload.config.ownerField];
  const recipients = Array.isArray(recordOwner) ? recordOwner : [recordOwner];

  const recordSubject = payload.record[payload.config.subjectField];

  let text = `Hello ${(recipients.length &&
    recipients.name &&
    recipients.name.split()[0]) ||
    'there'},\n\n`;
  text += `This is a reminder sent from the "${payload.base.name}" AirTable regarding...`;

  const msg = {
    to: recipients.map(_ => _.email),
    from: 'shaun@snooze-bot.com',
    subject: `[${payload.base.name}] ${
      currentUser.name.split()[0]
    } is reminding you of "${recordSubject}"`,
    text: text,
    html: makeHtml(payload)

    // templateId: process.env.SENDGRID_TEMPLATE_ON_ERROR,
    // dynamic_template_data: {
    //   action_text: 're-open a conversation for you',
    //   error_text:
    //     'User is no longer authenticated to SnoozeBot, please re-connect SnoozeBot to Help Scout in Help Scout',
    //   helpscout_link: `https://secure.helpscout.net/conversation/${snooze.id}/`
    // }
  };

  try {
    sgMail.send(msg);
    res.status(200).send('Success');
  } catch (e) {
    console.error(e);
    res.status(500).send('Server hit error sending email');
  }
});

//

// helpscout.addConversationTag("326808", "883799877", "snoozing");
// helpscout.removeConversationTag("326808", "883799877", "snoozing");

// Test duration -> text conversion
// console.log(moment.duration(-10, "seconds").humanize());

app.listen(process.env.PORT || 8082);
console.log('Server running on http://localhost:' + (process.env.PORT || 8082));

let makeHtml = function(payload) {
  const currentUser =
    payload.base.collaboratorsById[payload.base.currentUserId];

  const recordSubject = payload.record[payload.config.subjectField];
  const recordOwner = payload.record[payload.config.ownerField];
  const recordSummary = payload.record[payload.config.summaryField];
  const recordDueDate = payload.record[payload.config.dueDateField];

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html style="width:100%;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;">
   <head> 
    <meta charset="UTF-8"> 
    <meta content="width=device-width, initial-scale=1" name="viewport"> 
    <meta name="x-apple-disable-message-reformatting"> 
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
    <meta content="telephone=no" name="format-detection"> 
    <title>AirRemind</title> 
    <!--[if (mso 16)]>
      <style type="text/css">
      a {text-decoration: none;}
      </style>
      <![endif]--> 
    <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> 
    <!--[if !mso]><!-- --> 
    <link href="https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i" rel="stylesheet"> 
    <!--<![endif]--> 
    <style type="text/css">
  @media only screen and (max-width:600px) {p, ul li, ol li, a { font-size:16px!important; line-height:150%!important } h1 { font-size:30px!important; text-align:center; line-height:120% } h2 { font-size:26px!important; text-align:center; line-height:120% } h3 { font-size:20px!important; text-align:center; line-height:120% } h1 a { font-size:30px!important } h2 a { font-size:26px!important } h3 a { font-size:20px!important } .es-menu td a { font-size:16px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button { font-size:20px!important; display:block!important; border-width:10px 0px 10px 0px!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } .es-desk-menu-hidden { display:table-cell!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }
  #outlook a {
    padding:0;
  }
  .ExternalClass {
    width:100%;
  }
  .ExternalClass,
  .ExternalClass p,
  .ExternalClass span,
  .ExternalClass font,
  .ExternalClass td,
  .ExternalClass div {
    line-height:100%;
  }
  .es-button {
    mso-style-priority:100!important;
    text-decoration:none!important;
  }
  a[x-apple-data-detectors] {
    color:inherit!important;
    text-decoration:none!important;
    font-size:inherit!important;
    font-family:inherit!important;
    font-weight:inherit!important;
    line-height:inherit!important;
  }
  .es-desk-hidden {
    display:none;
    float:left;
    overflow:hidden;
    width:0;
    max-height:0;
    line-height:0;
    mso-hide:all;
  }
  </style> 
   </head> 
   <body style="width:100%;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;"> 
    <div class="es-wrapper-color" style="background-color:#F6F6F6;"> 
     <!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
          <v:fill type="tile" color="#f6f6f6"></v:fill>
        </v:background>
      <![endif]--> 
     <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;"> 
       <tr style="border-collapse:collapse;"> 
        <td valign="top" style="padding:0;Margin:0;"> 
         <table class="es-header" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top;"> 
           <tr style="border-collapse:collapse;"> 
            <td align="center" style="padding:0;Margin:0;"> 
             <table class="es-header-body" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;"> 
               <tr style="border-collapse:collapse;"> 
                <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;"> 
                 <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                   <tr style="border-collapse:collapse;"> 
                    <td width="560" align="center" valign="top" style="padding:0;Margin:0;"> 
                     <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                       <tr style="border-collapse:collapse;"> 
                        <td align="center" style="padding:0;Margin:0;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:18px;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:27px;color:#333333;">${
                          currentUser.name.split()[0]
                        } wanted to remind you...</p></td> 
                       </tr> 
                     </table></td> 
                   </tr> 
                 </table></td> 
               </tr> 
             </table></td> 
           </tr> 
         </table> 
         <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;"> 
           <tr style="border-collapse:collapse;"> 
            <td align="center" style="padding:0;Margin:0;"> 
             <table class="es-content-body" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;"> 
               <tr style="border-collapse:collapse;"> 
                <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;"> 
                 <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                   <tr style="border-collapse:collapse;"> 
                    <td width="560" valign="top" align="center" style="padding:0;Margin:0;"> 
                     <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                       <tr style="border-collapse:collapse;"> 
                        <td align="left" style="padding:25px;Margin:0;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#333333;"><strong>Subject: </strong>${recordSubject}</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#333333;"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#333333;"><strong>Owner:</strong> ${
    recordOwner.name
  } (that's you!)</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#333333;"><br><strong>Due Date: </strong>${recordDueDate} (6 days from now)</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#333333;"><br><strong>Summary:</strong> ${recordSummary}<br><br></p></td> 
                       </tr> 
                     </table></td> 
                   </tr> 
                 </table></td> 
               </tr> 
               <tr style="border-collapse:collapse;"> 
                <td align="left" style="padding:0;Margin:0;"> 
                 <!--[if mso]><table width="600" cellpadding="0" cellspacing="0"><tr><td width="160" valign="top"><![endif]--> 
                 <table cellpadding="0" cellspacing="0" class="es-left" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left;"> 
                   <tr style="border-collapse:collapse;"> 
                    <td width="140" class="es-m-p0r es-m-p20b" align="center" style="padding:0;Margin:0;"> 
                     <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                       <tr style="border-collapse:collapse;"> 
                        <td align="center" style="padding:0;Margin:0;display:none;"></td> 
                       </tr> 
                     </table></td> 
                    <td class="es-hidden" width="20" style="padding:0;Margin:0;"></td> 
                   </tr> 
                 </table> 
                 <!--[if mso]></td><td width="280" valign="top"><![endif]--> 
                 <table cellpadding="0" cellspacing="0" class="es-left" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left;"> 
                   <tr style="border-collapse:collapse;"> 
                    <td width="280" class="es-m-p20b" align="center" style="padding:0;Margin:0;"> 
                     <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                       <tr style="border-collapse:collapse;"> 
                        <td align="center" style="padding:10px;Margin:0;"><span class="es-button-border" style="border-style:solid;border-color:#35C5F8;background:#25B5F8;border-width:0px 0px 2px 0px;display:inline-block;border-radius:30px;width:auto;"><a href="https://airtable.com" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:18px;color:#FFFFFF;border-style:solid;border-color:#25B5F8;border-width:10px 20px 10px 20px;display:inline-block;background:#25B5F8;border-radius:30px;font-weight:normal;font-style:normal;line-height:22px;width:auto;text-align:center;">Update in AirTable</a></span></td> 
                       </tr> 
                     </table></td> 
                   </tr> 
                 </table> 
                 <!--[if mso]></td><td width="20"></td><td width="140" valign="top"><![endif]--> 
                 <table cellpadding="0" cellspacing="0" class="es-right" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right;"> 
                   <tr style="border-collapse:collapse;"> 
                    <td width="140" align="center" style="padding:0;Margin:0;"> 
                     <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                       <tr style="border-collapse:collapse;"> 
                        <td align="center" style="padding:0;Margin:0;display:none;"></td> 
                       </tr> 
                     </table></td> 
                   </tr> 
                 </table> 
                 <!--[if mso]></td></tr></table><![endif]--></td> 
               </tr> 
             </table></td> 
           </tr> 
         </table> 
         <table class="es-footer" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top;"> 
           <tr style="border-collapse:collapse;"> 
            <td align="center" style="padding:0;Margin:0;"> 
             <table class="es-footer-body" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;"> 
               <tr style="border-collapse:collapse;"> 
                <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;"> 
                 <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                   <tr style="border-collapse:collapse;"> 
                    <td width="560" align="center" valign="top" style="padding:0;Margin:0;"> 
                     <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                       <tr style="border-collapse:collapse;"> 
                        <td align="center" style="padding:0;Margin:0;display:none;"></td> 
                       </tr> 
                     </table></td> 
                   </tr> 
                 </table></td> 
               </tr> 
             </table></td> 
           </tr> 
         </table></td> 
       </tr> 
     </table> 
    </div>  
   </body>
  </html>`;
};
