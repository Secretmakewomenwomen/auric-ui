/**
 * Whether files that changed in the project's folder can change the picture, so the preview draws it again. A page
 * draws from what it loads (styles, code, pictures, data, fonts), and a clip plays its media file; what no page loads
 * (notes, scripts, logs, an agent's own working files) cannot change it, and redrawing the whole film for each of them
 * would make the preview reload over and over while an agent writes them.
 */

/** files no page loads: words to read, programs to run, settings of tools */
const NOT_PICTURE = /\.(md|markdown|txt|log|py|sh|bash|zsh|rb|go|rs|java|c|cc|cpp|h|hpp|swift|kt|toml|ya?ml|ini|cfg|env|lock|patch|diff|bak|tmp|swp)$/i;

/**
 * True when any of `paths` (in the project, with `/`) can change the picture: a page or anything a page may load, or a
 * media file a clip plays (`used`), made again in place. Other media under assets/ are loaded as they are used. No
 * paths (the watcher could not tell): true.
 */
export function changesPicture(paths: readonly string[] | undefined, used: ReadonlySet<string | undefined>): boolean {
  if (!paths) return true;
  return paths.some((path) => (path.startsWith('assets/') ? used.has(path) : !NOT_PICTURE.test(path)));
}
