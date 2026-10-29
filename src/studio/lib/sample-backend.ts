/** Stateful in-memory services for the component workbench. Never contacts a media/account service. */
import { applyOps } from '@engine/studio/server/ops.mjs';
import { filmHtml, readFilmFile } from '@engine/src/film-doc.mjs';
import { FILM_SUBTITLE_DEFAULT } from '@engine/studio/server/film-subtitle.mjs';
import type { Film, Project, ProjectSettings, StudioPrefs } from '@studio/api';
import type { ProvidersState, OwnService, OwnServiceFields } from '@studio/lib/providers';
import type { StudioFetch, StudioEvents } from '@studio/lib/transport';
import type { ExportJob, ExportRequest } from '@studio/lib/export-jobs';
import type { HistoryState } from '@studio/lib/project-history';
import type { FilmCaptions } from '@studio/lib/subtitles';
import type { SkillEntry, Example } from '@studio/lib/project-sources';
import seedText from './sample-film.html?raw';


const emptySummary = () => ({ scenes:{added:0,removed:0,edited:0}, sounds:{added:0,removed:0,edited:0}, stage:false, other:false });
const names=['设计系统演示','产品发布短片','深色视觉研究'];
export function createDemoBackend(origin: string, assets?: {fetch: typeof globalThis.fetch; film: string}) {
  const fetch = assets?.fetch ?? globalThis.fetch.bind(globalThis);
  const source = assets?.film ?? seedText;
  const freshFilm = () => structuredClone(readFilmFile(source).value!) as Film;
  let revision=0;
  const projects: Project[]=names.map((name,i)=>({id:`demo-${i+1}`,name,path:`/demo/projects/${name}`,openedAt:Date.now()-i*86400000,missing:false}));
  const films=new Map(projects.map(project=>[project.id,freshFilm()]));
  const settings=new Map<string,ProjectSettings>();
  const markers=new Map<string,unknown[]>();
  const subtitles=new Map<string,{style:typeof FILM_SUBTITLE_DEFAULT}>();
  const captions=new Map<string,FilmCaptions>();
  const captionState=(id:string):FilmCaptions=>{let state=captions.get(id);if(!state){state={cues:[{startMs:0,durMs:3000,text:'让细节，保持一致。',clip:'soundtrack',src:'assets/tone.wav',line:0},{startMs:3000,durMs:3000,text:'从灵感，到作品。',clip:'soundtrack',src:'assets/tone.wav',line:3000}],sourceLanguage:'zh-CN',languages:[],untranscribed:[]};captions.set(id,state);}return state;};
  const jobs=new Map<string,ExportJob[]>();
  const histories=new Map<string,HistoryState>();
  const listeners=new Map<string,Set<(event:unknown)=>void>>();
  const timers=new Set<ReturnType<typeof setInterval>>();
  let prefs:StudioPrefs={proxies:{on:false,height:720},seenVersion:'0.2.5',projectsFolder:'/demo/projects'};
  const providers:ProvidersState={providers:[
    {id:'openai',name:'OpenAI · 示例',verbs:['image','tts'],models:{image:[{id:'demo-image',name:'Image · 演示'}],tts:[{id:'demo-voice',name:'Voice · 演示'}]},keysUrl:'https://platform.openai.com',env:'DEMO_KEY',source:'file',envKey:false,last4:'demo'},
    {id:'google',name:'Google · 示例',verbs:['video','image'],models:{video:[{id:'demo-video',name:'Video · 演示'}]},keysUrl:'https://ai.google.dev',env:'DEMO_KEY',source:null,envKey:false,last4:null},
  ],custom:[],use:{image:'openai',tts:'openai'},model:{image:'demo-image',tts:'demo-voice'}};
  let skills:SkillEntry[]=[{name:'auricui',description:'统一深色应用的颜色、组件和动画。',source:'mine',scripts:1,kind:'style',version:'1.0.0',cover:'/demo-film/assets/poster.svg',installed:true},{name:'storyboard',description:'把一段想法整理为连贯的分镜。',source:'official',scripts:2,kind:'workflow',installed:false}];
  const examples:Example[]=names.map((title,i)=>({id:`example-${i}`,title,description:'本地示例，用于体验项目卡片、预览与详情。',poster:'/demo-film/assets/poster.svg',video:null,duration:12,url:`https://example.com/demo-${i}`,category:'演示',segments:[{title:'开场',from:0,to:6},{title:'细节',from:6,to:12}]}));
  const emit=(path:string,event:unknown)=>{ for(const fn of listeners.get(path)??[])fn(event); };
  const projectEvent=(id:string,event:unknown)=>emit(`projects/${id}/events`,event);
  const subscribe:StudioEvents=(path,fn)=>{const set=listeners.get(path)??new Set();set.add(fn);listeners.set(path,set);return()=>{set.delete(fn);if(!set.size)listeners.delete(path);};};
  const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
  const poster=()=>fetch(`${origin}/demo-film/assets/poster.svg`);
  const history=(id:string)=>{
    let value=histories.get(id);
    if(!value){const commit='demo0001';value={status:{branch:'main',head:commit,branches:[{name:'main',commit,at:Date.now(),message:'初始版本',current:true,parked:false}],changes:null,files:{held:4,heldBytes:200000,ignored:0}},commits:[{commit,parents:[],at:Date.now()-3600000,message:'初始版本',body:'本地组件演示',tags:[],summary:emptySummary()}]};histories.set(id,value);}
    return value;
  };
  const locationInfo=()=>({projects:{path:'/demo/projects',default:'/demo/projects',chosen:false,free:128*1024**3,count:projects.length},exports:{path:'/demo/exports',default:'/demo/exports',chosen:false,free:128*1024**3}});
  const request:StudioFetch=async(input,init={})=>{
    const raw=input instanceof Request?input.url:String(input); const url=new URL(raw,origin);
    if(url.origin!==origin || !url.pathname.startsWith('/api/'))return fetch(input,init);
    const path=decodeURIComponent(url.pathname.slice(5)), parts=path.split('/');const method=init.method??'GET';
    let body:Record<string,unknown>={};if(typeof init.body==='string'){try{body=JSON.parse(init.body);}catch{}}
    if(path==='health'||path==='version')return json({version:'0.2.5',latest:'0.2.5',newer:false,checkedAt:Date.now(),checking:false,source:true});
    if(path==='update')return json({error:'演示环境不安装更新',code:'demo-only'},409);
    if(path==='prefs'){if(method!=='GET')prefs={...prefs,...body,proxies:{...prefs.proxies,...body.proxies as object}};return json(prefs);}
    if(path==='locations')return json(locationInfo());
    if(path.startsWith('locations/'))return json({moved:0,failed:[],locations:locationInfo(),ok:true});
    if(path==='pick-folder')return json({path:'/demo/projects'});
    if(path==='doctor')return json({ok:true,text:'AuricUI 本地组件演示\nReact 19 / Tailwind 4\n未连接真实账户或媒体服务。'});
    if(path==='diagnostics/problems')return json({problems:[]});
    if(path==='diagnostics/export'){const url=URL.createObjectURL(new Blob([String(body.report??'本地演示诊断')],{type:'text/plain'}));const link=document.createElement('a');link.href=url;link.download='auricui-diagnostics.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return json({path:'auricui-diagnostics.txt',files:['auricui-diagnostics.txt'],conversations:false});}
    if(path==='providers')return json(providers);
    if(path.startsWith('providers/')){
      const id=parts[1];
      if(id==='use'){providers.use[String(body.verb)]=body.provider as string|null;if(body.model)providers.model[String(body.verb)]=String(body.model);}
      else if(id==='custom'){
        const fields=body as unknown as OwnServiceFields;
        if(method==='DELETE')providers.custom=providers.custom.filter(service=>service.id!==parts[2]);
        else{const service:OwnService={id:parts[2]??crypto.randomUUID(),name:fields.name,url:fields.url,auth:fields.auth??'Bearer {key}',note:fields.note,last4:fields.key?.slice(-4)??null};providers.custom=[...providers.custom.filter(old=>old.id!==service.id),service];}
      }else{const provider=providers.providers.find(provider=>provider.id===id);if(provider){provider.source=method==='DELETE'?null:'file';provider.last4=method==='DELETE'?null:String(body.key??'demo').slice(-4);}}
      return json(providers);
    }
    if(path==='browse')return json({path:url.searchParams.get('path')??'/demo/projects',root:'/demo',parent:'/demo',folders:projects.map(p=>({name:p.name,path:p.path,film:true})),name:'本地演示',film:false,more:false,recent:[],places:[{id:'home',path:'/demo/projects'}]});
    if(path==='examples')return json({examples});
    if(path.startsWith('examples/'))return json({folder:'/demo-film/'});
    if(path==='skills')return json({skills});
    if(path.startsWith('skills/')){const name=parts[1];if(method==='DELETE')skills=skills.filter(s=>s.name!==name);else skills=skills.map(s=>s.name===name?{...s,...('installed' in body?{installed:Boolean(body.installed)}:{}),...('on' in body?{off:body.on?undefined:true as const}:{}),...('cover' in body?{cover:String(body.cover??'')}: {})}:s);return json({ok:true,skills,cover:null});}
    if(path==='saved/files')return json({files:[],folders:[],pages:[],folder:`${origin}/demo-film/`});
    if(path==='projects/fetch')return json({error:'演示不下载远程仓库，请打开本地示例。',code:'demo-only'},409);
    if(path==='get/asks')return json({asks:[]});
    if(path.startsWith('get/asks/'))return json({answered:true});
    if(path==='projects'){
      if(method==='POST'){const project={id:`demo-${crypto.randomUUID()}`,name:String(body.name??'新的项目'),path:String(body.path??'/demo/projects/new'),openedAt:Date.now(),missing:false};projects.unshift(project);films.set(project.id,freshFilm());emit('events',{type:'projects'});return json({project});}
      return json({projects});
    }
    if(parts[0]!=='projects')return json({error:`本地演示尚未提供接口：${path}`,code:'demo-only'},501);
    const id=parts[1],action=parts.slice(2).join('/');let project=projects.find(p=>p.id===id);
    if(!project)return json({error:'项目不存在',code:'not-found'},404);
    const film=films.get(id)??freshFilm();
    if(!action){
      if(method==='PATCH'){project.name=String(body.name??project.name);projectEvent(id,{type:'project',project});return json({project});}
      if(method==='DELETE'){projects.splice(projects.indexOf(project),1);films.delete(id);projectEvent(id,{type:'gone'});return json({ok:true});}
      return json({project,folder:`${origin}/demo-film/`,text:filmHtml(film,source),rev:String(revision),value:film,doc:film,problems:[]});
    }
    if(action==='opened'||action==='locate')return json({project});
    if(action==='edit'){
      try{const next=applyOps(structuredClone(film),body.ops as never) as Film;films.set(id,next);const rev=String(++revision);history(id).status.changes={count:1,summary:{...emptySummary(),other:true}};return json({text:filmHtml(next,seedText),rev,value:next,doc:next,rebased:false});}catch(error){return json({error:String(error)},400);}
    }
    if(action==='settings'){if(method!=='GET')settings.set(id,{...settings.get(id),...body});return json({settings:settings.get(id)??{fps:30}});}
    if(action==='cover'&&method!=='GET'){project.cover=method==='DELETE'?undefined:Date.now();return json({cover:project.cover??null});}
    if(action==='file')return fetch(`${origin}/demo-film/${url.searchParams.get('path')??'assets/poster.svg'}`);
    if(action==='markers'){if(method==='PUT')markers.set(id,(body.markers??[]) as unknown[]);return json({markers:markers.get(id)??[{id:'intro-marker',t:0,name:'开场',color:'blue'},{id:'detail-marker',t:6,name:'细节',color:'green'}]});}
    if(action==='files')return json({files:[{path:'assets/tone.wav',kind:'audio',size:192044,mtime:Date.now()},{path:'assets/poster.svg',kind:'image',size:800,mtime:Date.now()}],folders:['assets','scenes'],pages:[{path:'scenes/intro.html',size:2000,mtime:Date.now()},{path:'scenes/details.html',size:2000,mtime:Date.now()}]});
    if(action==='fonts')return json({fonts:[],page:null});
    if(/cover|poster|thumb/.test(action))return poster();
    if(action==='media'){
      const what=url.searchParams.get('what'),file=url.searchParams.get('path')??'';
      if(what==='probe')return json(file.endsWith('.wav')?{duration:12,audio:true,channels:1,sampleRate:8000}:{width:1280,height:720,duration:6,fps:30});
      if(what==='wave'||what==='waveform')return json({peaks:Array.from({length:256},(_,i)=>Math.abs(Math.sin(i*.23))*.75),duration:12});
      if(what==='loudness')return json({lufs:-18,peak:-3});
      if(file.endsWith('.wav'))return fetch(`${origin}/demo-film/assets/tone.wav`);
      return poster();
    }
    if(action.includes('preview'))return json({renders:[],jobs:[],enabled:false});
    if(action==='captions')return json(captionState(id));
    if(action==='captions/line'){const state=captionState(id);state.cues=state.cues.map(cue=>cue.src===body.src&&cue.line===body.line?{...cue,text:String(body.text)}:cue);return json({ok:true});}
    if(action==='captions/source'){const state=captionState(id);return json({src:url.searchParams.get('src'),cut:false,cues:state.cues.map(cue=>({startMs:cue.startMs,endMs:cue.startMs+cue.durMs,text:cue.text}))});}
    if(action==='subtitles/translate'||action==='subtitles/transcribe')return json({error:'本地演示没有连接语音或翻译服务。',code:action.endsWith('translate')?'no-translator':'no-transcriber'},409);
    if(action==='subtitles'){
      const value=subtitles.get(id)??{style:FILM_SUBTITLE_DEFAULT};
      if(method!=='GET')subtitles.set(id,{style:(body.style??value.style) as typeof FILM_SUBTITLE_DEFAULT});
      return json(subtitles.get(id)??value);
    }
    if(action.startsWith('history')){
      const value=history(id);
      if(action==='history/files')return json({held:[{path:'film.html',size:2000},{path:'scenes/intro.html',size:2000}],ignored:[]});
      if(action==='history/commit'){const commit=`demo${++revision}`;value.commits.unshift({commit,parents:value.status.head?[value.status.head]:[],at:Date.now(),message:String(body.message??'保存版本'),body:'',tags:[],summary:emptySummary()});value.status.head=commit;value.status.changes=null;}
      if(action==='history/discard')value.status.changes=null;
      if(action==='history/checkout'){const name=String(body.branch??'main');if(!value.status.branches.some(b=>b.name===name))value.status.branches.push({name,commit:value.status.head??'',at:Date.now(),message:'本地分支',current:false,parked:false});value.status.branch=name;value.status.branches.forEach(b=>{b.current=b.name===name;});}
      return json(value);
    }
    if(action.startsWith('exports')){
      const list=jobs.get(id)??[];jobs.set(id,list);
      if(method==='POST'&&action==='exports'){
        const added:ExportJob[]=(body.jobs as ExportRequest[]??[]).map(spec=>({id:crypto.randomUUID(),project:id,name:`${project!.name} · 状态模拟`,label:spec.label??'',kind:spec.kind,status:'running' as const,phase:'rendering' as const,progress:0,framesDone:0,framesTotal:360,rate:60,etaMs:6000,encoder:'本地状态模拟',outputs:[],bytes:null,alpha:null,at:Date.now(),startedAt:Date.now(),finishedAt:null}));
        list.unshift(...added);
        const timer=setInterval(()=>{let active=false;for(const job of added){if(job.status!=='running')continue;job.progress=Math.min(1,job.progress+.1);job.framesDone=Math.round(job.progress*360);job.etaMs=Math.round((1-job.progress)*6000);if(job.progress>=1){job.status='done';job.phase=null;job.finishedAt=Date.now();}else active=true;projectEvent(id,{type:'export',job});}if(!active){clearInterval(timer);timers.delete(timer);}},600);timers.add(timer);return json({exports:added});
      }
      if(method==='DELETE'){const job=list.find(job=>job.id===parts[3]);if(job){job.status='cancelled';job.finishedAt=Date.now();projectEvent(id,{type:'export',job});}return json({ok:true});}
      return json({exports:list,folder:'/demo/exports',can:{h264:true,hevc:true,hevcAlpha:false,vp9:true,prores:true,mp3:true},drafts:{jianying:false,capcut:false},subtitles:2,project:{work:200000,history:2000,chat:1000,logs:null}});
    }
    if(action==='reveal'||action.endsWith('/open')||action.endsWith('/reveal'))return json({error:'本地演示没有实际的磁盘输出',code:'demo-only'},409);
    return json({error:`本地演示尚未提供接口：${action}`,code:'demo-only'},501);
  };
  return {fetch:request,subscribe,projects,ask(id:string){projectEvent(id,{type:'ask',ask:{id:crypto.randomUUID(),kind:'video',provider:'本地演示',model:'示例模型',seconds:5,prompt:'查看确认与取消交互，不会产生费用。'}});},dispose(){for(const timer of timers)clearInterval(timer);timers.clear();listeners.clear();},snapshot:()=>({projects,films:Object.fromEntries(films),prefs,providers})};
}
