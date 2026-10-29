import { useState } from 'react';
import { ArrowUpRight, Check, ChevronRight, Code2, Copy, Download, Package, Sparkles } from 'lucide-react';
import { Card, CardActions, CardButton } from './components/Card';
import generated from './docs/generated.json';
import { libraryDistribution as library, skillDistribution as skill } from './docs/distribution';

const appExample = `import { AuricUIProvider, CardButton, Toast, useToast } from 'auricui';
import 'auricui/styles.css';

export default function App() {
  const toast = useToast();
  return (
    <AuricUIProvider theme="dark">
      <CardButton weight="primary" onClick={() => toast.show('已保存')}>
        保存
      </CardButton>
      <Toast toast={toast.current} />
    </AuricUIProvider>
  );
}`;
const chatExample = `import { Markdown } from 'auricui/chat';

<section className="auricui-chat">
  <Markdown text="**你好，准备好开始了吗？**" />
</section>`;
const agentPrompt = `使用 $auricui 为当前项目开发一个深色应用界面。
先检查依赖和真实组件 API，再实现页面布局、交互和状态。
需要消息、工具执行、记忆与简报时使用 auricui/agent。
复杂聊天编辑器从 auricui/chat 导入，并接入项目的模型服务。`;

const themeCss = `/* theme.css — 在 auricui/styles.css 之后导入 */
:root[data-theme='dark'],
[data-theme='dark'] .auricui-chat {
  --bg: #17181c;
  --panel: #1d1e23;
  --surface: #22232a;
  --surface-2: #292a32;
  --surface-3: #32343e;
  --card-bg: var(--surface);
  --card-border: rgba(255, 255, 255, 0.10);
  --text: #eeeeF2;
  --text-muted: #a5a7b3;
  --accent: #c6bce8;
  --accent-soft: rgba(198, 188, 232, 0.12);
  --on-accent: #1d172d;
}

:root[data-theme='light'],
[data-theme='light'] .auricui-chat {
  --accent: #65518b;
  --accent-soft: rgba(101, 81, 139, 0.09);
  --on-accent: #ffffff;
}`;
const motionCss = `:root {
  --auricui-motion-fast: 140ms;
  --auricui-motion-normal: 220ms;
  --auricui-motion-slow: 320ms;
  --auricui-ease-out: cubic-bezier(.2, .8, .2, 1);
}`;

type Props = { onBrowse: (category?: string) => void; notify: (text: string) => void; onError: (text: string) => void };
function CodeBlock({ title, code, notify, onError }: { title: string; code: string } & Pick<Props, 'notify' | 'onError'>) {
  return <div className="quick-code">
    <div className="quick-code-label"><span>{title}</span><button type="button" aria-label={`复制${title}`} onClick={async () => {
      try { await navigator.clipboard.writeText(code); notify('已复制'); }
      catch { onError('无法访问剪贴板，请选中代码手动复制'); }
    }}><Copy size={13} />复制</button></div>
    <pre><code>{code}</code></pre>
  </div>;
}

export function QuickStart({ onBrowse, notify, onError }: Props) {
  const [global, setGlobal] = useState(true);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const suffix = global ? ' --global' : '';
  const feedback = { notify, onError };
  return <div className="quick-start">
    <section className="quick-intro">
      <div><span className="quick-kicker">AURICUI / GET STARTED</span>
        <h2>从第一个组件开始。</h2>
        <p>安装组件库，接入主题，再让你的 Agent 读懂这套设计系统。按钮、设置、弹窗和 AI 交互，共用一致的视觉语言。</p>
        <div className="quick-actions"><CardButton weight="primary" onClick={() => onBrowse()}>浏览组件 <ArrowUpRight size={13}/></CardButton><CardButton onClick={() => onBrowse('AI 交互')}>探索 AI 交互</CardButton></div>
      </div>
      <div className="quick-facts"><div><Package size={17}/><span>组件库<strong>auricui</strong></span><small>{library.version} · 本地构建</small></div><div><Sparkles size={17}/><span>Agent Skill<strong>auricui-skill</strong></span><small>{skill.version} · 安装器</small></div><p>React 19 · ESM · 内置 CSS、字体与动画</p></div>
    </section>

    <section className="quick-step" aria-labelledby="quick-install">
      <span className="quick-step-number">01</span><div className="quick-step-body">
        <h2 id="quick-install">安装 UI 组件库</h2><p>在 React 19 项目中通过 npm 安装组件库。当前文档版本为 {library.version}；React 与 React DOM 保持版本一致。</p>
        <CodeBlock title="通过 npm 安装" code={`npm install auricui@${library.version} --registry=https://registry.npmjs.org/`} {...feedback}/>
        <div className="quick-note"><Check size={14}/><span>样式、Inter 字体和 CSS 动画已内置。TypeScript 和 Tailwind 可按项目需要使用。</span></div>
        <details className="quick-details"><summary><ChevronRight size={13} aria-hidden="true"/>通过本地下载包安装</summary><div className="quick-distribution"><span className="quick-status">正在浏览 {library.version} 文档</span><p>需要本地安装或 npm 尚未发布当前版本时，下载下面的 tgz 包，放到项目目录再执行安装命令。</p><a className="quick-download" href={library.href} download><Download size={14}/>下载当前 UI 包 · {library.version}</a><CodeBlock title="安装本地下载包" code={library.install} {...feedback}/></div></details>
        <details className="quick-details"><summary><ChevronRight size={13} aria-hidden="true"/>遇到 E404 或 ETARGET？</summary><p>先向官方仓库检查预览版本。网页可见并不代表下载已经就绪；缓存或发布处理延迟可能影响结果。</p><CodeBlock title="检查版本" code="npm view auricui@next version --registry=https://registry.npmjs.org/ --prefer-online" {...feedback}/></details>
      </div>
    </section>

    <section className="quick-step" aria-labelledby="quick-use">
      <span className="quick-step-number">02</span><div className="quick-step-body">
        <h2 id="quick-use">接入主题，渲染第一个组件</h2><p>在应用入口导入 CSS，根部挂载一次 <code>AuricUIProvider</code>。在初始 HTML 的 <code>&lt;html&gt;</code> 上设置 <code>data-theme="dark"</code>，让首屏直接使用深色主题。</p>
        <CodeBlock title="App.tsx / App.jsx" code={appExample} {...feedback}/>
        <div className="quick-component-preview"><span>实际组件预览</span><CardButton onClick={() => notify('次要按钮已点击')}>取消</CardButton><CardButton weight="primary" onClick={() => notify('已保存')}>保存</CardButton></div>
        <details className="quick-details"><summary><ChevronRight size={13} aria-hidden="true"/>接入 AI 消息与聊天组件</summary><p>从 <code>auricui/chat</code> 导入，并为内容添加 <code>auricui-chat</code> 作用域。模型请求和业务数据由应用提供。</p><CodeBlock title="Chat.tsx / Chat.jsx" code={chatExample} {...feedback}/><p>模型菜单需配合 ModelOptionsProvider；SSR 应用应在浏览器挂载后渲染该菜单。完整接入方法包含在 Skill 中。</p></details>
      </div>
    </section>

    <section className="quick-step" aria-labelledby="quick-theme">
      <span className="quick-step-number">03</span><div className="quick-step-body">
        <h2 id="quick-theme">配置主题与动画</h2><p><code>AuricUIProvider</code> 接受 <code>dark</code> 或 <code>light</code>，并同步到页面的 <code>data-theme</code>。它管理整页主题，请只在应用根部挂载一次。</p>
        <div className="quick-theme-demo" data-theme={previewTheme}>
          <div className="quick-theme-demo-bar"><span>主题实时预览 · {previewTheme === 'dark' ? '深色' : '浅色'}</span><CardButton onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}>切换预览主题</CardButton></div>
          <Card title="你的工作空间" body="文字、表面、边框和操作按钮随主题一起变化。"><CardActions><CardButton onClick={() => notify('已取消')}>取消</CardButton><CardButton weight="primary" onClick={() => notify('偏好已保存')}>保存偏好</CardButton></CardActions></Card>
        </div>
        <CodeBlock title="深浅主题切换 · App.tsx" code={generated.examples.Theme} {...feedback}/>
        <h3>自定义颜色</h3><p>通过语义 CSS 变量覆盖颜色，并将自定义文件放在库样式之后。无需额外的 Tailwind 配置。</p>
        <CodeBlock title="样式导入顺序 · main.tsx" code={"import 'auricui/styles.css';\nimport './theme.css';"} {...feedback}/>
        <CodeBlock title="theme.css" code={themeCss} {...feedback}/>
        <div className="quick-theme-tokens"><table><thead><tr><th>变量</th><th>影响范围</th></tr></thead><tbody>
          <tr><td><code>--bg / --panel / --surface-*</code></td><td>页面、面板与分层表面</td></tr>
          <tr><td><code>--text / --text-muted</code></td><td>主要文字与次要说明</td></tr>
          <tr><td><code>--border / --border-strong</code></td><td>分隔线、输入框与浮层边界</td></tr>
          <tr><td><code>--card-bg / --card-border</code></td><td>Card 卡片表面与边框</td></tr>
          <tr><td><code>--accent / --on-accent</code></td><td>采用强调色的选择状态与焦点环</td></tr>
          <tr><td><code>--ok / --warn / --err</code></td><td>成功、警告和错误语义</td></tr>
        </tbody></table></div>
        <p><code>CardButton weight="primary"</code> 使用 <code>--text</code> 作为背景、<code>--panel</code> 作为文字，保持 AuricUI 的中性主操作风格。需要品牌色按钮时，给该按钮添加自己的样式类；不要为了按钮颜色而修改整页文字色。</p>
        <details className="quick-details"><summary><ChevronRight size={13} aria-hidden="true"/>Chat 组件、弹层与主题继承</summary><p>Chat 会在 <code>.auricui-chat</code> 内重新定义一组颜色，因此上面的自定义主题同时覆盖根节点和 Chat 作用域。Provider 创建的 <code>#auricui-chat-layer</code> 也带有这个类，挂载其中的菜单会一起生效。</p><p>Drawer 等挂到 body 的浮层继承 <code>html</code> 的全局主题。局部容器的 CSS 变量不会跨越 Portal；带浮层的完整应用请在根节点配置主题。</p></details>
        <details className="quick-details"><summary><ChevronRight size={13} aria-hidden="true"/>首屏主题、SSR 与保存偏好</summary><CodeBlock title="初始 HTML · index.html" code={'<html lang="zh-CN" data-theme="dark">'} {...feedback}/><p>初始 HTML 的主题应与 React 第一次渲染的值一致。SSR 项目可从 Cookie 读取偏好，同时传给 HTML 和 Provider。纯客户端项目可在 React 启动前读取 localStorage，再用同一值初始化状态；不要等页面显示后才读取，以免发生闪烁。</p><p>Provider 不会自动保存偏好，也没有 <code>system</code> 参数。需要跟随系统时，由应用使用 <code>matchMedia('(prefers-color-scheme: dark)')</code> 转成 dark / light，再传入 Provider。</p></details>
        <details className="quick-details"><summary><ChevronRight size={13} aria-hidden="true"/>调整动画节奏</summary><p>新增 Agent 和基础组件采用原生 CSS 过渡。使用这些 motion 变量的动效可以统一调整；不需要安装动画库。组件遵循系统的 <code>prefers-reduced-motion</code> 设置。部分原有 Chat / Studio 动效仍使用各自时长。</p><CodeBlock title="theme.css · 动画变量" code={motionCss} {...feedback}/></details>
      </div>
    </section>

    <section className="quick-step" aria-labelledby="quick-skill">
      <span className="quick-step-number">04</span><div className="quick-step-body">
        <h2 id="quick-skill">给 Agent 安装 Skill</h2><p>Skill 提供真实 API 查询、组件选择、主题规范、聊天接入和示例。安装器需要 Node.js 20.19+，依赖与 API 检查工具使用 Python 3。</p>
        <div className="quick-scope" role="group" aria-label="Skill 安装范围"><button type="button" aria-pressed={global} onClick={() => setGlobal(true)}>Codex 全局</button><button type="button" aria-pressed={!global} onClick={() => setGlobal(false)}>当前项目</button></div>
        <p className="quick-destination">安装位置：<code>{global ? '~/.codex/skills/auricui（设置 CODEX_HOME 时使用其目录）' : '.agents/skills/auricui'}</code></p>
        <CodeBlock title="通过 npm 安装 Skill" code={`npx auricui-skill@${skill.version}${suffix}`} {...feedback}/>
        <details className="quick-details"><summary><ChevronRight size={13} aria-hidden="true"/>通过本地下载包安装 Skill</summary><div className="quick-distribution"><p>需要本地安装或 npm 尚未发布当前版本时，下载对应安装器，在下载文件所在目录运行下面的命令。</p><a className="quick-download" href={skill.href} download><Download size={14}/>下载安装器 · {skill.version}</a></div><CodeBlock title="本地安装" code={`npx --package=./${skill.filename} auricui-skill${suffix}`} {...feedback}/></details>
        <p>已有同名 Skill 时，加 <code>--update</code> 备份并更新。其他 Agent 可用 <code>--dir &lt;技能目录&gt;</code> 指定安装位置。</p>
      </div>
    </section>

    <section className="quick-step" aria-labelledby="quick-agent">
      <span className="quick-step-number">05</span><div className="quick-step-body">
        <h2 id="quick-agent">让 Agent 开始开发</h2><p>刷新技能列表或开启新会话，使用 <code>$auricui</code> 调用。你可以从下面的提示词开始。</p>
        <CodeBlock title="发送给 Agent" code={agentPrompt} {...feedback}/>
        <div className="quick-note"><Code2 size={14}/><span>Skill 会指导 Agent 检查依赖、查阅组件声明，并按应用需求连接业务服务。</span></div>
      </div>
    </section>
    <footer className="quick-footer"><span>继续探索组件的状态、配置与交互。</span><CardButton onClick={() => onBrowse()}>打开组件总览 <ArrowUpRight size={13}/></CardButton></footer>
  </div>;
}
