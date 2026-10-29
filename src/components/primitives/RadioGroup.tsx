import { useId } from 'react';
import { classes, useControllable } from '../../agent/shared';
export interface RadioOption { value:string; label:string; description?:string; disabled?:boolean; }
export interface RadioGroupProps { label:string; options:RadioOption[]; value?:string; defaultValue?:string; onValueChange?:(value:string)=>void; name?:string; disabled?:boolean; orientation?:'horizontal'|'vertical'; className?:string; }
export function RadioGroup({label,options,value,defaultValue='',onValueChange,name,disabled,orientation='vertical',className}:RadioGroupProps) {
  const id=useId();const [selected,setSelected]=useControllable(value,defaultValue,onValueChange);
  return <fieldset className={classes('auricui-radio-group',className)} disabled={disabled} data-orientation={orientation}><legend>{label}</legend><div>{options.map(option=><label key={option.value} data-disabled={disabled||option.disabled}><input type="radio" name={name??id} value={option.value} checked={selected===option.value} disabled={option.disabled} onChange={()=>setSelected(option.value)}/><span><span className="auricui-control-label">{option.label}</span>{option.description&&<small>{option.description}</small>}</span></label>)}</div></fieldset>;
}
