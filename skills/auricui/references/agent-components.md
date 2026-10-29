# Agent 与 Personal Agent

基线：`0.1.0-preview.4`。从 `auricui/agent` 导入，CSS 仍只导入一次 `auricui/styles.css`。这些组件不依赖 Chat Provider 或模型 SDK；宿主传入数据、维护状态并实现回调。

| 需求 | 组件 |
| --- | --- |
| 消息与滚动 | MessageBubble、MessageActions、MessageList、ResponseSwitcher |
| 内容与引用 | CodeBlock、Citation、SourceList、ArtifactCard、AttachmentChip |
| 输入辅助 | Suggestion、PromptTemplate、ContextUsage |
| 执行状态 | ThinkingIndicator、ReasoningDisclosure、AgentStatus、ToolCall、TaskSteps、RunSummary、Checkpoint |
| 会话与身份 | AgentCard、ConversationList |
| 操作确认 | ApprovalCard |
| 个人助手 | MemoryCard、GoalCard、ScheduleCard、ConnectorCard、ProactiveSuggestion、ActivityTimeline、AutonomyControl、BriefingCard |

先查询真实契约，例如：

```bash
python3 <Skill目录>/scripts/inspect_api.py --entry agent --symbol ToolCall --project <前端目录>
python3 <Skill目录>/scripts/inspect_api.py --entry agent --symbol MemoryCard --project <前端目录>
```

## 容易接错的行为

- MessageList 只在用户位于底部时跟随新增内容；用户向上阅读时保留位置。传入稳定的消息 key，不用随机 key 重建消息。
- ReasoningDisclosure 展示宿主提供的过程摘要，不生成模型内部思维链。ToolCall 的输入、输出、错误与执行状态也来自宿主。
- CodeBlock 复制原始字符串，默认没有语法着色；需要时通过 `renderLine` 接入项目的高亮器。
- Citation 仅接受 HTTP/HTTPS 来源，摘要使用 body Portal，支持 Escape、外部点击和视口边界。Portal 读取全局主题。
- ResponseSwitcher 索引从 0 开始；Pagination 的页码从 1 开始。ContextUsage 容量未知时传入无效 limit，会展示未知而不是编造百分比。
- ApprovalCard 的 `status` 来自应用；请求中传 `submitting`，完成后传 `approved` / `rejected`。回调不等同服务端授权。AutonomyControl 只是偏好选择器，权限仍由服务端执行。
- ScheduleCard 只展示 timezone / nextRun 并通知开关变化，不创建定时任务。ConnectorCard 不实现 OAuth。MemoryCard 的编辑/忘记回调不自动修改存储。
- ConversationList 的搜索值和筛选结果由宿主管理；PromptTemplate 字段和值受控，提交结果由应用消费。

独立可复制示例位于 `assets/examples/`：MessageList、ToolCall、ApprovalCard、MemoryCard、BriefingCard。示例动作仅改变演示状态，接入应用时替换为实际回调。
