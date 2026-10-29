import { History } from 'lucide-react';
import { classes } from './shared';
export interface CheckpointProps { title:string; description?:string; onRestore:()=>void; pending?:boolean; disabled?:boolean; restoreLabel?:string; className?:string; }
export function Checkpoint({title,description,onRestore,pending,disabled,restoreLabel='恢复到此处',className}:CheckpointProps) {
  return <div className={classes('auricui-checkpoint',className)}><History size={15} aria-hidden="true"/><div><strong>{title}</strong>{description&&<p>{description}</p>}</div><button type="button" className="auricui-agent-button" disabled={disabled||pending} onClick={onRestore}>{pending?'恢复中…':restoreLabel}</button></div>;
}
