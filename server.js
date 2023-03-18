const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const apiKey = 'AIzaSyD-noz4x6tsvd4mFgDl-rpP5jUsVZWrL18';
const videoId = 'v6y1Xt1v_zA';

const express = require('express')
const app = express()
const port = 3000

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
    const prompt = `Given these messages separated by "," tell me the overall sentiment of these messages and what you think the context is: [${messages.join(", ")}]`;
  
    const cohere = require('cohere-ai');
    cohere.init('KAw4DX3e3XD8MIz0ypQCjs1vHxw7Pg2nELLRACeB');

    const response = await cohere.generate({
      model: 'command-xlarge-nightly',
      prompt: prompt,
      max_tokens: 100,
      temperature: 0.5,
    });
    if(response.body.generations && response.body.generations.length > 0){
      const prediction = response.body.generations[0].text;
      app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
      })
      app.get('/prediction', (req, res) => {
        res.send(prediction);
      });
    }
  }
}

function run() {
  main();
  setTimeout(run, 15000);
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

run();

