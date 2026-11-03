import { zhCN } from './locales/zh-CN';
import { enUS } from './locales/en-US';
import { lookup } from '@/i18n';
import { useCallback, useContext } from 'react';
import { UiLocaleContext } from '@/i18n/locale';
export function useT() {
  const locale = useContext(UiLocaleContext);
  return useCallback((key: string) => { const value = lookup(locale === 'en' ? enUS : zhCN, key); return value === key ? lookup(enUS, key) : value; }, [locale]);
}
export function useUiLocale() { return useContext(UiLocaleContext) ?? 'zh-CN'; }
