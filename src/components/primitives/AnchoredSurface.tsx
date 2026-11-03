import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { usePresence } from '../../lib/use-presence';

/** Shared portal, positioning and presence for anchored dialog surfaces. */
export function AnchoredSurface({ open, anchor, id, titleId, descriptionId, children, className, style,
  placement = 'auto', align = 'start', layer = 10000, onDismiss, onAfterClose }: {
  open: boolean; anchor: RefObject<HTMLButtonElement | null>; id: string; titleId: string; descriptionId?: string;
  children: ReactNode; className?: string; style?: CSSProperties; placement?: 'auto' | 'top' | 'bottom';
  align?: 'start' | 'end'; layer?: number; onDismiss: () => void; onAfterClose?: () => void;
}) {
  const presence = usePresence(open, onAfterClose);
  const panel = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number; maxHeight: number; side: 'top' | 'bottom' } | null>(null);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  const update = useCallback(() => {
    const button = anchor.current, element = panel.current;
    if (!button || !element) return;
    const rect = button.getBoundingClientRect();
    const gap = 6, edge = 12;
    const below = Math.max(0, window.innerHeight - rect.bottom - gap - edge);
    const above = Math.max(0, rect.top - gap - edge);
    const needed = element.scrollHeight + 2;
    const side = placement === 'top' || (placement === 'auto' && below < needed && above > below) ? 'top' : 'bottom';
    const maxHeight = side === 'top' ? above : below;
    const height = Math.min(needed, maxHeight), width = element.offsetWidth;
    const next = {
      left: Math.max(edge, Math.min(align === 'end' ? rect.right - width : rect.left, window.innerWidth - width - edge)),
      top: Math.max(edge, Math.min(side === 'top' ? rect.top - gap - height : rect.bottom + gap, window.innerHeight - height - edge)),
      maxHeight, side,
    } as const;
    setPosition(current => current && Object.keys(next).every(key => current[key as keyof typeof next] === next[key as keyof typeof next]) ? current : next);
  }, [anchor, align, placement]);

  useLayoutEffect(() => {
    if (!presence.present) { setPosition(null); return; }
    update();
    const observer = new ResizeObserver(update);
    if (panel.current) observer.observe(panel.current);
    if (anchor.current) observer.observe(anchor.current);
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && panel.current?.contains(event.target)) return;
      update();
    };
    window.addEventListener('resize', update);
    window.addEventListener('scroll', onScroll, true);
    return () => { observer.disconnect(); window.removeEventListener('resize', update); window.removeEventListener('scroll', onScroll, true); };
  }, [presence.present, update]);

  const ready = position !== null;
  useLayoutEffect(() => {
    if (!open || !ready) return;
    const element = panel.current, button = anchor.current;
    (element?.querySelector<HTMLElement>('[data-autofocus]') ?? element)?.focus({ preventScroll: true });
    return () => {
      if (element?.contains(document.activeElement) && document.hasFocus()) button?.focus({ preventScroll: true });
    };
  }, [open, ready, anchor]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && (panel.current?.contains(target) || anchor.current?.contains(target))) return;
      dismiss.current();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault(); event.stopPropagation(); dismiss.current();
      } else if (event.key === 'Tab' && panel.current?.contains(document.activeElement)) {
        const options = Array.from(panel.current.querySelectorAll<HTMLElement>('button,a[href],input,select,textarea,[tabindex]'))
          .filter(element => element.tabIndex >= 0 && !element.hasAttribute('disabled') && element.getClientRects().length > 0);
        const at = options.indexOf(document.activeElement as HTMLElement);
        const next = at + (event.shiftKey ? -1 : 1);
        if (next >= 0 && next < options.length) {
          event.preventDefault(); event.stopPropagation(); options[next].focus();
        } else {
          // Continue native page navigation from the trigger, including a parent dialog's trap.
          anchor.current?.focus({ preventScroll: true }); dismiss.current();
        }
      }
    };
    const blur = () => dismiss.current();
    window.addEventListener('pointerdown', outside, true);
    window.addEventListener('focusin', outside);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('pointerdown', outside, true); window.removeEventListener('focusin', outside);
      window.removeEventListener('keydown', onKey, true); window.removeEventListener('blur', blur);
    };
  }, [open, anchor]);

  if (!presence.present || typeof document === 'undefined') return null;
  const chat = !!anchor.current?.closest('.auricui-chat');
  const theme = anchor.current?.closest('[data-theme]')?.getAttribute('data-theme');
  return createPortal(<div className={chat ? 'auricui-chat' : undefined} data-theme={theme ?? undefined} data-popover-panel="true"
    style={{ position: 'fixed', left: position?.left ?? 0, top: position?.top ?? 0, zIndex: layer, visibility: ready ? 'visible' : 'hidden', pointerEvents: open ? undefined : 'none' }}>
    <div ref={panel} id={id} role="dialog" tabIndex={-1} aria-labelledby={titleId} aria-describedby={descriptionId}
      aria-hidden={!open || undefined} inert={!open} className={className} data-state={presence.state} data-side={position?.side}
      style={{ ...style, maxHeight: position?.maxHeight, transformOrigin: `${align === 'end' ? 'right' : 'left'} ${position?.side === 'top' ? 'bottom' : 'top'}` }}
      onClick={event => event.stopPropagation()}>{children}</div>
  </div>, document.body);
}
