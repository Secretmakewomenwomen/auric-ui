import { useCallback, useContext } from 'react';
import { UiLocaleContext, type UiLocale } from './locale';
import english from './ui.en.json';

const messages: Record<string, string> = english;
/** Only library-owned text is translated. Explicit labels and user content are never changed. */
export function translateUi(text: string, locale: UiLocale | null, ...values: (string | number)[]) {
  const translated = locale === 'en' ? messages[text] ?? text : text;
  return translated.replace(/\$\{(\d+)\}/g, (placeholder, index) => values[Number(index)] === undefined ? placeholder : String(values[Number(index)]));
}

export function useUiText() {
  const locale = useContext(UiLocaleContext);
  return useCallback((text: string, ...values: (string | number)[]) => translateUi(text, locale, ...values), [locale]);
}
