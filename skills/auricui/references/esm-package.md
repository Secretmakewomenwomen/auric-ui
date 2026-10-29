# 安装与应用接入

## 版本与安装

组件库版本与附带 tgz 路径以 `library-manifest.json` 为准，API 查询工具会打印所用版本。ESM 入口包括 `auricui`、`auricui/agent`、`auricui/chat`、`auricui/studio`、`auricui/demo` 和 `auricui/styles.css`。

已有项目优先复用锁文件中的兼容版本。先检查目标包，不为使用 Skill 擅自升级 React 或框架。新项目可按用户选择安装 npm 预览渠道；远端是否已有精确版本需查询确认，源码基线不等于 npm 发布状态。

```bash
npm view auricui dist-tags --json
npm install auricui@next
```

React / React DOM 要求 19，消费方可用 JavaScript，不必安装 TypeScript 或 Tailwind。Next.js 等应用需要把交互组件放进自己的客户端边界。

网络不可用时，读取 `library-manifest.json` 的 file 字段，将对应 tgz 复制到消费项目 vendor 目录，再安装该相对路径。不要把全局 Skill 绝对路径写入项目依赖；包的传递依赖仍需要网络或缓存。

## 应用根

HTML 在首屏设置 `<html lang="zh-CN" data-theme="dark">`。应用入口全局导入 CSS；`AuricUIProvider` 只挂载一次，它设置 document 的主题并创建 Chat Portal 容器，不会给 children 自动添加 Chat 作用域。

```tsx
import { AuricUIProvider, CardButton } from 'auricui';
import { Markdown } from 'auricui/chat';
import 'auricui/styles.css';

export function App() {
  return <AuricUIProvider theme="dark">
    <CardButton weight="primary">保存</CardButton>
    <section className="auricui-chat"><Markdown text="**已就绪**" /></section>
  </AuricUIProvider>;
}
```

只有需要 Chat 的区域包 `.auricui-chat`；不要将整个 Studio 包在其中。自管 Provider 时必须维护主题和唯一的 `<div id="auricui-chat-layer" class="auricui-chat"></div>`。

## 构建边界

- 包带 `.mjs`、`.d.ts` 和已编译 CSS，使用 ESM import；不提供 `require` 分支。
- JS/JSX 项目可以使用；TypeScript 用于类型提示和检查。消费方不需要构建库源码。
- 字体和 CSS 动画已内置。用自己的 CSS 写布局即可；采用 Tailwind 的项目自行编译应用新增的类名。
- React Server Components 应把交互 UI 放进应用自己的 `'use client'` 边界；当前打包产物不保证保留每个源码的 client directive。在框架允许的全局入口导入样式。
- Provider 会修改全局主题，不能用两个 Provider 做同页互相独立的深/浅色预览。编辑器/媒体组件依赖浏览器 API；需要时客户端挂载。不要因一次 SSR 冒烟通过就断言所有组件可服务端运行。
- 仅导入公开入口。`auricui/dist/...`、原项目 `@chat/` / `@studio/` 和私有源码路径不属于公共 API。
