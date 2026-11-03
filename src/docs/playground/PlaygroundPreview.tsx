import type { ComponentType } from 'react';
import * as english from '../generated-playground-en';
import { useDocsLocale } from '../locale';
import * as examples from '../generated-playground';
import { getDoc } from '../catalog';
import type { Entry } from '../../registry';
import { PlaygroundBoundary, PlaygroundContext, usePlayground } from './runtime';
import { playgroundCode, type PlaygroundSession } from './model';

export function PlaygroundPreview({ entry, session }: { entry: Entry; session: PlaygroundSession }) {
  const { locale } = useDocsLocale();
  const doc = getDoc(entry, locale);
  const Example = ((locale === 'en' ? english : examples) as Record<string, ComponentType>)[`${doc.example ?? doc.symbol}Example`];
  const snapshot = usePlayground(session);
  return <PlaygroundContext.Provider value={session}>
    <PlaygroundBoundary key={snapshot.recovery} revision={snapshot.revision} onReset={() => session.reset()}>
      <div className="docs-agent-example"><Example /></div>
    </PlaygroundBoundary>
  </PlaygroundContext.Provider>;
}

export function PlaygroundCode({ entry, session, className }: { entry: Entry; session: PlaygroundSession; className: string }) {
  const { locale } = useDocsLocale();
  const doc = getDoc(entry, locale);
  const snapshot = usePlayground(session);
  return <pre className={className}>{playgroundCode(doc.code ?? '', doc.symbol, doc.playground, snapshot.overrides, doc.api?.props)}</pre>;
}
