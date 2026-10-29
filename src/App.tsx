import { ArrowLeft, ArrowRight, BookOpen, Boxes, Check, ChevronRight, Code2, Copy, ExternalLink, Menu, Moon, Package, Play, Search, Settings2, Sparkles, Sun, X } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { libraryDistribution as library } from './docs/distribution';
import { QuickStart } from './QuickStart';
import { CodeEditor as CodeBlock } from './docs/CodeEditor';
import { Toast, useToast } from './components/Toast';
import { Checkbox } from './components/primitives/Checkbox';
import { MenuSelect } from './components/MenuSelect';
import { Tooltip } from './components/Tooltip';
import { getDoc } from './docs/catalog';
import { BrandMark } from './docs/BrandMark';
import { ApiTable } from './docs/ApiTable';
import { categories, entries, type Entry } from './registry';
const Preview=lazy(()=>import('./docs/Preview').then(m=>({default:m.Preview})));
const Workbench=lazy(()=>import('./Workbench').then(m=>({default:m.Workbench})));
const Studio=lazy(()=>import('./StudioShowcase').then(m=>({default:m.StudioShowcase})));
const routeValue=()=>typeof window==='undefined'?'start':window.location.hash.replace(/^#\/?/,'')||'start';
function readTheme() { try { return localStorage.getItem('auricui.docs.theme')==='light'?'light':'dark'; } catch { return 'dark'; } }
export function App() {
  const [route,setRoute]=useState(routeValue);
  const [query,setQuery]=useState('');
  const [theme,setTheme]=useState(readTheme);
  const [menu,setMenu]=useState(false);
  const [filter,setFilter]=useState('全部');
  const [replay,setReplay]=useState(0);
  const [motion,setMotion]=useState(true);
  const [width,setWidth]=useState('full');
  const search=useRef<HTMLInputElement>(null);
  const main=useRef<HTMLElement>(null);
  const mobileMenu=useRef<HTMLDivElement>(null);
  const menuTrigger=useRef<HTMLButtonElement>(null);
  const toast=useToast();
  const selected=route.startsWith('components/')?entries.find(e=>e.id===route.slice('components/'.length)):undefined;
  const doc=selected?getDoc(selected):undefined;
  const normalized=query.trim().toLowerCase();
  const matches=(entry:Entry)=>!normalized||[entry.name,entry.english,entry.description,entry.category,getDoc(entry).symbol].join(' ').toLowerCase().includes(normalized);
  const found=entries.filter(matches);
  useEffect(()=>{const onHash=()=>setRoute(routeValue());window.addEventListener('hashchange',onHash);return()=>window.removeEventListener('hashchange',onHash);},[]);
  useEffect(()=>{document.documentElement.dataset.agentMotion=motion?'on':'off';return()=>{delete document.documentElement.dataset.agentMotion;};},[motion]);
  useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem('auricui.docs.theme',theme);}catch{}},[theme]);
  useEffect(()=>{main.current?.scrollTo({top:0,left:0,behavior:'instant'});setMenu(false);setReplay(0);document.title=selected?`${getDoc(selected).symbol} · AuricUI`:'AuricUI · 组件文档';},[route]);
  useEffect(()=>{const handler=(event:KeyboardEvent)=>{const editing=event.target instanceof HTMLElement&&(event.target.matches('input,textarea,select')||event.target.isContentEditable);if((event.metaKey||event.ctrlKey)&&event.key==='k'||event.key==='/'&&!editing){event.preventDefault();search.current?.focus();search.current?.select();}if(event.key==='Escape'){setMenu(false);setQuery('');}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[]);
  useEffect(()=>{if(!menu)return;mobileMenu.current?.querySelector<HTMLElement>('a,button')?.focus();return()=>{menuTrigger.current?.focus();};},[menu]);
  const copy=async(text:string)=>{try{await navigator.clipboard.writeText(text);toast.show('已复制');}catch{toast.showError('复制失败，请手动选择文本');}};
  const go=(id:string)=>{window.location.hash=`/${id}`;setQuery('');setMenu(false);};
  const link=(id:string)=>`#/components/${id}`;
  const jump=(id:string)=>{
    const container=main.current,section=document.getElementById(id);
    if(!container||!section||!container.contains(section))return;
    const margin=parseFloat(getComputedStyle(section).scrollMarginTop)||0;
    const top=section.getBoundingClientRect().top-container.getBoundingClientRect().top+container.scrollTop-margin;
    container.scrollTo({top:Math.max(0,top),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  };
  const navigation=<><a className="docs-nav-link" data-active={route==='start'} href="#/start" onClick={()=>setMenu(false)}><BookOpen size={15}/>快速开始</a><a className="docs-nav-link" data-active={route==='overview'} href="#/overview" onClick={()=>setMenu(false)}><Boxes size={15}/>组件总览<span>{entries.length}</span></a><a className="docs-nav-link" data-active={route==='scenes'} href="#/scenes" onClick={()=>setMenu(false)}><Play size={15}/>完整场景</a><a className="docs-nav-link" href="#/workbench"><Settings2 size={15}/>设计与配置工作台</a><div className="docs-nav-divider"/>{['Agent UI','Personal Agent',...categories.filter(c=>!['Agent UI','Personal Agent'].includes(c))].map(category=>{
    const group=found.filter(e=>e.category===category);if(!group.length)return null;
    return <details className="docs-nav-group" key={`${category}-${!!query}`} open={!!query||category==='Agent UI'||category==='Personal Agent'||selected?.category===category}><summary>{category}<span>{group.length}</span></summary>{group.map(entry=><a key={entry.id} className="docs-component-link" data-active={selected?.id===entry.id} href={link(entry.id)} onClick={()=>{setMenu(false);setQuery('');}}><span>{entry.name}</span>{getDoc(entry).isNew&&<i>新</i>}</a>)}</details>;
  })}{!found.length&&<p className="docs-no-results">没有找到组件。试试“消息”“来源”或英文 API 名称。</p>}</>;
  if(route==='workbench')return <><a className="docs-back-workbench" href="#/overview"><ArrowLeft size={14}/>返回开发文档</a><Suspense fallback={<p className="docs-loading">加载工作台…</p>}><Workbench/></Suspense></>;
  return <div className="docs-app">
    <a className="docs-skip" href="#docs-content" onClick={event=>{event.preventDefault();main.current?.focus();}}>跳转到正文</a>
    <header className="docs-header" inert={menu||undefined}><a className="docs-logo" href="#/start" aria-label="AuricUI 文档首页"><BrandMark/><span>Auric<span>UI</span></span><small>docs</small></a><div className="docs-search"><Search size={15}/><input ref={search} type="search" aria-label="搜索组件" placeholder="搜索组件、名称或功能…" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&found.length){go(`components/${found[0].id}`);search.current?.blur();}}}/><kbd>⌘ K</kbd>{query&&<div className="docs-search-results" role="region" aria-label="搜索结果">{found.length?found.slice(0,12).map(entry=><a key={entry.id} href={link(entry.id)} onClick={()=>{setQuery('');search.current?.blur();}}><span>{entry.name}<small>{getDoc(entry).symbol}</small></span><ChevronRight size={13}/></a>):<p>没有找到“{query}”</p>}</div>}</div><div className="docs-header-actions"><span className="docs-version">{library.version}</span><button type="button" className="docs-icon-button" aria-label="切换主题" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?<Moon size={16}/>:<Sun size={16}/>}</button><button ref={menuTrigger} type="button" className="docs-icon-button docs-mobile-trigger" aria-label="打开文档导航" aria-expanded={menu} onClick={()=>setMenu(!menu)}><Menu size={18}/></button></div></header>
    <aside className="docs-sidebar" inert={menu||undefined}><nav aria-label="组件导航">{navigation}</nav><footer></footer></aside>
    {menu&&<div className="docs-mobile-overlay" onClick={()=>setMenu(false)}><div ref={mobileMenu} role="dialog" aria-modal="true" aria-label="文档导航" className="docs-mobile-panel" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Tab'){const focusable=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a,button,summary')).filter(el=>el.getClientRects().length);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}}><button type="button" className="docs-icon-button docs-menu-close" aria-label="关闭导航" onClick={()=>setMenu(false)}><X size={18}/></button><nav>{navigation}</nav></div></div>}
    <main id="docs-content" className="docs-main" ref={main} tabIndex={-1} inert={menu||undefined}>
      {route==='start'?<div className="docs-start"><div className="docs-page-kicker">AURICUI / DEVELOPER DOCUMENTATION</div><h1>细节统一，构建自由。</h1><p className="docs-lead">从一个按钮，到你的 Personal Agent。可组合的 React 组件，清晰的接口，一致的深色体验。</p><div className="docs-start-highlights"><a href={link('message-bubble')}><Sparkles size={16}/><span><b>30 个 Agent UI 新组件</b><small>消息、工具调用与个人助手</small></span><ArrowRight size={16}/></a><a href="#/overview"><Code2 size={16}/><span><b>从预览直接到代码</b><small>真实示例 · 类型 API · 独立导出</small></span><ArrowRight size={16}/></a></div><QuickStart onBrowse={category=>{setFilter(category==='AI 交互'?'Agent UI':category??'全部');go('overview');}} notify={toast.show} onError={toast.showError}/></div>
      :route==='overview'?<div className="docs-overview"><div className="docs-page-kicker">COMPONENTS</div><h1>为下一次交互，找到合适的组件。</h1><p className="docs-lead">按功能浏览，进入详情即可预览状态、复制示例和查看属性。</p><div className="docs-filter" role="group" aria-label="筛选组件分类">{['全部','Agent UI','Personal Agent',...categories.filter(c=>!['Agent UI','Personal Agent'].includes(c))].map(c=><button key={c} type="button" aria-pressed={filter===c} onClick={()=>setFilter(c)}>{c}</button>)}</div><div className="docs-overview-count">{entries.filter(e=>filter==='全部'||e.category===filter).length} 个组件与组合示例</div><div className="docs-overview-grid">{entries.filter(e=>filter==='全部'||e.category===filter).map(entry=>{const info=getDoc(entry);return <a href={link(entry.id)} className="docs-overview-card" key={entry.id}><span className="docs-card-category">{entry.category}{info.isNew&&<i>NEW</i>}</span><strong>{info.recipe?entry.english:info.symbol}</strong><span>{entry.name}</span><p>{entry.description}</p><footer>{info.recipe?'组合示例':info.entry}<ArrowUpRightIcon/></footer></a>;})}</div></div>
      :selected&&doc?<div className="docs-detail-layout"><article className="docs-detail" key={selected.id}><nav className="docs-breadcrumb" aria-label="面包屑"><a href="#/overview">组件</a><ChevronRight size={12}/><span>{selected.category}</span></nav><header className="docs-detail-header"><div className="docs-title-row"><h1>{doc.recipe?selected.english:doc.symbol}</h1>{doc.isNew&&<span className="docs-new">新增</span>}</div><p className="docs-detail-subtitle">{selected.name} <span>—</span> {selected.description}</p><div className="docs-badges"><span>{doc.recipe?'组合示例':doc.entry}</span><span>{doc.entry==='auricui/agent'?'SSR 可渲染':'React 19'}</span><span>深色 / 浅色</span></div><div className="docs-detail-actions">{doc.code&&<button type="button" onClick={()=>void copy(doc.code!)}><Copy size={13}/>复制完整示例</button>}{!doc.recipe&&<button type="button" onClick={()=>void copy(`import { ${doc.symbol} } from '${doc.entry}';`)}><Code2 size={13}/>复制导入</button>}<button type="button" onClick={()=>void copy(window.location.href)}><ExternalLink size={13}/>复制链接</button></div></header>
      <section id="preview" className="docs-section"><h2>交互预览</h2><div className="docs-preview-shell"><div className="docs-preview-toolbar"><span><i/>实时组件</span><div><Checkbox className="docs-motion-toggle" label="动效" checked={motion} onCheckedChange={setMotion}/><div className="docs-preview-size"><MenuSelect label="预览宽度" value={width} onPick={setWidth} groups={[{choices:[{value:'full',label:'自适应'},{value:'mobile',label:'移动端'}]}]}/></div><Tooltip label="重置并重播"><button type="button" className="docs-replay" aria-label="重置示例" onClick={()=>setReplay(replay+1)}><Play size={13}/></button></Tooltip></div></div><div className="docs-preview-stage" data-agent-motion={motion?'on':'off'}><div className="docs-preview-width" style={{maxWidth:width==='mobile'?360:640}} key={replay}><Suspense fallback={<p role="status">加载示例…</p>}><Preview entry={selected} notify={toast.show}/></Suspense></div></div></div></section>
      {doc.states.length>0&&<section id="states" className="docs-section"><h2>常见状态</h2>{doc.states.map(state=><div className="docs-state-example" key={state.example}><h3>{state.title}</h3><p>{state.description}</p><div className="docs-state-stage" data-agent-motion={motion?'on':'off'}><div style={{width:'100%',maxWidth:width==='mobile'?360:640}} key={replay}><Suspense fallback={<p role="status">加载状态示例…</p>}><Preview entry={selected} example={state.example} notify={toast.show}/></Suspense></div></div><CodeBlock code={state.code} language="tsx" filename="状态示例.tsx" collapsible defaultCollapsed expandLabel="展开完整状态示例" collapseLabel="收起状态示例" onCopyError={()=>toast.showError('复制失败，请手动选择代码')}/></div>)}</section>}
      <section id="usage" className="docs-section"><h2>安装与使用</h2><p>在应用入口导入一次 <code>auricui/styles.css</code>。{doc.isNew?'此组件不需要 Chat Provider，不连接任何模型或外部服务。':doc.entry==='auricui/chat'?'Chat 内容放在 .auricui-chat 内，Provider 在应用根部挂载一次。':'首次接入请先完成快速开始中的主题设置。'}</p>{doc.isNew&&<div className="docs-note"><Package size={14}/><span>当前示例对应 {library.version}。<a href={library.href} download>下载当前包</a>，然后执行 <code>{library.install}</code>。</span></div>}{doc.recipe&&<div className="docs-note"><Code2 size={14}/><span>这是 React 与 AuricUI 样式的组合示例，没有同名 npm 导出。复制下面的完整实现即可使用。</span></div>}{doc.note&&<p className="docs-note-text">{doc.note}</p>}{doc.code?<CodeBlock code={doc.code} language="tsx" filename="Example.tsx" lineNumbers onCopyError={()=>toast.showError('复制失败，请手动选择代码')}/>:<><CodeBlock code={`import { ${doc.symbol} } from '${doc.entry}';\nimport 'auricui/styles.css';`} language="tsx" filename="导入入口"/><p className="docs-note-text">此组件需要项目上下文或专用数据。请查看下面的完整属性表，并在「完整场景」中体验实际接入；不提供省略依赖的可运行示例。</p></>}</section>
      <section id="api" className="docs-section"><h2>API 参考</h2><p>{doc.recipe?'组合示例的参数与组合方式见上面的完整代码。':'类型从当前源码生成；列出组件专有属性及常用继承属性。“未设置”表示未传该属性，其他标准 HTML 属性遵循 React 定义。'}</p>{doc.api&&<ApiTable props={doc.api.props} symbol={doc.symbol}/>}</section>
      {doc.isNew&&<section id="behavior" className="docs-section"><h2>交互与动效</h2><ul className="docs-guidelines"><li>支持键盘聚焦与标准按钮行为；状态改变通过 ARIA 语义呈现。</li><li>使用 140 / 220 / 320ms 动效层级；系统开启减少动态效果时自动降级。</li><li>业务数据通过 props 传入，操作通过回调交给应用；没有隐式请求或持久化。</li></ul>{selected.category==='Personal Agent'&&<p>Personal Agent 交互研究参考 <a href="https://introducing.muse.ai/" target="_blank" rel="noreferrer">Muse 官方设计说明</a>，保留 AuricUI 的视觉与独立组件契约。</p>}</section>}
      <section id="source" className="docs-section docs-source"><h2>源码位置</h2><button type="button" onClick={()=>void copy(doc.source)}><code>{doc.source}</code><Copy size={13}/></button></section><div className="docs-next"><a href="#/overview"><ArrowLeft size={14}/>所有组件</a>{entries[entries.indexOf(selected)+1]&&<a href={link(entries[entries.indexOf(selected)+1].id)}>下一个 · {entries[entries.indexOf(selected)+1].name}<ArrowRight size={14}/></a>}</div>
      </article><aside className="docs-toc"><span>本页内容</span>{[['preview','交互预览'],...(doc.states.length?[['states','常见状态']]:[]),['usage','安装与使用'],['api','API 参考'],...(doc.isNew?[['behavior','交互与动效']]:[]),['source','源码位置']].map(([id,label])=><button type="button" key={id} onClick={()=>jump(id)}>{label}</button>)}<div><Check size={13}/>TypeScript 类型支持</div><a href="#/start">安装与主题接入<ArrowRight size={12}/></a></aside></div>
      :route==='scenes'?<div className="docs-overview"><h1>完整场景</h1><p className="docs-lead">查看组件如何组合成完整应用。业务数据为本地演示。</p><Suspense fallback={<p>加载场景…</p>}><Studio/></Suspense></div>:<div className="docs-overview"><h1>没有找到这个页面</h1><a href="#/overview">返回组件目录</a></div>}
      <footer className="docs-footer"><span>{library.version} · MIT</span></footer>
    </main><Toast toast={toast.current}/>
  </div>;
  
}
function ArrowUpRightIcon(){return <ArrowRight size={14}/>;}
