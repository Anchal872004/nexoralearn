const { SessionsClient } = require('@google-cloud/dialogflow'); // ✅ correct import

const projectId = 'nexoralearnchatbot-klek';
const sessionId = 'session123';
const text = 'hello';

// Create session client
const sessionClient = new SessionsClient({
  keyFilename: 'C:\\Users\\aanchal\\Downloads\\nexoralearnchatbot-klek-a1a220697f95.json'
});

// Create session path
const sessionPath = sessionClient.projectAgentSessionPath(
  projectId,
  sessionId
);

// Request object
const request = {
  session: sessionPath,
  queryInput: {
    text: {
      text: text,
      languageCode: 'en-US',
    },
  },
};

// Detect intent
async function run() {
  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    console.log('User Query:', text);
    console.log('Bot Reply:', result.fulfillmentText);
  } catch (err) {
    console.error('ERROR:', err);
  }
}

run();