import { Sun } from 'lucide-react';
import { classes } from './shared';
export interface BriefingItem { id:string; title:string; detail?:string; meta?:string; onSelect?:()=>void; }
export interface BriefingCardProps { title:string; subtitle?:string; items:BriefingItem[]; footer?:string; className?:string; }
export function BriefingCard({title,subtitle,items,footer,className}:BriefingCardProps) {
  return <section className={classes('auricui-agent-card auricui-briefing',className)} aria-label={title}><header className="auricui-agent-card-header"><Sun size={16}/><h3>{title}</h3></header>{subtitle&&<p>{subtitle}</p>}<ul>{items.map(item=>{const content=<><span><strong>{item.title}</strong>{item.detail&&<small>{item.detail}</small>}</span>{item.meta&&<span className="auricui-subtle">{item.meta}</span>}</>;return <li key={item.id}>{item.onSelect?<button type="button" onClick={item.onSelect}>{content}</button>:<div>{content}</div>}</li>;})}</ul>{footer&&<footer className="auricui-memory-meta">{footer}</footer>}</section>;
}
