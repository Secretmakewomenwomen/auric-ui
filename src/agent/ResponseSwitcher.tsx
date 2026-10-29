import { ChevronLeft, ChevronRight } from 'lucide-react';
import { classes } from './shared';

export interface ResponseSwitcherProps {
  /** Zero-based selected response index. */
  value: number;
  count: number;
  onValueChange: (index: number) => void;
  disabled?: boolean;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}

export function ResponseSwitcher({ value, count, onValueChange, disabled, label = '回答版本', previousLabel = '上一个回答', nextLabel = '下一个回答', className }: ResponseSwitcherProps) {
  const total = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const index = total ? Math.max(0, Math.min(total - 1, Number.isFinite(value) ? Math.floor(value) : 0)) : 0;
  return <div className={classes('auricui-response-switcher', className)} role="group" aria-label={label}>
    <button className="auricui-agent-button" type="button" aria-label={previousLabel} disabled={disabled || !total || index === 0} onClick={() => onValueChange(index - 1)}><ChevronLeft size={14}/></button>
    <span role="status" aria-live="polite" aria-atomic="true"><span key={`${index}-${total}`} className="auricui-response-index">{total ? index + 1 : 0}</span><span aria-hidden="true"> / </span><span className="auricui-sr-only">of </span>{total}</span>
    <button className="auricui-agent-button" type="button" aria-label={nextLabel} disabled={disabled || !total || index >= total - 1} onClick={() => onValueChange(index + 1)}><ChevronRight size={14}/></button>
  </div>;
}
