/* tslint:disable */
/* eslint-disable */
/**
 *
 * @export
 * @interface BrandFontsData
 */
export interface BrandFontsData {
    /**
     *
     * @type {string}
     * @memberof BrandFontsData
     */
    domain: string;
    /**
     *
     * @type {string}
     * @memberof BrandFontsData
     */
    url: string;
    /**
     *
     * @type {number}
     * @memberof BrandFontsData
     */
    count: number;
    /**
     * Word count reported by the rendered page metadata, when available.
     * @type {number}
     * @memberof BrandFontsData
     */
    words_count?: number;
    /**
     *
     * @type {Array<{ [key: string]: any; }>}
     * @memberof BrandFontsData
     */
    fonts?: Array<{ [key: string]: any; }>;
}
/**
 *
 * @export
 * @interface BrandFontsResponse
 */
export interface BrandFontsResponse {
    /**
     *
     * @type {BrandFontsData}
     * @memberof BrandFontsResponse
     */
    data: BrandFontsData;
    /**
     *
     * @type {ResponseMeta}
     * @memberof BrandFontsResponse
     */
    meta: ResponseMeta;
}
/**
 *
 * @export
 * @interface CreditTopupRequired
 */
export interface CreditTopupRequired {
    /**
     *
     * @type {string}
     * @memberof CreditTopupRequired
     */
    code: CreditTopupRequiredCodeEnum;
    /**
     *
     * @type {number}
     * @memberof CreditTopupRequired
     */
    balance_micro: number;
    /**
     *
     * @type {number}
     * @memberof CreditTopupRequired
     */
    price_micro: number;
    /**
     * URL for completing the required account action.
     * @type {string}
     * @memberof CreditTopupRequired
     */
    topup_url: string;
}


/**
 * @export
 */
export const CreditTopupRequiredCodeEnum = {
    topup_required: 'topup_required'
} as const;
export type CreditTopupRequiredCodeEnum = typeof CreditTopupRequiredCodeEnum[keyof typeof CreditTopupRequiredCodeEnum];

/**
 *
 * @export
 * @interface ErrorDetail
 */
export interface ErrorDetail {
    /**
     *
     * @type {string}
     * @memberof ErrorDetail
     */
    code: string;
    /**
     *
     * @type {string}
     * @memberof ErrorDetail
     */
    message: string;
    /**
     *
     * @type {string}
     * @memberof ErrorDetail
     */
    request_id: string;
}
/**
 *
 * @export
 * @interface ErrorResponse
 */
export interface ErrorResponse {
    /**
     *
     * @type {ErrorDetail}
     * @memberof ErrorResponse
     */
    error: ErrorDetail;
}
/**
 *
 * @export
 * @interface Pagination
 */
export interface Pagination {
    [key: string]: any | any;
    /**
     *
     * @type {string}
     * @memberof Pagination
     */
    next_cursor?: string;
    /**
     *
     * @type {boolean}
     * @memberof Pagination
     */
    has_more?: boolean;
    /**
     *
     * @type {number}
     * @memberof Pagination
     */
    page?: number;
    /**
     *
     * @type {number}
     * @memberof Pagination
     */
    limit?: number;
}
/**
 *
 * @export
 * @interface PaymentRequired
 */
export interface PaymentRequired {
    /**
     *
     * @type {number}
     * @memberof PaymentRequired
     */
    x402Version: PaymentRequiredX402VersionEnum;
    /**
     *
     * @type {string}
     * @memberof PaymentRequired
     */
    error: string;
    /**
     *
     * @type {PaymentRequiredResource}
     * @memberof PaymentRequired
     */
    resource: PaymentRequiredResource;
    /**
     *
     * @type {Array<PaymentRequirements>}
     * @memberof PaymentRequired
     */
    accepts: Array<PaymentRequirements>;
    /**
     *
     * @type {PaymentRequiredExtensions}
     * @memberof PaymentRequired
     */
    extensions: PaymentRequiredExtensions;
}


/**
 * @export
 */
export const PaymentRequiredX402VersionEnum = {
    NUMBER_2: 2
} as const;
export type PaymentRequiredX402VersionEnum = typeof PaymentRequiredX402VersionEnum[keyof typeof PaymentRequiredX402VersionEnum];

/**
 *
 * @export
 * @interface PaymentRequiredAccountlessExtensions
 */
export interface PaymentRequiredAccountlessExtensions {
    /**
     *
     * @type {PaymentRequiredAccountlessExtensionsXReplynodesAccountless}
     * @memberof PaymentRequiredAccountlessExtensions
     */
    x_replynodes_accountless: PaymentRequiredAccountlessExtensionsXReplynodesAccountless;
}
/**
 *
 * @export
 * @interface PaymentRequiredAccountlessExtensionsXReplynodesAccountless
 */
export interface PaymentRequiredAccountlessExtensionsXReplynodesAccountless {
    /**
     *
     * @type {string}
     * @memberof PaymentRequiredAccountlessExtensionsXReplynodesAccountless
     */
    payment_mode: PaymentRequiredAccountlessExtensionsXReplynodesAccountlessPaymentModeEnum;
    /**
     *
     * @type {boolean}
     * @memberof PaymentRequiredAccountlessExtensionsXReplynodesAccountless
     */
    bearer_supported: boolean;
    /**
     *
     * @type {boolean}
     * @memberof PaymentRequiredAccountlessExtensionsXReplynodesAccountless
     */
    prepaid_supported: boolean;
}


/**
 * @export
 */
export const PaymentRequiredAccountlessExtensionsXReplynodesAccountlessPaymentModeEnum = {
    x402_only: 'x402_only'
} as const;
export type PaymentRequiredAccountlessExtensionsXReplynodesAccountlessPaymentModeEnum = typeof PaymentRequiredAccountlessExtensionsXReplynodesAccountlessPaymentModeEnum[keyof typeof PaymentRequiredAccountlessExtensionsXReplynodesAccountlessPaymentModeEnum];

/**
 * @type PaymentRequiredExtensions
 *
 * @export
 */
export type PaymentRequiredExtensions = PaymentRequiredAccountlessExtensions | PaymentRequiredPrepaidExtensions;
/**
 *
 * @export
 * @interface PaymentRequiredPrepaidExtensions
 */
export interface PaymentRequiredPrepaidExtensions {
    /**
     *
     * @type {PaymentRequiredPrepaidExtensionsTopup}
     * @memberof PaymentRequiredPrepaidExtensions
     */
    topup: PaymentRequiredPrepaidExtensionsTopup;
}
/**
 *
 * @export
 * @interface PaymentRequiredPrepaidExtensionsTopup
 */
export interface PaymentRequiredPrepaidExtensionsTopup {
    /**
     * URL for completing the required account action.
     * @type {string}
     * @memberof PaymentRequiredPrepaidExtensionsTopup
     */
    topup_url: string;
}
/**
 *
 * @export
 * @interface PaymentRequiredResource
 */
export interface PaymentRequiredResource {
    /**
     *
     * @type {string}
     * @memberof PaymentRequiredResource
     */
    url: string;
    /**
     *
     * @type {string}
     * @memberof PaymentRequiredResource
     */
    mimeType: string;
}
/**
 * @type PaymentRequiredResponse
 *
 * @export
 */
export type PaymentRequiredResponse = CreditTopupRequired | PaymentRequired;
/**
 *
 * @export
 * @interface PaymentRequirements
 */
export interface PaymentRequirements {
    /**
     *
     * @type {string}
     * @memberof PaymentRequirements
     */
    scheme: string;
    /**
     *
     * @type {string}
     * @memberof PaymentRequirements
     */
    network: string;
    /**
     *
     * @type {string}
     * @memberof PaymentRequirements
     */
    asset: string;
    /**
     *
     * @type {string}
     * @memberof PaymentRequirements
     */
    amount: string;
    /**
     *
     * @type {string}
     * @memberof PaymentRequirements
     */
    payTo: string;
    /**
     *
     * @type {number}
     * @memberof PaymentRequirements
     */
    maxTimeoutSeconds: number;
    /**
     *
     * @type {{ [key: string]: any; }}
     * @memberof PaymentRequirements
     */
    extra?: { [key: string]: any; };
}
/**
 *
 * @export
 * @interface ResponseMeta
 */
export interface ResponseMeta {
    [key: string]: any | any;
    /**
     *
     * @type {string}
     * @memberof ResponseMeta
     */
    request_id: string;
    /**
     *
     * @type {string}
     * @memberof ResponseMeta
     */
    contract_version?: string;
    /**
     *
     * @type {string}
     * @memberof ResponseMeta
     */
    generated_at?: string;
    /**
     *
     * @type {string}
     * @memberof ResponseMeta
     */
    availability?: string;
    /**
     *
     * @type {string}
     * @memberof ResponseMeta
     */
    next_cursor?: string;
    /**
     *
     * @type {Array<string>}
     * @memberof ResponseMeta
     */
    missing_fields?: Array<string>;
    /**
     *
     * @type {boolean}
     * @memberof ResponseMeta
     */
    stale?: boolean;
}
/**
 *
 * @export
 * @interface SuccessResponse
 */
export interface SuccessResponse {
    /**
     *
     * @type {any}
     * @memberof SuccessResponse
     */
    data: any | null;
    /**
     *
     * @type {ResponseMeta}
     * @memberof SuccessResponse
     */
    meta: ResponseMeta;
}
