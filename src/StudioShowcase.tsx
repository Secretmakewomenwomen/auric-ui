import { lazy, Suspense, useState } from 'react';
import { ArrowUpRight, Clapperboard, Folder, Settings2, Shapes, MessagesSquare } from 'lucide-react';
import { SceneBoundary } from './demo/SceneBoundary';
import type { StudioScenario } from './demo/scenario-types';
export type { StudioScenario } from './demo/scenario-types';
const Bench=lazy(()=>import('./demo/StudioBench'));
export function StudioShowcase({initial=null}:{initial?:StudioScenario|null}){
 const [scenario,setScenario]=useState<StudioScenario|null>(initial);
 const scenarios=[{id:'chat' as const,title:'完整聊天工作台',icon:MessagesSquare,description:'对话历史、流式回复、输入建议、技能安装、分栏与模型日志。'},{id:'editor' as const,title:'专业编辑工作台',icon:Clapperboard,description:'时间轴、舞台选择、图层、字幕、素材、属性编辑、播放与导出。'},{id:'projects' as const,title:'项目与素材管理',icon:Folder,description:'项目卡片、列表、文件夹、搜索、重命名、封面与项目入口。'},{id:'settings' as const,title:'完整应用设置',icon:Settings2,description:'Agent、服务商、模型、自定义服务、快捷键、存储和诊断。'},{id:'gallery' as const,title:'模板与技能库',icon:Shapes,description:'技能卡片、分类、详情、示例分段预览与项目创建入口。'}];
 return <div className="studio-showcase"><p className="coverage-note">组合场景使用 AuricUI 组件和本地示例数据，展示组件的组合效果与交互。可参考各组件文档自行搭建页面；模型调用、项目持久化和媒体导出等能力需要接入业务逻辑，当前场景中的这些能力为模拟。</p><div className="scenario-grid">{scenarios.map(({id,title,icon:Icon,description})=><article key={id} className="scenario-card"><Icon size={25} strokeWidth={1.5}/><strong>{title}</strong><p>{description}</p><div className="scenario-actions"><button onClick={()=>setScenario(id)}>打开场景 <ArrowUpRight size={14}/></button></div></article>)}</div>{scenario&&<SceneBoundary onClose={()=>setScenario(null)}><Suspense fallback={<div className="studio-workbench"><p className="demo-loading">正在加载组件场景…</p></div>}><Bench initial={scenario} onClose={()=>setScenario(null)}/></Suspense></SceneBoundary>}</div>;
}
