import { Target } from 'lucide-react';
import { AgentStatus, type AgentState } from './AgentStatus';
import { ContextUsage } from './ContextUsage';
import { classes } from './shared';
export interface GoalCardProps { title:string; description?:string; status:AgentState; completed:number; total:number; nextStep?:string; onOpen?:()=>void; className?:string; }
export function GoalCard({title,description,status,completed,total,nextStep,onOpen,className}:GoalCardProps) {
  return <section className={classes('auricui-agent-card',className)} aria-label={title}><header className="auricui-agent-card-header"><Target size={16}/><h3>{title}</h3><AgentStatus status={status}/></header>{description&&<p>{description}</p>}<div className="auricui-agent-card-body"><ContextUsage used={completed} limit={total} label="已完成步骤" unit="项" warningAt={1}/></div>{nextStep&&<p className="auricui-next-step"><small>下一步</small>{nextStep}</p>}{onOpen&&<footer className="auricui-agent-card-footer"><button type="button" className="auricui-agent-button" onClick={onOpen}>查看目标</button></footer>}</section>;
}
