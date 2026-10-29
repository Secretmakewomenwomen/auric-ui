import type { HTMLAttributes, ReactNode } from 'react';
import { classes } from './shared';

export interface MessageBubbleProps extends Omit<HTMLAttributes<HTMLElement>, 'role'> {
  /** Visual alignment and default author label; not an ARIA role. */
  role?: 'user' | 'assistant' | 'system';
  author?: string;
  avatar?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

/** A message's presentation only. The application owns conversation state and content rendering. */
export function MessageBubble({ role = 'assistant', author, avatar, meta, actions, children, className, ...props }: MessageBubbleProps) {
  const name = author ?? { user: '你', assistant: '助手', system: '系统' }[role];
  return <article {...props} aria-label={props['aria-label'] ?? name} className={classes('auricui-message', className)} data-role={role}>
    {avatar && <div className="auricui-message-avatar" aria-hidden="true">{avatar}</div>}
    <div className="auricui-message-main">
      <header className="auricui-message-meta"><span>{name}</span>{meta && <span>{meta}</span>}</header>
      <div className="auricui-message-content">{children}</div>
      {actions && <footer className="auricui-message-actions">{actions}</footer>}
    </div>
  </article>;
}
