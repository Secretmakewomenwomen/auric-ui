import React from 'react';
import { createPortal } from 'react-dom';
import { Gauge, Repeat } from 'lucide-react';
import { useT } from '@/i18n';
import { useKeyHint } from '@/lib/keymap-store';
import { Tooltip } from './Tooltip';

/** The speeds the viewer plays at (the player plays forward only, from 0.25× to 2×). */
export const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

export type PlaybackSettings = {
  /** Loop playback (⇧L): of the range marked (`ranged`), else of the whole film. */
  loop: boolean;
  ranged: boolean;
  onLoop: () => void;
  speed: number;
  onSpeed: (speed: number) => void;
};

/**
 * The viewer's playback settings: loop and the speed (subtitles are the timeline's CC button). What is not the default shows on the
 * button itself (the loop icon, "1.5×"), so it is seen without opening the menu. Nothing here takes focus on click:
 * the next Space still plays.
 */
export function PlaybackMenu({ className, disabled, settings }: {
  className?: string;
  disabled?: boolean;
  settings: PlaybackSettings;
}) {
  const t = useT();
  const keyHint = useKeyHint();
  const button = React.useRef<HTMLButtonElement>(null);
  const panel = React.useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = React.useState<{ right: number; bottom: number } | null>(null);
  const id = React.useId();
  React.useEffect(() => {
    if (!anchor) return;
    const outside = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node) && !button.current?.contains(event.target as Node)) setAnchor(null);
    };
    const close = () => setAnchor(null);
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.stopPropagation(); close(); }
    };
    /* capture phase: the picture, the timeline and inputs each stop pointerdown, so it never bubbles to window.
       A click into the preview iframe sends no event at all, only a window blur — that counts as "elsewhere" too. */
    window.addEventListener('pointerdown', outside, true);
    window.addEventListener('keydown', escape, true);
    window.addEventListener('resize', close);
    window.addEventListener('blur', close);
    return () => {
      window.removeEventListener('pointerdown', outside, true);
      window.removeEventListener('keydown', escape, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('blur', close);
    };
  }, [anchor]);

  const { loop, ranged, onLoop, speed, onSpeed } = settings;
  const loopLabel = t(ranged ? 'viewer.loopRange' : 'viewer.loopFilm');
  const speedText = (s: number) => `${s}×`;
  const keep = (e: React.MouseEvent) => e.preventDefault();
  const toggle = (key: string, label: string, checked: boolean, change: () => void, Icon: typeof Repeat, hint?: string) => (
    <button key={key} type="button" role="switch" aria-checked={checked} onClick={change} onMouseDown={keep}
      data-playback={key}
      className="flex w-full items-center gap-2.5 rounded-[7px] px-2 py-1.5 text-[12px] text-[var(--text)] hover:bg-[var(--bg-hover)] focus-visible:outline focus-visible:outline-[var(--border-strong)]">
      <Icon size={14} aria-hidden className="shrink-0 text-[var(--text-muted)]" />
      <span className="flex-1 text-left">{label}</span>
      {hint ? <span className="text-[11px] text-[var(--text-faint)]">{hint}</span> : null}
      <span aria-hidden className={`relative h-[18px] w-[30px] shrink-0 rounded-full transition-colors ${checked ? 'bg-[var(--text)]' : 'bg-[var(--surface-2)] ring-1 ring-inset ring-[var(--border)]'}`}>
        <span className={`absolute top-[3px] h-3 w-3 rounded-full transition-all ${checked ? 'left-[15px] bg-[var(--bg)]' : 'left-[3px] bg-[var(--text-faint)]'}`} />
      </span>
    </button>
  );

  return <>
    <Tooltip label={t('viewer.playback')}>
      <button ref={button} type="button" disabled={disabled} className={className} aria-label={t('viewer.playback')}
        aria-haspopup="dialog" aria-expanded={!!anchor} aria-controls={anchor ? id : undefined}
        data-viewer-loop={loop ? '1' : '0'} data-viewer-speed={speed}
        /* no focus on click: the next Space would land on this button instead of playing */
        onMouseDown={keep}
        onClick={() => {
          const rect = button.current!.getBoundingClientRect();
          setAnchor((current) => current ? null : { right: Math.max(12, window.innerWidth - rect.right), bottom: window.innerHeight - rect.top + 6 });
        }}>
        {loop ? <Repeat size={14} className="text-[var(--accent)]" aria-hidden /> : null}
        {speed !== 1 ? <span className="text-[12px] leading-none tabular-nums">{speedText(speed)}</span> : null}
        {!loop && speed === 1 ? <Gauge size={14} aria-hidden /> : null}
      </button>
    </Tooltip>
    {anchor && createPortal(<div ref={panel} id={id} role="dialog" aria-label={t('viewer.playback')}
      style={anchor} className="fixed z-[110] w-56 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[0_18px_48px_-12px_rgba(0,0,0,0.45),0_2px_8px_rgba(0,0,0,0.12)]">
      <div className="px-2 pb-1 pt-1 text-[11px] font-medium text-[var(--text-faint)]">{t('viewer.playback')}</div>
      {toggle('loop', loopLabel, loop, onLoop, Repeat, keyHint('loop'))}
      <div className="mx-1 my-1 h-px bg-[var(--border)]" />
      <div className="px-2 pb-1.5 pt-1 text-[11px] font-medium text-[var(--text-faint)]">{t('viewer.speed')}</div>
      <div role="radiogroup" aria-label={t('viewer.speed')} className="grid grid-cols-4 gap-1 px-1 pb-1">
        {PLAYBACK_SPEEDS.map((s) => (
          <button key={s} type="button" role="radio" aria-checked={s === speed} onClick={() => onSpeed(s)} onMouseDown={keep}
            className={`h-7 rounded-[6px] text-[12px] tabular-nums transition focus-visible:outline focus-visible:outline-[var(--border-strong)] ${
              s === speed ? 'bg-[var(--text)] font-medium text-[var(--bg)]' : 'text-[var(--text)] hover:bg-[var(--bg-hover)]'
            }`}>
            {speedText(s)}
          </button>
        ))}
      </div>
    </div>, document.body)}
  </>;
}
