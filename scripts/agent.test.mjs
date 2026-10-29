import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const root=path.resolve(import.meta.dirname,'..');
const output=path.join(root,'.verification/agent-contracts.mjs');
fs.mkdirSync(path.dirname(output),{recursive:true});
await build({stdin:{contents:`export * from './src/library/agent'; export {usageMetrics,safeCitationHref} from './src/agent/shared'; export * as examples from './src/docs/examples/agent';`,resolveDir:root,loader:'tsx'},bundle:true,platform:'node',format:'esm',packages:'external',outfile:output,tsconfig:path.join(root,'tsconfig.json')});
const agent=await import(pathToFileURL(output));
test('30 Agent demos render on the server without browser globals',()=>{
 const examples=Object.values(agent.examples);assert.equal(examples.length,30);
 for(const Example of examples)assert.ok(renderToStaticMarkup(createElement(Example)).length>0,Example.name);
});
test('code is escaped as text and copy payload is not HTML',()=>{
 const html=renderToStaticMarkup(createElement(agent.CodeBlock,{code:'<script>alert(1)</script>',lineNumbers:true}));
 assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('aria-hidden="true"'));
});
test('citation disables script and data URLs while preserving valid HTTPS links',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,x','file:///secret','//example.com'])assert.equal(agent.safeCitationHref(url),undefined);
 assert.equal(agent.safeCitationHref('https://example.com/source'),'https://example.com/source');
 const html=renderToStaticMarkup(createElement(agent.Citation,{index:1,title:'资料',href:'javascript:alert(1)'}));
 assert.ok(!html.includes('href='));assert.ok(html.includes('aria-expanded="false"'));
});
test('unknown capacity stays unknown; overflow clamps the meter but preserves over-limit status',()=>{
 assert.deepEqual(agent.usageMetrics(0,0),{valid:false,percent:0,over:false});
 assert.deepEqual(agent.usageMetrics(150,100),{valid:true,percent:100,over:true});
 assert.equal(agent.usageMetrics(-10,100).valid,false);assert.equal(agent.usageMetrics(Infinity,100).valid,false);
 const html=renderToStaticMarkup(createElement(agent.ContextUsage,{used:150,limit:100}));
 assert.ok(html.includes('data-tone="danger"'));assert.ok(html.includes('aria-valuenow="100"'));assert.ok(html.includes('150 / 100'));
});
test('empty response selector never enables nonexistent navigation',()=>{
 const html=renderToStaticMarkup(createElement(agent.ResponseSwitcher,{value:NaN,count:0,onValueChange:()=>{}}));
 assert.equal((html.match(/disabled=""/g)||[]).length,2);
});
test('pending or completed approvals cannot be submitted again',()=>{
 const props={title:'确认操作',onApprove:()=>{},onReject:()=>{}};
 const pending=renderToStaticMarkup(createElement(agent.ApprovalCard,{...props,status:'submitting'}));
 assert.equal((pending.match(/disabled=""/g)||[]).length,2);
 const complete=renderToStaticMarkup(createElement(agent.ApprovalCard,{...props,status:'approved'}));assert.ok(!complete.includes('<button'));
});
test('template substitution treats input as data and preserves missing variables',()=>{
 assert.equal(agent.resolvePromptTemplate('Hello {{ name }} / {{missing}}',{name:'$& <script>'}),'Hello $& <script> / {{missing}}');
});
test('documentation examples use public imports, never an internal Demo placeholder',()=>{
 const docs=JSON.parse(fs.readFileSync(path.join(root,'src/docs/generated.json')));
 assert.ok(Object.keys(docs.examples).length>=74);
 for(const [name,code] of Object.entries(docs.examples)){assert.ok(!code.includes("from '../../"),name);assert.ok(!code.includes('<Demo'),name);assert.ok(code.includes("import 'auricui/styles.css'"),name);}
});
