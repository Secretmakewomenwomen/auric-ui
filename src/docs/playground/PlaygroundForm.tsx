import { useDocsLocale, localizeView } from '../locale';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, RotateCcw, Search } from 'lucide-react';
import { SettingsSwitch } from '../../components/settings/ui';
import { Dropdown } from '../../components/primitives/Dropdown';
import type { ApiProp } from '../catalog';
import { fieldValue, jsonValue, type JsonValue, type PlaygroundSession, type PlaygroundSnapshot } from './model';
import { usePlayground } from './runtime';

const own = (object: object, name: string) => Object.prototype.hasOwnProperty.call(object, name);
const advanced = /^(className|style|id|role|aria-|.*ClassName$|.*Style$|layer$)/;

function TextField({ value, onChange, label, numeric = false }: { value: JsonValue | undefined; onChange: (value: JsonValue) => void; label: string; numeric?: boolean }) {
  const { t } = useDocsLocale();
  return localizeView(<input aria-label={label} value={typeof value === 'string' || typeof value === 'number' ? value : ''} placeholder="未设置" onChange={event => {
    const text = event.target.value;
    onChange(numeric && text.trim() !== '' && Number.isFinite(Number(text)) ? Number(text) : text);
  }} />, t);
}

function StructuredField({ prop, value, session }: { prop: ApiProp; value: JsonValue | undefined; session: PlaygroundSession }) {
  const { t } = useDocsLocale();
  const serialized = value === undefined ? '' : prop.control?.kind === 'number' ? String(value) : JSON.stringify(value, null, 2);
  const [draft, setDraft] = useState(serialized);
  const [error, setError] = useState('');
  const id = useId();
  useEffect(() => { setDraft(serialized); setError(''); }, [serialized]);
  const number = prop.control?.kind === 'number';
  const change = (text: string) => {
    setDraft(text);
    if (!text.trim()) { setError(''); return; }
    try {
      const next = number ? Number(text) : JSON.parse(text);
      if (number && !Number.isFinite(next)) throw new Error('请输入有效数字');
      if (!number && jsonValue(next) === undefined) throw new Error('请输入有效的 JSON 值');
      if (!number && Array.isArray(value) && !Array.isArray(next)) throw new Error('此参数需要 JSON 数组');
      if (!number && value && typeof value === 'object' && !Array.isArray(value) && (next === null || typeof next !== 'object' || Array.isArray(next))) throw new Error('此参数需要 JSON 对象');
      session.set(prop.name, next);
      setError('');
    } catch (failure) { setError(number ? '请输入有效数字' : failure instanceof SyntaxError ? 'JSON 格式有误，预览保留上次有效值' : (failure as Error).message); }
  };
  const attrs = { 'aria-label': prop.name, 'aria-invalid': !!error, 'aria-describedby': error ? id : undefined, value: draft, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => change(event.target.value), onBlur: () => { if (!draft.trim()) { session.clear(prop.name); setDraft(serialized); } } };
  return localizeView(<>
    {number ? <input {...attrs} type="text" inputMode="decimal" placeholder="未设置" /> : <textarea {...attrs} rows={5} spellCheck={false} placeholder={prop.type.includes('[]') ? '[]' : '{}'} />}
    {error && <small id={id} className="playground-validation" role="alert">{error}</small>}
  </>, t);
}

function PropField({ prop, session, snapshot }: { prop: ApiProp; session: PlaygroundSession; snapshot: PlaygroundSnapshot }) {
  const { t } = useDocsLocale();
  const value = fieldValue(prop, snapshot, session.props);
  const control = prop.control!;
  const changed = own(snapshot.overrides, prop.name);
  const complex = snapshot.baseline[prop.name]?.complex;
  let input;
  if (control.kind === 'boolean') input = <SettingsSwitch label={prop.name} checked={value === true} onChange={next => session.set(prop.name, next)} />;
  else if (control.kind === 'select') input = <Dropdown label={prop.name} className="playground-select" menuClassName="playground-select-menu" items={[
    { id: '__default', label: '跟随示例', onSelect: () => session.clear(prop.name) },
    ...(control.options ?? []).map((option, index) => ({ id: String(index), label: String(option), onSelect: () => session.set(prop.name, option) })),
  ]}>{value === undefined ? '跟随示例' : String(value)}</Dropdown>;
  else if (control.kind === 'node') input = <>
    {(typeof value === 'string' || typeof value === 'number' || changed && value !== null && value !== false)
      ? <TextField label={prop.name} value={value} onChange={next => session.set(prop.name, next)} />
      : <span className="playground-value">{value === null || value === false ? '已隐藏' : complex ? '示例中的自定义内容' : '未设置'}</span>}
    <div className="playground-node-actions">
      <button type="button" onClick={() => session.set(prop.name, typeof value === 'string' ? value : '自定义内容')}>编辑文字</button>
      <button type="button" onClick={() => session.set(prop.name, false)} aria-pressed={value === null || value === false}>隐藏</button>
    </div>
  </>;
  else if (control.kind === 'text') input = <TextField label={prop.name} value={value} numeric={control.numeric} onChange={next => session.set(prop.name, next)} />;
  else if (control.kind === 'json' && complex && !changed) input = <p className="playground-value">包含函数或 JSX，请在代码示例中配置。</p>;
  else input = <StructuredField prop={prop} value={value} session={session} />;
  return localizeView(<div className={`playground-field ${control.kind === 'boolean' ? 'playground-field-switch' : ''}`} data-prop={prop.name} data-modified={changed || undefined}>
    <div className="playground-field-heading">
      <label title={prop.type}><code>{prop.name}</code>{prop.required && <span className="playground-required" title="必填参数">*</span>}</label>
      {changed && <button type="button" className="icon-btn playground-reset-field" aria-label={`重置 ${prop.name}`} title="恢复示例值" onClick={() => session.clear(prop.name)}><RotateCcw size={11} /></button>}
      {control.kind === 'boolean' && input}
    </div>
    {control.kind !== 'boolean' && <div className="playground-control">{input}</div>}
    {prop.description && <p className="playground-help">{prop.description}</p>}
    {prop.name.startsWith('default') && <small className="playground-help">修改后重新挂载；未覆盖受控值时切换为非受控模式。</small>}
  </div>, t);
}

export function PlaygroundForm({ session, supported }: { session: PlaygroundSession; supported: boolean }) {
  const { t } = useDocsLocale();
  const snapshot = usePlayground(session);
  const form = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const inspect = (event: Event) => {
      const target = event.target;
      session.inspectEvent(target instanceof Element && (!!form.current?.contains(target) || !!target.closest('.playground-select-menu')));
    };
    window.addEventListener('pointerdown', inspect, true);
    window.addEventListener('focusin', inspect, true);
    return () => { window.removeEventListener('pointerdown', inspect, true); window.removeEventListener('focusin', inspect, true); };
  }, [session]);
  const [query, setQuery] = useState('');
  const modified = Object.keys(snapshot.overrides).length;
  const editable = session.props.filter(prop => prop.control && prop.control.kind !== 'readonly');
  const matches = (prop: ApiProp) => `${prop.name} ${prop.description} ${t(prop.description)}`.toLowerCase().includes(query.toLowerCase());
  const primary = editable.filter(prop => !advanced.test(prop.name) && matches(prop));
  const secondary = editable.filter(prop => advanced.test(prop.name) && matches(prop));
  const readonly = session.props.filter(prop => prop.control?.kind === 'readonly' && matches(prop));
  return localizeView(<section ref={form} className="config-section playground-form" aria-label="参数调试">
    <h3><span>参数调试 <small className="playground-count">{modified ? `${modified} 项已修改` : '实时预览'}</small></span><button type="button" className="icon-btn" aria-label="重置全部参数" title="恢复当前组件的示例参数" disabled={!modified} onClick={() => session.reset()}><RotateCcw size={13} /></button></h3>
    {!supported ? <p className="playground-help">这是由多个组件组成的场景示例。可打开组件文档查看各部分的参数。</p> : <>
      <p className="playground-intro">调试左侧卡片中的第一个示例，预览与代码同步更新。</p>
      {!snapshot.mounted && <p className="playground-help">组件尚未显示。先打开左侧示例，参数会在组件显示时应用。</p>}
      {editable.length > 8 && <label className="playground-search"><Search size={12} /><input aria-label="搜索参数" placeholder="搜索参数…" value={query} onChange={event => setQuery(event.target.value)} /></label>}
      <form onSubmit={event => event.preventDefault()}>
        <div className="playground-fields">{primary.map(prop => <PropField key={prop.name} prop={prop} session={session} snapshot={snapshot} />)}</div>
        {!!secondary.length && <details className="playground-details" open={query ? true : undefined}><summary><ChevronDown size={12} />外观与高级参数 <span>{secondary.length}</span></summary><div className="playground-fields">{secondary.map(prop => <PropField key={prop.name} prop={prop} session={session} snapshot={snapshot} />)}</div></details>}
        {!!readonly.length && <details className="playground-details"><summary><ChevronDown size={12} />事件与引用 <span>{readonly.length}</span></summary><p className="playground-help">保留示例中的交互逻辑，可在代码中自定义。</p>{readonly.map(prop => <div className="playground-readonly" key={prop.name}><code>{prop.name}</code><small>{prop.type}</small><p className="playground-help">{prop.description}</p></div>)}</details>}
        {!primary.length && !secondary.length && !readonly.length && <p className="playground-help">没有匹配的参数。</p>}
      </form>
    </>}
  </section>, t);
}
