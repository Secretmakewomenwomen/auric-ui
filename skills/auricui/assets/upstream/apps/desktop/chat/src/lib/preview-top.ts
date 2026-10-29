/**
 * Where the lightbox (PreviewFrame) starts at the top of the window. On Windows the window's own buttons are drawn
 * over the page's top right (src/main.mjs, `titleBarOverlay`), above anything the page draws: the lightbox starts
 * below them, so its close button is never under the window's, which quits OpenFilm.
 *
 * Pure: no React, no bridge, so `node --test` runs it (src/preview-top.test.mjs).
 */

/** How tall Windows draws the window's buttons over the page: `titleBarOverlay`'s height in src/main.mjs. */
export const WINDOW_BUTTONS_H = 32;

/** The lightbox's top padding, as CSS, on this platform (`navigator.platform`). */
export function previewTop(platform: string): string {
  return platform.startsWith('Win') ? `${WINDOW_BUTTONS_H + 8}px` : 'max(1rem, var(--inset-titlebar-h, 0px))';
}
