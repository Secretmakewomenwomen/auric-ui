import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=path.resolve(import.meta.dirname,'..');
const output=path.join(root,'.verification/scenarios.mjs');
await build({stdin:{contents:[
 'export {createStudioDemo} from "./src/library/samples";',
 'export {configureStudioTransport, studioAssetUrl} from "./src/studio/lib/transport";',
 'export {createDemoBackend} from "./src/demo/studio-backend";',
 'export {createDemoHost} from "./src/demo/studio-host";',
 'export {parseMarkers} from "./src/studio/lib/markers";',
 'export {parseFilmSubtitleStyle} from "./src/engine/studio/server/film-subtitle.mjs";',
 'export {readFilmFile} from "./src/engine/src/film-doc.mjs";',
 'export {ChatBench} from "./src/demo/ChatBench";',
 'export {demoAssetTarget} from "./demo-assets";',
].join('\n'),resolveDir:root,loader:'tsx'},bundle:true,platform:'node',format:'esm',packages:'external',outfile:output,tsconfig:path.join(root,'tsconfig.json'),plugins:[{name:'raw',setup(b){b.onResolve({filter:/\.html\?raw$/},a=>({path:path.resolve(a.resolveDir,a.path.slice(0,-4)),namespace:'raw'}));b.onLoad({filter:/.*/,namespace:'raw'},a=>({contents:fs.readFileSync(a.path,'utf8'),loader:'text'}));}}]});
const ui=await import(pathToFileURL(output));
const setup=()=>{
 const backend=ui.createDemoBackend('http://demo.local');
 const call=async(path,body,method=body?'POST':'GET')=>{const res=await backend.fetch(`/api/${path}`,{method,...(body?{body:JSON.stringify(body)}:{})});assert.ok(res.ok,`${path}: ${res.status} ${res.ok?'':await res.text()}`);return res.json();};
 return {backend,call};
};
test('本地项目编辑经过原 film 解析器与操作引擎，重新读取保留修改',async()=>{
 const {backend,call}=setup();try{
  const original=await call('projects/demo-1');assert.deepEqual(ui.readFilmFile(original.text).problems,[]);assert.equal(original.value.tracks[0].clips.length,2);
  const changed=await call('projects/demo-1/edit',{base:original.rev,ops:[{op:'set',clip:'intro',field:'at',value:2},{op:'stage',w:1080,h:1920}]});
  assert.equal(changed.value.tracks[0].clips[0].at,2);assert.equal(changed.value.stage.w,1080);assert.notEqual(changed.rev,original.rev);assert.deepEqual(ui.readFilmFile(changed.text).problems,[]);
  assert.deepEqual((await call('projects/demo-1')).value,changed.value);
  const bad=await backend.fetch('/api/projects/demo-1/edit',{method:'POST',body:JSON.stringify({ops:[{op:'remove',clip:'missing'}]})});assert.equal(bad.status,400);assert.deepEqual((await call('projects/demo-1')).value,changed.value);
 }finally{backend.dispose();}
});
test('字幕样式、文字、标记及设置写入后可重新读取',async()=>{
 const {backend,call}=setup();try{
  const markers=ui.parseMarkers((await call('projects/demo-1/markers')).markers);assert.equal(markers.length,2);markers[0].name='修改开场';await call('projects/demo-1/markers',{markers},'PUT');assert.deepEqual((await call('projects/demo-1/markers')).markers,markers);
  const captions=await call('projects/demo-1/captions');assert.equal(captions.cues.length,2);assert.ok(captions.cues.every(c=>c.durMs>0));
  await call('projects/demo-1/captions/line',{src:captions.cues[0].src,line:captions.cues[0].line,text:'已修改'},'PUT');assert.equal((await call('projects/demo-1/captions')).cues[0].text,'已修改');
  const {style}=await call('projects/demo-1/subtitles');const updated=ui.parseFilmSubtitleStyle({...style,font:{...style.font,sizePct:3.5}});assert.equal(updated.font.sizePct,3.5);assert.notEqual(updated.font.sizePct,style.font.sizePct);await call('projects/demo-1/subtitles',{style:updated},'PUT');assert.deepEqual((await call('projects/demo-1/subtitles')).style,updated);
  await call('prefs',{proxies:{on:true}},'PATCH');assert.deepEqual((await call('prefs')).proxies,{on:true,height:720});
  await call('projects/demo-1/settings',{fps:24},'PATCH');assert.equal((await call('projects/demo-1/settings')).settings.fps,24);
 }finally{backend.dispose();}
});
test('本地技能开关与服务商配置可往返；不保留完整示例密钥',async()=>{
 const {backend,call}=setup();try{
  await call('skills/storyboard/installed',{installed:true},'PUT');await call('skills/storyboard/on',{on:false},'PUT');let skill=(await call('skills')).skills.find(s=>s.name==='storyboard');assert.equal(skill.installed,true);assert.equal(skill.off,true);
  await call('skills/storyboard/on',{on:true},'PUT');skill=(await call('skills')).skills.find(s=>s.name==='storyboard');assert.equal(skill.off,undefined);
  await call('providers/google',{key:'demo-secret-1234'},'PUT');const providers=await call('providers');assert.equal(providers.providers.find(p=>p.id==='google').last4,'1234');assert.ok(!JSON.stringify(backend.snapshot()).includes('demo-secret-1234'));
 }finally{backend.dispose();}
});
test('导出状态模拟能取消，项目事件在取消订阅后停止送达',async()=>{
 const {backend,call}=setup();try{
  const events=[];const stop=backend.subscribe('projects/demo-1/events',event=>events.push(event));backend.ask('demo-1');assert.equal(events[0].type,'ask');
  const created=await call('projects/demo-1/exports',{jobs:[{kind:'video',label:'测试'}]});const job=created.exports[0];assert.equal(job.status,'running');
  await call(`projects/demo-1/exports/${job.id}`,null,'DELETE');assert.equal((await call('projects/demo-1/exports')).exports[0].status,'cancelled');assert.equal(events.at(-1).type,'export');stop();const before=events.length;backend.ask('demo-1');assert.equal(events.length,before);
 }finally{backend.dispose();}
});
test('Host 的模型、技能权限和标签状态实际改变',async()=>{
 const host=ui.createDemoHost(()=>{},()=>{});await host.agents.allowMcp('codex','demo-files',false);assert.equal((await host.agents.mcp('codex')).servers[0].allowed,false);await host.agents.allowSkill('codex','auricui',false);assert.equal((await host.agents.skills('codex')).skills[0].allowed,false);
 const saved=await host.agents.saveOwnModel({name:'示例',format:'openai',model:'demo',baseUrl:'https://example.com/v1',key:'demo1234',levels:[],effort:'default'});assert.equal(saved.ok,true);const agents=await host.agents.list();assert.equal(agents.find(a=>a.id==='byok').byok.models[0].last4,'1234');assert.ok(!JSON.stringify(agents).includes('demo1234'));
 host.tabs.open('new-project');assert.equal((await host.tabs.list()).tabs.length,3);
});
test('媒体 URL 仅映射已知演示资源，不遮盖 JSON 接口',()=>{
 assert.equal(ui.demoAssetTarget('/api/projects/demo-1/media?what=probe&path=assets/tone.wav'),null);
 assert.equal(ui.demoAssetTarget('/api/projects/demo-1/media?what=frame&path=scenes/intro.html'),'/demo-film/assets/poster.svg');
 assert.equal(ui.demoAssetTarget('/api/projects/demo-1/file?path=assets/tone.wav'),'/demo-film/assets/tone.wav');
 assert.equal(ui.demoAssetTarget('/api/projects/demo-1/settings'),null);
});
test('完整聊天场景可服务端渲染，含原对话、分栏和诊断入口',async()=>{
 const {renderToString}=await import('react-dom/server');const {createElement}=await import('react');const html=renderToString(createElement(ui.ChatBench,{notify:()=>{}}));assert.ok(html.includes('Resize the chat'));assert.ok(html.includes('请检查界面'));assert.ok(html.includes('添加技能'));
});

test('standalone Studio defaults supply data, embedded media, edits and cleanup without HTTP',async()=>{
 const previous=globalThis.window;
 globalThis.window={location:{origin:'http://consumer.local'}};
 const demo=ui.createStudioDemo();
 try {
  const response=await demo.transport.fetch('/api/projects/demo-1');
  assert.ok(response.ok);
  const project=await response.json();
  assert.equal(project.project.id,'demo-1');
  assert.ok(project.text.includes('scenes/intro.html'));
  const filmUrl=demo.transport.resolveAssetUrl(project.folder+'film.html?load=1');
  assert.ok(filmUrl.startsWith('blob:'));
  const html=await (await fetch(filmUrl)).text();
  assert.ok(html.includes('window.filmHost={source:'));
  assert.ok(!html.includes('src="__film/'));
  for(const match of html.matchAll(/src="(blob:[^"]+)"/g)){
   const media=await fetch(match[1].split('#')[0]);assert.ok(media.ok);
  }
  const media=await demo.transport.fetch('/api/projects/demo-1/file?path=assets/tone.wav');
  assert.equal(media.headers.get('content-type'),'audio/wav');
  assert.ok((await media.arrayBuffer()).byteLength>40);
  const saved=await demo.transport.fetch('/api/projects/demo-1/edit',{method:'POST',body:JSON.stringify({base:project.rev,ops:[{op:'set',clip:'intro',field:'at',value:2}]})});
  assert.ok(saved.ok);assert.equal((await saved.json()).value.tracks[0].clips[0].at,2);
  ui.configureStudioTransport(demo.transport);
  assert.equal(ui.studioAssetUrl('/api/projects/demo-1/poster'),demo.transport.resolveAssetUrl('/demo-film/assets/poster.svg'));
  ui.configureStudioTransport(null);
  assert.equal(ui.studioAssetUrl('/api/projects/live/poster'),'/api/projects/live/poster');
  demo.dispose();
  await assert.rejects(fetch(filmUrl));
 }finally{demo.dispose();globalThis.window=previous;ui.configureStudioTransport(null);}
});
