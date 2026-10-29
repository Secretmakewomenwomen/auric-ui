# preview.3 验证记录

日期：2026-10-29。项目位置：`~/Desktop/auricui`。本轮增加 30 个 Agent / Personal Agent 组件与 13 个正式基础组件，文档共 82 个组件/组合示例页面。8 个基础组件由既有样式配方升级，不重复计算为新增文档页面。

## 自动检查

- `npm test`：29 项通过，含新组件 SSR、容量/分页边界、混合勾选、树语义和原业务契约。
- `npm run build`：类型检查和文档站生产构建通过。
- `npm run check:package`：实际 UI tgz 的 NodeNext 严格类型、Node ESM / SSR、无 Tailwind 插件的 Vite 消费构建通过。
- `npm run check:docs`：88 份文档示例和 13 份 Skill 示例通过实际 tgz 的严格类型编译；不使用 skipLibCheck。
- `npm run check:skill`：打包后的安装器通过参数、只读预览、项目/自定义安装、覆盖保护、更新备份、符号链接保护、API 查询和离线 npm exec 验证。
- Skill frontmatter 校验通过；包摘要及 API 索引的 536 条声明路径全部匹配。
- Skill 依赖检查在组件包消费项目中通过，包含 agent 公开入口。
- 来源模块审计：101 个来源模块，89 移植、12 适配、0 待接入。

## 浏览器验收

使用 Chrome / Playwright，对开发站和独立生产预览执行检查：

- 43 个新增或升级组件逐页核验预览、API 与示例；生产版遍历全部 82 个页面，无 pageerror。
- 消息滚动保留阅读位置、过程摘要开合、回答切换边界、操作确认防重复、调度开关、连接状态和模板提交。
- Checkbox 全选/半选/键盘、Radio 方向键、Tabs 跳过禁用项并保留输入内容。
- Tree 快速键盘展开与选择、首尾导航、跳过禁用节点；修复展开动画期间子项暂时不能聚焦的问题。
- Combobox 搜索、无结果、Enter 选择、Escape 恢复、选中后再次点击展开。
- Drawer 四个方向、正反 Tab 焦点循环、背景 inert、Escape、关闭后焦点恢复和 reduced-motion。
- Citation 外部点击、Escape、390px 视口边界；主题切换、搜索和深链接刷新。
- 移动端导航、焦点恢复与正文宽度；Quick Start 局部主题预览不改变整页主题。
- 生产站实际复制主题代码，UI / Skill 下载均返回 gzip 包而非 HTML 回退页。

原始执行记录与保留截图：`.verification/browser-agent-check.log`、`browser-primitives-check.log`、`browser-release-check.log`、`theme-mobile.png`。包含旧个人署名的历史截图已在隐私清理时移除。

## 交付状态与范围

- UI 本地包：`artifacts/auricui-0.1.0-preview.3.tgz`。
- Skill 安装器：`artifacts/auricui-skill-0.1.1.tgz`。
- 对应下载文件已复制到 `public/downloads/` 并进入生产站；独立 Skill zip 已更新。
- 项目内 Skill 已同步；未改写用户已有的全局 Skill，快速开始提供带备份的更新命令。
- 本轮未执行 npm publish。业务动作由宿主实现，不包含真实模型、OAuth、调度或后端授权。
- 完整 Studio 场景仍有大 bundle 提示，按需加载。此次浏览器检查不代表所有旧业务场景的完整端到端测试或 100% 像素一致性验收。
