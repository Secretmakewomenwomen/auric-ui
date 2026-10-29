export interface LocalAgentQuestion {
  id: string;
  question: string;
  header: string | null;
  options: Array<{ label: string; description?: string }>;
  /** The free-text field; null = options only (except for text-only questions). */
  customId: string | null;
  multi: boolean;
}

/** An answer: the option picked, or the text written. */
export type LocalAgentAnswer = { label: string } | { text: string };
