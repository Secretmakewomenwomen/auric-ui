import { useLayoutEffect, useRef, useState } from 'react';

/** Keep closing content mounted for the same 160ms as OpenFilm's pop transition. */
export function usePresence(visible: boolean, onAfterClose?: () => void) {
  const [present, setPresent] = useState(visible);
  const [shown, setShown] = useState(false);
  const afterClose = useRef(onAfterClose);
  afterClose.current = onAfterClose;
  useLayoutEffect(() => {
    let frame = 0, nextFrame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || document.documentElement.dataset.agentMotion === 'off';
    if (visible) {
      setPresent(true);
      if (reduced) setShown(true);
      else frame = requestAnimationFrame(() => { nextFrame = requestAnimationFrame(() => setShown(true)); });
    } else {
      setShown(false);
      if (present) timer = setTimeout(() => {
        setPresent(false);
        afterClose.current?.();
      }, reduced ? 0 : 160);
    }
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(nextFrame); clearTimeout(timer); };
  }, [visible, present]);
  return { present, state: visible ? (shown ? 'open' : 'opening') : 'closing' } as const;
}
