import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Globe } from 'lucide-react';
import { classes, safeCitationHref } from './shared';

export interface CitationProps {
  index: number | string;
  title: string;
  href?: string;
  description?: string;
  source?: string;
  className?: string;
}

/** Source summary in a viewport-aware portal. Escape or an outside interaction dismisses it. */
export function Citation({ index, title, href, description, source, className }: CitationProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [position, setPosition] = useState<CSSProperties>({ position: 'fixed', left: 12, top: 12 });
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLSpanElement>(null);
  const url = safeCitationHref(href);
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(280, window.innerWidth - 24);
      const height = Math.min(panel.current?.offsetHeight ?? 150, window.innerHeight - 24);
      const below = rect.bottom + 8;
      setPosition({ position: 'fixed', width, maxWidth: width, maxHeight: 'calc(100dvh - 24px)', overflowY: 'auto', left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), top: below + height <= window.innerHeight - 12 ? below : Math.max(12, rect.top - height - 8) });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [open, title, description, source]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !panel.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', outside); };
  }, [open]);
  return <span className={classes('auricui-citation', className)} onKeyDown={event => {
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); }
  }}>
    <button type="button" ref={trigger} className="auricui-citation-trigger" aria-label={`来源 ${index}：${title}`} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{index}</button>
    {mounted && createPortal(<span ref={panel} id={id} className="auricui-citation-card" style={position} data-open={open} inert={!open || undefined} aria-hidden={!open || undefined}>
      <span className="auricui-citation-source"><Globe size={12} aria-hidden="true"/>{source ?? (url ? new URL(url).hostname : '参考资料')}</span>
      {url ? <a href={url} target="_blank" rel="noopener noreferrer">{title}<ArrowUpRight size={13} aria-hidden="true"/></a> : <strong>{title}</strong>}
      {description && <span className="auricui-citation-description">{description}</span>}
    </span>, document.body)}
  </span>;
}
