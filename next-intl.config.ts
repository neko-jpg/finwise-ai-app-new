import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => ({
  // ルート直下の messages ディレクトリを参照
  messages: (await import(`./messages/${locale}.json`)).default
}));
