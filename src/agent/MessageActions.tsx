import type { ReactNode } from 'react';
import { classes } from './shared';

export interface MessageAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  pressed?: boolean;
}
export interface MessageActionsProps {
  actions: MessageAction[];
  label?: string;
  disabled?: boolean;
  className?: string;
}

/** Each action is supplied by the host; the component never requests a model or writes feedback. */
export function MessageActions({ actions, label = '消息操作', disabled, className }: MessageActionsProps) {
  return <div className={classes('auricui-message-toolbar', className)} role="group" aria-label={label}>
    {actions.map(action => <button key={action.id} type="button" className="auricui-agent-button" aria-label={action.label} title={action.label}
      disabled={disabled || action.disabled} aria-pressed={action.pressed} onClick={action.onSelect}>
      {action.icon && <span aria-hidden="true">{action.icon}</span>}{!action.icon && action.label}
    </button>)}
  </div>;
}
