import { useState } from 'react';
import { classes } from '../../agent/shared';
export interface AvatarProps { name:string; src?:string; size?:'sm'|'md'|'lg'; className?:string; }
export function Avatar({name,src,size='md',className}:AvatarProps) {
  const [failedSrc,setFailedSrc]=useState<string>();
  const initials=name.trim().split(/\s+/).slice(0,2).map(word=>Array.from(word)[0]??'').join('').toUpperCase()||'?';
  return <span className={classes('auricui-avatar',className)} data-size={size} role="img" aria-label={name}>{src&&failedSrc!==src?<img src={src} alt="" onError={()=>setFailedSrc(src)}/>:<span aria-hidden="true">{initials}</span>}</span>;
}
