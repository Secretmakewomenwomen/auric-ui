import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { classes } from './shared';

export interface SuggestionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  description?: string;
  children: ReactNode;
}

export function Suggestion({ icon, description, children, className, ...props }: SuggestionProps) {
  return <button {...props} type={props.type ?? 'button'} className={classes('auricui-suggestion', className)}>
    {icon && <span className="auricui-suggestion-icon" aria-hidden="true">{icon}</span>}
    <span><span className="auricui-suggestion-label">{children}</span>{description && <span className="auricui-suggestion-description">{description}</span>}</span>
    <ArrowUpRight size={14} aria-hidden="true" className="auricui-suggestion-arrow"/>
  </button>;
}
