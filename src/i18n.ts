import { zhCN } from './i18n/zh-CN';
import { en } from './i18n/en';
export function lookup(dict: unknown, path: string): string {
  let value: unknown = dict;
  for (const part of path.split('.')) value = value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined;
  return typeof value === 'string' ? value : path;
}
const translate = (key: string) => { const value = lookup(zhCN, key); return value === key ? lookup(en, key) : value; };
export function useT() { return translate; }
