import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'ja'],
 
  // Used when no locale matches
  defaultLocale: 'ja'
});
 
export const config = {
  // Match only internationalized pathnames
  // Make sure this is configured correctly for your app
  matcher: ['/', '/(ja|en)/:path*']
};