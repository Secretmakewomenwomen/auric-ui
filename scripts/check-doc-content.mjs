import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
// Check every generated export, including records that do not have their own docs page.
const generated = JSON.parse(fs.readFileSync(path.join(root, 'src/docs/generated.json'), 'utf8'));
for (const [name, record] of Object.entries(generated.api)) {
  for (const prop of record.props) {
    assert.ok(!/import\(["'](?:\/|[a-z]:[\\/])|\/Users\/|\/home\/|node_modules\//i.test(prop.type), `${name}.${prop.name}: machine-local path in generated type`);
  }
}
const output = path.join(root, '.verification/docs-content.mjs');
fs.mkdirSync(path.dirname(output), { recursive: true });
await build({
  stdin: { contents: `export { entries } from './src/registry'; export { getDoc } from './src/docs/catalog'; export * as states from './src/docs/examples/states';`, resolveDir: root, loader: 'tsx' },
  bundle: true, platform: 'node', format: 'esm', packages: 'external', loader: { '.css': 'empty' },
  outfile: output, tsconfig: path.join(root, 'tsconfig.json'),
});
const { entries, getDoc, states } = await import(pathToFileURL(output));
// The preview must render the same exported function used to generate copyable code.
// Missing examples must fail publication, never fall back to a lookalike renderer.
const previewSource = fs.readFileSync(path.join(root, 'src/docs/Preview.tsx'), 'utf8');
assert.ok(!/\bDemo\b|advanced-demos|from ['"]\.\.\/demos/.test(previewSource), 'Preview must not fall back to legacy mock demos');
const workbenchSource = fs.readFileSync(path.join(root, 'src/Workbench.tsx'), 'utf8');
assert.ok(workbenchSource.includes('<Preview') && !/<Demo\b|\bsnippet\(/.test(workbenchSource), 'Workbench must share documentation previews and code');
const previewAst = ts.createSourceFile('Preview.tsx', previewSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const liveExamples = new Map();
for (const declaration of previewAst.statements.filter(ts.isImportDeclaration)) {
  const specifier = declaration.moduleSpecifier.text;
  if (!specifier.startsWith('./examples/')) continue;
  const file = path.join(root, 'src/docs', `${specifier}.tsx`);
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const fn of source.statements.filter(ts.isFunctionDeclaration)) {
    if (fn.name?.text.endsWith('Example') && fn.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      assert.ok(!liveExamples.has(fn.name.text), `Duplicate example: ${fn.name.text}`);
      liveExamples.set(fn.name.text, { fn, source });
    }
  }
}
let props = 0, stateCount = 0;
for (const entry of entries) {
  const doc = getDoc(entry);
  const exampleName = `${doc.example ?? doc.symbol}Example`;
  const live = liveExamples.get(exampleName);
  assert.ok(live, `${entry.id}: missing live example ${exampleName}`);
  assert.ok(doc.code?.includes(live.fn.getText(live.source).replace(`export function ${exampleName}`, 'export default function Example')), `${entry.id}: displayed code differs from live example; regenerate docs`);
  if (!doc.recipe) {
    let rendersComponent = false;
    const visit = node => {
      if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(live.source) === doc.symbol) rendersComponent = true;
      ts.forEachChild(node, visit);
    };
    visit(live.fn);
    assert.ok(rendersComponent, `${entry.id}: example does not render documented ${doc.symbol}`);
    const librarySource = { auricui: '../../library/index', 'auricui/chat': '../../library/chat', 'auricui/studio': '../../library/studio', 'auricui/agent': '../../library/agent' }[doc.entry];
    assert.ok(live.source.statements.some(node => ts.isImportDeclaration(node) && node.moduleSpecifier.text === librarySource && node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings) && node.importClause.namedBindings.elements.some(element => element.name.text === doc.symbol)), `${entry.id}: component must come from its public library entry`);
  }
  if (!doc.recipe) {
    assert.ok(doc.api?.props.length, `${entry.id}: missing API properties`);
    for (const prop of doc.api.props) {
      assert.ok(prop.description.trim(), `${entry.id}.${prop.name}: missing description`);
      assert.ok(!/\/Users\/|\/home\/|node_modules\//.test(prop.type), `${entry.id}.${prop.name}: machine-local path in type`);
      props++;
    }
  }
  for (const state of doc.states) {
    assert.ok(state.code?.includes('export default function Example'), `${state.example}: missing copyable code`);
    const stateName = `${state.example}Example`;
    const stateLive = liveExamples.get(stateName);
    assert.ok(stateLive && state.code.includes(stateLive.fn.getText(stateLive.source).replace(`export function ${stateName}`, 'export default function Example')), `${state.example}: state preview differs from displayed code`);
    const Example = states[`${state.example}Example`];
    assert.equal(typeof Example, 'function', `${state.example}: missing live example`);
    assert.ok(renderToStaticMarkup(createElement(Example)).length > 0);
    stateCount++;
  }
}
const field = getDoc(entries.find(entry => entry.id === 'input'));
for (const name of ['value', 'onChange', 'disabled', 'readOnly', 'aria-invalid', 'ref']) {
  assert.ok(field.api.props.some(prop => prop.name === name), `SettingsField missing inherited ${name}`);
}
const button = getDoc(entries.find(entry => entry.id === 'button'));
const weight = button.api.props.find(prop => prop.name === 'weight');
assert.ok(weight.type.includes('"primary"') && weight.type.includes('"danger"'), 'CardButton weight must list its values');
assert.equal(weight.defaultValue, "'secondary'");
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'packages/auricui/package.json'), 'utf8'));
for (const name of ['auricui', 'auricui-skill']) {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'packages', name, 'package.json'), 'utf8'));
  const filename = `${name}-${pkg.version}.tgz`;
  const download = path.join(root, 'public/downloads', filename);
  assert.deepEqual(fs.readFileSync(download), fs.readFileSync(path.join(root, 'artifacts', filename)), `${name}: download differs from checked artifact`);
  const packed = JSON.parse(execFileSync('tar', ['-xOf', download, 'package/package.json'], { encoding: 'utf8' }));
  assert.equal(packed.version, pkg.version);
  if (name === 'auricui-skill') {
    const baseline = JSON.parse(execFileSync('tar', ['-xOf', download, 'package/skill/references/library-manifest.json'], { encoding: 'utf8' }));
    assert.equal(baseline.version, manifest.version, 'Skill download must reference the documented library version');
  }
}
console.log(`${entries.length} pages: ${props} documented API rows, ${stateCount} renderable state examples, matching library and Skill downloads.`);
