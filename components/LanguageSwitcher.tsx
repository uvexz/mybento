'use client';

import { useLocale } from 'next-intl';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { useState, useTransition } from 'react';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();
  const [currentLocale, setCurrentLocale] = useState(locale);

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;
    
    setCurrentLocale(newLocale);
    startTransition(() => {
      // 设置 cookie 来保存用户的语言偏好
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      // 刷新页面以应用新语言
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLocaleChange(loc)}
          disabled={isPending}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${
            currentLocale === loc
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {localeNames[loc]}
        </button>
      ))}
    </div>
  );
}
