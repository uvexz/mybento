import { getLocale, getMessages } from '@/i18n/request';

export async function getTranslator() {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  
  return (key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value: unknown = messages;
    
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // 简单的参数替换
    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
    }
    
    return value;
  };
}
