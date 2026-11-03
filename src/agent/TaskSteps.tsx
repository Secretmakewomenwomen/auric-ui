import { useUiText } from '../i18n/ui';
import { Check, Circle, LoaderCircle, AlertCircle } from 'lucide-react';
import { classes } from './shared';
export interface TaskStep { id: string; title: string; description?: string; status: 'pending' | 'running' | 'complete' | 'error'; }
export interface TaskStepsProps { steps: TaskStep[]; label?: string; className?: string; }
export function TaskSteps({steps,label,className}:TaskStepsProps) {
  const uiText = useUiText();
  if (label === undefined) label = uiText("任务步骤");

  return <ol className={classes('auricui-task-steps',className)} aria-label={label}>{steps.map(step => <li key={step.id} data-status={step.status} aria-current={step.status==='running'?'step':undefined}>
    <span className="auricui-step-icon" aria-hidden="true">{step.status==='complete'?<Check size={14}/>:step.status==='running'?<LoaderCircle size={14} className="auricui-agent-spin"/>:step.status==='error'?<AlertCircle size={14}/>:<Circle size={12}/>}</span>
    <div><span className="auricui-sr-only">{({pending:uiText("未开始"),running:uiText("执行中"),complete:uiText("已完成"),error:uiText("失败")})[step.status]}：</span><strong>{step.title}</strong>{step.description&&<p>{step.description}</p>}</div>
  </li>)}</ol>;
}
