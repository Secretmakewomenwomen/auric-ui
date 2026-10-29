import { CardButton, MenuSelect, SliderField } from '../../library/index';
import { useState } from 'react';
import { Copy, ThumbsUp, RotateCcw, Sparkles } from 'lucide-react';
import {
  MessageBubble, MessageActions, CodeBlock, Citation, ResponseSwitcher, ContextUsage,
  Suggestion, ThinkingIndicator, ReasoningDisclosure, AgentStatus, ToolCall, TaskSteps,
  ApprovalCard, AttachmentChip, SourceList, AgentCard, RunSummary, ArtifactCard,
  PromptTemplate, ConversationList, Checkpoint, MessageList, MemoryCard, GoalCard,
  ScheduleCard, ConnectorCard, ProactiveSuggestion, ActivityTimeline, AutonomyControl, BriefingCard,
} from '../../library/agent';

export function MessageBubbleExample() {
  const [role, setRole] = useState<'assistant' | 'user' | 'system'>('assistant');
  return <div style={{display:'grid',gap:24,width:'100%'}}>
    <div style={{display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:12,color:'var(--text-muted)'}}>角色</span><div style={{width:160}}><MenuSelect label="消息角色" size="md" value={role} onPick={value=>setRole(value as typeof role)} groups={[{choices:[{value:'assistant',label:'Assistant'},{value:'user',label:'User'},{value:'system',label:'System'}]}]}/></div></div>
    <MessageBubble role={role} avatar={role==='assistant'?<Sparkles size={14}/>:undefined} meta="刚刚">
      我已整理好今天需要关注的事项。你可以从任何一项开始。
    </MessageBubble>
  </div>;
}
export function MessageActionsExample() {
  const [liked,setLiked]=useState(false);
  const [result,setResult]=useState('选择一项操作');
  return <div><MessageActions actions={[
    {id:'copy',label:'复制',icon:<Copy size={14}/>,onSelect:()=>void navigator.clipboard.writeText('这是一条示例回答').then(()=>setResult('已复制')).catch(()=>setResult('复制失败'))},
    {id:'like',label:'有帮助',icon:<ThumbsUp size={14}/>,pressed:liked,onSelect:()=>{setLiked(!liked);setResult(liked?'已取消反馈':'已标记为有帮助');}},
    {id:'retry',label:'重新生成',icon:<RotateCcw size={14}/>,onSelect:()=>setResult('宿主收到重新生成请求')},
  ]}/><p role="status" style={{fontSize:12,marginTop:12}}>{result}</p></div>;
}
export function CodeBlockExample() {
  return <CodeBlock filename="hello.ts" language="typescript" lineNumbers collapsible code={'const greeting = "Hello, AuricUI";\nconsole.log(greeting);'}/>;
}
export function CitationExample() {
  return <p style={{lineHeight:2}}>让人看见每次行动的依据。<Citation index={1} title="How We Designed Muse" source="Meta · 产品设计" href="https://introducing.muse.ai/" description="了解长期对话、目标和后台活动的设计思路。"/></p>;
}
export function ResponseSwitcherExample() {
  const [index,setIndex]=useState(0);
  const responses=['先关注最重要的三件事。','按精力和时间安排今天。','留出空间，专注于一件事。'];
  return <div style={{display:'grid',gap:20}}><p>{responses[index]}</p><ResponseSwitcher value={index} count={responses.length} onValueChange={setIndex}/></div>;
}
export function ContextUsageExample() {
  const [used,setUsed]=useState(42000);
  return <div style={{display:'grid',gap:24,width:'100%'}}><ContextUsage used={used} limit={128000}/><SliderField label="上下文用量" value={used} min={0} max={140000} step={1000} fieldWidth={76} onPreview={setUsed} onCommit={setUsed}/></div>;
}
export function SuggestionExample() {
  const [value,setValue]=useState('');
  return <div style={{display:'grid',gap:16}}><Suggestion icon={<Sparkles size={16}/>} description="把零散想法变成清晰的下一步" onClick={()=>setValue('帮我规划今天')}>帮我规划今天</Suggestion><span role="status" style={{fontSize:12}}>{value&&`已选择：${value}`}</span></div>;
}
export function ThinkingIndicatorExample() {
  const [active,setActive]=useState(true);
  return <div style={{display:'flex',gap:24,alignItems:'center'}}><ThinkingIndicator active={active} label={active?'正在整理信息':'已暂停'}/><CardButton onClick={()=>setActive(!active)}>{active?'暂停':'继续'}</CardButton></div>;
}
export function ReasoningDisclosureExample() {
  return <ReasoningDisclosure title="查看过程摘要" meta="3 个步骤"><p>已查阅提供的资料，归纳关键约束，并整理出可执行的建议。</p><p>这里显示由应用提供的过程摘要。</p></ReasoningDisclosure>;
}
export function AgentStatusExample() {
  return <div style={{display:'flex',gap:18,flexWrap:'wrap'}}>{(['idle','running','waiting','success','error','paused'] as const).map(status=><AgentStatus key={status} status={status}/>)}</div>;
}
export function ToolCallExample() {
  const [done,setDone]=useState(false);
  return <div style={{display:'grid',gap:16,width:'100%'}}><ToolCall name="search_documents" status={done?'success':'running'} defaultOpen input={'{"query": "设计规范"}'} output={done?'找到 3 份相关文档。':'正在检索…'}/><CardButton onClick={()=>setDone(!done)}>{done?'重新演示':'模拟完成'}</CardButton></div>;
}
export function TaskStepsExample() {
  const [step,setStep]=useState(1);
  return <div style={{width:'100%'}}><TaskSteps steps={['整理需求','搜索资料','生成总结'].map((title,index)=>({id:String(index),title,status:index<step?'complete':index===step?'running':'pending'}))}/><CardButton onClick={()=>setStep((step+1)%4)}>推进步骤</CardButton></div>;
}
export function ApprovalCardExample() {
  const [status,setStatus]=useState<'pending'|'approved'|'rejected'>('pending');
  return <div style={{display:'grid',gap:16,width:'100%'}}><ApprovalCard title="发送这封邮件？" description="收件人：design@example.com" status={status} onApprove={()=>setStatus('approved')} onReject={()=>setStatus('rejected')}><p>主题：本周设计评审</p></ApprovalCard>{status!=='pending'&&<CardButton onClick={()=>setStatus('pending')}>重新演示</CardButton>}</div>;
}
export function AttachmentChipExample() {
  const [removed,setRemoved]=useState(false);
  return <div>{removed?<CardButton onClick={()=>setRemoved(false)}>重新添加附件</CardButton>:<AttachmentChip name="design-brief.pdf" detail="PDF · 240 KB" onRemove={()=>setRemoved(true)}/>}</div>;
}
export function SourceListExample() {
  return <SourceList sources={[{id:'react',title:'React 文档',href:'https://react.dev',description:'组件、状态和交互的基础。'},{id:'muse',title:'How We Designed Muse',href:'https://introducing.muse.ai/',source:'Meta'}]}/>;
}
export function AgentCardExample() {
  const [selected,setSelected]=useState(false);
  return <AgentCard name="Milo" description="你的日常规划伙伴" status="idle" selected={selected} onSelect={()=>setSelected(!selected)}/>;
}
export function RunSummaryExample() {
  return <RunSummary metrics={[{label:'耗时',value:'8.4 s'},{label:'工具调用',value:'3 次'},{label:'Token',value:'2,048'},{label:'实际费用',value:'$0.012'}]}/>;
}
export function ArtifactCardExample() {
  const [opened,setOpened]=useState(false);
  return <div style={{width:'100%'}}><ArtifactCard title="一周阅读计划" kind="Markdown" version="v2" description="3 个主题 · 7 天计划" onOpen={()=>setOpened(true)}/>{opened&&<p role="status" style={{marginTop:16,fontSize:12}}>已触发 onOpen，应用可在此打开预览。</p>}</div>;
}
export function PromptTemplateExample() {
  const [values,setValues]=useState<Record<string,string>>({topic:'设计系统',tone:'简洁'});
  const [result,setResult]=useState('');
  return <div style={{width:'100%'}}><PromptTemplate template="请用{{tone}}的语言解释{{topic}}。" variables={[{name:'topic',label:'主题',required:true},{name:'tone',label:'风格'}]} values={values} onValuesChange={setValues} onSubmit={setResult}/><p role="status" style={{fontSize:12,marginTop:16}}>{result&&`已提交：${result}`}</p></div>;
}
export function ConversationListExample() {
  const [value,setValue]=useState('a');
  const [query,setQuery]=useState('');
  const [items,setItems]=useState([{id:'a',title:'今天的安排',preview:'把重要的事情放在前面',meta:'09:10',unread:false},{id:'b',title:'周末出行',preview:'有两条路线供你选择',meta:'昨天',unread:true}]);
  return <ConversationList value={value} onValueChange={id=>{setValue(id);setItems(items.map(item=>item.id===id?{...item,unread:false}:item));}} query={query} onQueryChange={setQuery} items={items.filter(item=>item.title.includes(query))} onCreate={()=>{const id=String(Date.now());setItems([{id,title:'新的会话',preview:'开始一个新话题',meta:'刚刚',unread:false},...items]);setValue(id);}}/>;
}
export function CheckpointExample() {
  const [restored,setRestored]=useState(false);
  return <Checkpoint title={restored?'已恢复到版本 2':'版本 2 · 修改之前'} description="2 个文件 · 今天 10:24" restoreLabel={restored?'已恢复':'恢复到此处'} disabled={restored} onRestore={()=>setRestored(true)}/>;
}
export function MessageListExample() {
  const [count,setCount]=useState(8);
  return <div style={{width:'100%'}}><MessageList>{Array.from({length:count},(_,i)=><MessageBubble key={i} role={i%2?'assistant':'user'}>第 {i+1} 条消息。向上滚动查看历史时，新增消息会保留你的阅读位置。</MessageBubble>)}</MessageList><CardButton onClick={()=>setCount(count+1)}>追加消息</CardButton></div>;
}
export function MemoryCardExample() {
  const [content,setContent]=useState('我偏好简洁的回答，重要事项使用列表。');
  const [forgotten,setForgotten]=useState(false);
  return forgotten?<CardButton onClick={()=>setForgotten(false)}>重新演示记忆</CardButton>:<MemoryCard content={content} source="你的明确偏好" updatedAt="今天 09:00" onEdit={()=>setContent('我喜欢先看到结论，再阅读详细说明。')} onForget={()=>setForgotten(true)}/>;
}
export function GoalCardExample() {
  const [completed,setCompleted]=useState(2);
  return <div style={{display:'grid',gap:16,width:'100%'}}><GoalCard title="建立阅读习惯" description="每天留出 20 分钟，读一点喜欢的内容。" status={completed===5?'success':'running'} completed={completed} total={5} nextStep={completed===5?'目标已完成':'完成今天的阅读记录'}/><CardButton onClick={()=>setCompleted((completed+1)%6)}>更新进度</CardButton></div>;
}
export function ScheduleCardExample() {
  const [enabled,setEnabled]=useState(true);
  return <ScheduleCard title="每日简报" schedule="每个工作日 09:00" timezone="Asia/Shanghai" nextRun="明天 09:00" enabled={enabled} onEnabledChange={setEnabled}/>;
}
export function ConnectorCardExample() {
  const [connected,setConnected]=useState(true);
  return <ConnectorCard name="日历" account={connected?'demo@example.com':undefined} status={connected?'connected':'disconnected'} scopes={connected?['读取日程','查看空闲时间']:[]} onConnect={()=>setConnected(true)} onDisconnect={()=>setConnected(false)}/>;
}
export function ProactiveSuggestionExample() {
  const [state,setState]=useState('pending');
  return state==='pending'?<ProactiveSuggestion title="为明天留一点准备时间" description="明天有两场连续会议，可以提前整理待讨论事项。" reason="你添加了明天的会议安排" actionLabel="整理会议准备" onAccept={()=>setState('accepted')} onDismiss={()=>setState('dismissed')}/>:<div><p role="status">{state==='accepted'?'应用收到建议采纳事件':'已忽略这条建议'}</p><CardButton onClick={()=>setState('pending')}>重新演示</CardButton></div>;
}
export function ActivityTimelineExample() {
  return <ActivityTimeline events={[{id:'1',title:'整理今日安排',description:'归纳出 3 项需要关注的事项',time:'09:00',status:'done'},{id:'2',title:'等待确认邮件草稿',time:'09:12',status:'running'},{id:'3',title:'日历同步失败',description:'请重新连接日历账户',time:'09:15',status:'error'}]}/>;
}
export function AutonomyControlExample() {
  const [value,setValue]=useState('ask');
  return <AutonomyControl value={value} onValueChange={setValue} options={[{value:'ask',label:'执行前询问',description:'每次操作先展示计划，等待确认。'},{value:'routine',label:'处理日常事务',description:'已授权的日常操作直接执行，其他操作先确认。'},{value:'read',label:'只提供建议',description:'读取已授权的信息，提供建议，不执行修改。'}]}/>;
}
export function BriefingCardExample() {
  const [selected,setSelected]=useState('');
  return <div style={{width:'100%'}}><BriefingCard title="早上好" subtitle="今天有一些值得关注的小事。" items={[{id:'1',title:'产品设计评审',detail:'准备好你的三个关键问题',meta:'10:30',onSelect:()=>setSelected('产品设计评审')},{id:'2',title:'阅读计划',detail:'本周已经完成 2 天',meta:'20 分钟'}]} footer="根据你提供的日程与目标整理"/>{selected&&<p role="status" style={{fontSize:12,marginTop:12}}>已选择：{selected}</p>}</div>;
}
