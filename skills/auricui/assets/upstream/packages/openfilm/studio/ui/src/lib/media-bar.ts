/**
 * The media pane's top bar at the pane's width, worked out from what its words measure in the person's language and
 * font. The search field takes whatever room is left, so nothing is left empty. As the pane narrows, Upload loses its
 * word first, then the field gets shorter (its hint cut, or gone, down to its icon), and only when even that does not
 * fit does the search become a button. A field too short to type in opens over the bar when clicked. The square
 * buttons (view, filter, sort, new folder, close) always stay.
 */

/** What the words measure, in px, at the bar's type. */
export interface BarWords {
  /** The search's hint ("Search"). */
  hint: number;
  /** Upload's word. */
  upload: number;
}

export interface BarLayout {
  /** The search as a field (else a button). */
  field: boolean;
  /** Upload with its word (else its icon). */
  uploadWord: boolean;
  /** Tighter padding and gaps: the narrowest form. */
  tight: boolean;
  /** The field is too short to type in: clicked, it opens over the bar. */
  cramped: boolean;
}

/** A square button. */
export const BAR_BUTTON = 28;
/* the search field around its hint: padding 8 + icon 13 + gap 6 + padding 8, and room for the caret */
const FIELD_CHROME = 39;
/** The shortest field: its icon. */
export const MIN_FIELD = 44;
/** The shortest field to type in where it is: its icon and a few letters. */
export const TYPING_FIELD = 72;
/* the clear button, while something is typed */
const CLEAR = 18;
/* Upload around its word: padding 10 + icon 13 + gap 6 + padding 10 */
const UPLOAD_CHROME = 39;

/** The bar for `width` px, with `buttons` square buttons after Upload; `typed`: the search has text. */
export function barLayout(width: number, words: BarWords, buttons: number, typed: boolean): BarLayout {
  const clear = typed ? CLEAR : 0;
  /* Upload keeps its word while the field still shows its whole hint beside it */
  if (rest(width, false, UPLOAD_CHROME + words.upload, buttons) >= FIELD_CHROME + words.hint + clear) {
    return { field: true, uploadWord: true, tight: false, cramped: false };
  }
  const room = rest(width, false, BAR_BUTTON, buttons);
  if (room >= MIN_FIELD) return { field: true, uploadWord: false, tight: false, cramped: room < TYPING_FIELD + clear };
  return { field: false, uploadWord: false, tight: true, cramped: true };
}

/** The room the search field gets: the width less padding, Upload, the square buttons and the gaps between. */
export function rest(width: number, tight: boolean, upload: number, buttons: number): number {
  const pad = tight ? 16 : 20;
  const gap = tight ? 2 : 4;
  return width - pad - upload - buttons * BAR_BUTTON - (buttons + 1) * gap;
}
