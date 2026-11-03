import { useUiText } from '../i18n/ui';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { classes } from './shared';
export interface ActivityEvent { id:string; title:string; description?:string; time:string; status?:'done'|'running'|'error'; }
export interface ActivityTimelineProps { events:ActivityEvent[]; label?:string; emptyText?:string; className?:string; }
export function ActivityTimeline({events,label,emptyText,className}:ActivityTimelineProps) {
  const uiText = useUiText();
  if (label === undefined) label = uiText("活动记录");
  if (emptyText === undefined) emptyText = uiText("还没有活动");

  return <section className={classes('auricui-activity-timeline',className)} aria-label={label}>{!events.length?<p className="auricui-agent-empty">{emptyText}</p>:<ol>{events.map(event=><li key={event.id} data-status={event.status??'done'}><span className="auricui-timeline-mark" aria-hidden="true">{event.status==='error'?<AlertCircle size={12}/>:event.status==='running'?<Clock size={12}/>:<Check size={12}/>}</span><div><strong>{event.title}</strong>{event.description&&<p>{event.description}</p>}</div><time>{event.time}</time></li>)}</ol>}</section>;
}
