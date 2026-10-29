import { CalendarClock } from 'lucide-react';
import { classes } from './shared';
export interface ScheduleCardProps { title:string; schedule:string; timezone:string; nextRun?:string; enabled:boolean; onEnabledChange:(enabled:boolean)=>void; onEdit?:()=>void; pending?:boolean; className?:string; }
/** The host supplies the timezone and next occurrence; this component does not schedule jobs. */
export function ScheduleCard({title,schedule,timezone,nextRun,enabled,onEnabledChange,onEdit,pending,className}:ScheduleCardProps) {
  return <section className={classes('auricui-agent-card',className)} aria-label={title}><header className="auricui-agent-card-header"><CalendarClock size={16}/><h3>{title}</h3><button className="auricui-agent-toggle" type="button" role="switch" aria-label={`启用${title}`} aria-checked={enabled} disabled={pending} onClick={()=>onEnabledChange(!enabled)}><span/></button></header><p>{schedule} <span className="auricui-subtle">· {timezone}</span></p><footer className="auricui-agent-card-footer"><span>{enabled?`下次 · ${nextRun??'待计算'}`:'已暂停'} </span>{onEdit&&<button type="button" className="auricui-agent-button" disabled={pending} onClick={onEdit}>编辑计划</button>}</footer></section>;
}
