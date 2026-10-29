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

## 项目型完整会话

仅在接入 ProjectConversation、历史进度、技能安装、日志或分栏服务时，继续读取 [聊天服务](chat-services.md)。普通的消息和输入组合不需要加载这一部分。
