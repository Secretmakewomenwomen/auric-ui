# Studio 专业组件

入口 `auricui/studio` 面向专业项目和媒体编辑。普通设置页使用根入口 SettingsDialog，普通聊天优先组合 chat 控件。

| 场景 | 可查的公开组件 |
| --- | --- |
| 项目管理 | ProjectsView、ProjectsLibrary、ProjectSources、ProjectCover |
| 编辑器 | ProjectView、Timeline、LayersPanel、InspectorPanel |
| 字幕 | SubtitleInspector、SubtitleOverlay、SubtitleRow |
| 素材预览 | MediaPool、MediaPreview、SourcePreview、BlockThumbs、BlockWaveform |
| 控制/历史 | PlayerControlsBar、OperationHistory、ProjectHistoryControls（名称以 API 索引为准） |
| 设置 | SettingsModal、AgentsSection、ModelsSection、ProvidersSection |
| 模板技能 | ExamplesGallery、SkillsLibrary |
| 导出 | ExportCenter、ExportTray |

先查询准确名称和 props：`inspect_api.py --entry studio`。目录中某个组件名不意味着能脱离项目上下文直接渲染。

客户端挂载业务组件之前配置 `configureStudioTransport({fetch, subscribe})`；`fetch` 返回 Response，`subscribe(path, onEvent)` 返回取消订阅函数。未配置时沿用原 `/api/...` 后端约定。只把 URL 换成自己的接口地址还不够，需适配组件实际请求和响应结构。

`configureStudioHost(host)` 接入 Agent、窗口、文件定位、项目引用和原生能力；host 必须满足 `StudioHost`，只实现确有支持的可选能力。使用 `configureStudioHost(null)` / `configureStudioTransport(null)` 可恢复默认，但不要在另一实例仍使用时重置单例。

`Film`、`Clip`、`Track`、`Project`、`Op` 可从此入口作为类型导入；沿组件声明定位其他内部类型，使用 `ComponentProps<typeof Component>` 推导，避免越过 exports 深层导入。

视频舞台需要可访问的媒体和兼容的 film/preview iframe 消息协议。导出组件展示和控制后端任务，不在组件库内编码视频。本地原型可按需使用独立入口 `auricui/demo` 的 `createStudioDemo()`；它提供内存项目、模拟宿主与 Blob 素材，刷新后数据重置，不提供真实导出、模型或磁盘服务。卸载时需调用 `dispose()`，并由唯一的服务拥有者清理 Studio 的全局适配器。


## 按任务继续读取

- 仅实现时间轴或图层：先查询 `Timeline` / `LayersPanel` 的 props，再用 `--example` 读取各自的局部交互示例；不要先加载完整编辑器协议。
- 使用本地演示服务：查询 `inspect_api.py --entry demo --symbol createStudioDemo`，需要初始化示例时加 `--example`。
- 连接业务 transport：先读 [Studio 服务边界](studio-services.md)，再只查询当前功能需要的服务类型。
