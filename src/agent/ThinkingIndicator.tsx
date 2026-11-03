import { useUiText } from '../i18n/ui';
import { classes } from './shared';

export interface ThinkingIndicatorProps {
  label?: string;
  active?: boolean;
  className?: string;
}

/** Announce a stable status once; dots are purely visual and never simulate model output. */
export function ThinkingIndicator({ label, active = true, className }: ThinkingIndicatorProps) {
  const uiText = useUiText();
  if (label === undefined) label = uiText("正在思考");

  return <span className={classes('auricui-thinking', className)} role="status" aria-live="polite" data-active={active}>
    <span className="auricui-thinking-dots" aria-hidden="true"><i/><i/><i/></span><span>{label}</span>
  </span>;
}
