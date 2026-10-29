# 安装与应用接入

## 版本与安装

本文基线 `auricui@0.1.0-preview.4`，纯 ESM，入口为 `auricui`、`auricui/agent`、`auricui/chat`、`auricui/studio`、`auricui/styles.css`。源码构建会生成对应的本地 tarball。源码版本不代表已发布到 npm；远端安装前请先查询对应版本，未发布时使用附带包。

已有项目优先使用锁文件中的兼容版本；新项目可查询并锁定基线版本。沿用项目包管理器，以下为 npm 示例：

```bash
npm view auricui@0.1.0-preview.4 version --registry=https://registry.npmjs.org/ --prefer-online
npm install --save-exact auricui@0.1.0-preview.4 --registry=https://registry.npmjs.org/
```

仅当用户希望跟随预览渠道时用 `auricui@next`，`next` 会移动，不能假设永远对应本文基线。已有 React 19 项目复用其 React/DOM 版本；新建项目按框架要求安装两者。包的 peer 是 `^19.0.0`，未验证 React 18。

离线或 registry 不可用时，可将 Skill 内 `assets/library/auricui-0.1.0-preview.4.tgz` 复制到目标项目 `vendor/`，再安装相对路径。它提供当前基线包本体，传递依赖仍需网络或缓存。不能把用户全局 Skill 的绝对路径写入项目依赖。校验摘要见 [library-manifest.json](library-manifest.json)。

```bash
npm install ./vendor/auricui-0.1.0-preview.4.tgz
```

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
