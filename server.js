const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const apiKey = 'AIzaSyD-noz4x6tsvd4mFgDl-rpP5jUsVZWrL18';
const videoId = 'F35VYg3Bkbk';

async function getLiveChatId(videoId, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.items.length === 0) {
      console.log('No live chat found for this video');
      return null;
    }

    return data.items[0].liveStreamingDetails.activeLiveChatId;
  } catch (err) {
    console.log('Error:', err);
    return null;
  }
}

async function getChatMessages(liveChatId, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/liveChat/messages?part=snippet,authorDetails&liveChatId=${liveChatId}&maxResults=2000&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const messages = data.items.map(item => item.snippet.displayMessage);

    return messages;
  } catch (err) {
    console.log('Error:', err);
    return null;
  }
}

async function main() {
  const liveChatId = await getLiveChatId(videoId, apiKey);
  if (liveChatId) {
    const messages = await getChatMessages(liveChatId, apiKey);
    const prompt = `Given these messages separated by ",", tell me the overall sentiment and context of the messages: ${messages.join(", ")}`;

    const cohere = require('cohere-ai');
    cohere.init('KAw4DX3e3XD8MIz0ypQCjs1vHxw7Pg2nELLRACeB');

    const response = await cohere.generate({
      model: 'command-xlarge-nightly',
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.7,
    });

    console.log(`Prediction: ${response.body.generations[0].text}`);
  }
}

function run() {
  main();
  setTimeout(run, 5000);
}
run();

