import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { ArrowDown } from 'lucide-react';
import { classes } from './shared';
export interface MessageListProps { children:ReactNode; label?:string; follow?:boolean; className?:string; style?:CSSProperties; scrollLabel?:string; }
/** Follows content only while the reader is at the bottom; streaming never steals their reading position. */
export function MessageList({children,label='消息记录',follow=true,className,style,scrollLabel='回到最新消息'}:MessageListProps) {
  const viewport=useRef<HTMLDivElement>(null);
  const content=useRef<HTMLDivElement>(null);
  const pinned=useRef(true);
  const [atBottom,setAtBottom]=useState(true);
  useEffect(()=>{
    const target=viewport.current, inner=content.current;
    if(!target||!inner) return;
    const update=()=>{if(follow&&pinned.current)target.scrollTop=target.scrollHeight;};
    update();
    const observer=new ResizeObserver(update);observer.observe(inner);
    return()=>observer.disconnect();
  },[follow]);
  const bottom=()=>{
    const target=viewport.current;if(!target)return;
    pinned.current=true;setAtBottom(true);
    target.scrollTo({top:target.scrollHeight,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  };
  return <div className={classes('auricui-message-list',className)} style={style}><div className="auricui-message-viewport" ref={viewport} role="region" aria-label={label} tabIndex={0} onScroll={()=>{
    const target=viewport.current!;const near=target.scrollHeight-target.scrollTop-target.clientHeight<48;pinned.current=near;setAtBottom(near);
  }}><div ref={content} className="auricui-message-list-content">{children}</div></div><button type="button" className="auricui-scroll-latest" aria-label={scrollLabel} data-visible={!atBottom} tabIndex={atBottom?-1:0} inert={atBottom||undefined} onClick={bottom}><ArrowDown size={14}/>{scrollLabel}</button></div>;
}
