import { classes } from './shared';

export interface ThinkingIndicatorProps {
  label?: string;
  active?: boolean;
  className?: string;
}

/** Announce a stable status once; dots are purely visual and never simulate model output. */
export function ThinkingIndicator({ label = '正在思考', active = true, className }: ThinkingIndicatorProps) {
  return <span className={classes('auricui-thinking', className)} role="status" aria-live="polite" data-active={active}>
    <span className="auricui-thinking-dots" aria-hidden="true"><i/><i/><i/></span><span>{label}</span>
  </span>;
}
