import {
  AppStoreApi,
  BrandApi,
  Configuration,
  FomoApi,
  GoogleApi,
  GoogleMapsApi,
  GooglePlayApi,
  GoogleShoppingApi,
  HackerNewsApi,
  InstagramApi,
  RedditApi,
  ResponseError,
  TiktokApi,
  WebApi,
  YoutubeApi,
} from '../generated/src';
import type * as Generated from '../generated/src';

export type * from '../generated/src';
export type { CreditTopupRequired, PaymentRequired, PaymentRequiredResponse, SuccessResponse } from '../generated/src';

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

/**
 * The intentional public name for every canonical operation. The values are
 * generated operation IDs; the wrapper below never constructs HTTP requests.
 * `web.search` and `google.search` are compatibility aliases for one route.
 */
export const PUBLIC_OPERATION_REGISTRY = {
  appStore: {
    app: 'appStoreApp',
    developer: 'appStoreDeveloper',
    list: 'appStoreList',
    privacy: 'appStorePrivacy',
    ratings: 'appStoreRatings',
    reviews: 'appStoreReviews',
    search: 'appStoreSearch',
    similar: 'appStoreSimilar',
    suggest: 'appStoreSuggest',
  },
  brand: {
    fonts: 'brandFonts',
    retrieve: 'brandRetrieve',
    search: 'brandSearch',
    styleguide: 'brandStyleguide',
  },
  fomo: {
    alerts: 'fomoAlerts',
    leaderboard: 'fomoLeaderboard',
    notifications: 'fomoNotifications',
    search: 'fomoSearch',
    thesis: 'fomoThesis',
    thesisByToken: 'fomoThesisByToken',
    thesisByUser: 'fomoThesisByUser',
    thesisByUserToken: 'fomoThesisByUserToken',
    tokenHolders: 'fomoTokenHolders',
    tokensGraduated: 'fomoTokensGraduated',
    tokensMostHeld: 'fomoTokensMostHeld',
    tokensTrending: 'fomoTokensTrending',
    trade: 'fomoTrade',
    userBalances: 'fomoUserBalances',
    userProfile: 'fomoUserProfile',
    userTrades: 'fomoUserTrades',
  },
  google: {
    search: 'googleSearch',
  },
  googleMaps: {
    placeDetails: 'googleMapsPlaceDetails',
    placeReviews: 'googleMapsPlaceReviews',
    searchPlaces: 'googleMapsSearchPlaces',
  },
  googlePlay: {
    appDetails: 'googlePlayAppDetails',
    availability: 'googlePlayAvailability',
    categories: 'googlePlayCategories',
    categoryApps: 'googlePlayCategoryApps',
    dataSafety: 'googlePlayDataSafety',
    developer: 'googlePlayDeveloper',
    permissions: 'googlePlayPermissions',
    reviews: 'googlePlayReviews',
    search: 'googlePlaySearch',
    similarApps: 'googlePlaySimilarApps',
    suggest: 'googlePlaySuggest',
  },
  googleShopping: {
    productOffers: 'googleShoppingProductOffers',
    search: 'googleShoppingSearch',
  },
  hackerNews: {
    item: 'hackerNewsItem',
    search: 'hackerNewsSearch',
    storiesAsk: 'hackerNewsStoriesAsk',
    storiesBest: 'hackerNewsStoriesBest',
    storiesJob: 'hackerNewsStoriesJob',
    storiesNew: 'hackerNewsStoriesNew',
    storiesShow: 'hackerNewsStoriesShow',
    storiesTop: 'hackerNewsStoriesTop',
    user: 'hackerNewsUser',
  },
  instagram: {
    posts: 'instagramPosts',
    profile: 'instagramProfile',
  },
  reddit: {
    postById: 'redditPostById',
    postByPermalink: 'redditPostByPermalink',
    search: 'redditSearch',
    subredditPosts: 'redditSubredditPosts',
    userActivity: 'redditUserActivity',
    userPosts: 'redditUserPosts',
  },
  tiktok: {
    post: 'tiktokPost',
    user: 'tiktokUser',
    userPosts: 'tiktokUserPosts',
  },
  web: {
    brand: 'webBrand',
    crawl: 'webCrawl',
    map: 'webMap',
    scrape: 'webScrape',
    search: 'googleSearch',
  },
  youtube: {
    channel: 'youtubeChannel',
    comments: 'youtubeComments',
    playlist: 'youtubePlaylist',
    related: 'youtubeRelated',
    search: 'youtubeSearch',
    transcript: 'youtubeTranscript',
    video: 'youtubeVideo',
  },
} as const;

type RegistryResource = typeof PUBLIC_OPERATION_REGISTRY[keyof typeof PUBLIC_OPERATION_REGISTRY];
type RegistryValues<T> = T extends Record<string, infer TValue> ? TValue : never;
export type PublicOperationId = RegistryValues<RegistryResource>;

type GeneratedApi = Record<string, (requestParameters: object, initOverrides?: RequestInit) => Promise<unknown>>;
type Call = <T>(operation: (init: RequestInit) => Promise<T>) => Promise<T>;
type RequiredKeys<T> = {
  [Key in keyof T]-?: {} extends Pick<T, Key> ? never : Key;
}[keyof T];
type RequestArguments<TRequest extends object> = [RequiredKeys<TRequest>] extends [never]
  ? [params?: TRequest]
  : [params: TRequest];

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
  const generatedApis: GeneratedApi[] = [
    new AppStoreApi(configuration) as unknown as GeneratedApi,
    new BrandApi(configuration) as unknown as GeneratedApi,
    new FomoApi(configuration) as unknown as GeneratedApi,
    new GoogleApi(configuration) as unknown as GeneratedApi,
    new GoogleMapsApi(configuration) as unknown as GeneratedApi,
    new GooglePlayApi(configuration) as unknown as GeneratedApi,
    new GoogleShoppingApi(configuration) as unknown as GeneratedApi,
    new HackerNewsApi(configuration) as unknown as GeneratedApi,
    new InstagramApi(configuration) as unknown as GeneratedApi,
    new RedditApi(configuration) as unknown as GeneratedApi,
    new TiktokApi(configuration) as unknown as GeneratedApi,
    new WebApi(configuration) as unknown as GeneratedApi,
    new YoutubeApi(configuration) as unknown as GeneratedApi,
  ];

  const invokeOperation = <TResponse>(operationId: PublicOperationId, params: object, init: RequestInit) => {
    const api = generatedApis.find((candidate) => typeof candidate[operationId] === 'function');
    if (!api) throw new Error(`ReplyNodes generated client is missing operation ${operationId}`);
    return api[operationId].call(api, params, init) as Promise<TResponse>;
  };
  const bind = <TRequest extends object, TResponse>(operationId: PublicOperationId) =>
    (...args: RequestArguments<TRequest>): Promise<TResponse> => {
      const [params] = args;
      return call((init) => invokeOperation<TResponse>(operationId, params ?? {}, init));
    };

  const webSearch = bind<Generated.GoogleSearchRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.google.search);

  return {
    appStore: {
      app: bind<Generated.AppStoreAppRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.appStore.app),
      developer: bind<Generated.AppStoreDeveloperRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.appStore.developer),
      list: bind<Generated.AppStoreListRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.appStore.list),
      privacy: bind<Generated.AppStorePrivacyRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.appStore.privacy),
      ratings: bind<Generated.AppStoreRatingsRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.appStore.ratings),
      reviews: bind<Generated.AppStoreReviewsRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.appStore.reviews),
      search: bind<Generated.AppStoreSearchRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.appStore.search),
      similar: bind<Generated.AppStoreSimilarRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.appStore.similar),
      suggest: bind<Generated.AppStoreSuggestRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.appStore.suggest),
    },
    brand: {
      fonts: bind<Generated.BrandFontsRequest, Generated.BrandFontsResponse>(PUBLIC_OPERATION_REGISTRY.brand.fonts),
      retrieve: bind<Generated.BrandRetrieveRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.brand.retrieve),
      search: bind<Generated.BrandSearchRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.brand.search),
      styleguide: bind<Generated.BrandStyleguideRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.brand.styleguide),
    },
    fomo: {
      alerts: bind<Generated.FomoAlertsRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.fomo.alerts),
      leaderboard: bind<Generated.FomoLeaderboardRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.fomo.leaderboard),
      notifications: bind<Generated.FomoNotificationsRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.fomo.notifications),
      search: bind<Generated.FomoSearchRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.fomo.search),
      thesis: bind<Generated.FomoThesisRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.fomo.thesis),
      thesisByToken: bind<Generated.FomoThesisByTokenRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.fomo.thesisByToken),
      thesisByUser: bind<Generated.FomoThesisByUserRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.fomo.thesisByUser),
      thesisByUserToken: bind<Generated.FomoThesisByUserTokenRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.fomo.thesisByUserToken),
      tokenHolders: bind<Generated.FomoTokenHoldersRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.fomo.tokenHolders),
      tokensGraduated: bind<Generated.FomoTokensGraduatedRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.fomo.tokensGraduated),
      tokensMostHeld: bind<Generated.FomoTokensMostHeldRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.fomo.tokensMostHeld),
      tokensTrending: bind<Generated.FomoTokensTrendingRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.fomo.tokensTrending),
      trade: bind<Generated.FomoTradeRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.fomo.trade),
      userBalances: bind<Generated.FomoUserBalancesRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.fomo.userBalances),
      userProfile: bind<Generated.FomoUserProfileRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.fomo.userProfile),
      userTrades: bind<Generated.FomoUserTradesRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.fomo.userTrades),
    },
    google: { search: webSearch },
    googleMaps: {
      placeDetails: bind<Generated.GoogleMapsPlaceDetailsRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.googleMaps.placeDetails),
      placeReviews: bind<Generated.GoogleMapsPlaceReviewsRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.googleMaps.placeReviews),
      searchPlaces: bind<Generated.GoogleMapsSearchPlacesRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.googleMaps.searchPlaces),
    },
    googlePlay: {
      appDetails: bind<Generated.GooglePlayAppDetailsRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.googlePlay.appDetails),
      availability: bind<Generated.GooglePlayAvailabilityRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.googlePlay.availability),
      categories: bind<Generated.GooglePlayCategoriesRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.googlePlay.categories),
      categoryApps: bind<Generated.GooglePlayCategoryAppsRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.googlePlay.categoryApps),
      dataSafety: bind<Generated.GooglePlayDataSafetyRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.googlePlay.dataSafety),
      developer: bind<Generated.GooglePlayDeveloperRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.googlePlay.developer),
      permissions: bind<Generated.GooglePlayPermissionsRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.googlePlay.permissions),
      reviews: bind<Generated.GooglePlayReviewsRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.googlePlay.reviews),
      search: bind<Generated.GooglePlaySearchRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.googlePlay.search),
      similarApps: bind<Generated.GooglePlaySimilarAppsRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.googlePlay.similarApps),
      suggest: bind<Generated.GooglePlaySuggestRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.googlePlay.suggest),
    },
    googleShopping: {
      productOffers: bind<Generated.GoogleShoppingProductOffersRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.googleShopping.productOffers),
      search: bind<Generated.GoogleShoppingSearchRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.googleShopping.search),
    },
    hackerNews: {
      item: bind<Generated.HackerNewsItemRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.hackerNews.item),
      search: bind<Generated.HackerNewsSearchRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.hackerNews.search),
      storiesAsk: bind<Generated.HackerNewsStoriesAskRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.hackerNews.storiesAsk),
      storiesBest: bind<Generated.HackerNewsStoriesBestRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.hackerNews.storiesBest),
      storiesJob: bind<Generated.HackerNewsStoriesJobRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.hackerNews.storiesJob),
      storiesNew: bind<Generated.HackerNewsStoriesNewRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.hackerNews.storiesNew),
      storiesShow: bind<Generated.HackerNewsStoriesShowRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.hackerNews.storiesShow),
      storiesTop: bind<Generated.HackerNewsStoriesTopRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.hackerNews.storiesTop),
      user: bind<Generated.HackerNewsUserRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.hackerNews.user),
    },
    instagram: {
      posts: bind<Generated.InstagramPostsRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.instagram.posts),
      profile: bind<Generated.InstagramProfileRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.instagram.profile),
    },
    reddit: {
      postById: bind<Generated.RedditPostByIdRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.reddit.postById),
      postByPermalink: bind<Generated.RedditPostByPermalinkRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.reddit.postByPermalink),
      search: bind<Generated.RedditSearchRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.reddit.search),
      subredditPosts: bind<Generated.RedditSubredditPostsRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.reddit.subredditPosts),
      userActivity: bind<Generated.RedditUserActivityRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.reddit.userActivity),
      userPosts: bind<Generated.RedditUserPostsRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.reddit.userPosts),
    },
    tiktok: {
      post: bind<Generated.TiktokPostRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.tiktok.post),
      user: bind<Generated.TiktokUserRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.tiktok.user),
      userPosts: bind<Generated.TiktokUserPostsRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.tiktok.userPosts),
    },
    web: {
      brand: bind<Generated.WebBrandRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.web.brand),
      crawl: bind<Generated.WebCrawlRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.web.crawl),
      map: bind<Generated.WebMapRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.web.map),
      scrape: bind<Generated.WebScrapeRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.web.scrape),
      search: webSearch,
    },
    youtube: {
      channel: bind<Generated.YoutubeChannelRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.youtube.channel),
      comments: bind<Generated.YoutubeCommentsRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.youtube.comments),
      playlist: bind<Generated.YoutubePlaylistRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.youtube.playlist),
      related: bind<Generated.YoutubeRelatedRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.youtube.related),
      search: bind<Generated.YoutubeSearchRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.youtube.search),
      transcript: bind<Generated.YoutubeTranscriptRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.youtube.transcript),
      video: bind<Generated.YoutubeVideoRequest, Generated.SuccessResponse>(PUBLIC_OPERATION_REGISTRY.youtube.video),
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
