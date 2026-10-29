# 项目型聊天服务

只在任务需要完整会话或宿主服务时读取。先按需查询 `ProjectConversation` 与 `ChatServices`，不要一次展开全部 Chat 类型。

## 接入约定

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
