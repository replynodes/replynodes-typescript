import ReplyNodes from '@replynodes/sdk';

const client = ReplyNodes({ apiKey: process.env.REPLYNODES_API_KEY });
const result = await client.web.search({
  text: 'open source databases',
  limit: 5,
});

console.log(result.data);
console.log('request id:', result.meta.request_id);
