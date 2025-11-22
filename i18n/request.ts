import { locales, defaultLocale, type Locale } from './config';
import { headers, cookies } from 'next/headers';

export async function getLocale(): Promise<Locale> {
  // 优先从 cookie 获取用户设置的语言
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale as Locale;
  }
  
  // 从请求头获取浏览器语言偏好
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  
  // 解析 Accept-Language 头，获取首选语言
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase().split('-')[0]);
    
    // 找到第一个支持的语言
    const supportedLocale = languages.find(lang => 
      locales.includes(lang as any)
    ) as Locale | undefined;
    
    if (supportedLocale) {
      return supportedLocale;
    }
  }

  return defaultLocale;
}

export async function getMessages(locale?: Locale) {
  const currentLocale = locale || await getLocale();
  return (await import(`../messages/${currentLocale}.json`)).default;
}
