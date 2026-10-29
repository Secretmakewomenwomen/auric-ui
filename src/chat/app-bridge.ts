/** Injectable browser services. No Electron preload or global window bridge is required. */
export type { StudioRef } from '@studio/lib/host';
export interface SkillInfo {name:string;description:string;source:'project'|'mine'|'official';folder:string;scripts:string[];over?:Array<'project'|'mine'|'official'>;shown?:{title:Record<string,string>;summary:Record<string,string>;details?:Record<string,string>}}
export interface SkillPreview {name:string;description:string;scripts:string[];size:number;replaces:boolean}
export interface TurnLog {file:string;cut:boolean;size:number;callsSize?:number;events:Array<{t:number;kind:string;[field:string]:unknown}>;calls?:unknown[]}
type PreviewResult={ok:true;id:string;skills:SkillPreview[]}|{ok:false;error:string}|{ok:false;cancelled:true};
export interface ChatServices {
  setChatWidth:(width:number,commit?:boolean)=>void;
  revealPath:(path:string)=>Promise<unknown>;
  copyDiagnostics:()=>Promise<{ok:boolean}>;
  pathForFile?:(file:File)=>string;
  fetch:(input:RequestInfo|URL,init?:RequestInit)=>Promise<Response>;
  chat:{log:(project:string,turnId:string,unless?:{size:number;callsSize:number})=>Promise<TurnLog|{same:true}|null>;reveal:(project:string,turnId:string)=>Promise<unknown>};
  skills:{preview:(url:string)=>Promise<PreviewResult>;previewFolder:(path:string|null,words?:{title:string;button:string})=>Promise<PreviewResult>;commit:(id:string,covers?:Record<string,string>)=>Promise<{ok:true;skills:SkillInfo[]}|{ok:false;error:string}>;discard:(id:string)=>Promise<unknown>};
}
const missing=async():Promise<never>=>{throw new Error('请为此组件配置 ChatServices 服务');};
const fallback:ChatServices={setChatWidth:()=>{},revealPath:missing,copyDiagnostics:async()=>({ok:false}),fetch:(input,init)=>globalThis.fetch(input,init),chat:{log:async()=>null,reveal:missing},skills:{preview:missing,previewFolder:missing,commit:missing,discard:async()=>{}}};
let services:ChatServices=fallback;
export function configureChatServices(next:ChatServices|null){services=next??fallback;}
export const app:ChatServices=new Proxy(fallback,{get(_target,key:keyof ChatServices){return services[key];}});
export const chatFetch:typeof fetch=(input,init)=>services.fetch(input,init);
