import { useUiText } from '../i18n/ui';
import { classes } from './shared';
export type AgentState = 'idle' | 'running' | 'waiting' | 'success' | 'error' | 'paused';
export interface AgentStatusProps { status: AgentState; label?: string; className?: string; }
export const agentStatusLabels: Record<AgentState,string> = { idle:'待命',running:'执行中',waiting:'等待确认',success:'已完成',error:'出现问题',paused:'已暂停' };
export function AgentStatus({ status, label, className }: AgentStatusProps) {
  const uiText = useUiText();
  return <span className={classes('auricui-agent-status',className)} data-status={status} role="status"><i aria-hidden="true"/>{label ?? uiText(agentStatusLabels[status])}</span>;
}
