import { useId } from 'react';
import { classes } from './shared';
export interface AutonomyOption { value:string; label:string; description:string; disabled?:boolean; }
export interface AutonomyControlProps { options:AutonomyOption[]; value:string; onValueChange:(value:string)=>void; label?:string; disabled?:boolean; className?:string; }
/** A preference picker, not a permission enforcement mechanism. Persist and enforce choices in the host. */
export function AutonomyControl({options,value,onValueChange,label='行动偏好',disabled,className}:AutonomyControlProps) {
  const name=useId();
  return <fieldset className={classes('auricui-autonomy',className)} disabled={disabled}><legend>{label}</legend>{options.map(option=><label key={option.value} data-selected={value===option.value} data-disabled={disabled||option.disabled}><input type="radio" name={name} value={option.value} checked={value===option.value} disabled={option.disabled} onChange={()=>onValueChange(option.value)}/><span><strong>{option.label}</strong><small>{option.description}</small></span></label>)}</fieldset>;
}
