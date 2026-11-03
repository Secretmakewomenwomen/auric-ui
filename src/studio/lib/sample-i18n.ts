import { useContext, useMemo } from 'react';
import { UiLocaleContext, type UiLocale } from '../../i18n/locale';
import english from './sample.en.json';

const messages: Record<string, string> = english;
export function createSampleText(locale: UiLocale | null) {
  return (text: string, ...values: (string | number)[]) => (locale === 'en' ? messages[text] ?? text : text)
    .replace(/\$\{(\d+)\}/g, (placeholder, index) => values[Number(index)] === undefined ? placeholder : String(values[Number(index)]));
}
export function useSampleText() {
  const locale = useContext(UiLocaleContext);
  return useMemo(() => createSampleText(locale), [locale]);
}
