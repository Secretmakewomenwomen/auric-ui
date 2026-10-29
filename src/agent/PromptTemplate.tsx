import { useId, useState } from 'react';
import { classes } from './shared';
export interface PromptVariable { name:string; label:string; placeholder?:string; required?:boolean; }
export interface PromptTemplateProps {
  template:string;
  variables:PromptVariable[];
  values:Record<string,string>;
  onValuesChange:(values:Record<string,string>)=>void;
  onSubmit:(prompt:string)=>void;
  submitLabel?:string;
  disabled?:boolean;
  className?:string;
}
export function resolvePromptTemplate(template:string,values:Record<string,string>) {
  return template.replace(/\{\{\s*([\w-]+)\s*\}\}/g,(match,key)=>values[key]??match);
}
export function PromptTemplate({template,variables,values,onValuesChange,onSubmit,submitLabel='使用提示词',disabled,className}:PromptTemplateProps) {
  const id=useId();
  const [attempted,setAttempted]=useState(false);
  const prompt=resolvePromptTemplate(template,values);
  return <form noValidate className={classes('auricui-prompt-template',className)} onSubmit={event=>{
    event.preventDefault();
    if(disabled)return;
    setAttempted(true);
    const invalid=variables.findIndex(variable=>variable.required&&!values[variable.name]?.trim());
    if(invalid>=0){event.currentTarget.querySelectorAll('input')[invalid]?.focus();return;}
    onSubmit(prompt);
  }}>
    {variables.map(variable=>{
      const invalid=attempted&&variable.required&&!values[variable.name]?.trim();
      const fieldId=`${id}-${variable.name}`;
      return <label key={variable.name} htmlFor={fieldId}>{variable.label}{variable.required&&<span aria-hidden="true"> *</span>}<input id={fieldId} value={values[variable.name]??''} required={variable.required} disabled={disabled} aria-invalid={invalid||undefined} aria-describedby={invalid?`${fieldId}-error`:undefined} placeholder={variable.placeholder} onChange={event=>onValuesChange({...values,[variable.name]:event.target.value})}/>{invalid&&<span id={`${fieldId}-error`} role="alert" className="auricui-agent-error">请填写{variable.label}</span>}</label>;
    })}
    <pre aria-label="提示词预览">{prompt}</pre><button type="submit" className="auricui-agent-primary" disabled={disabled}>{submitLabel}</button>
  </form>;
}
