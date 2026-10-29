import { useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { Check, Minus } from 'lucide-react';
import { classes } from '../../agent/shared';
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>,'type'|'onChange'|'size'> {
  label:ReactNode;
  description?:string;
  indeterminate?:boolean;
  onCheckedChange?:(checked:boolean)=>void;
}
export function Checkbox({label,description,indeterminate=false,onCheckedChange,className,id,...props}:CheckboxProps) {
  const generated=useId(),ref=useRef<HTMLInputElement>(null);const inputId=id??generated;
  useEffect(()=>{if(ref.current)ref.current.indeterminate=indeterminate;},[indeterminate,props.checked]);
  return <label className={classes('auricui-checkbox',className)} data-disabled={props.disabled} htmlFor={inputId}><span className="auricui-checkbox-control"><input {...props} ref={ref} id={inputId} type="checkbox" aria-checked={indeterminate?'mixed':props.checked} aria-describedby={props['aria-describedby']??(description?`${inputId}-description`:undefined)} onChange={e=>onCheckedChange?.(e.target.checked)}/><span aria-hidden="true">{indeterminate?<Minus size={12}/>:<Check size={12}/>}</span></span><span><span className="auricui-control-label">{label}</span>{description&&<small id={`${inputId}-description`}>{description}</small>}</span></label>;
}
