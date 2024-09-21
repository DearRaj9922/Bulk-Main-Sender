const express = require('express');
const AWS = require('aws-sdk');
const fs = require('fs');
const app = express();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1',
});

const ses = new AWS.SES();
app.use(express.json());

// Load user data from JSON file
const loadUserData = () => {
    const data = fs.readFileSync('src/userdata.json');
    return JSON.parse(data);
};

const sendBulkEmails = async (recipients, subject, body) => {
    const params = {
        Source: "tech@thomso.in",
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

const createEmailBody = (name, thomsoId) => {
    return `
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Thomso'24 Invitation</title>
        </head>
        <body style='font-family: Arial, sans-serif; color: #333line-height:0.4;'>
            <div style='padding: 20px; max-width: 700px; margin: auto; border: 1px solid #ddd;'>
                <div>
                    <img src='https://i.postimg.cc/FHQz7vGW/thomsoimg.png' alt='IIT Roorkee Image' style='max-width: 50%; height: auto;'>
                </div>
                <br/>
                <div style='line-height:0.4;'>
                <p>Dear <b color:blue>${name}</b></p>
               <br/>
                <p>Your Payment is successfully done!</p>
                
                <br/>
                
                <p>Amount: <b style="color:blue;">3179</b></p>
                <p>Accommodation: <b style="color:blue;">True</b></p>
                <p>Thomso Id: <b style="color:blue;">${thomsoId}</b></p>
                <br/>
                
               
                
               
                <br/>
                <p>Download your ID card here:</p>
                <a href='https://thomso.in/#/id_card'>https://thomso.in/#/id_card</a>
                <p>    </p>
                <br/>
                
                <p>Follow our Instagram page for more info <a href='https://www.instagram.com/thomso.iitr/'>Click here</a>.</p>
                
                <br/>
                
                <p>Best regards,</p>
                <p>Team Thomso</p>
                </div>
                
            </div>
        </body>
        </html>
    `;
};
app.use(express.json())
// Endpoint to trigger mass email
app.post('/', async (req, res) => {
    const users = loadUserData();
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const batchSize = 50; 
    const totalRecipients = users.length;
    const numBatches = Math.ceil(totalRecipients / batchSize);

    for (let i = 0; i < numBatches; i++) {
        const batchRecipients = users.slice(i * batchSize, (i + 1) * batchSize);
        const emails = batchRecipients.map(user => user.email);
        const emailPromises = batchRecipients.map(user => {
            const subject = "Welcome to Thomso'24";
            const body = createEmailBody(user.name, user.thomsoId);
            return sendBulkEmails([user.email], subject, body);
        });

        try {
            await Promise.all(emailPromises);
            console.log(`Batch ${i + 1} sent successfully`);
            await delay(5000); // 0.5 seconds delay
        } catch (error) {
            res.status(500).send('Error sending emails');
            return;
        }
    }

    res.send("Emails sent successfully");
});

// Start the Express server
app.listen(3000, () => console.log('Server running on port 3000'));
