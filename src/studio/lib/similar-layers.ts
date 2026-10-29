/**
 * A look given to every layer like one (the inspector's "All like it"): the titles of a film are usually several
 * layers of the same kind (`h2.title`) in several pages, and restyling them one by one is tedious.
 *
 * A layer like it is one with its tag and classes (the stage's `similar`, stage.js). The style goes into each page
 * clip's `overrides` with that selector and no `n`, so it reaches every match in the page, as a style for all copies
 * does. Only clips whose page's source names every one of those classes get it: a page that never has them would show
 * the change as lost. Pages that make their classes in code name them in that code, so they are found the same way.
 */
import { nextOverrides, type OverrideGeometry } from './film-overrides.ts';
import { filmDocLoc, filmSrcIsPage, type FilmDoc } from './film.ts';

/** The classes a `similar` selector names: `h2.title.big` → title, big. */
export function similarClasses(selector: string): string[] {
  return [...selector.matchAll(/\.((?:\\.|[\w-])+)/g)].map((m) => m[1]!.replace(/\\(.)/g, '$1'));
}

/**
 * Whether a page's source puts every class of the selector on something: in a `class` attribute or a string its code
 * uses (`classList.add('title')`), never a stylesheet's rule (a page styling `.title` may have none) or its words.
 */
export function pageMayHave(source: string, selector: string): boolean {
  const classes = similarClasses(selector);
  const code = source.replace(/<style[\s\S]*?<\/style>/gi, '');
  const quoted = [...code.matchAll(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g)].map((m) => m[2]).join(' ');
  return classes.length > 0 && classes.every((c) => new RegExp(`(^|[^\\w-])${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\w-])`).test(quoted));
}

/** The page clips of the film (its place in film.html, its page) in film order. */
export function pageClips(doc: FilmDoc): { loc: string; src: string; overrides: FilmDoc['tracks'][number]['clips'][number]['overrides'] }[] {
  return doc.tracks.flatMap((track, ti) => track.clips.flatMap((clip, ci) => (
    filmSrcIsPage(clip.src) ? [{ loc: filmDocLoc(ti, ci), src: clip.src.replace(/#.*$/, ''), overrides: clip.overrides }] : []
  )));
}

/**
 * The `overrides` each clip gets for `style` on the layers like `selector`: the clips `holds` says may have them, and
 * always `own` (the clip of the layer picked).
 */
export function similarEdits(
  doc: FilmDoc, selector: string, style: Record<string, string | number | null>, holds: (src: string) => boolean, own: string,
): { loc: string; value: ReturnType<typeof nextOverrides> }[] {
  return pageClips(doc)
    .filter((c) => c.loc === own || holds(c.src))
    .map((c) => ({ loc: c.loc, value: nextOverrides(c.overrides, { at: selector }, { style } as OverrideGeometry) }));
}
