import { useEffect, useRef, useState } from 'react';
import { Checkbox } from '../components/primitives/Checkbox';
import { ArrowUp, Blocks, Square, RefreshCw } from 'lucide-react';
import { configureChatServices, type ChatServices, type SkillInfo, type SkillPreview } from '@chat/app-bridge';
import { ProjectConversation, primeStoredTranscript } from '@chat/components/ProjectConversation';
import { ProjectStarters } from '@chat/components/ProjectStarters';
import { AddSkillDialog } from '@chat/components/AddSkill';
import { CopyDiagnostics } from '@chat/components/CopyDiagnostics';
import { Divider } from '@chat/components/Divider';
import { PromptEditor, type PromptEditorHandle } from '@chat/components/prompt-editor';
import { ChatProjectContext, DeveloperContext } from '@chat/lib/developer';
import type { ProjectVersion } from '@chat/components/project-version';
import type { TranscriptItem } from '@chat/lib/agent-transcript';

const initialTurns:ProjectVersion[]=[{assetId:'demo-chat-1',label:'视觉规范',title:'视觉规范',prompt:'请检查界面的色彩、字重与交互节奏。',attachments:[],status:'ready',current:false,agent:'codex',model:'演示模型',durationMs:4800,createdAt:new Date().toISOString(),fileChanges:[{path:'src/theme.css',change:'changed',added:8,removed:3}]}];
const initialTranscript:TranscriptItem[]=[{id:'scan',kind:'act',act:'files.read',query:'src/theme.css',pending:false},{id:'reply',kind:'text',text:'已整理好这套视觉规范。\n\n- 使用原始深色变量，保持层级清晰。\n- 弹窗保留焦点锁定和 Escape 关闭。\n- 动画沿用 CSS transition 与 keyframes。\n\n```css\n.panel { background: var(--bg); }\n```',pending:false}];
primeStoredTranscript('demo-chat-1',initialTranscript);

export function ChatBench({notify}:{notify:(message:string)=>void}){
 const [turns,setTurns]=useState(initialTurns),[text,setText]=useState(''),[live,setLive]=useState<string|null>(null),[transcript,setTranscript]=useState<TranscriptItem[]>([]),[addSkill,setAddSkill]=useState(false),[width,setWidth]=useState(620),[logs,setLogs]=useState(true),[installed,setInstalled]=useState<SkillInfo[]>([]);
 const editor=useRef<PromptEditorHandle>(null), timer=useRef<ReturnType<typeof setInterval>|null>(null), file=useRef<HTMLInputElement>(null);
 const latest=useRef({live,transcript});latest.current={live,transcript};
 const stop=()=>{if(timer.current)clearInterval(timer.current);timer.current=null;const current=latest.current;if(current.live){primeStoredTranscript(current.live,current.transcript.map(item=>({...item,pending:false})));setTurns(list=>list.map(turn=>turn.assetId===current.live?{...turn,status:'ready',outcome:'stopped'}:turn));setLive(null);}};
 useEffect(()=>{
  const previews=new Map<string,SkillPreview[]>();
  const preview=async(address:string)=>{const id=crypto.randomUUID();const skills:SkillPreview[]=[{name:'demo-dark-ui',description:`本地预览示例 · ${address}`,scripts:[],size:2048,replaces:false}];previews.set(id,skills);return {ok:true as const,id,skills};};
  const services:ChatServices={
   setChatWidth:value=>setWidth(Math.max(340,Math.min(900,value))),
   revealPath:async path=>{notify(`浏览器演示：${path}`);},
   copyDiagnostics:async()=>{try{await navigator.clipboard.writeText('AuricUI 组件演示\nReact 19 / Tailwind 4\n本地数据，无真实模型请求。');return {ok:true};}catch{return {ok:false};}},
   fetch:async()=>new Response(JSON.stringify({snapshot:null}),{headers:{'content-type':'application/json'}}),
   chat:{log:async(_project,turnId)=>({file:`demo/${turnId}.jsonl`,cut:false,size:1024,callsSize:512,events:[{t:Date.now()-4800,kind:'start',agent:'codex'},{t:Date.now(),kind:'done'}],calls:[{startedAt:Date.now()-4800,ms:4800,prefix:0,messages:[{role:'user',content:'请检查界面的色彩、字重与交互节奏。'}],systemPrompt:'这是组件演示数据。',tools:[],settings:{model:'demo'},answer:{role:'assistant',content:[{type:'text',text:'已整理好视觉规范。'}],usage:{input:120,output:80,totalTokens:200}}}]}),reveal:async()=>{notify('浏览器演示中的日志保存在内存，可在日志窗口复制。');}},
   skills:{preview:async address=>{try{const url=new URL(address);if(!['http:','https:'].includes(url.protocol))throw new Error();return preview(url.hostname);}catch{return {ok:false,error:'请输入有效的 HTTPS 地址。演示只生成本地预览，不下载仓库。'};}},previewFolder:async()=>preview('示例文件夹'),commit:async id=>{const found=previews.get(id);if(!found)return {ok:false,error:'预览已过期，请重新选择。'};const skills:SkillInfo[]=found.map(skill=>({...skill,source:'mine',folder:`demo/${skill.name}`}));previews.delete(id);setInstalled(list=>[...list.filter(old=>!skills.some(skill=>old.name===skill.name)),...skills]);return {ok:true,skills};},discard:async id=>{previews.delete(id);}},
  };
  configureChatServices(services);return()=>{if(timer.current)clearInterval(timer.current);configureChatServices(null);};
 },[notify]);
 const submit=()=>{
  if(!text.trim()||live)return;
  const id=`demo-chat-${crypto.randomUUID()}`;const sent=text.trim();setTurns(list=>[...list,{assetId:id,label:sent,title:sent,prompt:sent,attachments:[],status:'active',current:true,agent:'codex',model:'演示模型',createdAt:new Date().toISOString()}]);setLive(id);setText('');editor.current?.clear();
  const reply='这是本地流式交互演示。你可以查看活动记录、复制回复、展开模型日志，也可以点击停止来测试中断状态。';let count=0;
  setTranscript([{id:'reply',kind:'text',text:'',pending:true}]);
  timer.current=setInterval(()=>{count+=3;const done=count>=reply.length;const items:TranscriptItem[]=[{id:'reply',kind:'text',text:reply.slice(0,count),pending:!done}];setTranscript(items);if(done){if(timer.current)clearInterval(timer.current);timer.current=null;primeStoredTranscript(id,items);setTurns(list=>list.map(turn=>turn.assetId===id?{...turn,status:'ready',durationMs:4000,settledAt:new Date().toISOString()}:turn));setLive(null);}},120);
 };
 return <div className="chat-workbench auricui-chat"><aside className="chat-scenario-controls"><h2>完整聊天组件</h2><p>输入内容可体验本地流式回复。日志和技能安装使用示例数据，不调用模型、不下载仓库。</p><button onClick={()=>{stop();setTurns([]);}}>空会话 / 起始建议</button><button onClick={()=>{stop();setTurns(initialTurns);}}>历史对话</button><button onClick={()=>{stop();setTurns([...initialTurns,{...initialTurns[0],assetId:'pending:failed',status:'failed',outcome:'failed',prompt:'演示失败状态',error:'本地示例：服务暂时不可用'}]);}}>失败状态</button><Checkbox label="显示开发日志" checked={logs} onCheckedChange={setLogs}/><p>已安装示例技能：{installed.length}</p><div className="text-[12px]"><CopyDiagnostics/></div></aside><section data-studio-host-panel className="chat-demo-panel" style={{width}}><Divider/><ChatProjectContext.Provider value="demo-1"><DeveloperContext.Provider value={{logs,changes:true}}><div className="chat-demo-history">{turns.length?<ProjectConversation turns={turns} liveAssetId={live} liveTranscript={transcript} liveActive={!!live} liveActivity={live?'本地演示正在回复':null}/>:<ProjectStarters onPick={value=>{editor.current?.setText(value);setText(value);editor.current?.focus();}} onAttach={()=>file.current?.click()}/>}</div></DeveloperContext.Provider></ChatProjectContext.Provider><div className="chat-demo-composer"><PromptEditor ref={editor} defaultValue="" references={[]} onChange={value=>setText(value.text)} onSubmit={submit} removeLabel="删除引用" placeholder="输入内容，体验本地流式回复…" minHeight={70} maxHeight={180} contentClassName="px-4 pt-3 pb-2 text-[14px] leading-6 outline-none"/><div className="chat-demo-actions"><button onClick={()=>setAddSkill(true)}><Blocks size={15}/>添加技能</button><button onClick={()=>{stop();editor.current?.clear();setText('');}} aria-label="重置输入"><RefreshCw size={14}/></button><span/><button onClick={live?stop:submit} disabled={!live&&!text.trim()} aria-label={live?'停止回复':'发送消息'}>{live?<Square size={14}/>:<ArrowUp size={16}/>}</button></div></div><input hidden ref={file} type="file" onChange={e=>{const picked=e.target.files?.[0];if(picked){editor.current?.insertText(`[附件：${picked.name}] `);notify(`已选择 ${picked.name}，文件未上传。`);}e.target.value='';}}/>{addSkill&&<AddSkillDialog onClose={()=>setAddSkill(false)} onAdded={async()=>{notify('示例技能已加入本地演示列表。');}} onPick={skill=>{editor.current?.insertReference({id:`skill:${skill.name}`,kind:'skill',label:skill.name});}} onMake={()=>{setAddSkill(false);editor.current?.setText('帮我创建一个深色视觉 Skill');}}/>}</section></div>;
}
