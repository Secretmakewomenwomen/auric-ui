import type { ReactNode } from 'react';
import { Bot } from 'lucide-react';
import { AgentStatus, type AgentState } from './AgentStatus';
import { classes } from './shared';
export interface AgentCardProps { name:string; description?:string; avatar?:ReactNode; status?:AgentState; selected?:boolean; onSelect?:()=>void; disabled?:boolean; className?:string; }
export function AgentCard({name,description,avatar,status='idle',selected,onSelect,disabled,className}:AgentCardProps) {
  const content=<><span className="auricui-agent-avatar" aria-hidden="true">{avatar??<Bot size={20}/>}</span><span className="auricui-agent-identity"><strong>{name}</strong>{description&&<span>{description}</span>}<AgentStatus status={status}/></span></>;
  return onSelect?<button type="button" className={classes('auricui-agent-profile',className)} aria-pressed={selected} disabled={disabled} onClick={onSelect}>{content}</button>:<div className={classes('auricui-agent-profile',className)}>{content}</div>;
}
