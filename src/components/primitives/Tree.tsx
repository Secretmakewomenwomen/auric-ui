import { useId, useRef, useState, type ReactNode } from 'react';
import { ChevronRight, File, Folder } from 'lucide-react';
import { classes, useControllable } from '../../agent/shared';
export interface TreeNode { id:string; label:string; icon?:ReactNode; disabled?:boolean; children?:TreeNode[]; }
export interface TreeProps { nodes:TreeNode[]; label:string; value?:string; defaultValue?:string; onValueChange?:(id:string)=>void; expanded?:string[]; defaultExpanded?:string[]; onExpandedChange?:(ids:string[])=>void; className?:string; }
export function Tree({nodes,label,value,defaultValue='',onValueChange,expanded,defaultExpanded=[],onExpandedChange,className}:TreeProps) {
  const [selected,setSelected]=useControllable(value,defaultValue,onValueChange);
  const [open,setOpen]=useControllable(expanded,defaultExpanded,onExpandedChange);
  const [focused,setFocused]=useState(defaultValue);
  const refs=useRef(new Map<string,HTMLLIElement>()),typed=useRef({text:'',at:0});
  const instance=useId();
  const flat:{node:TreeNode;parent?:string}[]=[];
  const walk=(items:TreeNode[],parent?:string)=>{for(const node of items){flat.push({node,parent});if(node.children&&open.includes(node.id))walk(node.children,node.id);}};walk(nodes);
  const enabled=flat.filter(row=>!row.node.disabled);
  const active=enabled.some(row=>row.node.id===focused)?focused:enabled.find(row=>row.node.id===selected)?.node.id??enabled[0]?.node.id;
  const focus=(id?:string)=>{if(id){setFocused(id);refs.current.get(id)?.focus();}};
  const toggle=(id:string)=>setOpen(open.includes(id)?open.filter(x=>x!==id):[...open,id]);
  const render=(items:TreeNode[],level:number)=>items.map((node,index)=>{
    const branch=!!node.children?.length,isOpen=open.includes(node.id);
    return <li key={node.id} ref={el=>{if(el)refs.current.set(node.id,el);else refs.current.delete(node.id);}} role="treeitem" aria-label={node.label} aria-selected={selected===node.id} aria-disabled={node.disabled||undefined} aria-expanded={branch?isOpen:undefined} aria-level={level} aria-setsize={items.length} aria-posinset={index+1} tabIndex={!node.disabled&&active===node.id?0:-1} onFocus={e=>{if(e.target===e.currentTarget)setFocused(node.id);}} onKeyDown={event=>{
      if(event.target!==event.currentTarget||node.disabled)return;
      const at=enabled.findIndex(row=>row.node.id===node.id);
      if(['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Home','End','Enter',' '].includes(event.key))event.preventDefault();
      if(event.key==='ArrowDown')focus(enabled[Math.min(enabled.length-1,at+1)]?.node.id);
      else if(event.key==='ArrowUp')focus(enabled[Math.max(0,at-1)]?.node.id);
      else if(event.key==='Home')focus(enabled[0]?.node.id);
      else if(event.key==='End')focus(enabled.at(-1)?.node.id);
      else if(event.key==='ArrowRight'&&branch){if(!isOpen)toggle(node.id);else focus(node.children?.find(n=>!n.disabled)?.id);}
      else if(event.key==='ArrowLeft'){if(branch&&isOpen)toggle(node.id);else focus(flat.find(row=>row.node.id===node.id)?.parent);}
      else if(event.key==='Enter'||event.key===' ')setSelected(node.id);
      else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey){const now=Date.now();typed.current={text:now-typed.current.at<600?typed.current.text+event.key:event.key,at:now};const list=[...enabled.slice(at+1),...enabled.slice(0,at+1)];focus(list.find(row=>row.node.label.toLowerCase().startsWith(typed.current.text.toLowerCase()))?.node.id);}
    }}><div className="auricui-tree-row" data-selected={selected===node.id} data-disabled={node.disabled} style={{paddingLeft:8+(level-1)*18}} onClick={()=>{if(!node.disabled){focus(node.id);setSelected(node.id);}}}><span className="auricui-tree-expander" aria-hidden="true" onClick={event=>{if(branch&&!node.disabled){event.stopPropagation();focus(node.id);toggle(node.id);}}}>{branch&&<ChevronRight size={13} data-open={isOpen}/>}</span><span aria-hidden="true">{node.icon??(branch?<Folder size={14}/>:<File size={14}/>)}</span><span>{node.label}</span></div>{branch&&<div className="auricui-collapse" data-open={isOpen} aria-hidden={!isOpen||undefined} inert={!isOpen||undefined}><div><ul role="group" id={`${instance}-${node.id}`}>{render(node.children!,level+1)}</ul></div></div>}</li>;
  });
  return <ul className={classes('auricui-tree',className)} role="tree" aria-label={label}>{render(nodes,1)}</ul>;
}
