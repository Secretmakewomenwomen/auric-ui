import fs from 'node:fs';
import ts from 'typescript';

const modelSource = fs.readFileSync(new URL('../src/docs/playground/model.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(modelSource, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
export const playgroundModel = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`);
export const generated = JSON.parse(fs.readFileSync(new URL('../src/docs/generated.json', import.meta.url), 'utf8'));

const cases = [
  ['CardButton', { weight: 'danger', children: '发布作品', disabled: true }],
  ['SettingsField', { value: '项目名称', placeholder: '输入名称' }],
  ['SettingsField', { defaultValue: '初始内容' }],
  ['SettingsSwitch', { checked: false }],
  ['SettingsSelect', { value: 'quality' }],
  ['NumField', { value: 36 }],
  ['SliderField', { value: 72, min: 0, max: 100 }],
  ['Tag', { children: '待处理', checked: true, visible: true, tone: 'warning' }],
  ['Tag', { defaultChecked: true }],
  ['Badge', { count: 120, overflowCount: 99, offset: [4, -4] }],
  ['Alert', { title: '已完成', description: '任务已处理', visible: true }],
  ['Dropdown', { open: true, placement: 'top', label: '调试菜单' }],
  ['Popconfirm', { open: true, title: '确定继续？', danger: true }],
  ['ConfirmDialog', { open: true, confirmLabel: '继续' }],
  ['SettingsDialog', { open: true }],
  ['Pagination', { page: 3, totalPages: 10 }],
  ['Tree', { expanded: ['project'], value: 'scene' }],
  ['Table', { sort: { key: 'name', direction: 'asc' }, density: 'compact' }],
  ['Tabs', { value: 'preview' }],
  ['Checkbox', { checked: true }],
];

export const playgroundExamples = Object.fromEntries(cases.map(([symbol, overrides], index) => {
  const api = generated.api[`auricui:${symbol}`];
  return [`Playground_${symbol}_${index}`, playgroundModel.playgroundCode(generated.examples[symbol], symbol, generated.playgrounds[symbol], overrides, api.props)];
}));
