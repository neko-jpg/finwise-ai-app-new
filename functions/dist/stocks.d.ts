import * as functions from "firebase-functions";
/**
 * Fetches dividend data for a given stock symbol from the Finnhub API.
 */
export declare const getDividendData: functions.HttpsFunction & functions.Runnable<any>;
