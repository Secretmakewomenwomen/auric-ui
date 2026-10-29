import { ChevronLeft,ChevronRight } from 'lucide-react';
import { classes } from '../../agent/shared';
export interface PaginationProps { page:number; totalPages:number; onPageChange:(page:number)=>void; disabled?:boolean; label?:string; className?:string; }
export function Pagination({page,totalPages,onPageChange,disabled,label='分页',className}:PaginationProps) {
  const total=Number.isFinite(totalPages)?Math.max(0,Math.floor(totalPages)):0;
  const current=total?Math.max(1,Math.min(total,Number.isFinite(page)?Math.floor(page):1)):0;
  const pages=[...new Set([1,current-1,current,current+1,total])].filter(n=>n>=1&&n<=total).sort((a,b)=>a-b);
  return <nav className={classes('auricui-pagination',className)} aria-label={label}><button type="button" aria-label="上一页" disabled={disabled||current<=1} onClick={()=>onPageChange(current-1)}><ChevronLeft size={14}/></button>{pages.map((p,i)=><span key={p}>{i>0&&p-pages[i-1]>1&&<span className="auricui-pagination-gap" aria-hidden="true">…</span>}<button type="button" aria-label={`第 ${p} 页`} aria-current={p===current?'page':undefined} disabled={disabled} onClick={()=>onPageChange(p)}>{p}</button></span>)}{!total&&<span>0</span>}<button type="button" aria-label="下一页" disabled={disabled||current>=total} onClick={()=>onPageChange(current+1)}><ChevronRight size={14}/></button></nav>;
}
