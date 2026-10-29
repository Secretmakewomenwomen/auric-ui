import type { ReactNode } from 'react';
import { FileCode2, ArrowUpRight } from 'lucide-react';
import { classes } from './shared';
export interface ArtifactCardProps { title:string; description?:string; kind?:string; preview?:ReactNode; version?:string; onOpen:()=>void; disabled?:boolean; className?:string; }
export function ArtifactCard({title,description,kind='文档',preview,version,onOpen,disabled,className}:ArtifactCardProps) {
  return <button type="button" className={classes('auricui-artifact',className)} onClick={onOpen} disabled={disabled}>{preview&&<span className="auricui-artifact-preview" aria-hidden="true">{preview}</span>}<span className="auricui-artifact-body"><span className="auricui-artifact-kind"><FileCode2 size={13}/>{kind}{version&&<span>{version}</span>}</span><strong>{title}</strong>{description&&<span className="auricui-artifact-description">{description}</span>}<span className="auricui-artifact-open">打开产物<ArrowUpRight size={13}/></span></span></button>;
}
