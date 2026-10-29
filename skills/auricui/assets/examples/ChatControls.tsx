'use client';
import { useEffect, useState, type ComponentProps } from 'react';
import { ModelOptionsProvider, ModelPopover, TurnQuestionCard, LocalAgentQuestionCard,
  AgentActivityList, FileChangesList, DeveloperContext, type ModelSelection } from 'auricui/chat';
import './examples.css';

// Replace these example model IDs with the catalogue returned by your own backend.
const options: ComponentProps<typeof ModelOptionsProvider>['options'] = {
  byok: [{id:'model', name:'模型', category:'model', options:[
    {value:'model-a',name:'示例模型 A'}, {value:'model-b',name:'示例模型 B'},
  ]}],
};
const questions: ComponentProps<typeof LocalAgentQuestionCard>['questions'] = [{
  id:'layout', header:'布局', question:'选择页面布局', multi:false, customId:'custom-layout',
  options:[{label:'双栏',description:'导航与内容分栏'},{label:'单栏',description:'聚焦主要内容'}],
}];
const changes: ComponentProps<typeof FileChangesList>['changes'] = [{
  path:'src/App.tsx', change:'changed', added:1, removed:1,
  hunks:[{oldStart:1,oldLines:1,newStart:1,newLines:1,lines:['-const title = "旧标题";','+const title = "新标题";']}],
}];

/** UI-only examples; connect answers and model selection to your application. */
export function ChatControls() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // ModelPopover reads window during render in this baseline. A client directive alone does not disable SSR.
  return mounted ? <ChatControlsClient /> : <section aria-busy="true">正在加载交互控件…</section>;
}

function ChatControlsClient() {
  const [selection, setSelection] = useState<ModelSelection>({agent:'byok',prefs:{byok:{model:'model-a'}}});
  const [answer, setAnswer] = useState('');
  const [questionOpen, setQuestionOpen] = useState(true);
  const [multiOpen, setMultiOpen] = useState(false);
  return <section className="auricui-chat auricui-example-controls">
    <ModelOptionsProvider agents={[{id:'byok',name:'自定义服务',status:'ready'}]}
      options={options} value={selection} onChange={setSelection}>
      <ModelPopover />
    </ModelOptionsProvider>
    {questionOpen && <TurnQuestionCard ask={{question:'是否继续？',options:[{label:'继续'},{label:'稍后'}]}}
      onAnswer={text => {setAnswer(text);setQuestionOpen(false);setMultiOpen(true);}} onSkip={() => {setQuestionOpen(false);setMultiOpen(true);}} />}
    {multiOpen && <LocalAgentQuestionCard questions={questions} onDone={answers => {
      setAnswer(answers ? JSON.stringify(answers) : '已跳过'); setMultiOpen(false);
    }} />}
    <p role="status">{answer}</p>
    <AgentActivityList items={[{id:'step-1',kind:'act',label:'act.read',detail:'src/App.tsx',pending:false}]} />
    <DeveloperContext.Provider value={{logs:false,changes:true}}><FileChangesList changes={changes} /></DeveloperContext.Provider>
  </section>;
}
