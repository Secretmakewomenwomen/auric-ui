# AI 交互与聊天

先接入根 Provider、全局 CSS 和 `.auricui-chat`。此入口中的 `CardButton`、`CardActions`、`Popover`、`Tooltip` 用于 Chat，和根入口同名组件导入时明确来源，必要时使用别名。

## 选组件

| 功能 | `auricui/chat` 公开导出 | 接入条件 |
| --- | --- | --- |
| 消息正文 | Markdown | `text` 字符串；流式生成时持续更新累积文本 |
| 输入 | PromptEditor | 必填属性见示例；Lexical 已由组件内部建立，无需外套 LexicalComposer |
| 行内引用 | PromptPill、PromptWithPills | PromptReference 数据；不是把路径字符串直接当引用对象 |
| @ 和 / 菜单 | PromptEditor 的 mentions / commands | providers 数据，回调与候选项类型从声明获取 |
| 模型菜单 | ModelPopover、ModelOptionsProvider | 必须提供 agents/options/value/onChange |
| 附件卡片内容 | AttachmentCardBody | icon/name/detail；用导出的 ATTACHMENT_CARD 常量或自有壳；没有名为 AttachmentCard 的导出 |
| 附件预览 | AttachmentPreview、AttachmentTypeIcon | 先查当前 props；文件上传由应用处理 |
| 工具活动 | AgentActivityList、StatusLine | items；没有名为 AgentActivityRow 的运行时组件 |
| 选择问答 | TurnQuestionCard | ask.question/options、onAnswer(text)、onSkip；关闭代表跳过 |
| 多步问答 | LocalAgentQuestionCard | questions、onDone；每题 id/header/question/multi/options，不猜结构 |
| 文件差异 | FileChangesList | changes；用 ComponentProps 推导未直接导出的 FileChange 类型 |
| 开场建议 | ProjectStarters | onPick/onAttach；配置/文案见声明 |
| 会话工具栏 | ConversationSessionBar | 显式 props；与会话路由/存储连接 |
| 完整会话 | ProjectConversation | ProjectVersion[]、TranscriptItem[]；不是通用 messages 属性 |
| 技能弹窗 | AddSkillDialog | 需要 ChatServices.skills |
| 诊断、日志、分栏 | CopyDiagnostics、TurnLogButton、Divider | 需要对应 ChatServices 实现 |

## 普通聊天的最小组合

复制 [ChatPanel.tsx](../assets/examples/ChatPanel.tsx) 和 [examples.css](../assets/examples/examples.css)，在一个根 `AuricUIProvider` 下使用。宿主传入 `reply(draft, signal)`，返回 `AsyncIterable<string>` 的文本增量。HTTP/SSE 协议解析、请求身份、历史和重试由目标应用现有数据层负责。示例支持发送、流式更新、停止、错误显示和卸载取消，不自带模型服务。

`PromptEditor` 不是受控 input：
- `defaultValue` 与初始 `references` 用于恢复草稿。`onChange` 给出 `{text, references}`，发送时保存二者。
- `text` 可能包含引用标记，不能直接删掉标记或丢弃 references。模型后端收到草稿后按业务解析引用。
- `onSubmit` 无参数，读取最新草稿；点击发送与键盘发送走同一函数。
- `setText` / `clear` 用于主动替换/清空；不要用 effect 在每次 onChange 后 setText。
- `contentClassName` 指向消费项目真实存在的 CSS；不依赖包替你生成任意 Tailwind 类。
- 文件粘贴通过 onPasteFiles，拖放和真实上传由宿主处理，不能把浏览器 File 伪装成磁盘路径。

## 模型、工具与问答

基线 ModelPopover 在 render 中读取 window，必须在客户端挂载后渲染。Next.js 等环境仅添加 use client 仍可能预渲染；附带 ChatControls 示例使用 mounted gate，也可用框架支持的禁用 SSR 方式。

[ChatControls.tsx](../assets/examples/ChatControls.tsx) 给出实际 props 的组合。自建模型服务用已支持的 `byok` agent 类型，模型 ID 放在其 options 中；不要随意给 LocalAgentId 添加未支持的字符串。模型选择回调只更新偏好，发送请求时宿主读取选中值并传给自己的后端。

问答回调应提交当前工具问题的答案，而不是自动追加新的用户消息。多步问答 onDone(null) 表示跳过；尊重后端的等待和取消状态。工具步骤区分 pending/完成，错误与取消在宿主数据层保留。

## 完整会话接入

确实需要项目型完整会话时读取 `ProjectConversation`、`ProjectVersion`、`TranscriptItem`、`ChatServices` 声明。

- `turns` 中每条必需 assetId/label/title/prompt/attachments/status/current；assetId 用全局唯一的轮次 ID，组件内部历史缓存以其为键。
- 活跃轮次同时设置 liveAssetId、liveTranscript、liveActive、liveActivity；TranscriptItem 至少含 id/kind/pending，文本项另有 text。
- 已完成历史可在客户端挂载前调用 `primeStoredTranscript(assetId, items)`，或提供 `/api/turns/:assetId/progress` 的原协议响应。组件不接收任意 OpenAI messages 或任意 SSE 事件；先在应用中适配。
- 外层使用 `ChatProjectContext.Provider value={projectId}` 和 `DeveloperContext.Provider value={{logs, changes}}`。
- `configureChatServices(services)` 在客户端初始化时调用；它是模块级单例，不能在 SSR 中按不同用户写入共享凭据。多应用实例应谨慎管理生命周期，不在每次 render 覆盖服务。

| 服务 | 使用场景 |
| --- | --- |
| fetch | 历史进度等 HTTP 协议；必须返回 Response，不是普通 JSON 对象 |
| chat.log / chat.reveal | 日志读取与打开；log 可返回完整日志、same 或 null |
| skills.preview / previewFolder / commit / discard | 技能预览、安装及取消清理，返回声明中的判别联合 |
| copyDiagnostics | 返回 `{ok:boolean}` |
| revealPath / pathForFile | 文件定位；浏览器环境由目标应用决定支持方式 |
| setChatWidth | 分栏宽度即时预览与提交 |

`ChatServices` 没有通用 sendMessage 方法。发起模型请求和流式状态转换仍由宿主实现。未实现的功能应在 UI 中禁用或明确提示，不返回虚假成功。所有服务字段的完整类型可通过 API 工具离线读取。
