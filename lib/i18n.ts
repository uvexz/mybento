import { getLocale, getMessages } from '@/i18n/request';

export async function getTranslator() {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  
  return (key: string, params?: Record<string, any>) => {
    const keys = key.split('.');
    let value: any = messages;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // 简单的参数替换
    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`);
    }
    
    return value;
  };
}
