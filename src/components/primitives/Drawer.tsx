import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { classes } from '../../agent/shared';
export interface DrawerProps { open:boolean; onOpenChange:(open:boolean)=>void; title:string; description?:string; children:ReactNode; footer?:ReactNode; side?:'left'|'right'|'top'|'bottom'; size?:'sm'|'md'|'lg'; closeOnOutsideClick?:boolean; className?:string; }
const layers:HTMLElement[]=[];
const inertBefore=new Map<HTMLElement,boolean>();
let overflowBefore='';
export function Drawer({open,onOpenChange,title,description,children,footer,side='right',size='md',closeOnOutsideClick=true,className}:DrawerProps) {
  const [mounted,setMounted]=useState(false);
  useEffect(()=>setMounted(true),[]);
  const [present,setPresent]=useState(open),[shown,setShown]=useState(false);
  const dialog=useRef<HTMLElement>(null),layer=useRef<HTMLDivElement>(null),close=useRef(onOpenChange);
  close.current=onOpenChange;
  const id=useId();
  useEffect(()=>{
    let frame=0,timer:ReturnType<typeof setTimeout>|undefined;
    if(open){setPresent(true);frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>setShown(true));});}
    else{
      setShown(false);
      const styles=dialog.current?getComputedStyle(dialog.current):null;
      const milliseconds=(value:string)=>parseFloat(value)*(value.trim().endsWith('ms')?1:1000)||0;
      const durations=styles?.transitionDuration.split(',').map(milliseconds)??[320];
      const delays=styles?.transitionDelay.split(',').map(milliseconds)??[0];
      const duration=Math.max(...durations.map((value,index)=>value+delays[index%delays.length]));
      timer=setTimeout(()=>setPresent(false),window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:duration+32);
    }
    return()=>{cancelAnimationFrame(frame);clearTimeout(timer);};
  },[open]);
  useEffect(()=>{
    if(!present||!layer.current||!dialog.current)return;
    const element=layer.current, panel=dialog.current,previous=document.activeElement as HTMLElement|null;
    if(!layers.length){overflowBefore=document.body.style.overflow;document.body.style.overflow='hidden';for(const child of Array.from(document.body.children)){if(child instanceof HTMLElement&&child!==element){inertBefore.set(child,child.inert);child.inert=true;}}}
    const parent=layers.at(-1);if(parent)parent.inert=true;layers.push(element);
    const tabbables=()=>Array.from(panel.querySelectorAll<HTMLElement>('button,a[href],input,select,textarea,[tabindex]')).filter(el=>el.tabIndex>=0&&!el.hasAttribute('disabled')&&el.getClientRects().length>0);
    const frame=requestAnimationFrame(()=>{(tabbables()[0]??panel).focus();});
    const key=(event:KeyboardEvent)=>{if(layers.at(-1)!==element)return;if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close.current(false);}if(event.key==='Tab'){const items=tabbables(),first=items[0]??panel,last=items.at(-1)??panel;if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}else if(!panel.contains(document.activeElement)){event.preventDefault();first.focus();}}};
    document.addEventListener('keydown',key,true);
    return()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',key,true);const index=layers.indexOf(element);if(index>=0)layers.splice(index,1);if(!layers.length){for(const [el,was] of inertBefore)el.inert=was;inertBefore.clear();document.body.style.overflow=overflowBefore;}else layers.at(-1)!.inert=false;if(previous?.isConnected&&!previous.closest('[inert]'))previous.focus();};
  },[present,mounted]);
  if(!present||!mounted)return null;
  return createPortal(<div ref={layer} className="auricui-drawer-layer" data-open={shown} onPointerDown={event=>{if(closeOnOutsideClick&&event.target===event.currentTarget&&layers.at(-1)===layer.current)close.current(false);}}><section ref={dialog} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={description?`${id}-description`:undefined} tabIndex={-1} className={classes('auricui-drawer',className)} data-side={side} data-size={size}><header><div><h2 id={`${id}-title`}>{title}</h2>{description&&<p id={`${id}-description`}>{description}</p>}</div><button type="button" className="auricui-agent-button" aria-label="关闭抽屉" onClick={()=>onOpenChange(false)}><X size={17}/></button></header><div className="auricui-drawer-body">{children}</div>{footer&&<footer>{footer}</footer>}</section></div>,document.body);
}
