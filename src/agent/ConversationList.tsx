import { Search, MessageSquare, Plus } from 'lucide-react';
import { classes } from './shared';
export interface ConversationItem { id:string; title:string; preview?:string; meta?:string; unread?:boolean; }
export interface ConversationListProps { items:ConversationItem[]; value?:string; onValueChange:(id:string)=>void; query?:string; onQueryChange?:(query:string)=>void; onCreate?:()=>void; label?:string; emptyText?:string; className?:string; }
/** Filtering and pagination belong to the host. query is a controlled search input. */
export function ConversationList({items,value,onValueChange,query='',onQueryChange,onCreate,label='会话',emptyText='暂无会话',className}:ConversationListProps) {
  return <section className={classes('auricui-conversations',className)} aria-label={label}><header><strong>{label}</strong>{onCreate&&<button type="button" className="auricui-agent-button" aria-label="新建会话" onClick={onCreate}><Plus size={15}/></button>}</header>
    {onQueryChange&&<label className="auricui-conversation-search"><Search size={14}/><input aria-label="搜索会话" placeholder="搜索会话…" value={query} onChange={e=>onQueryChange(e.target.value)}/></label>}
    <ul>{items.map(item=><li key={item.id}><button type="button" aria-current={value===item.id?'page':undefined} onClick={()=>onValueChange(item.id)}><MessageSquare size={14} aria-hidden="true"/><span><strong>{item.title}</strong>{item.preview&&<small>{item.preview}</small>}</span>{item.unread&&<i aria-label="未读"/>}{item.meta&&<time>{item.meta}</time>}</button></li>)}</ul>{!items.length&&<p className="auricui-agent-empty">{emptyText}</p>}
  </section>;
}
