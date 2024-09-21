const express = require('express');
const AWS = require('aws-sdk');
const app = express();
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1',
});
const ses = new AWS.SES();
const sendBulkEmails = async (recipients, subject, body) => {
    const params = {
        Source: "info@thomso.in",
        Destination: {
            ToAddresses: recipients,
        },
        Message: {
            Body: {
                Html: {
                    Data: body,
                },
            },
            Subject: {
                Data: subject,
            },
        },
    };

    try {
        await ses.sendEmail(params).promise();
        console.log('Emails sent successfully!');
    } catch (error) {
        console.error('Error sending emails:', error);
    }
};
const html = "<!DOCTYPE html>\n" +
    "<html lang='en'>\n" +
    "<head>\n" +
    "    <meta charset='UTF-8'>\n" +
    "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>\n" +
    "    <title>Thomso'23 Invitation</title>\n" +
    "</head>\n" +
    "<body style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>\n" +

    "\n" +
    "    <div style='padding: 20px; max-width: 700px; margin: auto; border: 1px solid #ddd;'>\n" +
    "    <div>\n" +
    "        <img src='https://i.postimg.cc/wvKJWRhn/thomsoimg.png' alt='IIT Roorkee Image' style='max-width: 100%; height: auto;'>\n" +
    "    </div>\n" +
    "        <h2>Dear <b color:blue>Ananya Chaudhary</b></h2>\n" +
    "\n" +
    "        <p>\n" +
    "        Your Paymnet is successfully done!\n"+
    "        </p>\n" +
    "\n" +
    "        <p>Amount:<b color:blue >3179</b></p>\n" +
    "\n" +
    "        <p>Accomodation:<b color:blue>True</b></p>\n" +
    "        <p>Thomso Id:<b color:blue>Th-2406296</b></p>\n" +

    "\n" +
    "        <p>Download your Id card here:</p>\n" + 
    "        <p><a href='thomso.in/#/id_card'>https://thomso.in/#/id_card</a></p>\n" + 
    "\n" +
    "        <p>Follow our instagram page for more info <a href='https://www.instagram.com/thomso.iitr/'>Click here</a></strong>.</p>\n" +
    "\n" +
    "        <p>Best regards,</p>" +
    "        <p>Team Thomso</p>\n" +
    "    </div>\n" +
    "</body>\n" +
    "</html>\n"
app.use(express.json())
// Endpoint to trigger mass email
app.post('/', async (req, res) => {
    const data =  'draj56227@gmail.com'
    const recipients = data.split('\n')
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const batchSize = 50; // Maximum allowed by AWS SES
    const totalRecipients = recipients.length;
    const numBatches = Math.ceil(totalRecipients / batchSize);
    console.log(numBatches)
    // for (let i = 415; i < numBatches; i++) {
    //     const batchRecipients = recipients.slice(i * batchSize, (i + 1) * batchSize);
        const subject = "Welcome to Thomso'24"
        const body = html;
        try {
            await sendBulkEmails(recipients, subject, body);
            // console.log('Batch ',i+1," Done", "Starting from ",batchRecipients[0]," to ",batchRecipients[batchRecipients.length-1]);
            // console.log('waiting')
            await delay(5000);
        } catch (error) {
            res.status(500).send('Error sending emails');
        }

    // }
        res.send("emails send successfully")
        // const recipients = ['keshav_g1@ce.iitr.ac.in']

});

// Start the Express server
app.listen(3000, () => console.log('Server running on port 3000'));