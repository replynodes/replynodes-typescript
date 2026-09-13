import { ReplyNodes } from '@replynodes/sdk';

const client = ReplyNodes({ apiKey: process.env.REPLYNODES_API_KEY!, baseUrl: 'https://api.replynodes.com' });
const result = await client.web.scrape({ url: 'https://example.com' });
console.log(result.data, result.meta.request_id);
