# Changelog

## 0.1.0-preview.3 — 2026-10-29（本地预览，未发布）

新增 `auricui/agent`，提供 30 个可组合组件：MessageBubble、MessageActions、CodeBlock、Citation、ResponseSwitcher、ContextUsage、Suggestion、ThinkingIndicator、ReasoningDisclosure、AgentStatus、ToolCall、TaskSteps、ApprovalCard、AttachmentChip、SourceList、AgentCard、RunSummary、ArtifactCard、PromptTemplate、ConversationList、Checkpoint、MessageList、MemoryCard、GoalCard、ScheduleCard、ConnectorCard、ProactiveSuggestion、ActivityTimeline、AutonomyControl、BriefingCard。

根入口增加 13 个正式基础组件：Drawer、Checkbox、RadioGroup、Tree、Combobox、Pagination、Textarea、Progress、Skeleton、EmptyState、Avatar、Breadcrumb、Tabs。其中 8 个替换文档中原先仅展示样式的配方。

动效统一使用 140 / 220 / 320ms 层级和减少动态效果降级；抽屉有退出动画、焦点约束、背景 inert 与焦点恢复，消息列表保留用户阅读位置。

文档重建为 82 个独立页面，支持搜索、复制导入/完整示例、生成的类型表、重放、移动预览和稳定链接。快速开始加入主题切换、CSS 变量、Chat / Portal 覆盖、SSR 首屏主题和动画配置。88 份复制示例通过独立 tarball 消费检查。

Lucide 升至 0.482.0，修复旧声明引用 ReactSVG 导致的严格类型检查错误。Skill 基线同步到 preview.3，新增 agent 入口查询与示例；安装器本地版本为 0.1.1。
