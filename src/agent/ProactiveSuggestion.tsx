import { Lightbulb, X } from 'lucide-react';
import { classes } from './shared';
export interface ProactiveSuggestionProps { title:string; description:string; reason?:string; actionLabel:string; onAccept:()=>void; onDismiss?:()=>void; pending?:boolean; className?:string; }
export function ProactiveSuggestion({title,description,reason,actionLabel,onAccept,onDismiss,pending,className}:ProactiveSuggestionProps) {
  return <article className={classes('auricui-agent-card',className)}><header className="auricui-agent-card-header"><Lightbulb size={16}/><h3>{title}</h3>{onDismiss&&<button type="button" className="auricui-agent-button" aria-label="忽略这条建议" disabled={pending} onClick={onDismiss}><X size={14}/></button>}</header><p>{description}</p>{reason&&<p className="auricui-suggestion-reason">为什么建议 · {reason}</p>}<footer className="auricui-agent-card-footer"><button type="button" className="auricui-agent-primary" disabled={pending} onClick={onAccept}>{pending?'处理中…':actionLabel}</button></footer></article>;
}
