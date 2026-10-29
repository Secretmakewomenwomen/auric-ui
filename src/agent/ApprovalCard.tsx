import type { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import { classes } from './shared';
export interface ApprovalCardProps {
  title: string;
  description?: string;
  children?: ReactNode;
  status?: 'pending' | 'submitting' | 'approved' | 'rejected';
  error?: string;
  onApprove: () => void;
  onReject: () => void;
  approveLabel?: string;
  rejectLabel?: string;
  className?: string;
}
/** Only the backend can authorize execution. This view submits a decision via host callbacks. */
export function ApprovalCard({title,description,children,status='pending',error,onApprove,onReject,approveLabel='允许这次操作',rejectLabel='拒绝',className}:ApprovalCardProps) {
  return <section className={classes('auricui-agent-card',className)} aria-label={title} aria-busy={status==='submitting'}>
    <header className="auricui-agent-card-header"><ShieldCheck size={16} aria-hidden="true"/><h3>{title}</h3></header>
    {description&&<p>{description}</p>}{children&&<div className="auricui-agent-card-body">{children}</div>}
    {error&&<p className="auricui-agent-error" role="alert">{error}</p>}
    <footer className="auricui-agent-card-footer">{status==='approved'||status==='rejected'?<span role="status">{status==='approved'?'已允许':'已拒绝'}</span>:<><span role="status">{status==='submitting'?'正在提交…':'等待你的决定'}</span><button type="button" className="auricui-agent-button" disabled={status==='submitting'} onClick={onReject}>{rejectLabel}</button><button type="button" className="auricui-agent-primary" disabled={status==='submitting'} onClick={onApprove}>{approveLabel}</button></>}</footer>
  </section>;
}
