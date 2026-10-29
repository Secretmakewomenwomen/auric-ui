import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { classes } from '../../agent/shared';
export interface ComboboxOption { value:string; label:string; disabled?:boolean; }
export interface ComboboxProps { options:ComboboxOption[]; value?:string; onValueChange:(value:string)=>void; label:string; placeholder?:string; emptyText?:string; disabled?:boolean; className?:string; }
export function Combobox({options,value,onValueChange,label,placeholder='搜索并选择…',emptyText='没有匹配选项',disabled,className}:ComboboxProps) {
  const [open,setOpen]=useState(false),[query,setQuery]=useState(''),[active,setActive]=useState(-1);
  const id=useId(),root=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null);
  const selected=options.find(o=>o.value===value);
  const filtered=options.filter(o=>o.label.toLowerCase().includes(query.toLowerCase()));
  const choose=(option:ComboboxOption)=>{if(option.disabled)return;onValueChange(option.value);setOpen(false);setQuery('');input.current?.focus();};
  useEffect(()=>{if(!open)return;const close=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node)){setOpen(false);setQuery('');}};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[open]);
  useEffect(()=>{if(disabled){setOpen(false);setQuery('');}},[disabled]);
  useEffect(()=>{if(open&&active>=0)document.getElementById(`${id}-option-${active}`)?.scrollIntoView({block:'nearest'});},[open,active,id]);
  const current=filtered[active]&&!filtered[active].disabled?active:-1;
  return <div ref={root} className={classes('auricui-combobox',className)} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget)){setOpen(false);setQuery('');}}}><label htmlFor={id}>{label}</label><div className="auricui-combobox-input"><input id={id} ref={input} role="combobox" autoComplete="off" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-list`} aria-activedescendant={open&&current>=0?`${id}-option-${current}`:undefined} placeholder={placeholder} disabled={disabled} value={open?query:selected?.label??''} onClick={()=>{if(!open){setOpen(true);setQuery('');setActive(-1);}}} onFocus={()=>{setOpen(true);setQuery('');setActive(-1);}} onChange={e=>{setQuery(e.target.value);setOpen(true);setActive(-1);}} onKeyDown={event=>{
    if(event.key==='Escape'){event.preventDefault();setOpen(false);setQuery('');return;}
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setOpen(true);const enabled=filtered.map((o,i)=>o.disabled?-1:i).filter(i=>i>=0);const at=enabled.indexOf(current);const next=event.key==='ArrowDown'?enabled[(at+1)%enabled.length]:enabled[(at<=0?enabled.length:at)-1];setActive(next??-1);}
    else if(open&&(event.key==='Home'||event.key==='End')){event.preventDefault();const indices=filtered.map((o,i)=>o.disabled?-1:i).filter(i=>i>=0);setActive((event.key==='Home'?indices[0]:indices.at(-1))??-1);}
    else if(event.key==='Enter'&&open){event.preventDefault();if(current>=0)choose(filtered[current]);}
  }}/><button type="button" tabIndex={-1} disabled={disabled} aria-label={`展开${label}`} onPointerDown={event=>event.preventDefault()} onClick={()=>{input.current?.focus();setOpen(!open);setQuery('');setActive(-1);}}><ChevronDown size={14} aria-hidden="true"/></button></div><ul id={`${id}-list`} role="listbox" aria-label={label} hidden={!open} className="auricui-combobox-list">{filtered.map((option,index)=><li id={`${id}-option-${index}`} key={option.value} role="option" aria-selected={value===option.value} aria-disabled={option.disabled||undefined} data-active={current===index} onPointerMove={()=>{if(!option.disabled)setActive(index);}} onPointerDown={e=>e.preventDefault()} onClick={()=>choose(option)}><span>{option.label}</span>{value===option.value&&<Check size={13}/>}</li>)}{!filtered.length&&<li role="presentation" className="auricui-agent-empty">{emptyText}</li>}</ul></div>;
}
