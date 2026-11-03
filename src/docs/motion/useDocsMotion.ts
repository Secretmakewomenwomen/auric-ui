import { useEffect, useRef, useState, type RefObject } from 'react';
import { docsEase, gsap, ScrollTrigger, useGSAP, useMotionAllowed } from './engine';

export function useDocsMotion(root: RefObject<HTMLDivElement | null>, main: RefObject<HTMLElement | null>, route: string, locale: string, query: string, motion: boolean) {
  const allowed = useMotionAllowed() && motion;
  const indicatorPosition = useRef<{ x: number; y: number; height: number } | null>(null);
  const [activeSection, setActiveSection] = useState('preview');

  useGSAP((_context, contextSafe) => {
    const container = main.current;
    if (!container || !root.current || !allowed) return;
    const header = container.querySelector('.docs-detail-header') ?? container.querySelector('.docs-overview > h1');
    if (header) gsap.from(header, { y: 8, opacity: 0, duration: .4, ease: docsEase, clearProps: 'transform,opacity' });
    const preview = container.querySelector('.docs-preview-shell');
    // Keep interactive ancestors stationary so anchored menus retain their position.
    if (preview) gsap.from(preview, { opacity: .35, duration: .4, delay: .08, ease: docsEase, clearProps: 'opacity' });
    // Content stays readable before its trigger fires, including browser search and deep scrolls.
    container.querySelectorAll<HTMLElement>('.quick-step, .docs-detail > .docs-section:not(#preview), .docs-start-highlights').forEach(section => {
      ScrollTrigger.create({ trigger: section, scroller: container, start: 'top 94%', once: true,
        onEnter: contextSafe!(() => { gsap.from(section, { opacity: .5, duration: .4, ease: docsEase, clearProps: 'opacity' }); }),
      });
    });
  }, { scope: root, dependencies: [route, allowed], revertOnUpdate: true });

  useGSAP((_context, contextSafe) => {
    const nav = root.current?.querySelector<HTMLElement>('.docs-sidebar > nav');
    const indicator = nav?.querySelector<HTMLElement>('.docs-nav-indicator');
    if (!nav || !indicator) return;
    const place = contextSafe!((animate: boolean) => {
      const selected = nav.querySelector<HTMLElement>('.docs-component-link[data-active=true], .docs-nav-link[data-active=true]');
      if (!selected?.getClientRects().length) { gsap.set(indicator, { opacity: 0 }); return; }
      const box = selected.getBoundingClientRect(), parent = nav.getBoundingClientRect();
      const next = { x: box.left - parent.left, y: box.top - parent.top + nav.scrollTop + 6, height: box.height - 12 };
      const previous = indicatorPosition.current ?? next;
      gsap.fromTo(indicator, { ...previous, opacity: 1 }, { ...next, opacity: 1, duration: animate && allowed ? .22 : 0, ease: docsEase, overwrite: true });
      indicatorPosition.current = next;
    });
    place(true);
    let bounds = nav.getBoundingClientRect();
    const resize = new ResizeObserver(() => {
      const next = nav.getBoundingClientRect();
      if (next.width !== bounds.width || next.height !== bounds.height) place(false);
      bounds = next;
    });
    resize.observe(nav);
    const onToggle = () => place(false);
    nav.addEventListener('toggle', onToggle, true);
    return () => { resize.disconnect(); nav.removeEventListener('toggle', onToggle, true); };
  }, { scope: root, dependencies: [route, locale, query, allowed], revertOnUpdate: true });

  useEffect(() => {
    const container = main.current;
    if (!container) return;
    let frame = 0;
    const sections = [...container.querySelectorAll<HTMLElement>('.docs-detail > section[id]')];
    const progress = root.current?.querySelector<HTMLElement>('.docs-reading-line > span');
    const update = () => {
      frame = 0;
      const top = container.getBoundingClientRect().top;
      const range = container.scrollHeight - container.clientHeight;
      const atEnd = range > 0 && container.scrollTop >= range - 2;
      const section = atEnd ? sections.at(-1) : sections.filter(section => section.getBoundingClientRect().top <= top + 140).at(-1) ?? sections[0];
      if (section) setActiveSection(section.id);
      if (progress) progress.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, container.scrollTop / range)) : 0})`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(container);
    if (container.firstElementChild) observer.observe(container.firstElementChild);
    container.addEventListener('scroll', schedule, { passive: true });
    update();
    return () => { observer.disconnect(); container.removeEventListener('scroll', schedule); cancelAnimationFrame(frame); };
  }, [route, locale, main, root]);

  useEffect(() => {
    const content = main.current?.firstElementChild;
    if (!content || !allowed) return;
    let frame = 0;
    const refresh = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => ScrollTrigger.refresh()); };
    const observer = new ResizeObserver(refresh);
    observer.observe(content);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [route, locale, allowed, main]);

  return { activeSection, allowed };
}
