import * as functions from "firebase-functions";
/**
 * Fetches a list of all supported cryptocurrencies from CoinGecko.
 * Uses an in-memory cache to avoid excessive API calls.
 */
export declare const getCoinList: functions.HttpsFunction & functions.Runnable<any>;
/**
 * A generic proxy for making requests to the CoinGecko API.
 */
export declare const cryptoApiProxy: functions.HttpsFunction & functions.Runnable<any>;
