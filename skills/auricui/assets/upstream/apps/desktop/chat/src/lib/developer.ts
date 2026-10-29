/**
 * Settings → Developer, as the chat follows it: `logs` on, each turn shows its full log (components/TurnLog.tsx);
 * `changes` on (unless turned off), what each turn changed in the files, under its reply (components/FileChangesList).
 * The app keeps the choice; Studio's Settings switches it.
 */
import React from 'react';
import { app, type DeveloperPrefs } from '../app-bridge';

let prefs: DeveloperPrefs = { logs: false, changes: true };
const listeners = new Set<() => void>();
const set = (next: DeveloperPrefs) => {
  if (next.logs === prefs.logs && next.changes === prefs.changes) return;
  prefs = next;
  for (const listener of listeners) listener();
};
let started = false;
function start() {
  if (started) return;
  started = true;
  void app.developer.get().then(set).catch(() => {});
  app.developer.onChange(set);
}
const subscribe = (listener: () => void) => { start(); listeners.add(listener); return () => { listeners.delete(listener); }; };

/** each turn's full log, from its footer */
export function useDeveloperMode(): boolean {
  return React.useSyncExternalStore(subscribe, () => prefs.logs, () => false);
}

/** what each turn changed in the files, under its reply */
export function useShowChanges(): boolean {
  return React.useSyncExternalStore(subscribe, () => prefs.changes, () => true);
}

/** The project the chat shows (its folder): where a turn's log is. */
export const ChatProjectContext = React.createContext<string | null>(null);

/** Whether something waits for the person's answer now (a question, a permission, a spend): the status line says so. */
export const WaitingContext = React.createContext(false);
