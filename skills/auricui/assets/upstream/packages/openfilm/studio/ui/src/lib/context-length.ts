/**
 * The context length of one of the person's own models, as typed in Settings → Agents: a whole number of tokens from
 * 32K to 10M (apps/desktop src/pi-config.mjs contextLength), its thousands separated or not.
 * `{}` when empty (the model gets 128K), `{ context }` when it holds, null when it does not.
 */
export function parseContextLength(text: string): { context?: number } | null {
  const typed = text.trim();
  if (!typed) return {};
  if (!/^\d+$|^\d{1,3}([,. '’]\d{3})+$/.test(typed)) return null;
  const context = Number(typed.replace(/\D/g, ''));
  return context >= 32_000 && context <= 10_000_000 ? { context } : null;
}
