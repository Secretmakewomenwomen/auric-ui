import type { ApiProp } from '../catalog';

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type PropOverrides = Record<string, JsonValue>;
export type PlaygroundMetadata = { body: number; targets: Record<string, { at: number; children?: number[]; attributes: Record<string, { start: number; end: number; value?: string } | undefined> }[]> };
export type PropControl = { kind: 'boolean' | 'number' | 'text' | 'select' | 'node' | 'json' | 'readonly'; options?: (string | number | boolean)[]; initial?: JsonValue; numeric?: boolean };
export type CapturedProp = { value?: JsonValue; complex?: boolean };
export type PlaygroundSnapshot = { overrides: PropOverrides; baseline: Record<string, CapturedProp>; mounted: boolean; revision: number; recovery: number; site?: string };

export function jsonValue(value: unknown, depth = 0): JsonValue | undefined {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (depth > 8 || !value || typeof value !== 'object') return undefined;
  if (Array.isArray(value)) {
    if (value.length > 200) return undefined;
    const children = value.map(child => jsonValue(child, depth + 1));
    return children.some(child => child === undefined) ? undefined : children as JsonValue[];
  }
  if (Object.getPrototypeOf(value) !== Object.prototype || '$$typeof' in value) return undefined;
  const result: Record<string, JsonValue> = {};
  for (const [key, child] of Object.entries(value)) {
    if (['__proto__', 'constructor', 'prototype'].includes(key)) return undefined;
    if (child === undefined) continue;
    const next = jsonValue(child, depth + 1);
    if (next === undefined) return undefined;
    result[key] = next;
  }
  return result;
}

export function validOverride(prop: ApiProp, value: JsonValue): boolean {
  const control = prop.control;
  if (!control || control.kind === 'readonly') return false;
  if (control.kind === 'boolean') return typeof value === 'boolean';
  if (control.kind === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (control.kind === 'select') return !!control.options?.includes(value as string | number);
  if (control.kind === 'text') return typeof value === 'string' || !!control.numeric && typeof value === 'number';
  if (control.kind === 'node') return value === null || value === false || typeof value === 'string' || typeof value === 'number';
  return jsonValue(value) !== undefined;
}

export function createPlaygroundSession(target: string, props: ApiProp[], initial: PropOverrides, onChange: (values: PropOverrides) => void) {
  const listeners = new Set<() => void>();
  let inspectorEvent = false;
  let inspectorEventId = 0;
  const instances = new Map<string, { values: Record<string, unknown>; site: string }>();
  const accepted = Object.fromEntries(Object.entries(initial).filter(([name, value]) => {
    const prop = props.find(prop => prop.name === name);
    return prop && validOverride(prop, value);
  }));
  let snapshot: PlaygroundSnapshot = { overrides: accepted, baseline: {}, mounted: false, revision: 0, recovery: 0 };
  const emit = () => listeners.forEach(listener => listener());
  const capture = () => {
    const instance = instances.values().next().value;
    const first = instance?.values;
    const baseline: Record<string, CapturedProp> = {};
    if (first) for (const prop of props) {
      if (!Object.prototype.hasOwnProperty.call(first, prop.name)) continue;
      const value = jsonValue(first[prop.name]);
      baseline[prop.name] = { value, complex: value === undefined && first[prop.name] !== undefined };
    }
    if (JSON.stringify(baseline) === JSON.stringify(snapshot.baseline) && snapshot.mounted === !!first && snapshot.site === instance?.site) return;
    snapshot = { ...snapshot, baseline, mounted: !!first, site: instance?.site };
    emit();
  };
  const commit = (overrides: PropOverrides) => {
    if (JSON.stringify(overrides) === JSON.stringify(snapshot.overrides)) return;
    snapshot = { ...snapshot, overrides, revision: snapshot.revision + 1 };
    onChange(overrides); emit();
  };
  return {
    target, props,
    inspectEvent: (inside: boolean) => { inspectorEvent = inside; const id = ++inspectorEventId; setTimeout(() => { if (id === inspectorEventId) inspectorEvent = false; }, 0); },
    shouldIgnoreDismiss: () => inspectorEvent,
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    capture: (id: string, values: Record<string, unknown>, site = id) => { instances.set(id, { values, site }); capture(); },
    release: (id: string) => { instances.delete(id); capture(); },
    set: (name: string, value: JsonValue) => { const prop = props.find(prop => prop.name === name); if (prop && validOverride(prop, value)) commit({ ...snapshot.overrides, [name]: value }); },
    clear: (name: string) => { const next = { ...snapshot.overrides }; delete next[name]; commit(next); },
    reset: () => { snapshot = { ...snapshot, overrides: {}, revision: snapshot.revision + 1, recovery: snapshot.recovery + 1 }; onChange({}); emit(); },
  };
}
export type PlaygroundSession = ReturnType<typeof createPlaygroundSession>;

export function fieldValue(prop: ApiProp, snapshot: PlaygroundSnapshot, props: ApiProp[] = []) {
  if (Object.prototype.hasOwnProperty.call(snapshot.overrides, prop.name)) return snapshot.overrides[prop.name];
  const baseline = snapshot.baseline[prop.name];
  if (baseline && baseline.value !== undefined) return baseline.value;
  if (prop.control?.initial !== undefined) return prop.control.initial;
  const initialName = `default${prop.name[0].toUpperCase()}${prop.name.slice(1)}`;
  return snapshot.overrides[initialName] ?? snapshot.baseline[initialName]?.value ?? props.find(prop => prop.name === initialName)?.control?.initial;
}

export function uncontrolledProps(overrides: PropOverrides) {
  return Object.keys(overrides).filter(name => /^default[A-Z]/.test(name)).map(name => name[7].toLowerCase() + name.slice(8)).filter(name => !(name in overrides));
}

export function eventBindings(props: ApiProp[], overrides: PropOverrides) {
  const available = new Set(props.map(prop => prop.name));
  const bindings: { event: string; prop: string; extract: 'first' | 'event' | 'close' }[] = [];
  for (const api of props) {
    const match = api.name.match(/^on([A-Z].*)Change$/);
    let prop = match ? match[1][0].toLowerCase() + match[1].slice(1) : '';
    if (api.name === 'onChange') prop = 'checked' in overrides ? 'checked' : 'value';
    if (api.name === 'onCommit' && ['number', 'text'].includes(props.find(prop => prop.name === 'value')?.control?.kind ?? '')) prop = 'value';
    if (api.name === 'onResize') prop = 'width';
    if (prop in overrides) bindings.push({ event: api.name, prop, extract: api.name === 'onChange' && /ChangeEvent/.test(api.type) ? 'event' : 'first' });
    if ('open' in overrides && !available.has('onOpenChange') && ['onClose', 'onCancel', 'onConfirm', 'onAlt'].includes(api.name)) bindings.push({ event: api.name, prop: 'open', extract: 'close' });
  }
  return bindings;
}

export function playgroundCode(code: string, symbol: string, metadata: PlaygroundMetadata | undefined, overrides: PropOverrides, props: ApiProp[] = []) {
  if (!metadata || !Object.keys(overrides).length || !metadata.targets[symbol]?.length) return code;
  const edits: { start: number; end: number; text: string }[] = [];
  const bindings = eventBindings(props, overrides);
  const controlled = [...new Set(bindings.map(binding => binding.prop))];
  const literal = (value: PropOverrides) => JSON.stringify(value, null, 2).replace(/\n/g, '\n  ');
  const values = Object.fromEntries(Object.entries(overrides).filter(([name]) => controlled.includes(name)));
  const rest = Object.fromEntries(Object.entries(overrides).filter(([name]) => !controlled.includes(name)));
  const declaration = bindings.length
    ? `const [playgroundState, setPlaygroundState] = usePlaygroundState<Required<Pick<ComponentProps<typeof ${symbol}>, ${controlled.map(name => JSON.stringify(name)).join(' | ')}>>>(${literal(values)});\n  const playgroundProps = { ...${literal(rest)}, ...playgroundState } satisfies Partial<ComponentProps<typeof ${symbol}>>;`
    : `const playgroundProps = ${literal(overrides)} satisfies Partial<ComponentProps<typeof ${symbol}>>;`;
  edits.push({ start: metadata.body, end: metadata.body, text: `\n  ${declaration}\n` });
  const targets = metadata.targets[symbol].slice(0, 1);
  for (const point of targets) {
    let attributes = ' {...playgroundProps}';
    for (const name of Object.keys(overrides)) {
      const original = point.attributes[name];
      if (original) edits.push({ start: original.start, end: original.end, text: '' });
    }
    for (const name of uncontrolledProps(overrides)) {
      const original = point.attributes[name];
      if (original) edits.push({ start: original.start, end: original.end, text: '' });
      attributes += ` ${name}={undefined}`;
    }
    for (const binding of bindings) {
      const original = point.attributes[binding.event];
      const call = original?.value ? `const original: NonNullable<ComponentProps<typeof ${symbol}>[${JSON.stringify(binding.event)}]> = ${original.value}; ` : '';
      const value = binding.extract === 'close' ? 'false' : binding.extract === 'event' ? `args[0].target.${binding.prop === 'checked' ? 'checked' : 'value'}` : 'args[0]';
      const update = `setPlaygroundState(current => ({ ...current, ${binding.prop}: ${value} }))`;
      const body = binding.extract === 'close' && original?.value ? `${call}return Promise.resolve(original(...args)).then(() => ${update});`
        : `${call}${original?.value ? 'original(...args); ' : ''}${update};`;
      const text = `${binding.event}={(...args) => { ${body} }}`;
      if (original) edits.push({ start: original.start, end: original.end, text });
      else attributes += ` ${text}`;
    }
    edits.push({ start: point.at, end: point.at, text: attributes });
    if (point.children && 'children' in overrides) edits.push({ start: point.children[0], end: point.children[1], text: '{playgroundProps.children}' });
  }
  for (const edit of edits.sort((a, b) => b.start - a.start)) code = code.slice(0, edit.start) + edit.text + code.slice(edit.end);
  return `${bindings.length ? "import { useState as usePlaygroundState, type ComponentProps }" : 'import type { ComponentProps }'} from 'react';\n${code}`;
}
