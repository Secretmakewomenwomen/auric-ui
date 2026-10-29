import { useState } from 'react';
import { Plus } from 'lucide-react';
import { CardButton, Checkbox, Textarea, Tabs, Breadcrumb, Progress, Skeleton, EmptyState, Avatar, Tooltip } from '../../library/index';
import { ThinkingIndicator } from '../../library/agent';
export function CheckboxRecipeExample() {
  const [checked,setChecked]=useState(false);
  return <Checkbox label="自动同步偏好" checked={checked} onCheckedChange={setChecked}/>;
}
export function TextareaRecipeExample() {
  const [text,setText]=useState('');
  return <Textarea label="描述" value={text} onChange={e=>setText(e.target.value)} placeholder="写下一点想法…"/>;
}
export function TabsRecipeExample() {
  return <Tabs label="项目" defaultValue="overview" items={[{value:'overview',label:'概览',content:'概览内容'},{value:'activity',label:'活动',content:'活动内容'},{value:'settings',label:'设置',content:'设置内容'}]}/>;
}
export function BreadcrumbRecipeExample() {
  return <Breadcrumb items={[{label:'组件库',href:'#/overview'},{label:'当前页面'}]}/>;
}
export function ProgressRecipeExample() {
  const [value,setValue]=useState(40);
  return <div style={{display:'grid',gap:16}}><Progress label="任务进度" value={value} showValue/><CardButton onClick={()=>setValue(value>=100?0:value+20)}>更新进度</CardButton></div>;
}
export function SkeletonRecipeExample() {
  return <div role="status" aria-label="内容加载中" style={{display:'grid',gap:10,width:'100%'}}><Skeleton width="70%"/><Skeleton/></div>;
}
export function EmptyStateRecipeExample() {
  const [created,setCreated]=useState(false);
  return created?<p role="status">已创建第一项内容。</p>:<EmptyState title="还没有内容" description="创建第一项，开始你的工作。" action={<CardButton weight="primary" onClick={()=>setCreated(true)}>创建内容</CardButton>}/>;
}
export function AvatarRecipeExample() {
  return <Avatar name="示例用户"/>;
}
export function TypographyRecipeExample() {
  return <div style={{fontFamily:'var(--font-sans)',lineHeight:1.8}}><h3 style={{fontSize:24}}>清晰，始于每一个细节。</h3><p style={{fontSize:14,color:'var(--text-muted)'}}>Inter Variable 与系统中文字体。</p></div>;
}
export function IconButtonRecipeExample() {
  const [added,setAdded]=useState(false);
  return <div style={{display:'flex',alignItems:'center',gap:12}}><Tooltip label="添加项目"><CardButton aria-label="添加项目" onClick={()=>setAdded(true)} style={{width:28,padding:0}}><Plus size={14}/></CardButton></Tooltip>{added&&<span role="status" style={{fontSize:12}}>已添加项目</span>}</div>;
}
export function LoadingRecipeExample() {
  return <ThinkingIndicator label="正在准备内容…"/>;
}

export function MediaRecipeExample() {
  return <figure style={{width:260,margin:0}}><div role="img" aria-label="示例素材预览" style={{aspectRatio:'16/9',borderRadius:8,background:'var(--surface-3)',display:'grid',placeItems:'center'}}>素材预览</div><figcaption style={{paddingTop:10,fontSize:12}}>春日记录 · 00:24</figcaption></figure>;
}
