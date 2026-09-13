const { ReplyNodes } = require('../sdk');

const client = ReplyNodes({
  apiKey: process.env.REPLYNODES_API_KEY,
  timeout: 10_000,
});

client.youtube.search({ term: 'open source databases', limit: 5 }).then((result) => {
  console.log(result.data);
  console.log('request id:', result.meta.request_id);
});
