import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Clapperboard, Folder, Settings2, Shapes } from 'lucide-react';
import { configureStudioTransport } from '@studio/lib/transport';
import { configureStudioHost } from '@studio/lib/host';
import { ProjectView } from '@studio/components/ProjectView';
import { Launcher } from '@studio/components/Launcher';
import { SettingsModal } from '@studio/components/settings/SettingsModal';
import { ExamplesGallery } from '@studio/components/ExamplesGallery';
import { DesktopDialog } from '@studio/components/DesktopDialog';
import { WhatsNew } from '@studio/components/WhatsNew';
import { showWhatsNew } from '@studio/lib/whats-new';
import { ChatBench } from './ChatBench';
import { createStudioDemo } from '../library/samples';
import type { StudioScenario } from './scenario-types';
export default function StudioBench({initial,onClose}:{initial:StudioScenario;onClose:()=>void}){
 const [ready,setReady]=useState(false),[scenario,setScenario]=useState(initial),[project,setProject]=useState('demo-1'),[settings,setSettings]=useState(initial==='settings'),[desktop,setDesktop]=useState(false),[message,setMessage]=useState('');
 const backendRef=useRef<ReturnType<typeof createStudioDemo>|null>(null);
 const notify=useCallback((value:string)=>setMessage(value),[]);
 const openProject=(id:string)=>{setProject(id);setScenario('editor');};
 useEffect(()=>{const backend=createStudioDemo(openProject,setMessage);backendRef.current=backend;configureStudioTransport(backend.transport);configureStudioHost(backend.host);setReady(true);return()=>{backend.dispose();backendRef.current=null;configureStudioTransport(null);configureStudioHost(null);};},[]);
 useEffect(()=>{if(!message)return;const timer=setTimeout(()=>setMessage(''),3500);return()=>clearTimeout(timer);},[message]);
 return <div className="studio-workbench" role="region" aria-label="组件组合场景">{createPortal(<div className="studio-bench-toolbar"><button onClick={onClose}><ArrowLeft size={15}/>返回组件库</button><span className="bench-divider"/><button className={scenario==='editor'?'active':''} onClick={()=>setScenario('editor')}><Clapperboard size={14}/>编辑器</button><button className={scenario==='projects'?'active':''} onClick={()=>setScenario('projects')}><Folder size={14}/>项目</button><button className={scenario==='gallery'?'active':''} onClick={()=>setScenario('gallery')}><Shapes size={14}/>技能与示例</button><button onClick={()=>setSettings(true)}><Settings2 size={14}/>设置</button><button className={scenario==='chat'?'active':''} onClick={()=>setScenario('chat')}>聊天</button><span className="bench-spacer"/><button onClick={()=>{setScenario('editor');setTimeout(()=>backendRef.current?.ask(project),100);}}>确认弹窗</button><button onClick={()=>showWhatsNew(['0.2.5'])}>更新说明</button><button onClick={()=>setDesktop(true)}>桌面弹窗</button><small>本地交互演示</small></div>, document.body)}<div className="studio-bench-content">{ready ? scenario==='chat'?<ChatBench notify={notify}/>:scenario==='projects'?<Launcher onOpen={openProject}/>:scenario==='gallery'?<div className="studio-gallery"><ExamplesGallery mode="reference" projectId={project} onStart={()=>openProject('demo-1')} onTrySkill={skill=>setMessage(`已选择技能：${skill.name}`)}/></div>:<ProjectView projectId={project} onProject={openProject} onLeave={()=>setScenario('projects')}/>:<p className="demo-loading">正在准备本地数据…</p>}</div>{ready&&<><SettingsModal open={settings} onClose={()=>{setSettings(false);if(scenario==='settings')setScenario('editor');}}/><DesktopDialog open={desktop} onClose={()=>setDesktop(false)}/><WhatsNew/></>}{message&&<div className="bench-feedback" role="status">{message}</div>}</div>;
}
