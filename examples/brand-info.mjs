import ReplyNodes from '@replynodes/sdk';

const client = ReplyNodes({ apiKey: process.env.REPLYNODES_API_KEY });
const result = await client.web.brand({ url: 'https://replynodes.com' });

console.log(result.data);
console.log('request id:', result.meta.request_id);
