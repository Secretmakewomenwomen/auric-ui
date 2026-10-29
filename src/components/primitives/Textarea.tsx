import { useId, type TextareaHTMLAttributes } from 'react';
import { classes } from '../../agent/shared';
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { label:string; description?:string; error?:string; }
export function Textarea({label,description,error,id,className,...props}:TextareaProps) {
  const generated=useId();const inputId=id??generated;
  return <div className={classes('auricui-textarea',className)}><label htmlFor={inputId}>{label}</label><textarea {...props} id={inputId} aria-invalid={error?true:props['aria-invalid']} aria-describedby={props['aria-describedby']??(error||description?`${inputId}-help`:undefined)}/>{(error||description)&&<p id={`${inputId}-help`} data-error={!!error}>{error??description}</p>}</div>;
}
