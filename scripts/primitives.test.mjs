import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
const root=path.resolve(import.meta.dirname,'..');
const output=path.join(root,'.verification/primitives-contracts.mjs');
fs.mkdirSync(path.dirname(output),{recursive:true});
await build({stdin:{contents:`export * from './src/library/index';export * as examples from './src/docs/examples/primitives';`,resolveDir:root,loader:'tsx'},loader:{'.css':'empty'},bundle:true,platform:'node',format:'esm',packages:'external',outfile:output,tsconfig:path.join(root,'tsconfig.json')});
const ui=await import(pathToFileURL(output));
test('14 primitive examples render without browser globals',()=>{
 assert.equal(Object.keys(ui.examples).length,14);
 for(const Example of Object.values(ui.examples))assert.ok(render(createElement(Example)).length>0,Example.name);
 assert.equal(render(createElement(ui.Drawer,{open:true,onOpenChange:()=>{},title:'Drawer',children:'content'})),'');
});
test('empty pagination disables both directions and never exposes page 1',()=>{
 const html=render(createElement(ui.Pagination,{page:NaN,totalPages:0,onPageChange:()=>{}}));
 assert.equal((html.match(/disabled=""/g)||[]).length,2);assert.ok(!html.includes('aria-current'));
});
test('indeterminate progress never pretends to have a numeric value',()=>{
 const unknown=render(createElement(ui.Progress,{label:'Processing'}));assert.ok(!unknown.includes('aria-valuenow'));
 const overflow=render(createElement(ui.Progress,{label:'Processing',value:500,max:100}));assert.ok(overflow.includes('aria-valuenow="100"'));
});
test('checkbox exposes mixed state and preserves form name/value',()=>{
 const html=render(createElement(ui.Checkbox,{label:'All',indeterminate:true,name:'selection',value:'all'}));
 assert.ok(html.includes('aria-checked="mixed"'));assert.ok(html.includes('name="selection"'));assert.ok(html.includes('value="all"'));
});
test('tree includes hierarchy and only one focusable item',()=>{
 const html=render(createElement(ui.Tree,{label:'Files',defaultExpanded:['folder'],nodes:[{id:'folder',label:'Folder',children:[{id:'file',label:'File'}]},{id:'locked',label:'Locked',disabled:true}]}));
 assert.equal((html.match(/tabindex="0"/g)||[]).length,1);assert.ok(html.includes('aria-level="2"'));assert.ok(html.includes('aria-disabled="true"'));
});

test('table sorts a copy, supports controlled unsorted order, and exposes column semantics',()=>{
 const rows=Object.freeze([{id:'b',score:2},{id:'a',score:1},{id:'c',score:2}]);
 const columns=[{key:'score',title:'Score',render:row=>row.id,compare:(a,b)=>a.score-b.score}];
 const base={label:'Results',rows,columns,rowKey:row=>row.id};
 const html=render(createElement(ui.Table,{...base,defaultSort:{key:'score',direction:'asc'}}));
 assert.ok(html.includes('aria-sort="ascending"'));
 assert.ok(html.includes('scope="col"'));
 assert.ok(html.indexOf('>a</td>')<html.indexOf('>b</td>'));
 assert.ok(html.indexOf('>b</td>')<html.indexOf('>c</td>'));
 assert.deepEqual(rows.map(row=>row.id),['b','a','c']);
 const unsorted=render(createElement(ui.Table,{...base,sort:null,defaultSort:{key:'score',direction:'asc'}}));
 assert.ok(unsorted.indexOf('>b</td>')<unsorted.indexOf('>a</td>'));
 const descending=render(createElement(ui.Table,{...base,sort:{key:'score',direction:'desc'}}));
 assert.ok(descending.indexOf('>c</td>')<descending.indexOf('>a</td>'));
});
test('table select-all counts eligible rows only; loading hides stale data and disables controls',()=>{
 const base={label:'Results',rows:[{id:'a'},{id:'b'},{id:'locked'}],rowKey:row=>row.id,columns:[{key:'id',title:'ID',render:row=>row.id,compare:(a,b)=>a.id.localeCompare(b.id)}],selection:{selectedKeys:['a','off-page'],onChange:()=>{},isDisabled:row=>row.id==='locked',getLabel:row=>`Select ${row.id}`}};
 const html=render(createElement(ui.Table,base));
 assert.ok(html.includes('aria-checked="mixed"'));
 assert.equal((html.match(/data-selected="true"/g)||[]).length,1);
 const all=render(createElement(ui.Table,{...base,selection:{...base.selection,selectedKeys:['a','b']}}));
 assert.ok(!all.includes('aria-checked="mixed"'));
 const loading=render(createElement(ui.Table,{...base,loading:true}));
 assert.ok(loading.includes('aria-busy="true"'));
 assert.ok(!loading.includes('Select locked'));
 assert.equal((loading.match(/disabled=""/g)||[]).length,2);
 assert.ok(loading.includes('colSpan="2"'));
 const empty=render(createElement(ui.Table,{...base,rows:[],emptyContent:'Nothing here'}));
 assert.ok(empty.includes('Nothing here'));
 assert.ok(!empty.includes('aria-checked="mixed"'));
});
