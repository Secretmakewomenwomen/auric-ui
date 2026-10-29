export type StateExample = { example: string; title: string; description: string };

const state = (example: string, title: string, description: string): StateExample[] => [{ example, title, description }];
export const stateExamples: Record<string, StateExample[]> = {
  table: state('TableStates', '加载、空数据与固定表头', '在本地切换加载和空数据状态，体验紧凑行高、滚动与固定表头；此示例不请求后端。'),
  button: state('CardButtonStates', '提交中与禁用', '用 disabled 防止重复提交，配合 aria-busy 和结果文字提供反馈。此处保存请求为本地模拟。'),
  input: state('SettingsFieldStates', '校验、只读与禁用', '校验逻辑由应用控制。错误文字与 aria-describedby 关联；只读内容仍可选择和复制。'),
  switch: state('SettingsSwitchStates', '关闭、开启与锁定', '禁用状态保留当前值，并在旁边说明无法修改的原因。'),
  textarea: state('TextareaStates', '错误反馈与不可编辑状态', '填写后重新检查，错误会随有效内容消失；error 的显示优先于 description。'),
  radio: state('RadioGroupStates', '部分选项禁用与整组禁用', '可用选项仍支持键盘切换；整组禁用时保留选中状态。'),
  combobox: state('ComboboxStates', '空结果与暂不可用', '展开空数据可查看提示；输入不匹配关键词可查看搜索空结果。'),
  progress: state('ProgressStates', '零进度、完成与总量未知', '总量未知时省略 value，不用 0% 表示加载中。'),
  avatar: state('AvatarStates', '姓名与图片失败回退', '图片加载失败后回退到姓名首字母，辅助技术仍读取完整姓名。'),
  pagination: state('PaginationStates', '零页、单页与页码边界', '没有数据时禁用两个方向；到达首尾页后禁用相应按钮。'),
  empty: state('EmptyStateStates', '空数据、加载与请求失败', '切换列表状态，体验创建和重试操作；加载时保留内容结构。'),
  'tool-call': state('ToolCallStates', '失败后重试', '状态与工具执行由宿主管理。点击重试，再模拟成功或失败。'),
  'approval-card': state('ApprovalCardStates', '提交中、失败与最终决定', '提交期间暂时禁用操作。可关闭“模拟提交失败”后重试，查看已允许状态。'),
  'attachment-chip': state('AttachmentChipStates', '上传、失败与长文件名', '准备就绪的文件才能打开；失败项可移除；禁用项保留可读信息。'),
  'connector-card': state('ConnectorCardStates', '过期、连接中与断开', '重新授权后模拟连接成功。权限说明只在已连接时展示。'),
  'context-usage': state('ContextUsageStates', '容量阈值与未知总量', '用量达到警告阈值时改变颜色；超过容量与容量未知分别处理。'),
  checkpoint: state('CheckpointStates', '恢复中与恢复完成', '恢复期间阻止重复操作；完成后显示结果并禁用当前检查点。'),
  'conversation-list': state('ConversationListStates', '新用户与搜索空结果', '新建会话后搜索一个不匹配的关键词，查看不同的空状态说明。筛选逻辑在示例中实现。'),
  'prompt-template': state('PromptTemplateStates', '必填校验与禁用', '留空提交会显示组件内的错误提示；关闭模板时保留已填写的内容。'),
};
