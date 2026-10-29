import type { ReactNode } from 'react';
import { classes } from '../../agent/shared';
export interface EmptyStateProps { title:string; description?:string; icon?:ReactNode; action?:ReactNode; className?:string; }
export function EmptyState({title,description,icon,action,className}:EmptyStateProps) {
  return <div className={classes('auricui-empty-state',className)}>{icon&&<span aria-hidden="true">{icon}</span>}<strong>{title}</strong>{description&&<p>{description}</p>}{action&&<div>{action}</div>}</div>;
}
