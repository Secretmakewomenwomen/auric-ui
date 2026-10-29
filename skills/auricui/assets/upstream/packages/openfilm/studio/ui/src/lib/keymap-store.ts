/**
 * The keys in use on this page: the scheme and custom schemes from Studio's prefs (`keys`, lib/keymap), read once and
 * again whenever the page comes back into view (Settings may have changed them in another window), and the keymap
 * they make. The key handlers read it as each key is pressed (`keyAction`); hints and Settings re-render on a change.
 */
import { useMemo, useSyncExternalStore } from 'react';
import { api } from '@/api';
import { actionOf, DEFAULT_KEY_PREFS, hintOf, keyPrefsOf, keymapOf, type ActionId, type KeyPrefs, type Keymap } from './keymap.ts';
import type { KeyPress } from './timeline-keys.ts';

/** ⌘ is the modifier on a Mac, Ctrl elsewhere (as lib/shortcut-hint). */
export const MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

let prefs: KeyPrefs = DEFAULT_KEY_PREFS;
let keymap: Keymap = keymapOf(prefs, MAC);
const listeners = new Set<() => void>();
let loaded = false;

function set(next: KeyPrefs): void {
  if (JSON.stringify(next) === JSON.stringify(prefs)) return;
  prefs = next;
  keymap = keymapOf(next, MAC);
  for (const fn of listeners) fn();
}

function load(): void {
  void api.prefs().then((p) => set(keyPrefsOf(p.keys)), () => { /* Studio not reachable: the keys as they are */ });
}

function ensure(): void {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  load();
  window.addEventListener('focus', load);
}

/** The keys in use. */
export function currentKeymap(): Keymap {
  ensure();
  return keymap;
}

/** The action a key press is, with the keys in use; null when it is none. */
export const keyAction = (e: KeyPress): ActionId | null => actionOf(e, currentKeymap(), MAC);

/** The schemes as kept. */
export function currentKeyPrefs(): KeyPrefs {
  ensure();
  return prefs;
}

/** Keep the schemes (Settings' Save): in use at once here, and in Studio's prefs for every window and next time. */
export async function saveKeyPrefs(next: KeyPrefs): Promise<void> {
  set(next);
  await api.setPrefs({ keys: next });
}

function subscribe(fn: () => void): () => void {
  ensure();
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** The schemes as kept, kept up to date. */
export const useKeyPrefs = (): KeyPrefs => useSyncExternalStore(subscribe, currentKeyPrefs, () => DEFAULT_KEY_PREFS);

/** The keys in use, kept up to date. */
export const useKeymap = (): Keymap => useSyncExternalStore(subscribe, currentKeymap, currentKeymap);

/** A hint for an action (its first key, ⌘B on a Mac and Ctrl+B elsewhere), with the keys in use; undefined: it has none. */
export function useKeyHint(): (id: ActionId) => string | undefined {
  const map = useKeymap();
  return useMemo(() => (id: ActionId) => hintOf(map, id, MAC), [map]);
}
