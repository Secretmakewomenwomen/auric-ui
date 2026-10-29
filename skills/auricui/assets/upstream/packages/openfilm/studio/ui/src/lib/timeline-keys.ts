/**
 * Reading keys (`letterOf`), J / K / L shuttle (`shuttleRate`) and looping a range (`loopBack`, `playStart`). Which key
 * does what is lib/keymap's.
 *
 * Plain letters are read by the letter they type, so they follow the keyboard's layout; on a layout without Latin
 * letters (Korean, Russian…) by where the key is on a US keyboard.
 */

export interface KeyPress {
  key: string;
  code?: string;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

/** The letter a key types (lower case), or where it is on a US keyboard when it types none. */
export function letterOf(e: Pick<KeyPress, 'key' | 'code'>): string {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (/^[a-z]$/.test(key)) return key;
  const code = /^Key([A-Z])$/.exec(e.code ?? '')?.[1];
  return code ? code.toLowerCase() : key;
}

/** How many frames ⇧← / ⇧→ move the playhead (a big step). */
export const JUMP_FRAMES = 10;

/* ── J / K / L ── */

/** The fastest a shuttle goes, either way. */
export const SHUTTLE_MAX = 4;

/**
 * The rate after J, K or L, from `rate` (0: stopped; negative: backwards). L plays forward, and again doubles it
 * (1×, 2×, 4×); J the same backwards; K stops. From one direction the other key starts over at 1× that way.
 */
export function shuttleRate(rate: number, key: 'j' | 'k' | 'l'): number {
  if (key === 'k') return 0;
  if (key === 'l') return rate > 0 ? Math.min(SHUTTLE_MAX, rate * 2) : 1;
  return rate < 0 ? Math.max(-SHUTTLE_MAX, rate * 2) : -1;
}

/* ── looping a range ── */

type Range = { startMs: number; endMs: number } | null | undefined;

/** What loops: the range marked, else the whole film. */
function loopSpan(range: Range, totalMs: number): { startMs: number; endMs: number } {
  return range && range.endMs > range.startMs ? range : { startMs: 0, endMs: totalMs };
}

/** Where playback goes back to once it reaches the end of what loops; null: on it goes. */
export function loopBack(nowMs: number, range: Range, totalMs: number): number | null {
  const span = loopSpan(range, totalMs);
  return span.endMs > span.startMs && nowMs >= span.endMs - 1 ? span.startMs : null;
}

/** Where playback starts with loop on: where it is, inside what loops; else at its start. */
export function playStart(nowMs: number, range: Range, totalMs: number): number {
  const span = loopSpan(range, totalMs);
  return nowMs >= span.startMs && nowMs < span.endMs - 1 ? nowMs : span.startMs;
}
