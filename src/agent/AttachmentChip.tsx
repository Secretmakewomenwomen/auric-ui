import { FileText, X, AlertCircle, LoaderCircle } from 'lucide-react';
import { classes } from './shared';
export interface AttachmentChipProps { name:string; detail?:string; status?:'ready'|'uploading'|'error'; onRemove?:()=>void; onOpen?:()=>void; disabled?:boolean; className?:string; }
export function AttachmentChip({name,detail,status='ready',onRemove,onOpen,disabled,className}:AttachmentChipProps) {
  const icon=status==='uploading'?<LoaderCircle size={16} className="auricui-agent-spin"/>:status==='error'?<AlertCircle size={16}/>:<FileText size={16}/>;
  const content=<><span aria-hidden="true">{icon}</span><span className="auricui-attachment-name"><strong>{name}</strong><small>{detail??({ready:'已就绪',uploading:'上传中',error:'上传失败'})[status]}</small></span></>;
  return <span className={classes('auricui-attachment',className)} data-status={status}>{onOpen?<button type="button" disabled={disabled||status!=='ready'} onClick={onOpen} className="auricui-attachment-open">{content}</button>:<span className="auricui-attachment-open">{content}</span>}{onRemove&&<button type="button" className="auricui-agent-button" disabled={disabled} aria-label={`移除 ${name}`} onClick={onRemove}><X size={13}/></button>}</span>;
}
