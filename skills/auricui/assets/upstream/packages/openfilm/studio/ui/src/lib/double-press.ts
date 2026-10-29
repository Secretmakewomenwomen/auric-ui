/** A press on the picture: where, in the film's own pixels, and when (an event's timeStamp, ms). */
export interface Press { x: number; y: number; at: number }

/** Two presses this close in time are one double-click (the system's own interval is about this). */
export const DOUBLE_PRESS_MS = 500;

/** The presses kept: the last two, since a double-click is aimed by the first of its pair. */
export function keepPress(presses: readonly Press[], press: Press): Press[] {
  return [...presses.slice(-1), press];
}

/**
 * Where a double-click at `now` was aimed: its first press. The picture can move under the hand between the two (the
 * first click opens the inspector, which shrinks it), so the second press is not where it was meant. The press just
 * before the second one, not the first in a while: a click elsewhere a moment earlier was not aimed at it. Null when
 * the last two presses are not the double-click's (the double-click's own point is then the best there is).
 */
export function doubleClickAim(presses: readonly Press[], now: number): Press | null {
  const [first, second] = presses.length >= 2 ? presses.slice(-2) : [];
  if (!first || !second) return null;
  return second.at - first.at < DOUBLE_PRESS_MS && now - second.at < DOUBLE_PRESS_MS ? first : null;
}
