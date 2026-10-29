/**
 * What an agent points at in Studio, in its reply. The agent writes a token in its text (src/agents.mjs tells it how)
 * and the chat draws it as a pill, the same pill the person's own references are, which opens the thing in Studio:
 *
 *   [[clip:<id>]]            a clip, by its film.html id
 *   [[t:<seconds>]]          a moment of the film
 *   [[range:<start>-<end>]]  a stretch of the film, in seconds (start before end)
 *   [[track:<index>]]        a track, by its place in film.html (0 is the first)
 *   [[file:<path>]]          a file of the project, by its path in the project
 *
 * Anything else between double brackets (an unknown kind, a number that is not one, a path out of the project) stays
 * as the agent wrote it: a pill that leads nowhere would be worse than the words.
 *
 * Pure: no React, no bridge, so `node --test` runs it (src/agent-refs.test.mjs).
 */
import type { PromptReference as StoredPromptReference } from '@/shared';
import type { StudioRef } from '../app-bridge';

export type AgentRefSegment = { kind: 'text'; text: string } | { kind: 'ref'; ref: StudioRef; raw: string };

const TOKEN = /\[\[([a-z]+):([^\[\]\n]{1,300})\]\]/g;
const SECONDS = /^\d+(?:\.\d+)?$/;

/** The reference a token's kind and value name, or null when they name none. */
function refOf(kind: string, value: string): StudioRef | null {
  const v = value.trim();
  switch (kind) {
    case 'clip':
      return /^[^\s"'<>`]{1,120}$/.test(v)
        ? { kind: 'clip', id: v, loc: null, label: v, clipKind: 'mg', src: null, start: 0, end: 0 }
        : null;
    case 't':
      return SECONDS.test(v) ? { kind: 'time', time: Number(v) } : null;
    case 'range': {
      /* an agent writes an en dash as often as a hyphen */
      const m = /^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)$/.exec(v);
      if (!m) return null;
      const start = Number(m[1]);
      const end = Number(m[2]);
      return end > start ? { kind: 'range', start, end, clipIds: [] } : null;
    }
    case 'track':
      return /^\d{1,3}$/.test(v) ? { kind: 'track', track: Number(v), label: '', clipIds: [] } : null;
    case 'file': {
      /* a path in the project: not from the disk's root, not out of the folder, not an address */
      const path = v.replace(/^\.\//, '');
      if (!path || path.startsWith('/') || /^[a-z]:[\\/]/i.test(path) || /^[a-z][a-z0-9+.-]*:/i.test(path)) return null;
      if (path.split(/[\\/]/).some((part) => part === '..')) return null;
      return { kind: 'file', path, fileKind: '' };
    }
    default:
      return null;
  }
}

/** A piece of the agent's text, split into its words and the references in it. */
export function parseAgentRefs(text: string): AgentRefSegment[] {
  const out: AgentRefSegment[] = [];
  const pushText = (chunk: string) => {
    if (!chunk) return;
    const last = out[out.length - 1];
    if (last?.kind === 'text') last.text += chunk;
    else out.push({ kind: 'text', text: chunk });
  };
  let cursor = 0;
  for (const match of text.matchAll(TOKEN)) {
    const ref = refOf(match[1]!, match[2]!);
    if (!ref) continue;
    pushText(text.slice(cursor, match.index));
    out.push({ kind: 'ref', ref, raw: match[0] });
    cursor = match.index! + match[0].length;
  }
  pushText(text.slice(cursor));
  return out;
}

export function agentRefPill(ref: StudioRef, { trackLabel }: { clipSrc?: string | null; trackLabel?: (track: number) => string } = {}): StoredPromptReference {
 const label = ref.kind === 'file' ? ref.path : ref.kind === 'clip' ? ref.label : ref.kind === 'time' ? `${ref.time}s` : ref.kind === 'range' ? `${ref.start}–${ref.end}s` : ref.kind === 'track' ? trackLabel?.(ref.track) ?? `Track ${ref.track}` : 'label' in ref ? String(ref.label) : ref.kind;
 return { id: `agent:${ref.kind}:${label}`, kind: ref.kind === 'clip' ? 'clipMg' : ref.kind, label, target: { ...ref } };
}
