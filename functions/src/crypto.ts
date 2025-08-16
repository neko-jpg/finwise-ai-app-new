import * as functions from "firebase-functions";

// @ts-expect-error - Assuming global fetch is available in Node.js 18+ environment
const fetch = global.fetch;

// Simple in-memory cache
interface Coin {
  id: string;
  symbol: string;
  name: string;
}
let cachedCoinList: Coin[] | null = null;
let lastFetched = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetches a list of all supported cryptocurrencies from CoinGecko.
 * Uses an in-memory cache to avoid excessive API calls.
 */
export const getCoinList = functions.https.onCall(async () => {
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
    } catch (error) {
        functions.logger.error("Error fetching coin list:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while fetching the coin list.");
    }
});

interface CryptoApiProxyData {
    path: string;
    params?: { [key: string]: string | number | boolean };
}

/**
 * A generic proxy for making requests to the CoinGecko API.
 */
export const cryptoApiProxy = functions.https.onCall(async (data: CryptoApiProxyData) => {
    const { path, params } = data;

    if (!path) {
        throw new functions.https.HttpsError("invalid-argument", "The 'path' parameter is required.");
    }

    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const url = `https://api.coingecko.com/api/v3/${path}?${queryString}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text();
            functions.logger.error(`CoinGecko API error for path ${path}:`, errorBody);
            throw new functions.https.HttpsError("internal", `CoinGecko API returned status ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        functions.logger.error(`Error proxying request to CoinGecko path ${path}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "An error occurred while proxying the request to CoinGecko.");
    }
});
