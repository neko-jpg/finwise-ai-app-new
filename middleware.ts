import createMiddleware from 'next-intl/middleware';
import {getRequestConfig} from 'next-intl/server';

export default createMiddleware({
  locales: ['en', 'ja'],
  defaultLocale: 'ja'
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)']
};

export const getMessages = getRequestConfig(async ({locale}) => {
  try {
    return {
      messages: (await import(`./src/messages/${locale}.json`)).default,
    };
  } catch (error) {
    console.error('Failed to load messages for locale', locale, error);
    return {
      messages: (await import('./src/messages/en.json')).default,
    }
  }
});