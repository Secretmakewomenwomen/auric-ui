---
name: auricui
description: 使用 AuricUI React 组件库开发或修改界面，按需查询组件参数、示例、主题与服务接入。用户指定 AuricUI 或其组件入口时使用。
---

# AuricUI

先确认目标项目已安装的版本。以其公开导出和类型声明为准，附带示例仅对应 Skill 的组件库基线。下面路径均相对本 Skill；脚本使用 Python 3 标准库。

## 按需查询

只把当前任务需要的组件信息带入上下文。先搜索，再查询选中的组件；需要实现参考时才读取单个示例。不要一次读取整个 API 索引、所有指南或上游源码，也不需要先阅读查询脚本源码。

```bash
# 不确定组件名：搜索返回有限条目，可用 --offset 翻页
python3 <Skill目录>/scripts/inspect_api.py --search 表格 --project <项目目录>
# 已知组件名：只读该组件与关联类型
python3 <Skill目录>/scripts/inspect_api.py --entry core --symbol Table --project <项目目录>
# 需要代码时再取一个示例
python3 <Skill目录>/scripts/inspect_api.py --entry core --symbol Table --example --project <项目目录>
```

入口选择：基础控件 `core`；消息/工具/记忆 `agent`；富文本聊天 `chat`；时间轴/项目编辑 `studio`；本地模拟服务 `demo`。复杂类型仍不明确时，按输出中的声明路径继续查；详细查询选项见 [查询指南](references/query.md)。

## 必要约束

- React 19、ESM；全局导入一次 `auricui/styles.css`，应用根挂载一次 `AuricUIProvider`。Chat 内容放进 `.auricui-chat`。
- 普通按钮是 `CardButton`，输入框是 `SettingsField`；不要猜测组件名或 props。只从公开入口导入。
- 基础/Agent 组件通过 props 和回调接业务；完整 Chat/Studio 页面可能依赖服务协议。本地演示不能代替真实模型、保存或导出服务。
- 沿用用户项目的框架与业务，完成后运行相关检查；UI 变更验证实际交互，说明未验证项。

## 需要时才读

| 当前问题 | 读取资料 |
| --- | --- |
| 首次安装、缺依赖、SSR 或主题入口 | [安装接入](references/esm-package.md) |
| 普通表单、设置或表格的交互约定 | [基础组件](references/core-components.md) |
| Agent 状态、操作确认、个人助手 | [Agent 组件](references/agent-components.md) |
| 输入、流式回复、模型选择 | [聊天组件](references/chat-components.md) |
| 项目型完整会话的服务与历史 | [聊天服务](references/chat-services.md) |
| 编辑器、媒体、时间轴或本地演示 | [Studio 组件](references/studio-components.md) |
| 改颜色、焦点或动画 | [主题动效](references/theme-motion.md) |
| 安装/渲染报错；交互验收 | [排错](references/troubleshooting.md)；[验收](references/verification.md) |

只有修改库源码或移植上游实现时才读 [集成规范](references/integration.md)、[来源索引](references/components.md)。`assets/upstream/` 是历史参考快照，不是当前包的 API 依据。
