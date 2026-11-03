import type { UiLocale } from '../i18n/locale';
import type { Entry } from '../registry';
import generated from './generated.json';
import { agentCatalog } from './agent-catalog';
import { stateExamples } from './state-catalog';
import type { PropControl, PlaygroundMetadata } from './playground/model';
export type ApiProp = { name: string; type: string; required: boolean; inherited: boolean; defaultValue: string | null; description: string; control?: PropControl };
export type DocInfo = { symbol:string; entry:string; recipe?:boolean; note?:string; example?:string; motion?:string };
const core = (symbol:string,extra:Partial<DocInfo>={}):DocInfo=>({symbol,entry:'auricui',...extra});
const chat = (symbol:string,extra:Partial<DocInfo>={}):DocInfo=>({symbol,entry:'auricui/chat',...extra});
const recipe=(symbol:string):DocInfo=>({symbol,entry:'React + AuricUI CSS',recipe:true});
const docs:Record<string,DocInfo>={
  tag:core('Tag',{motion:'选择与关闭采用 160ms 过渡；关闭后保留退场，再移除内容。系统减少动态效果设置优先。',note:'checked 和 visible 均可受控。onClose 可通过 preventDefault 阻止关闭；需要从数组删除时，放在 onAfterClose 中以保留退场动画。className / style 与主题变量可扩展外观。'}),
  badge:core('Badge',{motion:'计数变化、状态点显示与隐藏采用 160ms 过渡；系统减少动态效果设置优先。',note:'有 children 时附着在右上角，否则独立显示。count 为 0 时默认隐藏；overflowCount 仅影响视觉显示，辅助技术仍读取实际数量。'}),
  alert:core('Alert',{motion:'显示与关闭采用 160ms 透明度、轻微位移和高度过渡；系统减少动态效果设置优先。',note:'支持自定义 icon、description、children 与 action。visible 可受控，onAfterClose 在退场完成后触发。danger 默认使用 alert 语义，其余使用 status。'}),
  popconfirm:core('Popconfirm',{motion:'展开与收起采用 OpenFilm 的 160ms 淡入淡出、6px 位移与轻微缩放；系统减少动态效果设置优先。',note:'onConfirm 返回 Promise 时自动加载，成功关闭，失败展示 errorText 并允许重试。关闭浮层不会取消业务请求，旧请求的结果不会影响重新打开的浮层。默认先聚焦取消按钮；支持 Escape、Tab、外部点击与焦点恢复。'}),
  dropdown:core('Dropdown',{motion:'菜单以 160ms 淡入、轻微位移和缩放展开；系统开启减少动态效果时关闭过渡。',note:'展开使用 160ms 淡入、6px 位移与 0.98 → 1 缩放。支持方向键、Home / End、键入查找与 Escape；Tab 关闭后继续页面导航。系统减少动态效果设置优先。'}),
  table:core('Table'),
  drawer:core('Drawer'),radio:core('RadioGroup'),tree:core('Tree'),combobox:core('Combobox'),pagination:core('Pagination'),
  button:core('CardButton'),input:core('SettingsField'),switch:core('SettingsSwitch'),select:core('SettingsSelect'),segmented:core('SettingsSegmented'),status:core('SettingsStatus'),card:core('Card'),slider:core('SliderField'),tooltip:core('Tooltip'),
  iconbutton:recipe('IconButtonRecipe'),checkbox:core('Checkbox'),textarea:core('Textarea'),number:core('NumField'),color:core('ColorPicker'),font:core('FontFamilyPicker'),dialog:core('ConfirmDialog'),danger:core('ConfirmDialog',{example:'DangerConfirm',note:'危险操作通过 danger 属性表达。示例中请明确操作对象和后果。'}),settings:core('SettingsDialog'),popover:core('Popover'),context:core('ContextMenu'),toast:core('Toast'),notice:chat('ComposerNotice'),
  tabs:core('Tabs'),breadcrumb:core('Breadcrumb'),divider:core('PaneDivider'),accordion:core('Section'),layers:{symbol:'LayersPanel',entry:'auricui/studio'},typography:recipe('TypographyRecipe'),progress:core('Progress'),skeleton:core('Skeleton'),empty:core('EmptyState'),media:recipe('MediaRecipe'),timeline:{symbol:'Timeline',entry:'auricui/studio'},avatar:core('Avatar'),
  composer:chat('PromptEditor',{note:'defaultValue 只在挂载时读取；程序修改请使用 ref.setText / clear。实际发送和文件上传由宿主提供。'}),markdown:chat('Markdown'),attachment:chat('AttachmentCardBody'),activity:chat('AgentActivityList'),question:chat('TurnQuestionCard'),loading:recipe('LoadingRecipe'),filechanges:chat('FileChangesList'),balance:chat('BalanceNotice'),sessionbar:chat('ConversationSessionBar'),inspector:core('Section',{example:'Inspector'}),metric:core('MetricField'),model:chat('ModelPopover',{note:'必须放在 ModelOptionsProvider 内，且在浏览器挂载后渲染。'}),promptpill:chat('PromptPill'),
};
for(const [id,symbol] of agentCatalog) docs[id]={symbol,entry:'auricui/agent'};
export function getDoc(entry:Entry,locale:UiLocale='zh-CN') {
  const info=docs[entry.id]??core(entry.english);
  const api=(generated.api as Record<string,{props:ApiProp[];source:string;description:string}>)[`${info.entry}:${info.symbol}`];
  const localized=locale==='en'?generated.locales.en:generated;
  let code=(localized.examples as Record<string,string>)[info.example??info.symbol];
  const states=(stateExamples[entry.id]??[]).map(state=>({...state,code:(localized.examples as Record<string,string>)[state.example]}));
  const playground=(localized.playgrounds as Record<string,PlaygroundMetadata>)[info.example??info.symbol];
  return {...info,api,code,states,playground,source:api?.source??entry.source,isNew:info.entry==='auricui/agent'||['tag','badge','alert','popconfirm','dropdown','table','drawer','radio','tree','combobox','pagination','checkbox','textarea','tabs','breadcrumb','progress','skeleton','empty','avatar'].includes(entry.id)};
}
