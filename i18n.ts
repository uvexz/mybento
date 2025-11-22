import { getRequestConfig } from 'next-intl/server';
import { getLocale, getMessages } from '@/i18n/request';

export default getRequestConfig(async () => {
  const locale = await getLocale();
  const messages = await getMessages(locale);

  return {
    locale,
    messages,
  };
});
