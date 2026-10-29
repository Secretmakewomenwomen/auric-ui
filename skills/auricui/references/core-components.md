# 基础组件与设置

从 `auricui` 导入。完整 props 使用 `inspect_api.py` 查看；以下是选择组件与避免 API 混用的要点。

| 需求 | 导出名 | 关键契约 |
| --- | --- | --- |
| 按钮 | CardButton | `weight`: primary / secondary / quiet / danger；其余为原生 button 属性，默认 type=button |
| 卡片 | Card、CardActions | Card 必须有 title；body、icon、onClose 可选 |
| 文本输入 | SettingsField | 原生 input 属性；onChange 接收 event，用 e.target.value |
| 开关 | SettingsSwitch | checked、label、onChange(boolean)，不是 event |
| 分段选项 | SettingsSegmented | label、value、options、onChange(value) |
| 设置下拉 | SettingsSelect | options 是 value/label；onChange(value) |
| 分组/预览下拉 | MenuSelect | groups 中放 choices；onPick(value)，可选 onPreview/onRevert |
| 设置壳 | SettingsDialog | open、onClose、pages；页面定义为 id/title/group/icon/content |
| 设置排版 | SettingsPage、SettingsGroup、SettingsItem | 行标题和说明放左侧，control 放右侧 |
| 设置按钮 | SettingsButton | variant: default / primary / quiet，与 CardButton 不同 |
| 确认弹窗 | ConfirmDialog | open/title/onConfirm/onCancel；危险操作 danger；父组件负责关闭和异步状态 |
| 通用浮层 | Popover | 受控 open/onOpenChange；trigger、children；自身不绘制卡片皮肤 |
| 右键菜单 | ContextMenu | x/y/items/onClose；父组件阻止原生 contextmenu；支持 separator 和 submenu |
| 悬浮提示 | Tooltip | label/shortcut/side；单个 child 必须可接收 ref 和鼠标事件 |
| 提示消息 | useToast、Toast | toast.show/showError；渲染 `<Toast toast={toast.current} />` |
| 颜色选择 | ColorPicker | value/onPreview/onCommit/onClose，preview 不等于保存 |
| 数字/滑块 | NumField、SliderField | 先读声明；区分 onPreview/onCommit/onRevert，保留单位与多选 Mixed 语义 |
| 属性分组 | Section、Row、SubLabel | 编辑器密度控件，不能套普通表单大尺寸覆盖 |

`CardButton` 没有 `primary` 布尔属性，也没有 `loading`、`size`、`variant` API。加载时由宿主渲染文字/图标，结合 `disabled` 与 `aria-busy`。默认主按钮是 `--text` 背景配 `--panel` 文字，并非蓝底。

设置面板可直接使用 [BasicApp.tsx](../assets/examples/BasicApp.tsx)。`SettingsDialog` 提供壳和页面导航，页面内容由应用提供。`SettingsModal` 是 `auricui/studio` 的专业业务设置页面，需要服务适配，不用于代替普通设置壳。

通用浮层使用 `Popover` 包含 `Card` 或带 `POPOVER_CHROME` 的面板。不要从 npm 导入演示工程私有的 `Modal`；包中也没有通用 `Button` / `Input` 别名。列表、表格、路由等需求先查真实导出，缺失时用已有控件和原生语义元素组合，不要虚构组件。

## preview.3 新增的基础组件

以下现在是 `auricui` 的正式导出，不需要复制展示站的原生 HTML 配方：

- Checkbox：原生表单属性、`label`、`indeterminate`、`onCheckedChange`；三态时由应用计算 `checked` 和 `indeterminate`。
- RadioGroup：`options`、`value/defaultValue`、`onValueChange`；原生 radio 键盘与表单语义。
- Drawer：受控 `open/onOpenChange`、四个 `side`、`size`、footer；body Portal、进出动画、焦点约束、焦点恢复和滚动锁。
- Tree：稳定唯一的 node.id；`value/onValueChange` 与 `expanded/onExpandedChange` 独立控制；单选，支持方向键及键入查找。不提供异步加载、多选或虚拟化。
- Combobox：`value/onValueChange`、`options`、`label`；客户端过滤与键盘选择。大列表或远端搜索需要宿主另行实现。
- Tabs：items 包含 value/label/content；支持键盘切换，保留隐藏面板状态。
- Textarea、Progress（无 value 时不定进度）、Skeleton、EmptyState、Avatar、Breadcrumb、Pagination。

通过 `inspect_api.py --entry core --symbol Drawer` 等命令读取准确属性。可运行示例：`assets/examples/Drawer.tsx`、`Checkbox.tsx`、`Tree.tsx`、`Combobox.tsx`。使用 CSS 变量，不需要安装额外 headless 或动画库。
