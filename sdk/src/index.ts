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
  WebScrapeRequest,
  YoutubeApi,
  YoutubeCommentsRequest,
  YoutubeSearchRequest,
  YoutubeTranscriptRequest,
} from '../generated/src';

export type { CreditTopupRequired, PaymentRequired, PaymentRequiredResponse, SuccessResponse } from '../generated/src';
export type { AppStoreReviewsRequest, AppStoreSearchRequest, GoogleSearchRequest, RedditSearchRequest, WebScrapeRequest, YoutubeCommentsRequest, YoutubeSearchRequest, YoutubeTranscriptRequest };

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

export function ReplyNodes(options: ReplyNodesOptions) {
  if (!options.apiKey) throw new Error('ReplyNodes requires an apiKey');
  if (options.timeout !== undefined && (!Number.isFinite(options.timeout) || options.timeout <= 0)) {
    throw new Error('ReplyNodes timeout must be a positive number of milliseconds');
  }

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
    basePath: options.baseUrl?.replace(/\/+$/, ''),
    accessToken: options.apiKey,
    fetchApi: (input, init) => fetchWithTimeout(input, init),
  });
  const youtube = new YoutubeApi(configuration);
  const reddit = new RedditApi(configuration);
  const web = new WebApi(configuration);
  const google = new GoogleApi(configuration);
  const appStore = new AppStoreApi(configuration);

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
      scrape: (params: WebScrapeRequest): Promise<SuccessResponse> => call((init) => web.webScrape(params, init)),
    },
    google: {
      search: (params: GoogleSearchRequest): Promise<SuccessResponse> => call((init) => google.googleSearch(params, init)),
    },
    appStore: {
      search: (params: AppStoreSearchRequest): Promise<SuccessResponse> => call((init) => appStore.appStoreSearch(params, init)),
      reviews: (params: AppStoreReviewsRequest): Promise<SuccessResponse> => call((init) => appStore.appStoreReviews(params, init)),
    },
  };
}

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
