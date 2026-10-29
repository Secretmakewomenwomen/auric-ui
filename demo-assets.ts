import type { Plugin } from 'vite';
/** Only the demo's media URLs use this static redirect; stateful services live in StudioBench. */
export function demoAssetTarget(path:string):string|null {
 const url=new URL(path,'http://demo.local');
 if(!/^\/api\/(?:projects\/[^/]+\/(?:media|cover|poster|file|history\/poster\/[^/]+)|saved\/(?:media|file|poster))$/.test(url.pathname))return null;
 const what=url.searchParams.get('what');
 if(what&&['probe','wave','waveform','loudness'].includes(what))return null;
 const file=url.searchParams.get('path');
 if(url.pathname.endsWith('/file')&&file&&['assets/tone.wav','assets/poster.svg','scenes/intro.html','scenes/details.html'].includes(file))return `/demo-film/${file}`;
 if(file?.endsWith('.wav')&&!what)return '/demo-film/assets/tone.wav';
 return '/demo-film/assets/poster.svg';
}
export function demoAssets():Plugin {
 const attach=(server:{middlewares:{use:(handler:(req:{url?:string;method?:string},res:{writeHead:(status:number,headers:Record<string,string>)=>void;end:()=>void},next:()=>void)=>void)=>void}})=>{
  server.middlewares.use((req,res,next)=>{const target=req.method==='GET'?demoAssetTarget(req.url??''):null;if(!target)return next();res.writeHead(302,{Location:target,'Cache-Control':'no-store'});res.end();});
 };
 return {name:'frame-demo-assets',configureServer:attach,configurePreviewServer:attach};
}
