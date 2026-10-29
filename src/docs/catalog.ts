import type { Entry } from '../registry';
import generated from './generated.json';
import { agentCatalog } from './agent-catalog';
import { stateExamples } from './state-catalog';
export type ApiProp = { name: string; type: string; required: boolean; inherited: boolean; defaultValue: string | null; description: string };
export type DocInfo = { symbol:string; entry:string; recipe?:boolean; note?:string; example?:string };
const core = (symbol:string,extra:Partial<DocInfo>={}):DocInfo=>({symbol,entry:'auricui',...extra});
const chat = (symbol:string,extra:Partial<DocInfo>={}):DocInfo=>({symbol,entry:'auricui/chat',...extra});
const recipe=(symbol:string):DocInfo=>({symbol,entry:'React + AuricUI CSS',recipe:true});
const docs:Record<string,DocInfo>={
  table:core('Table'),
  drawer:core('Drawer'),radio:core('RadioGroup'),tree:core('Tree'),combobox:core('Combobox'),pagination:core('Pagination'),
  button:core('CardButton'),input:core('SettingsField'),switch:core('SettingsSwitch'),select:core('SettingsSelect'),segmented:core('SettingsSegmented'),badge:core('SettingsStatus'),card:core('Card'),slider:core('SliderField'),tooltip:core('Tooltip'),
  iconbutton:recipe('IconButtonRecipe'),checkbox:core('Checkbox'),textarea:core('Textarea'),number:core('NumField'),color:core('ColorPicker'),font:core('FontFamilyPicker'),dialog:core('ConfirmDialog'),danger:core('ConfirmDialog',{example:'DangerConfirm',note:'危险操作通过 danger 属性表达。示例中请明确操作对象和后果。'}),settings:core('SettingsDialog'),popover:core('Popover'),context:core('ContextMenu'),toast:core('Toast'),notice:chat('ComposerNotice'),
  tabs:core('Tabs'),breadcrumb:core('Breadcrumb'),divider:core('PaneDivider'),accordion:core('Section'),layers:{symbol:'LayersPanel',entry:'auricui/studio'},typography:recipe('TypographyRecipe'),progress:core('Progress'),skeleton:core('Skeleton'),empty:core('EmptyState'),media:recipe('MediaRecipe'),timeline:{symbol:'Timeline',entry:'auricui/studio'},avatar:core('Avatar'),
  composer:chat('PromptEditor',{note:'defaultValue 只在挂载时读取；程序修改请使用 ref.setText / clear。实际发送和文件上传由宿主提供。'}),markdown:chat('Markdown'),attachment:chat('AttachmentCardBody'),activity:chat('AgentActivityList'),question:chat('TurnQuestionCard'),loading:recipe('LoadingRecipe'),filechanges:chat('FileChangesList'),balance:chat('BalanceNotice'),sessionbar:chat('ConversationSessionBar'),inspector:core('Section',{example:'Inspector'}),metric:core('MetricField'),model:chat('ModelPopover',{note:'必须放在 ModelOptionsProvider 内，且在浏览器挂载后渲染。'}),promptpill:chat('PromptPill'),
};
for(const [id,symbol] of agentCatalog) docs[id]={symbol,entry:'auricui/agent'};
export function getDoc(entry:Entry) {
  const info=docs[entry.id]??core(entry.english);
  const api=(generated.api as Record<string,{props:ApiProp[];source:string;description:string}>)[`${info.entry}:${info.symbol}`];
  let code=(generated.examples as Record<string,string>)[info.example??info.symbol];
  const states=(stateExamples[entry.id]??[]).map(state=>({...state,code:(generated.examples as Record<string,string>)[state.example]}));
  return {...info,api,code,states,source:api?.source??entry.source,isNew:info.entry==='auricui/agent'||['table','drawer','radio','tree','combobox','pagination','checkbox','textarea','tabs','breadcrumb','progress','skeleton','empty','avatar'].includes(entry.id)};
}
