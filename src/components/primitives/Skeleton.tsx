import type { CSSProperties } from 'react';
import { classes } from '../../agent/shared';
export interface SkeletonProps { width?:CSSProperties['width']; height?:CSSProperties['height']; rounded?:boolean; animated?:boolean; className?:string; }
export function Skeleton({width='100%',height=14,rounded=false,animated=true,className}:SkeletonProps) {
  return <span aria-hidden="true" className={classes('auricui-skeleton',className)} data-animated={animated} style={{width,height,borderRadius:rounded?'50%':6}}/>;
}
