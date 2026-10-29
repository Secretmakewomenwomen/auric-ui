# 原始模块覆盖清单

共 101 个导出模块（含业务页面、上下文和复合控件，不等同于通用组件数量）。

已移植 89 · 已适配 12 · 部分完成 0 · 待接入 0

“已移植”表示源码及展示入口已接入，不代表已经完成像素对比验证。来源模块对应原有 47 个案例和 5 个完整场景；新增 Agent 与基础组件另见 README。业务服务使用明确标识的本地演示适配器。

| 模块 | 状态 | 示例入口 | 说明 |
| --- | --- | --- | --- |
| chat/AddSkill.tsx | 已适配 | scene-chat | 保留完整预览、安装和取消界面；通过 ChatServices 接入技能服务。 |
| chat/AgentActivityRow.tsx | 已移植 | activity | — |
| chat/AgentIcons.tsx | 已移植 | model | — |
| chat/AttachmentCard.tsx | 已移植 | attachment | — |
| chat/AttachmentPreview.tsx | 已移植 | attachment | — |
| chat/BalanceNotice.tsx | 已移植 | balance | — |
| chat/BrandLogo.tsx | 已适配 | scene-chat | 保留尺寸与布局，替换为目标产品 AuricUI 标识。 |
| chat/ComposerCard.tsx | 已移植 | notice, question | — |
| chat/ConversationSessionBar.tsx | 已移植 | sessionbar | — |
| chat/CopyDiagnostics.tsx | 已适配 | scene-chat | 通过 ChatServices 注入诊断复制。 |
| chat/Divider.tsx | 已适配 | scene-chat | 通过 ChatServices 注入列宽更新。 |
| chat/FileChangesList.tsx | 已移植 | filechanges | — |
| chat/Markdown.tsx | 已适配 | markdown, activity | 原解析与渲染；Studio 引用通过本地 context 和回调适配。 |
| chat/ModelPopover.tsx | 已适配 | model | 原菜单交互和样式；用 ModelOptionsProvider 替换桌面状态与服务。 |
| chat/NoticeCard.tsx | 已移植 | notice | — |
| chat/Popover.tsx | 已移植 | model | — |
| chat/PreviewFrame.tsx | 已移植 | attachment | — |
| chat/ProjectConversation.tsx | 已适配 | scene-chat | 原对话渲染、缓存与流式更新；进度读取和桌面操作通过可注入服务提供。 |
| chat/ProjectStarters.tsx | 已移植 | scene-chat | — |
| chat/prompt-editor/MentionMenuPlugin.tsx | 已移植 | composer | — |
| chat/prompt-editor/PromptEditor.tsx | 已移植 | composer | — |
| chat/prompt-editor/PromptPill.tsx | 已适配 | promptpill, composer | 保留原引用交互；补充服务端渲染所需的 hover store 快照。 |
| chat/prompt-editor/PromptReferenceNode.tsx | 已移植 | composer | — |
| chat/Tooltip.tsx | 已移植 | attachment, promptpill | — |
| chat/TurnLog.tsx | 已适配 | scene-chat | 原日志查看器；日志数据和文件定位通过 ChatServices 提供。 |
| chat/TurnQuestionCard.tsx | 已移植 | question | — |
| studio/AudioMeters.tsx | 已移植 | scene-editor | — |
| studio/BlockThumbs.tsx | 已移植 | scene-editor | — |
| studio/BlockWaveform.tsx | 已移植 | scene-editor | — |
| studio/BrandLoadingScreen.tsx | 已移植 | scene-editor | — |
| studio/BrandLogo.tsx | 已适配 | scene-editor | 保留尺寸与布局，替换为目标产品 AuricUI 标识。 |
| studio/Card.tsx | 已移植 | button, card | — |
| studio/ColorPicker.tsx | 已移植 | color | — |
| studio/ConfirmDialog.tsx | 已移植 | danger | — |
| studio/ContextMenu.tsx | 已移植 | context | — |
| studio/DesktopDialog.tsx | 已移植 | scene-editor | — |
| studio/ExamplesGallery.tsx | 已移植 | scene-gallery | — |
| studio/export/ExportCenter.tsx | 已移植 | scene-editor | — |
| studio/export/ExportTray.tsx | 已移植 | scene-editor | — |
| studio/FilmFullscreenBar.tsx | 已移植 | scene-editor | — |
| studio/FilmInspector.tsx | 已移植 | scene-editor | — |
| studio/FilmStageSelect.tsx | 已移植 | scene-editor | — |
| studio/FocusNav.tsx | 已移植 | global | — |
| studio/FontFamilyPicker.tsx | 已适配 | font | 原选择器；字体来源适配为浏览器本地可用字体检测。 |
| studio/FramePicker.tsx | 已移植 | scene-editor | — |
| studio/inspector-fields.tsx | 已移植 | number, slider, metric, inspector | — |
| studio/inspector-look.tsx | 已移植 | scene-editor | — |
| studio/InspectorPanel.tsx | 已移植 | scene-editor | — |
| studio/Launcher.tsx | 已移植 | scene-projects | — |
| studio/LayersPanel.tsx | 已移植 | scene-editor | — |
| studio/LiveTime.tsx | 已移植 | scene-editor | — |
| studio/MediaPool.tsx | 已移植 | scene-editor | — |
| studio/MediaPreview.tsx | 已移植 | scene-editor | — |
| studio/MenuSelect.tsx | 已移植 | select, inspector | — |
| studio/MgOutline.tsx | 已移植 | scene-editor | — |
| studio/OperationHistory.tsx | 已移植 | scene-editor | — |
| studio/PaneDivider.tsx | 已移植 | divider | — |
| studio/PasteAttrsDialog.tsx | 已移植 | scene-editor | — |
| studio/PlaybackMenu.tsx | 已移植 | scene-editor | — |
| studio/player-controls/controls-bar.tsx | 已移植 | scene-editor | — |
| studio/player-controls/transport.tsx | 已移植 | scene-editor | — |
| studio/Popover.tsx | 已移植 | popover | — |
| studio/ProjectCover.tsx | 已移植 | scene-projects | — |
| studio/ProjectHistoryControls.tsx | 已移植 | scene-editor | — |
| studio/ProjectLayoutMenu.tsx | 已移植 | scene-editor | — |
| studio/ProjectMenu.tsx | 已移植 | scene-editor | — |
| studio/ProjectsLibrary.tsx | 已移植 | scene-projects | — |
| studio/ProjectSources.tsx | 已移植 | scene-projects | — |
| studio/ProjectsView.tsx | 已移植 | scene-projects | — |
| studio/ProjectView.tsx | 已移植 | scene-editor | — |
| studio/PropertiesSection.tsx | 已移植 | scene-editor | — |
| studio/ResourceInspector.tsx | 已移植 | scene-editor | — |
| studio/SelectionToolbar.tsx | 已移植 | scene-editor | — |
| studio/settings/AgentsSection.tsx | 已移植 | scene-settings | — |
| studio/settings/CustomServices.tsx | 已移植 | scene-settings | — |
| studio/settings/DiagnosticsGroup.tsx | 已移植 | scene-settings | — |
| studio/settings/ModelsSection.tsx | 已移植 | scene-settings | — |
| studio/settings/ProviderMark.tsx | 已移植 | scene-settings | — |
| studio/settings/ProvidersSection.tsx | 已移植 | scene-settings | — |
| studio/settings/SettingsModal.tsx | 已适配 | settings, scene-settings | 完整设置页已接入；Agent、服务商、模型、快捷键和存储使用本地服务。 |
| studio/settings/SettingsSelect.tsx | 已移植 | select, settings | — |
| studio/settings/ShortcutsSection.tsx | 已移植 | scene-settings | — |
| studio/settings/StorageGroup.tsx | 已移植 | scene-settings | — |
| studio/settings/ui.tsx | 已移植 | input, switch, segmented, settings | — |
| studio/SkillsLibrary.tsx | 已移植 | scene-gallery | — |
| studio/SourcePreview.tsx | 已移植 | scene-editor | — |
| studio/SpendAsks.tsx | 已移植 | scene-editor | — |
| studio/StageMaskOverlay.tsx | 已移植 | scene-editor | — |
| studio/StageTransformFrame.tsx | 已移植 | scene-editor | — |
| studio/SubtitleInspector.tsx | 已移植 | scene-editor | — |
| studio/SubtitleOverlay.tsx | 已移植 | scene-editor | — |
| studio/SubtitleRow.tsx | 已移植 | scene-editor | — |
| studio/TabStrip.tsx | 已移植 | scene-editor | — |
| studio/timeline-head-extras.tsx | 已移植 | scene-editor | — |
| studio/Timeline.tsx | 已移植 | scene-editor | — |
| studio/TimelineMarkers.tsx | 已移植 | scene-editor | — |
| studio/Toast.tsx | 已移植 | toast | — |
| studio/Tooltip.tsx | 已移植 | tooltip | — |
| studio/UpdateButton.tsx | 已移植 | scene-editor | — |
| studio/ViewerBar.tsx | 已移植 | scene-editor | — |
| studio/WhatsNew.tsx | 已移植 | scene-editor | — |
