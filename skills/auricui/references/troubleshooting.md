# 常见问题

| 现象 | 检查和处理 |
| --- | --- |
| E404 / ETARGET | 先查目标环境 registry 与精确版本。npm 页面可见、发布命令成功都不能代替实际下载验证。 |
| registry 有版本但安装查不到 | 用官方 registry、--prefer-online 重新查询；必要时用临时独立缓存排除旧元数据。不要直接清空整个用户缓存。 |
| 无法联网 | 使用附带 tgz；依赖仍需可用缓存/网络。明确安装未完成。 |
| 找不到 Button/Input/Modal/AttachmentCard | 查询公开导出，分别选 CardButton/SettingsField、Popover或ConfirmDialog、AttachmentCardBody。不能导入展示工程私有文件。 |
| 按钮 primary 不生效 | CardButton 使用 weight="primary"，SettingsButton 使用 variant="primary"。 |
| 无样式/字体或新增类无效 | 检查全局 CSS；包内字体已编译。新增 Tailwind 类需要消费方生成。 |
| Chat 颜色/弹层异常 | 内容有 .auricui-chat；唯一 auricui-chat-layer 容器已由根 Provider 挂载；主题在 html。 |
| ModelPopover 报 Provider 错误 | 用 ModelOptionsProvider 提供 agents/options/value/onChange。 |
| PromptEditor 光标跳/输入被覆盖 | defaultValue 是初始化值；移除每次输入后 setText 的回写。程序更新才调用 ref。 |
| JSX 缺少属性 | 用 inspect_api.py 查当前声明，尤其 PromptEditor 必填的高度、文案、引用、contentClassName。 |
| SSR / RSC 出错 | 在应用设置客户端边界；ModelPopover 首次 render 读取 window，应 mounted gate 或关闭其 SSR；仅客户端初始化模块单例服务。 |
| /api 请求404或提示配置ChatServices | 专业组件依赖原服务协议；按服务文档适配，或使用只依赖 props 的基础控件。 |
| 找到类型文件但不能深层import | exports 未公开该路径；用公开类型或 ComponentProps 推导。 |

排查安装命令（在目标项目中执行）：

```bash
npm config get registry
npm view auricui@0.1.0-preview.4 version --registry=https://registry.npmjs.org/ --prefer-online
npm view auricui dist-tags --json --registry=https://registry.npmjs.org/ --prefer-online
```

确认版本存在后再安装。只有 next 标签缺失且用户正在管理发布时才讨论修复标签；使用组件不需要发布权限。持续无法下载应报告查询结果和错误，不循环发布/升级版本。
