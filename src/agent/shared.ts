import { useEffect, useRef, useState } from 'react';

export function classes(...values: (string | false | undefined)[]) {
  return values.filter(Boolean).join(' ');
}

export function useControllable<T>(value: T | undefined, initial: T, onChange?: (value: T) => void) {
  const [local, setLocal] = useState(initial);
  const current = value === undefined ? local : value;
  return [current, (next: T) => { if (value === undefined) setLocal(next); onChange?.(next); }] as const;
}

export function useCopy(onError?: (error: Error) => void) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearTimeout(timer.current); }; }, []);
  const copy = async (text: string) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard is unavailable');
      await navigator.clipboard.writeText(text);
      if (!mounted.current) return;
      setStatus('copied');
    } catch (error) {
      if (!mounted.current) return;
      setStatus('error');
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { if (mounted.current) setStatus('idle'); }, 2000);
  };
  return { status, copy };
}

/** Invalid/unknown capacity stays indeterminate instead of reporting a fictional percentage. */
export function usageMetrics(used: number, limit: number) {
  const valid = Number.isFinite(used) && used >= 0 && Number.isFinite(limit) && limit > 0;
  return { valid, percent: valid ? Math.min(100, used / limit * 100) : 0, over: valid && used > limit };
}

export function safeCitationHref(href?: string) {
  if (!href) return undefined;
  try { const url = new URL(href); return /^(https?:)$/.test(url.protocol) ? url.href : undefined; }
  catch { return undefined; }
}
