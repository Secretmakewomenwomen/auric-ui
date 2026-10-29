/**
 * What a turn changed in the project's files (src/file-changes.mjs reads the folder as the turn starts and settles):
 * each file added, removed or changed, its lines added and removed, and the changed lines in hunks. Kept with the
 * turn (`fileChanges` on the saved turn), since afterwards nothing can tell what the files were before.
 *
 * Pure: no React, no bridge, so `node --test` runs it (src/file-changes.test.mjs).
 */

export interface FileHunk { oldStart: number; oldLines: number; newStart: number; newLines: number; lines: string[] }

export interface FileChange {
  /** its path in the project, with `/` */
  path: string;
  change: 'added' | 'removed' | 'changed';
  /** lines added and removed: none for a file that is not text (media, a large file) */
  added?: number;
  removed?: number;
  /** the changed lines, with three around each; `cut`: only the first of them are kept */
  hunks?: FileHunk[];
  cut?: boolean;
}

/** What a saved turn keeps of this (lib/chat-store's Turn, extended here: older turns have none). */
export interface TurnFileChanges { fileChanges?: FileChange[] }

/** A saved turn's file changes, as read back from its file: what does not look like one is left out. */
export function readFileChanges(value: unknown): FileChange[] | null {
  if (!Array.isArray(value)) return null;
  const list = value.filter((c): c is FileChange => Boolean(c) && typeof c.path === 'string'
    && (c.change === 'added' || c.change === 'removed' || c.change === 'changed'));
  return list.length ? list : null;
}
