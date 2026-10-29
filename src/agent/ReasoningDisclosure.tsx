import { useId, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { classes, useControllable } from './shared';

export interface ReasoningDisclosureProps {
  title?: string;
  meta?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

/** A disclosure for a supplied explanation or execution summary. Does not generate reasoning. */
export function ReasoningDisclosure({ title = '查看过程摘要', meta, open, defaultOpen = false, onOpenChange, children, className }: ReasoningDisclosureProps) {
  const [expanded, setExpanded] = useControllable(open, defaultOpen, onOpenChange);
  const id = useId();
  return <section className={classes('auricui-reasoning', className)}>
    <button type="button" className="auricui-reasoning-trigger" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(!expanded)}>
      <ChevronDown size={14} className="auricui-chevron" data-open={expanded}/><span>{title}</span>{meta && <small>{meta}</small>}
    </button>
    <div id={id} className="auricui-collapse" data-open={expanded} aria-hidden={!expanded || undefined} inert={!expanded || undefined}><div><div className="auricui-reasoning-content">{children}</div></div></div>
  </section>;
}
