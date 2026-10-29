# 来源与第三方声明

AuricUI 包含原创组件，以及从 OpenFilm 复制、整理和修改的 UI 与浏览器算法。仓库整体采用 [MIT License](./LICENSE)，各第三方内容保留其原有许可证和署名。

| 内容 | 来源与许可 | 仓库中的说明 |
| --- | --- | --- |
| Chat / Studio UI、编辑器相关算法及上游参考快照 | OpenFilm，MIT | [原始许可证](./OPENFILM-LICENSE)；`skills/auricui/assets/upstream/` 保留上游文件和许可证 |
| Inter 字体 | `@fontsource-variable/inter`，SIL Open Font License | [字体许可证](./packages/auricui/INTER-LICENSE) |
| 服务商图标 | Simple Icons、Lobe Icons 及上游标注的厂商 favicon | [包内来源说明](./packages/auricui/THIRD-PARTY-NOTICES.md)、[Lobe Icons 许可证](./packages/auricui/LOBE-ICONS-LICENSE) |
| React、React DOM、Lucide、Lexical、Yjs 等依赖 | 各依赖各自的许可证 | 版本由 `package-lock.json` 固定，许可证随依赖分发 |

AuricUI 的修改包括公开包入口、通用组件、主题与样式、服务适配、文档、演示和构建工具。上游来源代码的版权不因这些修改而改变。服务商名称与图标用于标识对应服务，不代表其对 AuricUI 的背书。

提交新的代码、字体、图片、图标或示例素材时，请记录来源，并附上相应许可证；不要删除已有署名。
