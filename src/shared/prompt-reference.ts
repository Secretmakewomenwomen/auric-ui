/**
 * The things a message points at (its "pills"), as they are sent and stored.
 *
 * Two things here cross process boundaries:
 *
 *   1. The token. A pill in the text is an invisible token (`⁣<id>⁣`), and that string is stored with the
 *      turn, so its shape is a format, not a component's private detail.
 *   2. What a pill keeps so it can be drawn again. See `promptReferenceSchema`.
 *
 * The text sent to the model is not this: the client expands pills into plain words (file paths, "[1: beat 2 0:04]").
 * This is what the person saw in the composer; both are kept.
 */
// Browser build: use structural types; server-side Zod validators stay in the source snapshot.

/** The token mark: `U+2063 INVISIBLE SEPARATOR` on both sides of the id. Nobody types it, and a stray one is invisible. */
export const PROMPT_REFERENCE_MARK = '⁣';

export function promptReferenceToken(id: string): string {
  return `${PROMPT_REFERENCE_MARK}${id}${PROMPT_REFERENCE_MARK}`;
}

/* A new one each time: a `g` regex remembers where it stopped. */
function tokenPattern(): RegExp {
  return new RegExp(`${PROMPT_REFERENCE_MARK}([^${PROMPT_REFERENCE_MARK}]+)${PROMPT_REFERENCE_MARK}`, 'g');
}

export type PromptTextSegment =
  | { kind: 'text'; value: string }
  | { kind: 'reference'; id: string };

/** Splits tokenized text into alternating text and reference segments (the composer and the chat use the same split). */
export function splitPromptReferenceText(text: string): PromptTextSegment[] {
  const segments: PromptTextSegment[] = [];
  let cursor = 0;
  for (const match of text.matchAll(tokenPattern())) {
    const at = match.index ?? 0;
    if (at > cursor) segments.push({ kind: 'text', value: text.slice(cursor, at) });
    segments.push({ kind: 'reference', id: match[1]! });
    cursor = at + match[0].length;
  }
  if (cursor < text.length) segments.push({ kind: 'text', value: text.slice(cursor) });
  return segments;
}

/** The text without its tokens: what the person actually typed. */
export function stripPromptReferenceTokens(text: string): string {
  return text.replace(tokenPattern(), '');
}

/**
 * What a pill keeps: enough to draw it and to go back to what it points at.
 *
 * `kind` is any string, not an enum: a kind the reader does not know falls back to a generic icon instead of failing.
 */
export interface PromptReference {
  id: string; kind: string; label: string; detail?: string;
  image?: { src: string; crop?: { x: number; y: number; w: number; h: number }; stage?: { w: number; h: number } };
  target?: Record<string, unknown>;
}

/** Limits for a field kept only for display (the product's own limit is on the expanded text). */
export const PROMPT_DISPLAY_MAX_CHARS = 50_000;
export const PROMPT_DISPLAY_MAX_REFERENCES = 64;

/** A message as it looked in the composer. */
export interface PromptDisplay { text: string; references: PromptReference[] }

/**
 * The composer view of a message, or undefined when it has no pills (then it equals the sent text).
 *
 * `references` is the sender's whole pool; only the ones still in the text are kept (an undo may have removed one).
 * Over a limit, nothing is kept rather than a partial list: the expanded text still reads whole.
 */
export function buildPromptDisplay(
  text: string,
  references: readonly PromptReference[],
): PromptDisplay | undefined {
  const byId = new Map(references.map((item) => [item.id, item]));
  const used: PromptReference[] = [];
  const seen = new Set<string>();
  for (const segment of splitPromptReferenceText(text)) {
    if (segment.kind === 'text' || seen.has(segment.id)) continue;
    seen.add(segment.id);
    const reference = byId.get(segment.id);
    if (reference) used.push(reference);
  }
  if (!used.length) return undefined;
  if (text.length > PROMPT_DISPLAY_MAX_CHARS) return undefined;
  if (used.length > PROMPT_DISPLAY_MAX_REFERENCES) return undefined;
  return { text, references: used };
}
