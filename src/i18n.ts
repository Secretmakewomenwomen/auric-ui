import { zhCN } from './i18n/zh-CN';
import { en } from './i18n/en';
import { useCallback, useContext } from 'react';
import { UiLocaleContext } from './i18n/locale';
export function lookup(dict: unknown, path: string): string {
  let value: unknown = dict;
  for (const part of path.split('.')) value = value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined;
  return typeof value === 'string' ? value : path;
}
export function useT() {
  const locale = useContext(UiLocaleContext);
  return useCallback((key: string) => { const value = lookup(locale === 'en' ? en : zhCN, key); return value === key ? lookup(en, key) : value; }, [locale]);
}
