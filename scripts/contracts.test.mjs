import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// Exercise the portable contracts without a desktop service or a browser account.
const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, '.verification/contracts.mjs');
await mkdir(path.dirname(output), { recursive: true });
const built = await build({
  stdin: { contents: [
    'export * from "./src/lib/field-input";',
    'export * from "./src/lib/inspect-scrub";',
    'export * from "./src/lib/type-metrics";',
    'export * from "./src/chat/components/prompt-editor/mention-menu";',
    'export * from "./src/chat/components/prompt-editor/prompt-text";',
    'export * from "./src/shared/markdown-blocks";',
    'export * from "./src/chat/lib/model-options";',
    'export * from "./src/chat/lib/project-sessions";',
    'export { entries } from "./src/registry";',
    'export { AdvancedDemo, advancedIds } from "./src/advanced-demos";',
    'export { Demo } from "./src/demos";',
  ].join('\n'), resolveDir: root, loader: 'tsx' },
  loader: { '.css': 'empty' },
  bundle: true, platform: 'node', format: 'esm', packages: 'external', write: false,
  tsconfig: path.join(root, 'tsconfig.json'),
});
await writeFile(output, built.outputFiles[0].text);
const ui = await import(pathToFileURL(output));

test('数值表达式、百分比和时间单位保持原始语义', () => {
  assert.deepEqual(ui.parseFieldInput('1440/2'), { set: 720 });
  assert.equal(ui.applyFieldInput(ui.parseFieldInput('+20'), 64), 84);
  assert.equal(ui.applyFieldInput(ui.parseFieldInput('-20'), 64), 44);
  assert.deepEqual(ui.parseFieldInput('50%', { percent: 1920 }), { set: 960 });
  assert.deepEqual(ui.parseFieldInput('12f', { time: true, fps: 30 }), { set: 0.4 });
  for (const input of ['1/0', '/0', 'abc', '']) assert.equal(ui.parseFieldInput(input), null);
});
test('拖动修饰键和排版单位转换', () => {
  assert.equal(ui.scrubFromDrag(10, 6, 1), 11);
  assert.equal(ui.scrubFromDrag(10, 6, 1, { shift: true }), 20);
  assert.equal(ui.scrubFromDrag(10, 6, 1, { alt: true }), 10.1);
  assert.equal(ui.metricCss('letter-spacing', ui.parseMetric('letter-spacing', '5%')), '0.05em');
  assert.equal(ui.metricCss('line-height', ui.parseMetric('line-height', 'auto')), 'normal');
  assert.equal(ui.parseMetric('line-height', '-3px'), null);
});
test('@ 与 / 菜单不会错误截获邮箱或文件路径', () => {
  assert.equal(ui.matchMentionTrigger('hello@example.com'), null);
  assert.equal(ui.matchMentionTrigger('选择@brief')?.query, 'brief');
  assert.equal(ui.matchMentionTrigger('@brief other'), null);
  assert.equal(ui.matchSlashTrigger('/review')?.query, 'review');
  assert.equal(ui.matchSlashTrigger('查看 /review'), null);
});
test('删除引用后，提交的数据不保留已经移除的引用', () => {
  const references = [{ id: 'file:a', kind: 'file', label: 'a.md' }, { id: 'file:b', kind: 'file', label: 'b.md' }];
  const text = '查看 ' + ui.promptReferenceToken('file:a');
  assert.deepEqual(ui.collectPromptReferences(text, id => references.find(reference => reference.id === id)).map(item => item.id), ['file:a']);
  assert.deepEqual(ui.collectPromptReferences('查看文件', id => references.find(reference => reference.id === id)), []);
});
test('Markdown 流式输出和链接协议', () => {
  const before = ui.rescanMarkdown(null, '# 标题\n\n已完成段落\n\n');
  const after = ui.rescanMarkdown(before, '# 标题\n\n已完成段落\n\n新的内容');
  assert.equal(after.blocks[0], before.blocks[0]);
  assert.equal(ui.safeMarkdownHref('javascript:alert(1)'), null);
  assert.equal(ui.safeMarkdownHref('data:text/html,<script>'), null);
  assert.equal(ui.safeMarkdownHref('https://example.com/docs'), 'https://example.com/docs');
});
test('模型配置按 agent 隔离，默认选项可确定', () => {
  const options = [{id:'model',name:'Model',category:'model',options:[{value:'fast',name:'Fast'},{value:'quality',name:'Quality'}]}];
  const prefs = {codex:{model:'quality'},claude:{model:'fast'}};
  assert.equal(ui.agentModelSummary(options, ui.effectivePrefs(prefs, 'codex', [], options)).model, 'Quality');
  assert.equal(ui.agentModelSummary(options, ui.effectivePrefs(prefs, 'claude', [], options)).model, 'Fast');
  assert.equal(ui.optionValue(options, {}, 'model'), 'fast');
});
test('会话历史按本地日期分组', () => {
  const now = new Date(2026,9,28,12).getTime();
  const make = (id,days) => ({id,title:id,createdAt:new Date(now-days*86400000).toISOString(),updatedAt:new Date(now-days*86400000).toISOString(),turns:1});
  const groups = ui.groupSessionsByRecency([make('a',0),make('b',1),make('c',4),make('d',20)],now);
  assert.deepEqual(groups.map(group=>[group.key,group.items[0].id]), [['today','a'],['yesterday','b'],['week','c'],['earlier','d']]);
});
test('原始模块覆盖清单的预览入口存在', async () => {
  const { readFile } = await import('node:fs/promises');
  const rows = JSON.parse(await readFile(path.join(root,'src/component-coverage.json'),'utf8'));
  const ids = new Set(ui.entries.map(entry=>entry.id));
  assert.equal(rows.length,101);
  for (const row of rows) for (const example of row.examples) assert.ok(example==='global'||['scene-editor','scene-projects','scene-settings','scene-gallery','scene-chat'].includes(example)||ids.has(example), `${row.id}: ${example}`);
  assert.equal(ids.size,ui.entries.length);
  for (const id of ui.advancedIds) assert.ok(ids.has(id),id);
});
test('可服务端渲染的组件示例可以挂载（不代替浏览器交互测试）', async () => {
  const { createElement } = await import('react');
  const { renderToString } = await import('react-dom/server');
  for (const id of ['number','slider','inspector','metric','settings','markdown','promptpill','attachment','notice','activity','question','filechanges','balance','sessionbar']) {
    const markup = renderToString(createElement(ui.AdvancedDemo,{id,notify:()=>{}}));
    assert.ok(markup.length>0,id);
  }
});
