# AuricUI

**面向 AI 应用的 React 组件库，从基础交互到聊天与编辑工作台。**

AuricUI 将表单、消息、工具调用、项目管理和媒体编辑组件放在统一的视觉系统中。以深色界面为起点，支持浅色主题，帮助你搭建 AI 助手、Agent 工作台和内容创作工具。

![AuricUI 文档站预览：深色主题、组件导航与快速开始](./docs/images/image1.png)

[在线文档与演示](https://coderclouds.com:8443/#/start) · [快速开始](#快速开始) · [组件入口](#组件入口) · [运行文档](#运行文档) · [参与贡献](./CONTRIBUTING.md)

## 特性

- **覆盖日常交互与 AI 场景**：从按钮、表格和弹窗，到消息、引用、工具执行、操作确认与记忆展示。
- **支持复杂工作台**：提供富文本输入、模型菜单、时间轴、图层、素材和属性面板，可按业务需要组合。
- **主题与动效随包提供**：深浅主题、CSS 变量、Inter 字体和过渡动画，无需额外配置 Tailwind 即可使用组件样式。
- **示例与实际组件一致**：文档中的预览和可复制代码共用示例源，属性信息从 TypeScript 提取，并通过包消费检查。

## 快速开始

### 1. 安装组件库

在已有 **React 19 + React DOM 19** 项目中安装：

```bash
npm install auricui@next
```

### 2. 安装 Skill，让 AI 帮你搭建界面

AuricUI 配套提供编程 Agent Skill，包含组件选择、API 查询、主题配置、业务接入指南和可编译示例。安装后，可以直接描述你想要的页面，让 Agent 按组件库的实际接口实现。

Skill 采用按需读取：入口保留关键约束，Agent 先搜索组件，再查询单个组件的参数，需要时才加载一个示例或对应的业务指南。参数优先来自项目实际安装的版本，避免一次把整个组件索引和全部示例放入上下文。

在你的应用项目根目录执行：

```bash
npx auricui-skill@latest
```

默认安装到当前项目的 `.agents/skills/auricui`。如果希望在 Codex 的多个项目中使用，可以选择全局安装：

```bash
npx auricui-skill@latest --global
```

安装后刷新 Agent 的技能列表或新开会话，在对话中使用 `$auricui` 并说明需求，例如：

```text
使用 $auricui，为当前项目搭建一个 AI 助手工作台：
左侧是会话列表，中间是聊天内容，底部是消息输入区。
支持深浅主题切换、流式回复和工具调用状态。
先检查项目中安装的组件版本与 API，再实现页面；业务请求通过回调接入。
```

Skill 安装器只安装指南和工具，组件库仍通过上面的 `npm install` 安装。其他支持 `SKILL.md` 的 Agent 可通过 `--dir <技能父目录>` 指定位置；不自动发现技能的工具，可让它读取安装目录中的 `SKILL.md`。更新已有安装时，在原安装命令后加 `--update`，安装器会先备份旧版本。更多选项见 [Skill 使用说明](./packages/auricui-skill/README.md)。

#### 第一次使用：让 Agent 先了解项目

在编程工具中打开你的应用项目，再把需求发送到对话框。`$auricui` 写在给 Agent 的消息里，无需在终端执行。第一次接入时，可以先让它检查项目结构和依赖，再实现一个小页面：

```text
使用 $auricui，先检查当前项目的框架、React 版本和已安装的 AuricUI 导出。
沿用现有路由和包管理器，接入全局样式与主题，避免重复挂载 Provider。
然后实现一个应用设置页，包含主题切换、通知开关和保存反馈。
```

如果 Agent 没有识别技能，项目内安装的用户可以告诉它：“请先读取 `.agents/skills/auricui/SKILL.md`，按其中的指南完成任务。”全局或自定义安装则使用安装器输出的实际路径。Skill 附带的依赖与 API 查询脚本需要 Python 3，可由 Agent 按指南运行。

#### 描述需求：说明布局、交互和数据来源

不需要提前列出每个组件名。告诉 Agent 页面给谁用、有哪些区域、点击后应发生什么，并提供已有接口或数据类型，它就能据此选择组件。尚未接入后端时，明确要求使用本地示例数据，并保留业务回调：

```text
使用 $auricui，搭建一个任务管理页面。
顶部放搜索和状态筛选，中间用表格展示任务，点击任务后在右侧抽屉查看详情。
支持加载中、空列表和请求失败状态，窄屏下也要可用。
先用本地示例数据，搜索、保存和删除通过回调接入，方便以后替换成真实接口。
```

#### 改造已有页面：指出范围和需要保留的行为

Skill 也适合渐进替换现有界面。附上目标文件或让 Agent 定位页面，说明要保留的业务逻辑、需要调整的视觉细节，以及允许修改的范围：

```text
使用 $auricui，改造现有的用户设置页面。
保留当前表单字段、校验规则、接口调用和路由，仅替换界面组件并统一样式。
按钮圆角设为 6px，使用克制的聚焦样式，补充保存中的禁用状态和结果反馈。
先核对已安装组件支持的 props，不支持的部分用应用层组合实现。
```

#### 继续迭代：把反馈变成可验证的要求

页面生成后，可以继续用自然语言调整：“缩小侧栏宽度”“增加空状态”“让抽屉支持键盘关闭”。涉及 bug 时，提供触发步骤、实际表现与期望结果；例如“切换到工作台后滚动到底部出现空白，期望页面固定一屏，各面板内部滚动”。

完成前，可以让 Agent 做一次验收：

```text
请按 AuricUI Skill 检查这次改动：
确认使用的是已安装版本的公开组件和 props，样式与 Provider 已正确接入。
运行项目现有的类型检查和构建，在可用的浏览器环境中验证键盘操作、
深浅主题、窄屏布局，以及加载、空数据和错误状态。
最后列出已验证的结果、仍使用模拟数据的功能和未能验证的部分。
```

### 3. 最小接入示例

AuricUI 提供 ESM 和 TypeScript 类型声明，也可在 JavaScript 项目中使用。`next` 为 npm 预览渠道，可能落后于仓库源码；安装版本以项目锁文件为准。

在应用入口导入样式，并在根部挂载一次 `AuricUIProvider`：

```tsx
import { useState } from 'react';
import { AuricUIProvider, CardButton } from 'auricui';
import 'auricui/styles.css';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  return (
    <AuricUIProvider theme={theme}>
      <main
        style={{
          minHeight: '100vh',
          padding: 24,
          background: 'var(--bg)',
          color: 'var(--text)',
        }}
      >
        <CardButton
          weight="primary"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          切换到{theme === 'dark' ? '浅色' : '深色'}主题
        </CardButton>
      </main>
    </AuricUIProvider>
  );
}
```

在初始 HTML 中设置 `<html data-theme="dark">`，让首屏与默认主题保持一致。使用 Chat 组件时，将对应内容放入 `.auricui-chat` 容器。自定义配色、Portal 和服务接入说明见 [组件包文档](./packages/auricui/README.md)。

## 组件入口

按使用场景选择入口：

| 入口 | 提供的能力 |
| --- | --- |
| `auricui` | 按钮、表单、Table、Drawer、Tree、Tabs、主题 Provider 等基础组件 |
| `auricui/agent` | 消息、引用、工具执行、操作确认、记忆、目标和简报 |
| `auricui/chat` | 富文本输入、Markdown、模型菜单和聊天组件 |
| `auricui/studio` | 时间轴、图层、素材、项目和编辑器组件 |
| `auricui/demo` | 浏览器内的本地演示数据、模拟宿主与素材 |
| `auricui/styles.css` | 编译好的组件样式、字体与动画 |

基础组件与 Agent 组件通过 props 和回调连接业务。部分 Chat / Studio 组合组件需要配置服务适配器，由应用提供模型调用、项目持久化和媒体处理等能力。文档中的完整场景用于展示组合效果，这些服务行为使用本地模拟。

## 运行文档

文档站提供组件预览、可复制示例、属性说明和主题配置，以及聊天工作台、专业编辑器、项目管理、应用设置、模板与技能库五个完整场景。

克隆仓库后，在根目录执行：

```bash
npm ci
npm run build
npm run dev
```

打开 **<http://127.0.0.1:5178/#/start>**。

源码开发需要 Node.js 22.12+、npm 和 `tar`；完整验证还需要 Python 3。推荐使用 `.nvmrc` 指定的 Node.js 22。首次构建会自动生成组件库、Skill 安装包及文档下载资源，无需 npm 登录或 Docker。

后续开发可直接运行 `npm run dev`。修改公开 API 或文档示例后，执行 `npm run docs:generate` 更新文档数据。

## 开发与验证

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动文档开发服务器 |
| `npm run prepare:docs` | 生成本地安装包、API 文档和下载资源 |
| `npm run pack:lib` | 构建并打包当前组件库 |
| `npm run build` | 构建组件库、Skill 与静态文档站 |
| `npm run check` | 执行组件测试、包消费、文档示例和 Skill 安装器检查 |

提交前执行 `npm run build` 和 `npm run check`。检查覆盖类型声明、ESM 导入、SSR、浏览器构建与文档示例编译；界面交互还需在浏览器中验证，具体要求见 [贡献指南](./CONTRIBUTING.md)。

需要在其他项目中试用尚未发布的修改时，运行 `npm run pack:lib`，将 `artifacts/` 中生成的组件库 tgz 复制到目标项目，再通过 `npm install ./vendor/实际文件名.tgz` 安装。

<details>
<summary>源码目录</summary>

| 目录 | 内容 |
| --- | --- |
| `src/components/primitives/`、`src/agent/` | 基础与 Agent 组件 |
| `src/chat/`、`src/studio/`、`src/engine/` | 聊天、编辑器与浏览器算法 |
| `src/library/`、`src/styles/` | 公开入口、Provider 与样式 |
| `src/docs/`、`src/demo/` | 文档、组件示例和场景预览 |
| `public/demo-film/` | 本地演示素材 |
| `packages/` | npm 包配置与安装器源码 |
| `skills/auricui/` | Skill 指南、示例、工具与上游参考快照 |
| `scripts/` | 构建、检查与发布脚本 |

构建产物位于 `dist/`、`artifacts/` 等目录，由脚本生成，不提交到 Git。

</details>

## 部署与发布

文档站构建产物位于 `dist/`，可使用仓库中的 [Dockerfile](./Dockerfile) 制作静态站点镜像。镜像构建、推送与服务器更新步骤见 [部署说明](./deploy/README.md)。

<details>
<summary>维护者：发布 npm 包</summary>

修改完 `skills/auricui/` 中的指南和示例后，可使用 Skill 维护工作流：

```bash
# 同步组件索引和示例、构建安装包与文档、执行全部检查
bash scripts/maintain-skill.sh

# 检查通过后递增 Skill 版本、发布 npm，并更新本机 Codex Skill
bash scripts/maintain-skill.sh --publish --install-global
```

仅在本机试用时使用 `--install-global`，不加 `--publish`。脚本不会自动编写缺失的组件教程；可用参数和失败恢复方式见 [Skill 维护流程](./CONTRIBUTING.md#skill-维护流程)。

组件库及组合发布命令：

```bash
npm run release -- --dry-run # 校验组件库发布流程，不上传
npm run release             # 递增版本并发布组件库
npm run release:skill       # 递增版本并发布 Skill
npm run release:all         # 发布两者
```

单独发布 Skill 前先执行 `npm run prepare:docs`。实际发布需要对应的 npm 权限；组件库预览版本使用 `next` 标签，Skill 使用 `latest` 标签。日常构建和 CI 只生成产物并运行检查。

</details>

## 参与贡献

欢迎反馈使用问题、改进文档与可访问性，或提交组件修复。开始前请阅读 [贡献指南](./CONTRIBUTING.md)，了解开发流程、验证要求和提交范围。

## 许可与致谢

AuricUI 采用 [MIT License](./LICENSE)。部分 Chat / Studio UI 与浏览器算法来自 OpenFilm，保留其 [原始 MIT 许可证](./OPENFILM-LICENSE)。感谢 OpenFilm 及相关开源项目的贡献。

字体、服务商图标及其他依赖的来源和许可见 [第三方声明](./THIRD-PARTY-NOTICES.md)。
