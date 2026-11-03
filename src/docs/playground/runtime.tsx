import { Component, createContext, createElement, useContext, useId, useLayoutEffect, useSyncExternalStore, type ComponentType, type ReactNode } from 'react';
import { eventBindings, uncontrolledProps, type PlaygroundSession } from './model';
import { localizeView, useDocsLocale } from '../locale';

export const PlaygroundContext = createContext<PlaygroundSession | null>(null);
export const usePlayground = (session: PlaygroundSession) => useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);

function Connected({ component, original, session, site }: { component: ComponentType<Record<string, unknown>>; original: Record<string, unknown>; session: PlaygroundSession; site: string }) {
  const id = useId();
  const snapshot = usePlayground(session);
  useLayoutEffect(() => { session.capture(id, original, site); });
  useLayoutEffect(() => () => session.release(id), [id, session]);
  const overrides = snapshot.site === site ? snapshot.overrides : {};
  const props = { ...original, ...overrides };
  for (const name of uncontrolledProps(overrides)) delete props[name];
  for (const { event, prop: valueProp, extract } of eventBindings(session.props, overrides)) {
    const handler = original[event];
    props[event] = (...args: unknown[]) => {
      let next = args[0];
      if (extract === 'event' && next && typeof next === 'object' && 'target' in next) {
        const target = (next as { target: Record<string, unknown> }).target;
        next = target[valueProp === 'checked' ? 'checked' : 'value'];
      }
      // Editing the inspector is part of the preview interaction, not an outside dismissal.
      if (valueProp === 'open' && next === false && session.shouldIgnoreDismiss()) return;
      const result = typeof handler === 'function' ? handler(...args) : undefined;
      if (extract === 'close') {
        const close = () => { if (session.getSnapshot().revision === snapshot.revision) session.set(valueProp, false); };
        if (result && typeof result.then === 'function') return Promise.resolve(result).then(close);
        close();
        return result;
      }
      // Preserve the example's callback and keep explicitly controlled values interactive.
      if (next !== undefined) session.set(valueProp, next as Parameters<typeof session.set>[1]);
      return result;
    };
  }
  // default* props are read on mount. Remount only when one of those overrides changes.
  const defaults = Object.entries(overrides).filter(([name]) => name.startsWith('default'));
  return createElement(component, { ...props, key: JSON.stringify(defaults) });
}

/** Generated wrappers retain the original public type, including generic props and refs. */
export function bindPlaygroundComponent<T>(component: T, target: string, site: string): T {
  function Bound(props: Record<string, unknown>) {
    const session = useContext(PlaygroundContext);
    const original = component as ComponentType<Record<string, unknown>>;
    return session?.target === target
      ? <Connected component={original} original={props} session={session} site={site} />
      : createElement(original, props);
  }
  Bound.displayName = `Playground(${target})`;
  return Bound as T;
}

function PlaygroundError({ onReset }: { onReset: () => void }) {
  const { t } = useDocsLocale();
  return localizeView(<div className="playground-error" role="alert"><b>这组参数暂时无法预览</b><span>请检查参数结构，或恢复示例设置。</span><button type="button" onClick={onReset}>恢复示例</button></div>, t);
}

export class PlaygroundBoundary extends Component<{ children: ReactNode; onReset: () => void; revision: number }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidUpdate(previous: Readonly<{ children: ReactNode; onReset: () => void; revision: number }>) {
    if (this.state.error && previous.revision !== this.props.revision) this.setState({ error: false });
  }
  render() {
    if (this.state.error) return <PlaygroundError onReset={this.props.onReset} />;
    return this.props.children;
  }
}
