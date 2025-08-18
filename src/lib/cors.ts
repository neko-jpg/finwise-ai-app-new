import { NextResponse } from 'next/server';

// Load allowed origins from environment variables.
// The variable should be a comma-separated string of URLs.
// e.g., "http://localhost:3000,https://your-production-domain.com"
const allowedOriginsStr = process.env.ALLOWED_ORIGINS ?? "http://localhost:3000";
const ALLOWED_ORIGINS = allowedOriginsStr.split(',').map(origin => origin.trim());

/**
 * Generates CORS headers based on the request's origin.
 * @param origin The origin from the request headers.
 * @returns A record of CORS headers.
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };

  // Dynamically allow Vercel preview deployments
  const isVercelPreview = origin && new RegExp(`^https://.*-.*\\.vercel\\.app$`).test(origin);

  if (origin && (ALLOWED_ORIGINS.includes(origin) || isVercelPreview)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }


  return headers;
}

/**
 * Creates a standard OPTIONS response for preflight requests.
 * @param req The incoming request.
 * @returns A NextResponse with CORS headers and a 204 status.
 */
export function optionsResponse(req: Request): NextResponse {
  const origin = req.headers.get('origin');
  const headers = getCorsHeaders(origin);
  return new NextResponse(null, { status: 204, headers });
}

/**
 * Applies CORS headers to an existing NextResponse.
 * @param response The response to modify.
 * @param req The incoming request.
 * @returns The modified response with CORS headers.
 */
export function applyCorsHeaders(
  response: NextResponse,
  req: Request
): NextResponse {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
