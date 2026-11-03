import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { CardButton } from '../Card';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  /** 右侧展示的快捷键提示；快捷键的绑定由应用处理。 */
  shortcut?: string;
  disabled?: boolean;
  /** 禁用原因，鼠标悬停时显示。 */
  hint?: string;
  danger?: boolean;
  onSelect?: () => void;
}

export interface DropdownSeparator { id: string; separator: true; }
export type DropdownEntry = DropdownItem | DropdownSeparator;

export interface DropdownProps {
  /** 触发按钮与菜单的名称。 */
  label: string;
  /** 操作项与分隔线；id 在同一菜单内唯一。空数组会禁用触发按钮。 */
  items: readonly DropdownEntry[];
  /** 自定义按钮内容，例如图标；不要嵌套按钮或链接。未传时显示 label。 */
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /** 菜单与按钮的左边或右边对齐；靠近视口边缘时自动避让。 */
  align?: 'start' | 'end';
  /** 展开方向；auto 优先向下，空间不足时向上。 */
  placement?: 'auto' | 'top' | 'bottom';
  /** 触发按钮的视觉权重，沿用 CardButton。 */
  weight?: 'primary' | 'secondary' | 'quiet' | 'danger';
  /** 是否显示随展开状态旋转的箭头。 */
  showArrow?: boolean;
  /** 菜单层级；在更高层级的弹窗中使用时可覆盖。 */
  layer?: number;
  /** 触发按钮的附加样式。 */
  className?: string;
  /** 菜单面板的附加样式。 */
  menuClassName?: string;
}

const isItem = (entry: DropdownEntry): entry is DropdownItem => !('separator' in entry);
type InitialFocus = 'first' | 'last' | 'menu';

/** 按钮触发的操作菜单，沿用 OpenFilm 0.2.5 的 MenuSelect 表面与 pop 动画。 */
export function Dropdown({
  label, items, children, open, defaultOpen = false, onOpenChange, disabled = false,
  align = 'start', placement = 'auto', weight = 'secondary', showArrow = true,
  layer = 10000, className = '', menuClassName = '',
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const trigger = useRef<HTMLButtonElement>(null);
  const initialFocus = useRef<InitialFocus>('first');
  const id = useId();
  const blocked = disabled || !items.some(isItem);
  const expanded = (open ?? internalOpen) && !blocked;
  const change = useRef(onOpenChange);
  change.current = onOpenChange;
  const setOpen = useCallback((next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    if (next !== (open ?? internalOpen)) change.current?.(next);
  }, [open, internalOpen]);

  useEffect(() => {
    if (blocked && (open ?? internalOpen)) setOpen(false);
  }, [blocked, open, internalOpen, setOpen]);

  return <>
    <CardButton
      ref={trigger}
      id={`${id}-trigger`}
      weight={weight}
      disabled={blocked}
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={expanded}
      aria-controls={expanded ? `${id}-menu` : undefined}
      className={`auricui-dropdown-trigger ${className}`}
      onClick={event => {
        initialFocus.current = event.detail === 0 ? 'first' : 'menu';
        setOpen(!expanded);
      }}
      onKeyDown={event => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        event.stopPropagation();
        initialFocus.current = event.key === 'ArrowUp' ? 'last' : 'first';
        setOpen(true);
      }}
    >
      {children ?? label}
      {showArrow && <ChevronDown size={12} aria-hidden="true" className="auricui-dropdown-chevron" />}
    </CardButton>
    {expanded && typeof document !== 'undefined' && <DropdownMenu
      id={id} label={label} items={items} trigger={trigger} initialFocus={initialFocus.current}
      align={align} placement={placement} layer={layer} className={menuClassName}
      onClose={() => setOpen(false)}
    />}
  </>;
}

function DropdownMenu({ id, label, items, trigger, initialFocus, align, placement, layer, className, onClose }: {
  id: string; label: string; items: readonly DropdownEntry[]; trigger: RefObject<HTMLButtonElement | null>;
  initialFocus: InitialFocus; align: 'start' | 'end'; placement: 'auto' | 'top' | 'bottom';
  layer: number; className: string; onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number; maxHeight: number; minWidth: number; side: 'top' | 'bottom' } | null>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const search = useRef({ text: '', time: 0 });
  const startingFocus = useRef(initialFocus);
  const enabled = () => Array.from(panel.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []);
  const focus = (element?: HTMLElement) => {
    element?.focus({ preventScroll: true });
    element?.scrollIntoView({ block: 'nearest' });
  };

  const update = useCallback(() => {
    const button = trigger.current;
    const menu = panel.current;
    if (!button || !menu) return;
    const rect = button.getBoundingClientRect();
    const gap = 6, edge = 12;
    const below = Math.max(0, window.innerHeight - rect.bottom - gap - edge);
    const above = Math.max(0, rect.top - gap - edge);
    // offset/scroll sizes exclude the opening animation's transform.
    const needed = Math.min(320, menu.scrollHeight + 2);
    const side = placement === 'top' || (placement === 'auto' && below < needed && above > below) ? 'top' : 'bottom';
    const maxHeight = Math.min(320, side === 'top' ? above : below);
    const minWidth = Math.min(Math.max(160, rect.width), Math.max(0, window.innerWidth - edge * 2));
    const width = Math.max(menu.offsetWidth, minWidth);
    const height = Math.min(needed, maxHeight);
    const left = Math.max(edge, Math.min(align === 'end' ? rect.right - width : rect.left, window.innerWidth - width - edge));
    const top = Math.max(edge, Math.min(side === 'top' ? rect.top - gap - height : rect.bottom + gap, window.innerHeight - height - edge));
    setPosition(current => current && current.left === left && current.top === top && current.maxHeight === maxHeight && current.minWidth === minWidth && current.side === side
      ? current : { left, top, maxHeight, minWidth, side });
  }, [trigger, align, placement]);

  useLayoutEffect(() => { update(); }, [update, items]);
  const ready = position !== null;
  useLayoutEffect(() => {
    if (!ready) return;
    const menu = panel.current;
    const button = trigger.current;
    const options = enabled();
    const target = startingFocus.current === 'menu' ? menu : startingFocus.current === 'last' ? options.at(-1) : options[0];
    (target ?? menu)?.focus({ preventScroll: true });
    if (target && target !== menu) target.scrollIntoView({ block: 'nearest' });
    return () => {
      // Restore only while focus still belongs to this menu; a newly opened dialog owns its focus.
      if (menu?.contains(document.activeElement) && document.hasFocus()) button?.focus({ preventScroll: true });
    };
  }, [ready, trigger]);

  useEffect(() => {
    const inside = (target: EventTarget | null) => target instanceof Node && (panel.current?.contains(target) || trigger.current?.contains(target));
    const outside = (event: Event) => { if (!inside(event.target)) close.current(); };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        trigger.current?.focus({ preventScroll: true });
        close.current();
      } else if (event.key === 'Tab') {
        // Start native tab navigation at the trigger, not the portal at the end of body.
        // Let the event reach a surrounding dialog's focus trap.
        trigger.current?.focus({ preventScroll: true });
        close.current();
      }
    };
    const onBlur = () => close.current();
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && panel.current?.contains(event.target)) return;
      update();
    };
    const observer = new ResizeObserver(update);
    if (panel.current) observer.observe(panel.current);
    if (trigger.current) observer.observe(trigger.current);
    window.addEventListener('pointerdown', outside, true);
    window.addEventListener('focusin', outside);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('blur', onBlur);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('pointerdown', outside, true);
      window.removeEventListener('focusin', outside);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', update);
    };
  }, [trigger, update]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const options = enabled();
    const index = options.indexOf(document.activeElement as HTMLButtonElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
        : event.key === 'ArrowDown' ? (index + 1) % options.length
          : index <= 0 ? options.length - 1 : index - 1;
      focus(options[next]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      options[index]?.click();
    } else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.nativeEvent.isComposing) {
      const time = Date.now();
      const text = (time - search.current.time < 500 ? search.current.text : '') + event.key.toLocaleLowerCase();
      search.current = { text, time };
      const query = [...text].every(char => char === text[0]) ? text[0] : text;
      const ordered = [...options.slice(index + 1), ...options.slice(0, index + 1)];
      focus(ordered.find(option => option.dataset.label?.toLocaleLowerCase().startsWith(query)));
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // Portals from Chat keep Chat's separate tokens and font scope.
  const inChat = !!trigger.current?.closest('.auricui-chat');
  const theme = trigger.current?.closest('[data-theme]')?.getAttribute('data-theme');
  return createPortal(<div
    className={inChat ? 'auricui-chat' : undefined}
    data-theme={theme ?? undefined}
    data-popover-panel="true"
    style={{ position: 'fixed', left: position?.left ?? 0, top: position?.top ?? 0, zIndex: layer, visibility: ready ? 'visible' : 'hidden' }}
  >
    <div
      ref={panel} id={`${id}-menu`} role="menu" tabIndex={-1}
      aria-label={label} aria-labelledby={`${id}-trigger`} aria-orientation="vertical"
      className={`auricui-dropdown-menu ${className}`} data-ready={ready} data-side={position?.side}
      style={{ maxHeight: position?.maxHeight ?? 320, minWidth: position?.minWidth, transformOrigin: `${align === 'end' ? 'right' : 'left'} ${position?.side === 'top' ? 'bottom' : 'top'}` } as CSSProperties}
      onKeyDown={onKeyDown}
      onClick={event => event.stopPropagation()}
    >
      {items.map(entry => isItem(entry) ? <button
        key={entry.id} type="button" role="menuitem" tabIndex={-1}
        disabled={entry.disabled} aria-disabled={entry.disabled || undefined}
        title={entry.disabled ? entry.hint : undefined} data-danger={entry.danger || undefined} data-label={entry.label}
        className="auricui-dropdown-item"
        onPointerMove={event => { if (!entry.disabled && event.pointerType !== 'touch') event.currentTarget.focus({ preventScroll: true }); }}
        onClick={() => {
          if (entry.disabled) return;
          trigger.current?.focus({ preventScroll: true });
          close.current();
          entry.onSelect?.();
        }}
      >
        {entry.icon && <span className="auricui-dropdown-icon" aria-hidden="true">{entry.icon}</span>}
        <span className="auricui-dropdown-label">{entry.label}</span>
        {entry.shortcut && <span className="auricui-dropdown-shortcut" aria-hidden="true">{entry.shortcut}</span>}
      </button> : <div key={entry.id} role="separator" className="auricui-dropdown-separator" />)}
    </div>
  </div>, document.body);
}
