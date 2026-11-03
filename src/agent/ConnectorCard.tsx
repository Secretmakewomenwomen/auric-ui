import { useUiText } from '../i18n/ui';
import type { ReactNode } from 'react';
import { Plug } from 'lucide-react';
import { classes } from './shared';
export interface ConnectorCardProps { name:string; icon?:ReactNode; account?:string; status:'connected'|'disconnected'|'expired'|'connecting'; scopes?:string[]; onConnect?:()=>void; onDisconnect?:()=>void; onManage?:()=>void; className?:string; }
export function ConnectorCard({name,icon,account,status,scopes=[],onConnect,onDisconnect,onManage,className}:ConnectorCardProps) {
  const uiText = useUiText();
  return <section className={classes('auricui-agent-card',className)} aria-label={name}><header className="auricui-agent-card-header">{icon??<Plug size={16}/>}<h3>{name}</h3><span className="auricui-connector-state" data-status={status} role="status">{({connected:uiText("已连接"),disconnected:uiText("未连接"),expired:uiText("需重新授权"),connecting:uiText("连接中…")})[status]}</span></header>{account&&<p>{account}</p>}{scopes.length>0&&<ul className="auricui-scope-list" aria-label={uiText("已授予的权限")}>{scopes.map(scope=><li key={scope}>{scope}</li>)}</ul>}<footer className="auricui-agent-card-footer">{status==='connected'?<>{onManage&&<button type="button" className="auricui-agent-button" onClick={onManage}>{uiText("管理权限")}</button>}{onDisconnect&&<button type="button" className="auricui-agent-button" onClick={onDisconnect}>{uiText("断开连接")}</button>}</>:onConnect&&<button type="button" className="auricui-agent-primary" disabled={status==='connecting'} onClick={onConnect}>{status==='expired'?uiText("重新授权"):uiText("连接服务")}</button>}</footer></section>;
}
