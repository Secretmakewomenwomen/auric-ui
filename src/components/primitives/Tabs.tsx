import { useId, type ReactNode } from 'react';
import { classes, useControllable } from '../../agent/shared';
export interface TabItem { value:string; label:string; content:ReactNode; disabled?:boolean; }
export interface TabsProps { items:TabItem[]; value?:string; defaultValue?:string; onValueChange?:(value:string)=>void; label:string; className?:string; }
export function Tabs({items,value,defaultValue,onValueChange,label,className}:TabsProps) {
  const id=useId();const first=items.find(item=>!item.disabled)?.value??'';
  const [selected,setSelected]=useControllable(value,defaultValue??first,onValueChange);
  const active=items.some(item=>item.value===selected&&!item.disabled)?selected:first;
  return <div className={classes('auricui-tabs',className)}><div role="tablist" aria-label={label}>{items.map((item,index)=><button key={item.value} type="button" id={`${id}-tab-${index}`} role="tab" aria-selected={active===item.value} aria-controls={`${id}-panel-${index}`} tabIndex={active===item.value?0:-1} disabled={item.disabled} onClick={()=>setSelected(item.value)} onKeyDown={event=>{
    const enabled=items.filter(item=>!item.disabled);const at=enabled.findIndex(i=>i.value===item.value);
    const next=event.key==='ArrowRight'?enabled[(at+1)%enabled.length]:event.key==='ArrowLeft'?enabled[(at+enabled.length-1)%enabled.length]:event.key==='Home'?enabled[0]:event.key==='End'?enabled.at(-1):undefined;
    if(next){event.preventDefault();setSelected(next.value);document.getElementById(`${id}-tab-${items.indexOf(next)}`)?.focus();}
  }}>{item.label}</button>)}</div>{items.map((item,index)=><div key={item.value} role="tabpanel" id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`} hidden={active!==item.value} tabIndex={0}>{item.content}</div>)}</div>;
}
