import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { build } from 'esbuild';
const project = path.resolve(import.meta.dirname, '..');
const upstream = path.resolve(process.argv[2] ?? path.join(project, './skills/auricui/assets/upstream'));
const roots = { studio: 'packages/openfilm/studio/ui/src/components', chat: 'apps/desktop/chat/src/components' };
const examples = {
  'studio/Card.tsx':['button','card'], 'studio/ColorPicker.tsx':['color'], 'studio/ConfirmDialog.tsx':['danger'], 'studio/ContextMenu.tsx':['context'],
  'studio/FocusNav.tsx':['global'], 'studio/MenuSelect.tsx':['select','inspector'], 'studio/PaneDivider.tsx':['divider'], 'studio/Popover.tsx':['popover'], 'studio/Toast.tsx':['toast'], 'studio/Tooltip.tsx':['tooltip'],
  'studio/settings/ui.tsx':['input','switch','segmented','settings'], 'studio/settings/SettingsSelect.tsx':['select','settings'],
  'studio/inspector-fields.tsx':['number','slider','metric','inspector'], 'studio/FontFamilyPicker.tsx':['font'], 'studio/settings/SettingsModal.tsx':['settings'],
  'chat/ComposerCard.tsx':['notice','question'], 'chat/Popover.tsx':['model'], 'chat/Tooltip.tsx':['attachment','promptpill'], 'chat/NoticeCard.tsx':['notice'],
  'chat/AttachmentCard.tsx':['attachment'], 'chat/AttachmentPreview.tsx':['attachment'], 'chat/PreviewFrame.tsx':['attachment'], 'chat/Markdown.tsx':['markdown','activity'],
  'chat/ModelPopover.tsx':['model'], 'chat/AgentIcons.tsx':['model'], 'chat/prompt-editor/PromptEditor.tsx':['composer'], 'chat/prompt-editor/MentionMenuPlugin.tsx':['composer'], 'chat/prompt-editor/PromptPill.tsx':['promptpill','composer'], 'chat/prompt-editor/PromptReferenceNode.tsx':['composer'],
  'chat/AgentActivityRow.tsx':['activity'], 'chat/TurnQuestionCard.tsx':['question'], 'chat/BalanceNotice.tsx':['balance'], 'chat/ConversationSessionBar.tsx':['sessionbar'], 'chat/FileChangesList.tsx':['filechanges'],
};
const notes = {
  'studio/BrandLogo.tsx':'保留尺寸与布局，替换为目标产品 AuricUI 标识。',
  'chat/BrandLogo.tsx':'保留尺寸与布局，替换为目标产品 AuricUI 标识。',
  'chat/AddSkill.tsx':'保留完整预览、安装和取消界面；通过 ChatServices 接入技能服务。',
  'chat/CopyDiagnostics.tsx':'通过 ChatServices 注入诊断复制。',
  'chat/Divider.tsx':'通过 ChatServices 注入列宽更新。',
  'chat/ProjectConversation.tsx':'原对话渲染、缓存与流式更新；进度读取和桌面操作通过可注入服务提供。',
  'chat/TurnLog.tsx':'原日志查看器；日志数据和文件定位通过 ChatServices 提供。',
  'chat/prompt-editor/PromptPill.tsx':'保留原引用交互；补充服务端渲染所需的 hover store 快照。',
  'studio/settings/SettingsModal.tsx':'完整设置页已接入；Agent、服务商、模型、快捷键和存储使用本地服务。',
  'studio/FontFamilyPicker.tsx':'原选择器；字体来源适配为浏览器本地可用字体检测。',
  'chat/ModelPopover.tsx':'原菜单交互和样式；用 ModelOptionsProvider 替换桌面状态与服务。',
  'chat/Markdown.tsx':'原解析与渲染；Studio 引用通过本地 context 和回调适配。',
};
const graph=await build({entryPoints:[path.join(project,'src/main.tsx')],bundle:true,write:false,metafile:true,outdir:path.join(project,'.verification/audit'),packages:'external',loader:{'.css':'empty','.woff2':'file'},logLevel:'silent',plugins:[{name:'raw-html',setup(b){b.onResolve({filter:/\.html\?raw$/},args=>({path:path.resolve(args.resolveDir,args.path.slice(0,-4)),namespace:'raw'}));b.onLoad({filter:/.*/,namespace:'raw'},args=>({contents:fs.readFileSync(args.path,'utf8'),loader:'text'}));}}]});
const connected=new Set(Object.keys(graph.metafile.inputs).map(file=>path.resolve(file)));
const projects=new Set(['Launcher','ProjectsLibrary','ProjectsView','ProjectSources','ProjectCover']);
function scene(area,relative){return area==='chat'?'scene-chat':relative.startsWith('settings/')?'scene-settings':projects.has(relative.replace(/\.tsx$/,''))?'scene-projects':/^(ExamplesGallery|SkillsLibrary)/.test(relative)?'scene-gallery':'scene-editor';}
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(file => file.isDirectory() ? walk(path.join(dir,file.name)) : [path.join(dir,file.name)]); }
const rows = [];
for (const [area,root] of Object.entries(roots)) for (const file of walk(path.join(upstream,root)).filter(f => f.endsWith('.tsx'))) {
  const code=fs.readFileSync(file,'utf8'); const ast=ts.createSourceFile(file,code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const exported=ast.statements.some(node => node.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword) && (
    ts.isFunctionDeclaration(node) && /^[A-Z]/.test(node.name?.text ?? '') ||
    ts.isVariableStatement(node) && node.declarationList.declarations.some(d=> /^[A-Z]/.test(d.name.getText(ast)))
  ));
  if(!exported)continue;
  const relative=path.relative(path.join(upstream,root),file), id=`${area}/${relative}`;
  const local=area==='studio' ? `src/components/${relative}` : `src/chat/components/${relative}`;
  const mapped=area==='studio' && (id==='studio/settings/SettingsModal.tsx'||!fs.existsSync(path.join(project,local)))?`src/studio/components/${relative}`:local;
  const present=fs.existsSync(path.join(project,mapped))&&connected.has(path.join(project,mapped));
  const links=id==='studio/settings/SettingsModal.tsx'?['settings','scene-settings']:examples[id]??[scene(area,relative)];
  rows.push({id,area,name:relative.replace(/\.tsx$/,''),source:`${root}/${relative}`,local:present?mapped:null,status:!present?'pending':notes[id]?'adapted':'ported',examples:present?links:[],note:notes[id]??''});
}
rows.sort((a,b)=>a.id.localeCompare(b.id));
fs.writeFileSync(path.join(project,'src/component-coverage.json'),JSON.stringify(rows,null,2)+'\n');
const stats=Object.fromEntries(['ported','adapted','partial','pending'].map(s=>[s,rows.filter(r=>r.status===s).length]));
const labels={ported:'已移植',adapted:'已适配',partial:'部分完成',pending:'待接入'};
fs.writeFileSync(path.join(project,'COMPONENT-COVERAGE.md'),`# 原始模块覆盖清单\n\n共 ${rows.length} 个导出模块（含业务页面、上下文和复合控件，不等同于通用组件数量）。\n\n${Object.entries(stats).map(([key,n])=>`${labels[key]} ${n}`).join(' · ')}\n\n“已移植”表示源码及展示入口已接入，不代表已经完成像素对比验证。来源模块对应原有 47 个案例和 5 个完整场景；新增 Agent 与基础组件另见 README。业务服务使用明确标识的本地演示适配器。\n\n| 模块 | 状态 | 示例入口 | 说明 |\n| --- | --- | --- | --- |\n`+rows.map(r=>`| ${r.id} | ${labels[r.status]} | ${r.examples.join(', ')||'—'} | ${r.note||'—'} |`).join('\n')+'\n');
console.log(JSON.stringify({total:rows.length,...stats}));
