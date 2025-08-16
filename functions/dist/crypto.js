"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cryptoApiProxy = exports.getCoinList = void 0;
const functions = __importStar(require("firebase-functions"));
const fetch = global.fetch;
let cachedCoinList = null;
let lastFetched = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
/**
 * Fetches a list of all supported cryptocurrencies from CoinGecko.
 * Uses an in-memory cache to avoid excessive API calls.
 */
exports.getCoinList = functions.https.onCall(async () => {
    const now = Date.now();
    if (cachedCoinList && (now - lastFetched < CACHE_DURATION)) {
        return cachedCoinList;
    }
    try {
        const response = await fetch("https://api.coingecko.com/api/v3/coins/list");
        if (!response.ok) {
            throw new functions.https.HttpsError("internal", "Failed to fetch coin list from CoinGecko.");
        }
        const coinList = await response.json();
        cachedCoinList = coinList;
        lastFetched = now;
        return coinList;
    }
    catch (error) {
        functions.logger.error("Error fetching coin list:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while fetching the coin list.");
    }
});
/**
 * A generic proxy for making requests to the CoinGecko API.
 */
exports.cryptoApiProxy = functions.https.onCall(async (data) => {
    const { path, params } = data;
    if (!path) {
        throw new functions.https.HttpsError("invalid-argument", "The 'path' parameter is required.");
    }
    const queryString = new URLSearchParams(params).toString();
    const url = `https://api.coingecko.com/api/v3/${path}?${queryString}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text();
            functions.logger.error(`CoinGecko API error for path ${path}:`, errorBody);
            throw new functions.https.HttpsError("internal", `CoinGecko API returned status ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        functions.logger.error(`Error proxying request to CoinGecko path ${path}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "An error occurred while proxying the request to CoinGecko.");
    }
});
