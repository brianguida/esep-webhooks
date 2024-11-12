const https = require('https');

exports.handler = async (event) => {
    console.log("Event received from GitHub:", JSON.stringify(event, null, 2));

    try {
        // Parse the event body (ensure it handles JSON payloads)
        const body = JSON.parse(event.body);

        // Extract the issue URL
        const issueUrl = body.issue && body.issue.html_url;

        if (!issueUrl) {
            console.error('No issue URL found in the event');
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid event structure' })
            };
        }

        // Construct the message payload for Slack
        const slackMessage = JSON.stringify({
            text: `Issue Created: ${issueUrl}`
        });

        // Get SLACK_URL from environment variables
        const slackUrl = process.env.SLACK_URL;

        if (!slackUrl) {
            throw new Error('SLACK_URL is not defined in environment variables');
        }

        // Send the message to Slack
        await sendSlackNotification(slackUrl, slackMessage);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Notification sent successfully!' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error processing webhook' })
        };
    }
};

const sendSlackNotification = (slackUrl, message) => {
    return new Promise((resolve, reject) => {
        const url = new URL(slackUrl);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(message)
            }
        };

        const req = https.request(options, (res) => {
            res.setEncoding('utf8');
            if (res.statusCode === 200) {
                resolve();
            } else {
                reject(new Error(`Failed with status code: ${res.statusCode}`));
            }
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(message);
        req.end();
    });
};
