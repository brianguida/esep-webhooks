exports.handler = async (event) => {
    console.log("Event received from GitHub:", JSON.stringify(event, null, 2));

    // Example response for GitHub webhook events
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Webhook received successfully!' })
    };
};
