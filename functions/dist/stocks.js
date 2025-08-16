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
exports.getDividendData = void 0;
const functions = __importStar(require("firebase-functions"));
const fetch = global.fetch;
const FINNHUB_API_KEY = functions.config().finnhub?.key;
/**
 * Fetches dividend data for a given stock symbol from the Finnhub API.
 */
exports.getDividendData = functions.https.onCall(async (data) => {
    if (!FINNHUB_API_KEY) {
        throw new functions.https.HttpsError("failed-precondition", "The Finnhub API key is not configured.");
    }
    if (!data.symbol) {
        throw new functions.https.HttpsError("invalid-argument", "The 'symbol' parameter is required.");
    }
    const symbol = data.symbol.toUpperCase();
    // Using a guess for the date range. A real implementation would make these parameters.
    const from = "2020-01-01";
    const to = new Date().toISOString().split('T')[0];
    const url = `https://finnhub.io/api/v1/stock/dividend?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text();
            functions.logger.error(`Finnhub API error for symbol ${symbol}:`, errorBody);
            throw new functions.https.HttpsError("internal", `Finnhub API returned status ${response.status}`);
        }
        const dividendData = await response.json();
        return dividendData;
    }
    catch (error) {
        functions.logger.error(`Error fetching dividend data for ${symbol}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "An error occurred while fetching dividend data.");
    }
});
