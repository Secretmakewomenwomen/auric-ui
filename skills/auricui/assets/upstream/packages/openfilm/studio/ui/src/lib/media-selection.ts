/**
 * What is picked in the media pane, the way a file manager picks (Finder, File Explorer): a click picks one, ⌘ (Ctrl)
 * adds one or takes it away, ⇧ picks the run from the one clicked last, and a box dragged over empty space picks what
 * it touches (with ⌘ or ⇧ held, on top of what was picked). Items are named by their project-relative path, a
 * folder's too, so a key is the path a move or a delete takes.
 */

export interface PickMods {
  /** ⌘ or Ctrl held: add or take away. */
  toggle: boolean;
  /** ⇧ held: the run from the anchor. */
  range: boolean;
}

/** What is picked after a click on `key`; `order` is the items as shown, `anchor` the one clicked last. */
export function pickItem(
  picked: readonly string[],
  key: string,
  order: readonly string[],
  anchor: string | null,
  mods: PickMods,
): string[] {
  const from = anchor == null ? -1 : order.indexOf(anchor);
  const to = order.indexOf(key);
  if (mods.range && from >= 0 && to >= 0) {
    const run = order.slice(Math.min(from, to), Math.max(from, to) + 1);
    return mods.toggle ? [...new Set([...picked, ...run])] : run;
  }
  if (mods.toggle) return picked.includes(key) ? picked.filter((k) => k !== key) : [...picked, key];
  return [key];
}

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** The box between two points, whichever way it was dragged. */
export function boxBetween(a: { x: number; y: number }, b: { x: number; y: number }): Box {
  return { left: Math.min(a.x, b.x), top: Math.min(a.y, b.y), right: Math.max(a.x, b.x), bottom: Math.max(a.y, b.y) };
}

/** The items a dragged box touches, in the order given. */
export function boxHits(items: readonly { key: string; box: Box }[], box: Box): string[] {
  return items
    .filter(({ box: b }) => b.left < box.right && b.right > box.left && b.top < box.bottom && b.bottom > box.top)
    .map(({ key }) => key);
}

/** What a box picks: what it touches, or that on top of what was picked before it (`add`). */
export function boxPick(before: readonly string[], hits: readonly string[], add: boolean): string[] {
  return add ? [...new Set([...before, ...hits])] : [...hits];
}

/**
 * Where things can be moved: the top ('') and every folder (paths under assets/), less the folders being moved and
 * the folders inside them (a folder cannot go into itself).
 */
export function moveTargets(folders: readonly string[], moving: readonly string[]): string[] {
  const inside = (dir: string) => moving.some((m) => dir === m || dir.startsWith(`${m}/`));
  return ['', ...folders.filter((dir) => !inside(dir)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))];
}
