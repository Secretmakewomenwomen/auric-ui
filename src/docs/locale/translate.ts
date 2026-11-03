import english from './en.json';
import type { UiLocale } from '../../i18n/locale';

const dictionary: Record<string, string> = english;
export function translateDocs(text: string, locale: UiLocale): string {
  if (locale === 'zh-CN') return text;
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (Object.prototype.hasOwnProperty.call(dictionary, normalized)) return `${text.match(/^\s*/)?.[0] ?? ''}${dictionary[normalized]}${text.match(/\s*$/)?.[0] ?? ''}`;
  const patterns: [RegExp, (match: RegExpMatchArray) => string][] = [
    [/^(.+) 属性$/, match => `${match[1]} props`],
    [/^展开 (.+) 的完整类型$/, match => `Expand the full ${match[1]} type`],
    [/^复制(.+)$/, match => `Copy ${translateDocs(match[1], locale)}`],
    [/^收藏(.+)$/, match => `Favorite ${translateDocs(match[1], locale)}`],
    [/^重置 (.+)$/, match => `Reset ${match[1]}`],
    [/^(\d+) 项已修改$/, match => `${match[1]} changed`],
  ];
  for (const [pattern, format] of patterns) { const match = normalized.match(pattern); if (match) return format(match); }
  return text;
}

export function readDocsLocale(storage?: Pick<Storage, 'getItem'>): UiLocale {
  try { return storage?.getItem('auricui.docs.locale') === 'zh-CN' ? 'zh-CN' : 'en'; }
  catch { return 'en'; }
}
