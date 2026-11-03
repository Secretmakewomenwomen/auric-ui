import { Children, cloneElement, createContext, isValidElement, useContext, useLayoutEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import { Check, Languages } from 'lucide-react';
import { UiLocaleContext, type UiLocale } from '../../i18n/locale';
import { Dropdown } from '../../components/primitives/Dropdown';
import { readDocsLocale, translateDocs } from './translate';

type LocaleState = { locale: UiLocale; setLocale: (locale: UiLocale) => void; t: (text: string) => string };
const DocsLocaleContext = createContext<LocaleState>({ locale: 'en', setLocale: () => {}, t: text => translateDocs(text, 'en') });

export function DocsLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<UiLocale>(() => { try { return readDocsLocale(window.localStorage); } catch { return 'en'; } });
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    try { localStorage.setItem('auricui.docs.locale', locale); } catch { /* The in-memory preference still works. */ }
  }, [locale]);
  const value = useMemo(() => ({ locale, setLocale, t: (text: string) => translateDocs(text, locale) }), [locale]);
  return <DocsLocaleContext.Provider value={value}><UiLocaleContext.Provider value={locale}>{children}</UiLocaleContext.Provider></DocsLocaleContext.Provider>;
}

export function useDocsLocale() { return useContext(DocsLocaleContext); }

/** Translate only presentation props. State values, IDs, code, callbacks and user input remain intact. */
export function localizeView(node: ReactNode, t: (text: string) => string): ReactNode {
  if (typeof node === 'string') return t(node);
  if (Array.isArray(node)) return Children.map(node, child => localizeView(child, t));
  if (!isValidElement<Record<string, unknown>>(node)) return node;
  const preserveContent = typeof node.type === 'string' && ['pre', 'code', 'textarea', 'script', 'style'].includes(node.type);
  const props: Record<string, unknown> = {};
  const textProps = ['children', 'title', 'label', 'description', 'body', 'placeholder', 'aria-label', 'filename', 'expandLabel', 'collapseLabel', 'closeLabel', 'emptyText'];
  for (const key of textProps) if (key in node.props && !(key === 'children' && preserveContent)) props[key] = localizeView(node.props[key] as ReactNode, t);
  for (const key of ['options', 'groups']) {
    if (Array.isArray(node.props[key])) props[key] = (node.props[key] as Record<string, unknown>[]).map(option => ({ ...option, ...(typeof option.label === 'string' ? { label: t(option.label) } : {}), ...(Array.isArray(option.choices) ? { choices: option.choices.map(choice => ({ ...choice, label: t(choice.label) })) } : {}) }));
  }
  if (node.props.toast && typeof node.props.toast === 'object' && 'text' in node.props.toast) props.toast = { ...node.props.toast, text: t(String(node.props.toast.text)) };
  return cloneElement(node as ReactElement, props);
}

export function LanguageSwitch() {
  const { locale, setLocale } = useDocsLocale();
  return <Dropdown label="Language / 语言" align="end" className="docs-language-switch" menuClassName="docs-language-menu" showArrow={false} weight="quiet" items={[
    { id: 'en', label: 'English', icon: locale === 'en' ? <Check size={14} /> : undefined, onSelect: () => setLocale('en') },
    { id: 'zh-CN', label: '简体中文', icon: locale === 'zh-CN' ? <Check size={14} /> : undefined, onSelect: () => setLocale('zh-CN') },
  ]}><Languages size={15} aria-hidden="true" /><span>{locale === 'en' ? 'English' : '中文'}</span></Dropdown>;
}
