# Studio 服务边界

只在接入项目型 Studio 页面时读取；时间轴、图层的局部示例不要求先实现完整服务。先查询当前使用的组件和 `configureStudioTransport` / `StudioHost` 类型。

## 三种数据

- `projectId` 是应用提供的稳定项目标识。`ProjectView` 用它读取项目、文件和编辑记录，不是 URL 或凭据。
- transport 接管数据请求与事件。`fetch(input, init)` 返回标准 `Response`；`subscribe(path, onEvent)` 返回取消订阅函数，事件传解析后的对象。省略订阅适配会使用组件内置的 WebSocket 路径。
- host 是应用能力与交互回调，如打开文件、引用片段、面板与窗口行为。`StudioHost` 必须有 `version: 1`；仅实现确实支持的可选能力。host 不是后端域名。

配置为模块级单例。由一个客户端根统一配置和清理；不要在每次渲染时覆盖，也不要在 SSR 中按用户写入共享凭据。只有拥有这组服务的根卸载时才重置；媒体 Blob 的释放由创建方负责。

## 项目编辑的核心请求

以下是当前源码的核心约定，不是所有子面板的完整后端清单。响应通过 JSON 返回；失败时使用非 2xx 状态与 `{ "error": "可读说明" }`。

| 请求 | 用途与数据 |
| --- | --- |
| `GET /api/projects` | 返回 `{projects: Project[]}` |
| `GET /api/projects/:id` | 返回 `{project, folder, text, rev, value, doc, problems}`；value/doc 为 Film 或 null |
| `GET /api/projects/:id/files` | 返回 `{files, folders, pages}` |
| `GET /api/projects/:id/settings` | 返回 `{settings: ProjectSettings}` |
| `POST /api/projects/:id/edit` | 请求 `{base, ops}`；响应 `{text, rev, value, doc, rebased}` |

`text` 为项目 Film 文本；`rev` 为版本标识，编辑请求的 `base` 用于冲突处理。Film 中的片段时间按秒表达，部分播放/UI 接口使用毫秒，按具体属性声明换算。`Op` 用稳定片段 ID 操作，不把数组下标当成 ID。

文件夹、服务商、技能、字幕、历史和导出面板还有各自的服务请求。先确认当前组件实际需要的能力，缺失时不提供虚假成功。完整接口实现不能仅通过改一个 base URL 完成；若现有后端契约未知，应先收集契约或选择只依赖 props 的组件。

## 事件与媒体

项目事件订阅路径为 `projects/:id/events`（传给 subscribe 时不带 `/api/`）。如 `{type:'film', rev}` 通知项目更新，`{type:'files', paths?}` 通知素材更新；先按所使用功能接入对应事件与取消订阅。

原生 img/audio/video/iframe 的加载不会经过 transport.fetch。需要改写资源地址时配置 `resolveAssetUrl(url)`，身份验证使用目标应用支持的 Cookie 或签名 URL；不能假设 fetch 的自定义请求头会自动附加给媒体标签。预览 iframe 还需兼容 Film 预览消息协议，不是任意 HTML 都能作为编辑器舞台。

## 仅做本地演示

使用 `auricui/demo` 的 `createStudioDemo()`，将其 transport 与 host 交给配置函数，使用返回的 projectId。只读取初始化示例：

```bash
python3 <Skill目录>/scripts/inspect_api.py --entry demo --symbol createStudioDemo --example
```

这个示例在浏览器内存中维护项目，导出和宿主行为为模拟。它不能证明真实后端接入完成。完整应用集成时替换模拟服务并单独验收保存、事件、媒体与失败状态。
