# AuricUI

React 19 的深色组件与交互系统。仅提供 ESM（`.mjs`），包含 TypeScript 声明和编译好的 CSS，不提供 CJS。

版本号以随包的 `package.json` 为准。包含 30 个 Agent / Personal Agent 组件和 13 个基础组件。文档提供可复制示例、常见状态、属性默认值与主题配置。

## 使用

```tsx
import { CardButton, AuricUIProvider, Toast, useToast } from 'auricui';
import { Markdown } from 'auricui/chat';
import 'auricui/styles.css';

export function App() {
  const toast = useToast();
  return (
    <AuricUIProvider theme="dark">
      <CardButton onClick={() => toast.show('已保存')}>保存</CardButton>
      <section className="auricui-chat">
        <Markdown text="**准备就绪。**" />
      </section>
      <Toast toast={toast.current} />
    </AuricUIProvider>
  );
}
```

初始 HTML 设置 `<html data-theme="dark">`，避免首屏闪烁。Provider 在应用根部挂载一次，提供 Chat 弹层容器；Chat 内容必须包在 `.auricui-chat` 中。应用可以不用 Provider，自己维护 `data-theme` 和 `<div id="auricui-chat-layer" class="auricui-chat"></div>`。

## 入口

| 路径 | 内容 |
| --- | --- |
| `auricui` | 按钮、卡片、Drawer、Checkbox、RadioGroup、Tree、Combobox、Tabs、Pagination、Textarea、Progress、Skeleton、Avatar、Breadcrumb、EmptyState、设置与 Provider |
| `auricui/agent` | MessageBubble、MessageList、ToolCall、ApprovalCard、MemoryCard、BriefingCard 等 30 个无服务耦合组件 |
| `auricui/chat` | Lexical 输入、Markdown、附件、问答、完整对话、模型选择、技能弹窗、日志，以及服务接口 |
| `auricui/studio` | 原专业场景组件：时间轴、舞台、字幕、素材、项目、完整设置和导出面板，以及服务接口 |
| `auricui/styles.css` | 原始变量、组件样式、CSS 动画和 Inter Variable 字体 |

React 与 React DOM 19 为 peer dependencies。Lucide、Lexical 及其 React 绑定、Yjs 是声明的依赖。CSS 已编译，使用方无需安装 Tailwind 来生成本库样式；若修改源码，构建使用 Tailwind 4。动画沿用 CSS keyframes/transition 和原组件触发逻辑，不要求 GSAP 或 Motion。

## 主题配置

```tsx
import 'auricui/styles.css';
import './theme.css';
```

```css
:root[data-theme='dark'],
[data-theme='dark'] .auricui-chat {
  --surface: #22232a;
  --card-bg: var(--surface);
  --accent: #c6bce8;
}
```

Provider 的 theme 可受控切换 dark / light，不内置偏好持久化或 system 模式。Chat 自己声明颜色变量，因此自定义覆盖同时包含 Chat 选择器。Drawer / Citation 的 body Portal 使用根主题，不继承局部 wrapper。CardButton primary 使用 --text 作为背景、--panel 作为文字。

新增动效采用 --auricui-motion-fast / normal / slow（140 / 220 / 320ms）和原生 CSS，遵循 prefers-reduced-motion。CodeBlock 默认无语法着色，可通过 renderLine 接入高亮器。

## 服务边界

基础控件与 auricui/agent 接受 props。Agent 组件不请求模型、不创建调度、不实现 OAuth，也不执行后端授权；这些行为由宿主回调提供。`SettingsDialog` 接收 `pages`，`ModelOptionsProvider` 接收模型目录、选中值和更新回调。

完整 Studio 业务页面需要在挂载前调用 `configureStudioTransport({ fetch, subscribe })`；`configureStudioHost(host)` 接入 Agent、更新、标签及文件系统能力。不配置 transport 时，页面使用原 `/api/…` 协议，因此不能把 `ProjectView` 当作无后端的普通卡片使用。视频舞台还需要与原 preview/film 消息协议兼容的页面服务。

完整聊天的技能安装、对话进度、日志、诊断和分栏由 `configureChatServices(services)` 提供。用 `ChatProjectContext` 提供项目 ID，用 `DeveloperContext` 控制日志/文件差异。Markdown 的 Studio 引用可以通过 `ClipSourcesContext` 与回调接入。类型声明给出完整接口。

`auricui/demo` 提供可选的 `createStudioDemo()`，包含浏览器内存项目、模拟宿主和内置 Blob 素材，用于本地场景演示与交互验证。普通业务入口不会自动启用模拟服务。它不承担真实模型请求、媒体导出或磁盘管理，刷新后数据重置，卸载时需调用 `dispose()`。使用业务 `transport` 时不要创建演示适配器。同一页面只挂载一个配置 Studio 全局服务的场景根。

Studio 与 Chat 保留各自的色彩变量；Portal 的主题容器和焦点行为属于组件契约。专业页面依赖 DOM、媒体和浏览器 API，SSR 应只加载需要的基础组件，并在客户端挂载编辑器。

源码基于 OpenFilm 0.2.5 的 MIT 许可版本；产品标识改为 AuricUI。见 `LICENSE`、`INTER-LICENSE` 和 `THIRD-PARTY-NOTICES.md`。
