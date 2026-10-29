/**
 * Delivery frame: fitting a film into a box of another aspect ratio.
 *
 * The film stays as it is; the frame goes around it. A 16:9 film delivered vertically gets a 9:16 box with the film
 * centered and black bars above and below — not a 1080×1920 stage, which would break every px coordinate the film was
 * laid out with. Re-laying a film out is its author's job, not a button's.
 *
 * Two ways to fit it: `contain` (default) scales and centers with bars and never crops; `cover` fills the box and
 * crops the overflow, so the edges are really gone — a choice, never the default.
 *
 * The frame is the export's choice, not part of the film: picked in the export dialog for one export (the film's own
 * shape is its canvas, which the viewer's ratio button changes).
 */

/**
 * A delivery frame: `native` (no frame, the film at its own size), or a ratio written `W:H` ("16:9", "2.39:1"): one of
 * the presets, or any other the person types, from 1:4 to 4:1.
 */
export type FilmFrameId = 'native' | `${number}:${number}`;

/** The presets, as editors offer them: video and social shapes first, then photo and cinema ones. */
export const FILM_FRAME_IDS: FilmFrameId[] = [
  'native', '16:9', '9:16', '1:1', '4:5', '4:3', '3:4', '3:2', '2:3', '21:9', '2.39:1', '1.85:1', '2:1',
];

/** How far a frame may go from square, either way (a custom one past it is refused). */
export const FRAME_RATIO_LIMIT = 4;
const RATIO = /^(\d{1,4}(?:\.\d{1,3})?):(\d{1,4}(?:\.\d{1,3})?)$/;

/** Width ÷ height of a frame written `W:H`, or null when it is not one (or too far from square). */
export function frameRatioOf(frame: string): number | null {
  const m = RATIO.exec(frame);
  if (!m) return null;
  const ratio = Number(m[1]) / Number(m[2]);
  return Number.isFinite(ratio) && ratio >= 1 / FRAME_RATIO_LIMIT && ratio <= FRAME_RATIO_LIMIT ? ratio : null;
}

/** A frame from a typed width and height ("2.39" and "1"), or null when they make none. */
export function customFilmFrame(w: number, h: number): FilmFrameId | null {
  const num = (n: number) => String(Math.round(n * 1000) / 1000);
  if (!(w > 0) || !(h > 0)) return null;
  const id = `${num(w)}:${num(h)}`;
  return frameRatioOf(id) != null ? id as FilmFrameId : null;
}

export function filmFrameRatio(frame: FilmFrameId, stage: { w: number; h: number }): number {
  return (frame === 'native' ? null : frameRatioOf(frame)) ?? stage.w / Math.max(1, stage.h);
}

/** Even sizes: H.264 samples chroma in 2×2 blocks and refuses odd dimensions. */
function even(n: number): number {
  return Math.max(2, Math.round(n / 2) * 2);
}

export type FilmFrameFill = 'contain' | 'cover';

export interface FilmFrameBox {
  /** The frame's pixel size (an export comes out this size). */
  w: number;
  h: number;
  /** Its exact shape: the frame's own ratio, not its even-rounded pixels' (16:9 around a 2:1 film is 2160 × 1216). */
  ratio: number;
  /** The film inside the frame, scaled. With `cover`, `left`/`top` go negative: the overflow is cut by the frame. */
  inner: { w: number; h: number; left: number; top: number; scale: number };
}

/**
 * Fit `stage` into `frame`: the frame's size and the film's place in it. The frame's long side follows the film's
 * (a 4K film framed 9:16 stays 4K-sharp; a 720p film is not blown up), so the frame only decides the shape.
 */
export function filmFrameBox(
  stage: { w: number; h: number },
  frame: FilmFrameId,
  fill: FilmFrameFill = 'contain',
): FilmFrameBox {
  const sw = Math.max(1, stage.w);
  const sh = Math.max(1, stage.h);
  const ratio = frame === 'native' ? null : frameRatioOf(frame);
  if (ratio == null) {
    return { w: even(sw), h: even(sh), ratio: sw / sh, inner: { w: sw, h: sh, left: 0, top: 0, scale: 1 } };
  }
  /* the frame must hold the film both ways: take the larger */
  const byWidth = { w: sw, h: sw / ratio };
  const byHeight = { w: sh * ratio, h: sh };
  const box = byWidth.h >= sh ? byWidth : byHeight;
  const w = even(box.w);
  const h = even(box.h);
  const scale = fill === 'cover'
    ? Math.max(w / sw, h / sh)
    : Math.min(w / sw, h / sh);
  const iw = sw * scale;
  const ih = sh * scale;
  return {
    w,
    h,
    ratio,
    inner: { w: iw, h: ih, left: (w - iw) / 2, top: (h - ih) / 2, scale },
  };
}

/** Whether the frame has the film's own shape (then framing it changes nothing). */
export function filmFrameIsNative(stage: { w: number; h: number }, frame: FilmFrameId): boolean {
  const ratio = frame === 'native' ? null : frameRatioOf(frame);
  if (ratio == null) return true;
  return Math.abs(stage.w / Math.max(1, stage.h) - ratio) < 0.01;
}

/**
 * The stage itself in another shape (canvas mode: nothing has been laid out yet, so changing the stage breaks
 * nothing). 1080p family: the short side is pinned at 1080 (16:9 = 1920×1080, 21:9 = 2520×1080, 9:16 = 1080×1920).
 */
const HD = 1080;

export function filmFrameStage(
  stage: { w: number; h: number },
  frame: FilmFrameId,
): { w: number; h: number } {
  const ratio = frame === 'native' ? null : frameRatioOf(frame);
  if (ratio == null) return { w: even(stage.w), h: even(stage.h) };
  return ratio >= 1
    ? { w: even(HD * ratio), h: even(HD) }
    : { w: even(HD), h: even(HD / ratio) };
}

/** Which frame this stage's shape is (`native` when none). Canvas mode ticks this one. */
export function filmFrameOf(stage: { w: number; h: number }): FilmFrameId {
  return FILM_FRAME_IDS.find((id) => id !== 'native' && filmFrameIsNative(stage, id)) ?? 'native';
}

export function parseFilmFrame(raw: unknown): FilmFrameId {
  return typeof raw === 'string' && (raw === 'native' || frameRatioOf(raw) != null)
    ? raw as FilmFrameId
    : 'native';
}
