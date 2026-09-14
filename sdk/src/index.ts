import {
  AppStoreApi,
  AppStoreReviewsRequest,
  AppStoreSearchRequest,
  Configuration,
  GoogleApi,
  GoogleSearchRequest,
  RedditApi,
  RedditSearchRequest,
  ResponseError,
  SuccessResponse,
  WebApi,
  WebBrandRequest,
  WebScrapeRequest,
  YoutubeApi,
  YoutubeCommentsRequest,
  YoutubeSearchRequest,
  YoutubeTranscriptRequest,
} from '../generated/src';

export type { CreditTopupRequired, PaymentRequired, PaymentRequiredResponse, SuccessResponse } from '../generated/src';
export type { AppStoreReviewsRequest, AppStoreSearchRequest, GoogleSearchRequest, RedditSearchRequest, WebBrandRequest, WebScrapeRequest, YoutubeCommentsRequest, YoutubeSearchRequest, YoutubeTranscriptRequest };

export interface ReplyNodesOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export class ReplyNodesError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly requestId?: string;
  readonly details?: unknown;

  constructor(message: string, status: number, options: { code?: string; requestId?: string; details?: unknown } = {}) {
    super(message);
    this.name = 'ReplyNodesError';
    this.status = status;
    this.code = options.code;
    this.requestId = options.requestId;
    this.details = options.details;
  }
}

export class ReplyNodesTimeoutError extends Error {
  constructor(message = 'ReplyNodes request timed out') {
    super(message);
    this.name = 'ReplyNodesTimeoutError';
  }
}

type Call = <T>(operation: (init: RequestInit) => Promise<T>) => Promise<T>;

const OFFICIAL_API_ORIGIN = 'https://api.replynodes.com';
const SAFE_TEST_ORIGINS = new Set(['https://test.invalid']);

function validateBaseUrl(baseUrl: string | undefined): string | undefined {
  if (baseUrl === undefined) return undefined;

  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error('ReplyNodes baseUrl must be an absolute URL for an allowed ReplyNodes or test origin');
  }

  const isLocalTestOrigin = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    && (url.protocol === 'http:' || url.protocol === 'https:');
  if (url.origin !== OFFICIAL_API_ORIGIN && !isLocalTestOrigin && !SAFE_TEST_ORIGINS.has(url.origin)) {
    throw new Error('ReplyNodes baseUrl must use the official ReplyNodes API origin or an explicitly allowed test origin');
  }

  return url.toString().replace(/\/+$/, '');
}

export function ReplyNodes(options: ReplyNodesOptions) {
  if (!options.apiKey) throw new Error('ReplyNodes requires an apiKey');
  if (options.timeout !== undefined && (!Number.isFinite(options.timeout) || options.timeout <= 0)) {
    throw new Error('ReplyNodes timeout must be a positive number of milliseconds');
  }
  const baseUrl = validateBaseUrl(options.baseUrl);

  const call: Call = async <T>(operation: (init: RequestInit) => Promise<T>) => {
    const controller = new AbortController();
    const timer = options.timeout === undefined ? undefined : setTimeout(() => controller.abort(), options.timeout);
    try {
      return await operation({ signal: controller.signal });
    } catch (error) {
      if (controller.signal.aborted) throw new ReplyNodesTimeoutError();
      if (error instanceof ResponseError) throw await toReplyNodesError(error);
      throw error;
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
  };

  const configuration = new Configuration({
    basePath: baseUrl,
    accessToken: options.apiKey,
    fetchApi: (input, init) => fetchWithTimeout(input, init),
  });
  const youtube = new YoutubeApi(configuration);
  const reddit = new RedditApi(configuration);
  const web = new WebApi(configuration);
  const google = new GoogleApi(configuration);
  const appStore = new AppStoreApi(configuration);
  const webSearch = (params: GoogleSearchRequest): Promise<SuccessResponse> => call((init) => google.googleSearch(params, init));

  return {
    youtube: {
      search: (params: YoutubeSearchRequest): Promise<SuccessResponse> => call((init) => youtube.youtubeSearch(params, init)),
      comments: (params: YoutubeCommentsRequest): Promise<SuccessResponse> => call((init) => youtube.youtubeComments(params, init)),
      transcript: (params: YoutubeTranscriptRequest): Promise<SuccessResponse> => call((init) => youtube.youtubeTranscript(params, init)),
    },
    reddit: {
      search: (params: RedditSearchRequest): Promise<SuccessResponse> => call((init) => reddit.redditSearch(params, init)),
    },
    web: {
      brand: (params: WebBrandRequest): Promise<SuccessResponse> => call((init) => web.webBrand(params, init)),
      scrape: (params: WebScrapeRequest): Promise<SuccessResponse> => call((init) => web.webScrape(params, init)),
      search: webSearch,
    },
    google: {
      search: webSearch,
    },
    appStore: {
      search: (params: AppStoreSearchRequest): Promise<SuccessResponse> => call((init) => appStore.appStoreSearch(params, init)),
      reviews: (params: AppStoreReviewsRequest): Promise<SuccessResponse> => call((init) => appStore.appStoreReviews(params, init)),
    },
  };
}

export default ReplyNodes;

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, init);
}

async function toReplyNodesError(error: ResponseError): Promise<ReplyNodesError> {
  let details: any;
  try { details = await error.response.clone().json(); } catch { details = undefined; }
  const body = details?.error;
  return new ReplyNodesError(body?.message || error.message, error.response.status, {
    code: body?.code,
    requestId: body?.request_id || error.response.headers.get('x-request-id') || undefined,
    details,
  });
}
