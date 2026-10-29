import { ChevronRight } from 'lucide-react';
import { classes } from '../../agent/shared';
export interface BreadcrumbItem { label:string; href?:string; onClick?:()=>void; }
export interface BreadcrumbProps { items:BreadcrumbItem[]; label?:string; className?:string; }
export function Breadcrumb({items,label='面包屑',className}:BreadcrumbProps) {
  return <nav className={classes('auricui-breadcrumb',className)} aria-label={label}><ol>{items.map((item,index)=><li key={`${item.label}-${index}`}>{index>0&&<ChevronRight size={12} aria-hidden="true"/>}{index===items.length-1?<span aria-current="page">{item.label}</span>:item.onClick?<button type="button" onClick={item.onClick}>{item.label}</button>:item.href?<a href={/^(https?:|\/|#|\.)/i.test(item.href)&&!/^\/\//.test(item.href)?item.href:undefined}>{item.label}</a>:<span>{item.label}</span>}</li>)}</ol></nav>;
}
