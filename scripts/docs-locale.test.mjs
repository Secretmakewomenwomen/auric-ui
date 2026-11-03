import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { localizeExample } from './docs-localization.mjs';

const root = path.resolve(import.meta.dirname, '..');
const outfile = path.join(root, '.verification/docs-locale-test.mjs');
await build({ stdin: { contents: `export * as examples from './src/docs/generated-examples-en'; export { UiLocaleContext } from './src/i18n/locale'; export { translateUi } from './src/i18n/ui'; export { readDocsLocale, translateDocs } from './src/docs/locale/translate'; export { entries } from './src/registry'; export { getDoc } from './src/docs/catalog'; export { Alert, Pagination } from './src/library/index';`, resolveDir: root, loader: 'tsx' }, bundle: true, platform: 'node', format: 'esm', packages: 'external', loader: { '.css': 'empty' }, outfile });
const { examples, UiLocaleContext, translateUi, readDocsLocale, translateDocs, entries, getDoc, Alert, Pagination } = await import(pathToFileURL(outfile));
const render = (component, props = {}, locale = 'en') => renderToStaticMarkup(createElement(UiLocaleContext.Provider, { value: locale }, createElement(component, props)));

test('English is the first-visit default; only a saved Chinese preference overrides it', () => {
  assert.equal(readDocsLocale(), 'en');
  for (const preference of [null, 'en', 'invalid']) assert.equal(readDocsLocale({ getItem: () => preference }), 'en');
  assert.equal(readDocsLocale({ getItem: () => 'zh-CN' }), 'zh-CN');
  assert.equal(readDocsLocale({ getItem: () => { throw new Error('Storage blocked'); } }), 'en');
});

test('every documentation page has English names, descriptions, notes and API descriptions', () => {
  const noChinese = text => !/[\p{Script=Han}]/u.test(text);
  for (const entry of entries) {
    const doc = getDoc(entry, 'en');
    for (const text of [entry.name, entry.category, entry.description, doc.note, doc.motion, ...doc.states.flatMap(state => [state.title, state.description]), ...(doc.api?.props.map(prop => prop.description) ?? [])].filter(Boolean)) {
      assert.ok(noChinese(translateDocs(text, 'en')), `${entry.id}: ${text}`);
    }
    assert.equal(translateDocs(entry.name, 'zh-CN'), entry.name);
  }
});

test('every English demo is compiled from the same source as its Chinese counterpart', () => {
  const dictionary = JSON.parse(fs.readFileSync(path.join(root, 'src/docs/locale/examples.en.json')));
  for (const file of fs.readdirSync(path.join(root, 'src/docs/examples'))) {
    const raw = fs.readFileSync(path.join(root, 'src/docs/examples', file), 'utf8');
    assert.equal(localizeExample(raw, file, dictionary), fs.readFileSync(path.join(root, 'src/docs/generated-examples-en', file), 'utf8'));
  }
  assert.throws(() => localizeExample('<p>遗漏</p>', 'Example.tsx', {}), /missing demo translation/);
});

test('English demos render with English component defaults', () => {
  for (const [name, Example] of Object.entries(examples)) {
    const html = render(Example);
    assert.ok(!/[\p{Script=Han}]/u.test(html), `${name}: ${html.match(/.{0,40}[\p{Script=Han}].{0,90}/u)?.[0]}`);
  }
});

test('localized defaults preserve supplied labels and interpolate values safely', () => {
  assert.equal(translateUi('${0} 条通知', 'en', 12), '12 notifications');
  assert.equal(translateUi('${0} 条通知', 'zh-CN', 12), '12 条通知');
  assert.match(render(Alert, { title: 'Custom content', closable: true }), /Dismiss alert/);
  assert.match(render(Alert, { title: '用户内容', closable: true, closeLabel: '我的关闭按钮' }), /我的关闭按钮/);
  assert.match(render(Alert, { title: '标题', closable: true }, null), /关闭提示/);
  assert.match(render(Pagination, { page: 2, totalPages: 4, onPageChange: () => {} }), /aria-label="Page 2"/);
});
