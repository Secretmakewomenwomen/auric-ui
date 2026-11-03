import { useUiText } from '../i18n/ui';
import { Brain, Pencil, Trash2 } from 'lucide-react';
import { classes } from './shared';
export interface MemoryCardProps { content:string; category?:string; source?:string; updatedAt?:string; onEdit?:()=>void; onForget?:()=>void; pending?:boolean; className?:string; }
/** Explicit source and host-owned edit/forget actions keep personal memory understandable. */
export function MemoryCard({content,category,source,updatedAt,onEdit,onForget,pending,className}:MemoryCardProps) {
  const uiText = useUiText();
  if (category === undefined) category = uiText("偏好");

  return <article className={classes('auricui-agent-card',className)} aria-label={uiText("记忆")} aria-busy={pending}><header className="auricui-agent-card-header"><Brain size={16}/><span>{category}</span><div className="auricui-card-actions">{onEdit&&<button type="button" className="auricui-agent-button" aria-label={uiText("编辑记忆")} disabled={pending} onClick={onEdit}><Pencil size={13}/></button>}{onForget&&<button type="button" className="auricui-agent-button" aria-label={uiText("忘记这条记忆")} disabled={pending} onClick={onForget}><Trash2 size={13}/></button>}</div></header><p className="auricui-memory-content">{content}</p>{(source||updatedAt)&&<footer className="auricui-memory-meta">{source&&<span>{uiText("来源 ·")}{source}</span>}{updatedAt&&<time>{updatedAt}</time>}</footer>}</article>;
}
