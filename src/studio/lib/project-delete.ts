/**
 * Which of the projects whose delete seemed to fail are still there, by the list read again (`list`): one gone already
 * was deleted, and one whose answer was lost (`lost`: the request was cut off, as when the page showing it leaves
 * it) may still be on its way to the Trash, so the list is read again a few times (`wait` between) before it counts.
 * A list that cannot be read changes nothing.
 */
export async function stillThere<F extends { id: string; lost: boolean }>(
  failed: readonly F[],
  list: () => Promise<readonly string[]>,
  { tries = 6, wait = () => new Promise<void>((done) => setTimeout(done, 500)) }: { tries?: number; wait?: () => Promise<void> } = {},
): Promise<F[]> {
  let left = [...failed];
  for (let i = 0; left.length && i < tries; i++) {
    if (i) await wait();
    const ids = await list().then((l) => new Set(l), () => null);
    if (ids) left = left.filter((f) => ids.has(f.id));
    if (!left.some((f) => f.lost)) break;
  }
  return left;
}
