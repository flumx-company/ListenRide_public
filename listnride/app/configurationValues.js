export const API_ENDPOINT = process.env.LNR_API_ENDPOINT;
export const USER_ENDPOINT = process.env.LNR_USER_ENDPOINT;
export const WEBAPP_URL = process.env.LNR_WEBAPP_URL;
export const HTML_5_MODE = process.env.LNR_HTML_5_MODE === 'true';
export const API_KEY_BRAINTREE = process.env.LNR_API_KEY_BRAINTREE;
export const API_BRAINTREE_ENV = process.env.LNR_API_BRAINTREE_ENV;
export const API_KEY_FACEBOOK_PLATFORM = process.env.LNR_API_KEY_FACEBOOK_PLATFORM;
export const API_KEY_GOOGLE_MAPS = process.env.LNR_API_KEY_GOOGLE_MAPS;
export const API_KEY_RECAPTCHA_PUBLIC = process.env.LNR_API_RECAPTCHA_V3_PUBLIC;
export const ADYEN_ENV = process.env.LNR_ADYEN_ENV;
export const ADYEN_ORIGIN_KEY = process.env.LNR_ADYEN_ORIGIN_KEY;

// different keys for different domains
export const ADYEN_ORIGIN_KEY_COM = ADYEN_ORIGIN_KEY;
export const ADYEN_ORIGIN_KEY_DE = process.env.LNR_ADYEN_ORIGIN_KEY_DE;
export const ADYEN_ORIGIN_KEY_NL = process.env.LNR_ADYEN_ORIGIN_KEY_NL;
export const ADYEN_ORIGIN_KEY_ES = process.env.LNR_ADYEN_ORIGIN_KEY_ES;
export const ADYEN_ORIGIN_KEY_IT = process.env.LNR_ADYEN_ORIGIN_KEY_IT;
export const ADYEN_ORIGIN_KEY_FR = process.env.LNR_ADYEN_ORIGIN_KEY_FR;
export const ADYEN_ORIGIN_KEY_AT = process.env.LNR_ADYEN_ORIGIN_KEY_AT;
