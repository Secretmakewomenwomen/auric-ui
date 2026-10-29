import { zhCN } from './locales/zh-CN';
import { enUS } from './locales/en-US';
import { lookup } from '@/i18n';
const translate = (key: string) => { const value = lookup(zhCN, key); return value === key ? lookup(enUS, key) : value; };
export function useT() { return translate; }
export function useUiLocale() { return 'zh-CN'; }
