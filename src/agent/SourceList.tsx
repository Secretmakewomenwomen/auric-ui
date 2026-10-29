import { ArrowUpRight, FileText } from 'lucide-react';
import { classes, safeCitationHref } from './shared';
export interface SourceItem { id:string; title:string; href?:string; description?:string; source?:string; }
export interface SourceListProps { sources:SourceItem[]; label?:string; className?:string; }
export function SourceList({sources,label='参考来源',className}:SourceListProps) {
  return <ol className={classes('auricui-source-list',className)} aria-label={label}>{sources.map((source,i)=>{const href=safeCitationHref(source.href);return <li key={source.id}><span className="auricui-source-index">{i+1}</span><div>{href?<a href={href} target="_blank" rel="noopener noreferrer">{source.title}<ArrowUpRight size={12}/></a>:<strong>{source.title}</strong>}{source.description&&<p>{source.description}</p>}<small><FileText size={11} aria-hidden="true"/>{source.source??(href?new URL(href).hostname:'文档')}</small></div></li>;})}</ol>;
}
