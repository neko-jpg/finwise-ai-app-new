// @ts-check

/**
 * @type {import('next-intl/config').NextIntlConfig}
 */
const config = {
  // This is the default configuration for Next.js App Router.
  // See https://next-intl-docs.vercel.app/docs/getting-started/app-router
  locales: ['en', 'ja'],
  defaultLocale: 'ja',
  localeDetection: true,

  // Use a shared path for all namespaces.
  // See https://next-intl-docs.vercel.app/docs/usage/configuration#shared-path
  messages: './messages',

  // Other options …
};

module.exports = config;
