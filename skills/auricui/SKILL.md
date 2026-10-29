---
name: auricui
description: 使用 auricui React 组件库开发深色应用、设置面板和 AI 聊天界面；提供组件选择、准确的 props、主题与动画、服务适配和安装排错。用户提到 AuricUI、auricui/agent、auricui/chat、auricui/studio，或要求沿用这套视觉系统时使用。
---

# AuricUI

以已安装的 `auricui` 成品包开发应用。文档和可编译示例基于 `0.1.0-preview.4`；版本不同时，以安装包的 `package.json`、`exports` 和 `.d.ts` 为准。所有附带路径相对于本 Skill，跨项目使用不需要原开发仓库。

## 工作流程

1. 确认目标前端包目录、包管理器、框架与 AuricUI 版本。运行 `python3 <Skill目录>/scripts/check_dependencies.py --project <前端目录>`，默认检查成品包；新项目先建立 package.json。
2. 读取 [安装与接入](references/esm-package.md)。当前包要求 React 19 + React DOM 19 与 ESM；TypeScript、Tailwind 是消费方选项。保持用户指定的技术栈，不为通过检查擅自升级框架。
3. 按下表阅读相关资料，确认真实导出和 props 再写 JSX。优先组合已有组件，库未提供的功能在应用侧实现。
4. 接入 CSS、主题与 Portal，编写需要的状态和业务回调。
5. 完成目标项目类型检查、构建和所用组件的交互验证。静态检查不代替浏览器验收；没有运行环境时说明未验证项。

## 按任务阅读

| 任务 | 资料 |
| --- | --- |
| 安装、入口、React/SSR、全局样式 | [esm-package.md](references/esm-package.md) |
| 按钮、表单、设置、弹窗、颜色和数字字段 | [core-components.md](references/core-components.md) |
| Agent 消息、工具执行、记忆、简报与个人助手 | [agent-components.md](references/agent-components.md) |
| AI 聊天、富文本、模型菜单、附件、工具和问答 | [chat-components.md](references/chat-components.md) |
| 项目、时间轴、媒体、专业编辑器 | [studio-components.md](references/studio-components.md) |
| 配色、字体、层级、Portal、动画 | [theme-motion.md](references/theme-motion.md) |
| 依赖分类、检查结果 | [dependencies.md](references/dependencies.md) |
| 安装失败、缺失导出、样式和接口问题 | [troubleshooting.md](references/troubleshooting.md) |
| 视觉和交互验收 | [verification.md](references/verification.md) |

## 查 API，而不是猜 API

只读工具优先读取目标项目声明，未安装时从附带 tgz 读取：

```bash
python3 <Skill目录>/scripts/inspect_api.py --entry core --symbol CardButton --project <前端目录>
python3 <Skill目录>/scripts/inspect_api.py --entry chat --symbol PromptEditor --project <前端目录>
python3 <Skill目录>/scripts/inspect_api.py --entry agent --symbol MemoryCard --project <前端目录>
python3 <Skill目录>/scripts/inspect_api.py --entry studio
```

无 `--symbol` 时列出入口导出。工具基于 [API 索引](references/api-index.json)，区分运行时和 type-only 导出；版本不同则沿安装包入口的 `export *` 检查当前声明，不把基线索引当成新版契约。

附带可复制并经过编译检查的示例：
- 主题和新增组件：`assets/examples/Theme.tsx`、`Drawer.tsx`、`Tree.tsx`、`MessageList.tsx`、`ToolCall.tsx`、`MemoryCard.tsx` 等，均使用公开导出。
- [BasicApp.tsx](assets/examples/BasicApp.tsx)：应用根、表单、设置、确认弹窗和 Toast。
- [ChatPanel.tsx](assets/examples/ChatPanel.tsx)：消息、输入、发送/取消与流式响应，通过 `reply` 注入业务请求。
- [ChatControls.tsx](assets/examples/ChatControls.tsx)：模型选择、单步/多步问答、工具活动和文件差异。
- [examples.css](assets/examples/examples.css)：示例布局，不依赖 Tailwind 编译。

## 保持组件契约

- 全局导入一次 `auricui/styles.css`；首屏 HTML 设置 `data-theme="dark"`；应用根只挂载一个 `AuricUIProvider`；Chat 内容放在 `.auricui-chat` 内。
- `CardButton` 用 `weight="primary"`，`SettingsButton` 用 `variant="primary"`。`Button`、`Input`、`Modal`、`AttachmentCard` 不是该版本对应的公开组件名。
- `PromptEditor.defaultValue` 只在挂载时读取。程序修改用 ref 的 `setText` / `clear`，不要每次 render 回写内容。
- `ModelPopover` 必须在 `ModelOptionsProvider` 内；宿主负责模型目录、选择和持久化。
- CSS 包含字体、关键帧和组件样式。应用自己新增的任意 Tailwind 类不由预编译包保证，需要自己的 CSS 或 Tailwind 构建。
- 组件不会自动调用模型。完整 Chat/Studio 页面的服务接口按任务接入，不把演示数据当生产后端。
- 保留目标业务和信息架构，复用尺寸、色彩、焦点、禁用状态和动效；不宣称未验证的 100% 像素匹配。

## 源码适配

需要修改库实现时才读取 [集成规范](references/integration.md) 和 [来源索引](references/components.md)。`assets/library/` 是独立可安装包；`assets/upstream/` 是保留来源名称的原始参考快照，包含业务耦合，并非当前成品包的等价源码。以成品包声明和行为为基准，保留 MIT 与第三方署名。源码依赖检查显式使用 `--mode source`。
