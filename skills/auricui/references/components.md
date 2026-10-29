# 组件索引

以下路径相对于 assets/upstream。S = packages/openfilm/studio/ui/src，C = apps/desktop/chat/src。选择相关组件读取，沿 import 查找依赖；不要把全部业务代码复制进新项目。

| 场景 | 来源 |
| --- | --- |
| 卡片、按钮权重、浮层阴影 | S/components/Card.tsx |
| 确认、危险操作、备选操作弹窗 | S/components/ConfirmDialog.tsx |
| 桌面说明、属性粘贴弹窗 | S/components/DesktopDialog.tsx、PasteAttrsDialog.tsx |
| 设置弹窗、分组、输入、开关 | S/components/settings/SettingsModal.tsx、ui.tsx、SettingsSelect.tsx |
| 锚定浮层、视口适配、关闭逻辑 | S/components/Popover.tsx；聊天用 C/components/Popover.tsx |
| 提示气泡 | S/components/Tooltip.tsx；聊天用 C/components/Tooltip.tsx |
| 右键菜单、菜单选择 | S/components/ContextMenu.tsx、MenuSelect.tsx、ProjectMenu.tsx |
| Toast、通知、问答卡 | S/components/Toast.tsx；C/components/NoticeCard.tsx、TurnQuestionCard.tsx |
| 布局、面板、分隔拖动、标签 | S/components/ProjectView.tsx、PaneDivider.tsx、TabStrip.tsx；C/components/Divider.tsx |
| 输入、颜色、字体、属性分组 | S/components/inspector-fields.tsx、ColorPicker.tsx、FontFamilyPicker.tsx、PropertiesSection.tsx |
| 聊天输入、附件、富文本 | C/components/ComposerCard.tsx、AttachmentCard.tsx、prompt-editor/ |
| Markdown、工具调用、活动展示 | C/components/Markdown.tsx、TurnLog.tsx、AgentActivityRow.tsx |
| 列表、素材卡、空状态 | S/components/ProjectsLibrary.tsx、MediaPool.tsx、Launcher.tsx；C/components/ProjectStarters.tsx |
| 加载、全局键盘焦点 | S/components/BrandLoadingScreen.tsx、FocusNav.tsx |
| 字幕局部 CSS | S/components/SubtitleInspector.module.css |

ConfirmDialog 基准：遮罩 black/45、blur 2px、z-index 10100、最大宽 420px；Popover 默认层级 10000、触发间隔 6px、视口 padding 12px。具体上下文可能覆盖这些值。保留源码的测量、滚动监听、事件捕获与焦点恢复，再按目标应用的可访问性需求补充；不要声称原组件必然包含完整 focus trap。
