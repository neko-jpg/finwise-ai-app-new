import { NextResponse } from 'next/server';

// It's recommended to load this from environment variables
// for better flexibility between environments.
const ALLOWED_ORIGINS = [
  'https://finwise-ai-app-new-djt7.vercel.app', // Production
  'http://localhost:3000', // Local development
  // Vercel Preview URLs can be dynamic. A more robust solution for preview
  // environments might involve checking the origin against a pattern
  // or using environment variables provided by the Vercel platform.
  // For now, any specific preview URLs must be added here.
];

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
  };

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (origin && new RegExp(`^https://finwise-ai-app-new-djt7-.*\\.vercel\\.app$`).test(origin)) {
    // Dynamically allow Vercel preview deployments
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
