import { classes } from '../../agent/shared';
export interface ProgressProps { value?:number; max?:number; label:string; showValue?:boolean; className?:string; }
export function Progress({value,max=100,label,showValue=false,className}:ProgressProps) {
  const known=Number.isFinite(value)&&Number.isFinite(max)&&max>0;
  const percent=known?Math.max(0,Math.min(100,value!/max*100)):undefined;
  return <div className={classes('auricui-progress',className)}><div className="auricui-progress-label"><span>{label}</span>{showValue&&<span>{known?`${Math.round(percent!)}%`:'进行中'}</span>}</div><div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="auricui-progress-track" data-indeterminate={!known}><span style={known?{transform:`scaleX(${percent!/100})`}:undefined}/></div></div>;
}
