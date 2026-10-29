/**
 * The inspector's look controls over one or several things (layers inside a page, or clips): what each reads of their
 * CSS, and how an edit is shown (previewed) and written (committed) for each of them.
 */
import { MIXED, type Mixed } from './mixed.ts';

/** One thing's CSS property (kebab-case), as it is now. */
export type LookRead = (prop: string) => string | undefined;
/** Properties to write: a value, or null — "none of mine" (the panel decides what that leaves). */
export type LookSet = Record<string, string | null>;
/** What a control does to one thing, from that thing's own values. */
export type LookEdit = (read: LookRead) => LookSet;

export interface Look {
  /** How many things it is. */
  n: number;
  /** What `fn` makes of every thing's values, when they agree; MIXED when they do not. */
  common<V>(fn: (read: LookRead) => V): V | Mixed;
  /** Shows an edit on the picture, nothing written. */
  preview(edit: LookEdit): void;
  /** Writes an edit, as one change. */
  commit(edit: LookEdit): void;
  /** Takes a preview back off the picture. */
  revert(): void;
}

/**
 * A Look over `targets`: read each through `readOf`, and hand each one's properties to `write` (the panel stores
 * them). `write` gets only the things an edit changes.
 */
export function makeLook<Tg>(
  targets: readonly Tg[],
  readOf: (t: Tg) => LookRead,
  write: {
    commit: (sets: [Tg, LookSet][]) => void;
    preview?: (sets: [Tg, LookSet][]) => void;
    revert?: () => void;
  },
): Look {
  const reads = targets.map(readOf);
  const sets = (edit: LookEdit, kept?: ReadonlyMap<string, string | undefined>[] | null): [Tg, LookSet][] => targets.flatMap((tg, i) => {
    const read = reads[i]!;
    /* what was there before a preview: the layer is measured again while previewed, so by now it reads as the
       preview. The edit is worked out from it (a preview may have changed what the edit decides by, as text color
       taking over the words' own fill), and unchanged properties are not written: the agent reads the diff, a no-op
       would be an undo step, and a kept preview would read as no change */
    const was = (k: string) => (kept?.[i]?.has(k) ? kept[i]!.get(k) : read(k));
    const set = edit(was);
    const changed = Object.entries(set).filter(([k, v]) => (v ?? undefined) !== was(k));
    return changed.length ? [[tg, Object.fromEntries(changed)] as [Tg, LookSet]] : [];
  });
  return {
    n: targets.length,
    common(fn) {
      if (!reads.length) return MIXED;
      const first = fn(reads[0]!);
      const key = JSON.stringify(first);
      return reads.every((r) => JSON.stringify(fn(r)) === key) ? first : MIXED;
    },
    /* shown as said, unchanged or not: a layer reads as its kept change while a preview paints over it, so painting
       back what was there would read as no change */
    preview(edit) {
      if (!previewedBefore || previewedBefore.length !== targets.length) previewedBefore = targets.map(() => new Map());
      const list = targets.flatMap((tg, i) => {
        const set = edit(reads[i]!);
        for (const k of Object.keys(set)) if (!previewedBefore![i]!.has(k)) previewedBefore![i]!.set(k, reads[i]!(k));
        return Object.keys(set).length ? [[tg, set] as [Tg, LookSet]] : [];
      });
      write.preview?.(list);
    },
    commit(edit) {
      const list = sets(edit, previewedBefore);
      previewedBefore = null;
      if (list.length) write.commit(list);
    },
    revert() { previewedBefore = null; write.revert?.(); },
  };
}

/** What each previewed property of the things in hand was before its first preview (see makeLook's `sets`). */
let previewedBefore: Map<string, string | undefined>[] | null = null;
/** A preview was painted back by hand (as a preview of what was there): nothing previewed stands any more. */
export const previewSettled = () => { previewedBefore = null; };
