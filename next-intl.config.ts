import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => ({
  // Validate that the incoming `locale` parameter is valid
  messages: (await import(`./messages/${locale}.json`)).default
}));
