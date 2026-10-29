/** Injectable browser services. A consuming app supplies its backend without changing UI modules. */
export type StudioFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
export type StudioEvents = (path: string, onEvent: (event: unknown) => void) => () => void;
let request: StudioFetch | null = null;
let events: StudioEvents | null = null;
export function configureStudioTransport(next: { fetch?: StudioFetch; subscribe?: StudioEvents; resolveAssetUrl?: (url: string) => string } | null) {
  assetResolver = next?.resolveAssetUrl;
  request = next?.fetch ?? null;
  events = next?.subscribe ?? null;
}
export const studioFetch: StudioFetch = (input, init) => (request ?? globalThis.fetch)(input, init);
export function studioSubscribe(path: string, onEvent: (event: unknown) => void): (() => void) | null {
  return events?.(path, onEvent) ?? null;
}

/** Resolve browser-loaded media (images, audio, preview frames) without intercepting global fetch. */
export function studioAssetUrl<T extends string | undefined>(url: T): T {
  return (url && assetResolver ? assetResolver(url) : url) as T;
}
let assetResolver: ((url: string) => string) | undefined;
