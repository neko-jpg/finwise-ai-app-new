import * as functions from "firebase-functions";

// @ts-expect-error - Assuming global fetch is available in Node.js 18+ environment
const fetch = global.fetch;

const FINNHUB_API_KEY = functions.config().finnhub?.key;

/**
 * Fetches dividend data for a given stock symbol from the Finnhub API.
 */
export const getDividendData = functions.https.onCall(async (data: { symbol: string }) => {
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
    } catch (error) {
        functions.logger.error(`Error fetching dividend data for ${symbol}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "An error occurred while fetching dividend data.");
    }
});
