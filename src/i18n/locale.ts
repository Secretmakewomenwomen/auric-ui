import { createContext } from 'react';

export type UiLocale = 'en' | 'zh-CN';
/** The documentation supplies its locale; standalone components keep their existing default. */
export const UiLocaleContext = createContext<UiLocale | null>(null);
