# AuricUI Skill

为编码 Agent 安装 AuricUI 组件库指南，包括 API 查询、基础组件、Agent / Personal Agent、AI 聊天、Studio、主题动画、依赖检查和可编译示例。需要 Node.js >=20.19；附带的依赖/API 检查工具使用 Python 3 标准库。

此 npm 包是 Skill 安装器，React 组件库本身为 `auricui`。安装器只复制技能文件；在应用中安装 UI 库由 Agent 按 Skill 指南完成。

发布本包之后，可执行：

```bash
# 当前项目：.agents/skills/auricui
npx auricui-skill@latest

# Codex 全局：CODEX_HOME/skills，未设置时为 ~/.codex/skills
npx auricui-skill@latest --global

# 其他支持 SKILL.md 的 Agent：传入其实际技能目录
npx auricui-skill@latest --dir ./my-agent-skills

# 更新现有安装，自动备份旧版本
npx auricui-skill@latest --global --update

# 仅查看路径
npx auricui-skill@latest --dry-run
```

自定义目录参数表示技能的父目录，安装器会追加 `auricui`。已有目录默认不覆盖；`--update` 的备份位于 skills 父目录下的 `.auricui-skill-backups/`，终端会输出确切位置。符号链接目标不会被覆盖。

安装后刷新 Agent 技能列表或新开会话，使用 `$auricui`；不支持自动扫描技能的 Agent 可显式读取安装目录中的 SKILL.md。参数查询优先使用目标项目的安装包；附带基线版本见 Skill 内的 `references/library-manifest.json`。

包含的源参考快照和本地组件包保留 MIT 与第三方许可；详见 Skill 内来源资料和组件包的 LICENSE / THIRD-PARTY-NOTICES.md。

## 按需读取

Skill 入口只保留关键约束和任务路由。Agent 先搜索组件，再读取单个组件及其关联类型，必要时再取一个 TSX 示例或对应的服务指南。无需预先加载全部 API、示例或上游快照。

`inspect_api.py` 支持 `--search`、`--limit/--offset`、`--symbol` 和 `--example`；参数来自目标安装包，示例来自 Skill 基线，版本不同时会提示核对。`--full` / `--file` 用于确有需要时展开完整声明。完整 Chat/Studio 服务资料按场景独立读取；不保证上下文零消耗，也不会自动实现真实后端。
