import { CardButton } from '../../library/index';
import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { Markdown, PromptEditor, ComposerNotice, AttachmentCardBody, AgentActivityList, TurnQuestionCard, PromptPill, FileChangesList, ConversationSessionBar, ModelPopover, ModelOptionsProvider, BalanceNotice, type ModelSelection } from '../../library/chat';
export function MarkdownExample() {
  return <section className="auricui-chat"><Markdown text={'## 一个清晰的开始\n\n支持 **强调**、列表和 `代码`。\n\n- 整理需求\n- 开始行动'}/></section>;
}
export function PromptEditorExample() {
  const [draft,setDraft]=useState('');
  const [sent,setSent]=useState('');
  return <section className="auricui-chat" style={{width:'100%',padding:12,border:'1px solid var(--border)',borderRadius:12}}><PromptEditor defaultValue="" references={[]} onChange={state=>setDraft(state.text)} onSubmit={()=>setSent(draft)} removeLabel="移除引用" placeholder="告诉我你想完成什么…" minHeight={80} maxHeight={240} contentClassName=""/><CardButton disabled={!draft.trim()} onClick={()=>setSent(draft)}>发送</CardButton><p role="status">{sent&&`已提交：${sent}`}</p></section>;
}
export function ComposerNoticeExample() {
  const [visible,setVisible]=useState(true);
  return <section className="auricui-chat">{visible?<ComposerNotice title="服务暂时不可用" body="请稍后重试。" primaryLabel="重试" onPrimary={()=>setVisible(false)} onDismiss={()=>setVisible(false)}/>:<CardButton onClick={()=>setVisible(true)}>重新显示</CardButton>}</section>;
}
export function AttachmentCardBodyExample() {
  return <section className="auricui-chat" style={{padding:12,border:'1px solid var(--border)',borderRadius:8}}><AttachmentCardBody icon={<FileText size={18}/>} name="设计简报.pdf" detail="PDF · 240 KB"/></section>;
}
export function AgentActivityListExample() {
  return <section className="auricui-chat"><AgentActivityList items={[{kind:'text',label:'',text:'正在整理你提供的信息。'},{kind:'plan',label:'',plan:[{content:'整理需求',status:'completed'},{content:'生成方案',status:'in_progress'}]}]}/></section>;
}
export function TurnQuestionCardExample() {
  const [answer,setAnswer]=useState('');
  return <section className="auricui-chat">{answer?<><p role="status">{answer}</p><CardButton onClick={()=>setAnswer('')}>重新选择</CardButton></>:<TurnQuestionCard ask={{question:'你希望采用哪种输出风格？',options:[{label:'简洁',description:'先给出关键结论'},{label:'详细',description:'保留完整说明'}]}} onAnswer={setAnswer} onSkip={()=>setAnswer('已跳过')}/>}</section>;
}
export function PromptPillExample() {
  return <section className="auricui-chat"><PromptPill reference={{id:'file:brief',kind:'file',label:'brief.md'}}/></section>;
}
export function FileChangesListExample() {
  return <section className="auricui-chat"><FileChangesList changes={[{path:'src/App.tsx',change:'changed',added:12,removed:3}]}/></section>;
}
export function ConversationSessionBarExample() {
  const [id,setId]=useState('a');
  return <section className="auricui-chat"><ConversationSessionBar sessions={[{id:'a',title:'设计讨论',createdAt:'2026-10-29T01:00:00Z',updatedAt:'2026-10-29T01:00:00Z',turns:3},{id:'b',title:'计划安排',createdAt:'2026-10-28T01:00:00Z',updatedAt:'2026-10-28T01:00:00Z',turns:1}]} currentSessionId={id} onSelectSession={setId}/></section>;
}

export function BalanceNoticeExample() {
  return <section className="auricui-chat"><BalanceNotice balance={{provider:'示例服务'}}/></section>;
}
export function ModelPopoverExample() {
  const [mounted,setMounted]=useState(false);
  const [value,setValue]=useState<ModelSelection>({agent:'byok',prefs:{byok:{model:'fast'}}});
  useEffect(()=>setMounted(true),[]);
  return <section className="auricui-chat"><ModelOptionsProvider agents={[{id:'byok',name:'自定义服务',status:'ready'}]} options={{byok:[{id:'model',name:'模型',category:'model',options:[{value:'fast',name:'快速'},{value:'quality',name:'高质量'}]}]}} value={value} onChange={setValue}>{mounted?<ModelPopover/>:<span>正在加载模型菜单…</span>}</ModelOptionsProvider></section>;
}
