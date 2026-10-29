import assets from './sample-assets.json';
import seed from './sample-film.html?raw';
import { createDemoBackend } from './sample-backend';
import { createDemoHost } from './sample-host';

/** Browser-only, self-contained in-memory Studio demonstration. Call dispose on unmount. */
export function createStudioDemo(onOpen:(id:string)=>void=()=>{},onMessage:(text:string)=>void=()=>{}) {
  const origin=window.location.origin;
  const urls=new Map<string,string>();
  const contents=assets as Record<string,string>;
  const decoder=new TextDecoder();
  const bytes=(name:string)=>Uint8Array.from(atob(contents[name]),c=>c.charCodeAt(0));
  const text=(name:string)=>decoder.decode(bytes(name));
  const mime=(name:string)=>name.endsWith('.html')?'text/html':/\.(m?js)$/.test(name)?'text/javascript':name.endsWith('.svg')?'image/svg+xml':'audio/wav';
  const make=(name:string,content:BlobPart)=>{const url=URL.createObjectURL(new Blob([content],{type:mime(name)}));urls.set(name,url);return url;};
  for(const name of Object.keys(contents).filter(name=>name.startsWith('assets/')))make(name,bytes(name));
  for(const name of ['__film/film-doc.mjs','__film/overrides.mjs','__film/bridge.js','__film/stage.js'])make(name,text(name));
  make('__film/timeline.mjs',text('__film/timeline.mjs').replaceAll("'./film-doc.mjs'",JSON.stringify(urls.get('__film/film-doc.mjs'))).replaceAll("'./overrides.mjs'",JSON.stringify(urls.get('__film/overrides.mjs'))));
  for(const name of Object.keys(contents).filter(name=>name.startsWith('scenes/')))make(name,text(name).replaceAll('../__film/bridge.js',urls.get('__film/bridge.js')!));
  const replace=(html:string)=>{for(const [name,url] of urls)html=html.replaceAll(name,url);return html;};
  const boot = `<script>window.filmHost={source:${JSON.stringify(seed)},base:${JSON.stringify(origin+'/demo-film/')},assets:${JSON.stringify(Object.fromEntries(urls))},resolveUrl(src){return this.assets[src.split('#')[0]]||src},facts(src){return src.includes('.wav')?{duration:12,w:0,h:0}:{duration:6,w:1280,h:720}}};</script>`;
  make('film.html',replace(text('film.html')).replace('<script>window.filmHost={};</script>',boot));
  const resolveAssetUrl=(input:string)=>{
    if(input.startsWith('blob:'))return input.split('?')[0];
    const url=new URL(input,origin);
    if(url.origin!==origin)return input;
    if(url.pathname.startsWith('/demo-film/'))return urls.get(decodeURIComponent(url.pathname.slice('/demo-film/'.length)))??input;
    if(/^\/api\/(projects\/[^/]+|saved)\/(media|file|cover|poster|history\/poster)/.test(url.pathname)){
      const file=url.searchParams.get('path');
      if(url.pathname.endsWith('/file')&&file&&urls.has(file))return urls.get(file)!;
      if(file?.endsWith('.wav')&&!url.searchParams.get('what'))return urls.get('assets/tone.wav')!;
      return urls.get('assets/poster.svg')!;
    }
    return input;
  };
  const localFetch:typeof fetch=(input,init)=>{
    const url=input instanceof Request?input.url:String(input);
    const resolved=resolveAssetUrl(url);
    if(resolved.startsWith('blob:'))return globalThis.fetch(resolved,init);
    return Promise.resolve(new Response(JSON.stringify({error:'本地演示未提供此资源'}),{status:404,headers:{'content-type':'application/json'}}));
  };
  const backend=createDemoBackend(origin,{fetch:localFetch,film:seed});
  return {ask:backend.ask,projectId:'demo-1',transport:{fetch:backend.fetch,subscribe:backend.subscribe,resolveAssetUrl},host:createDemoHost(onOpen,onMessage),dispose(){backend.dispose();for(const url of urls.values())URL.revokeObjectURL(url);urls.clear();}};
}
