# 集成规范

## 依据与范围

来源为用户本地 OpenFilm 0.2.5 工作目录，快照提取日期 2026-10-28；可能包含本地修改，不表示上游最新版本。source-manifest.json 记录每个附带文件的 SHA-256。快照保留 Studio、Chat、Shell 和共享类型源码，覆盖组件与其辅助逻辑；不是包含服务端、字体二进制、图片和构建产物的完整可运行仓库。

下列来源路径均相对于 `assets/upstream`，快照保留原始文件名与版权。成品包对外名称为 `auricui`，入口见 [ESM 成品包](esm-package.md)。

源码模式复制到目标项目后，将样式与组件中的 `openfilm-` CSS 类名、关键帧同步改为 `auricui-`，Chat 作用域 `.of-chat` 和 Portal ID `of-chat-layer` 同步改为 `.auricui-chat` 和 `auricui-chat-layer`。保留参数、状态和行为；不要批量改写上游链接、许可、媒体协议或持久化数据键。

## 样式与依赖接入

- 基底：`packages/openfilm/studio/ui/src/globals.css`。保留 Tailwind 4、Inter Variable 导入和自定义 dark variant。
- 聊天：`apps/desktop/chat/src/chat.css`。它在原桌面构建中由 `apps/desktop/shell/vite.config.ts` 的 scopeChat PostCSS 插件改写，不能直接作为第二份全局 CSS 加入。
- 桌面：`apps/desktop/shell/shell.css`、`main.tsx`、`index.html` 定义加载顺序与挂载结构。先 Studio/Shell，后 Chat。
- 移植 scopeChat 时更新 CHAT 路径判断；确保选择器重写仍执行，保留 keyframes 排除及主题分支规则。Chat 根节点和 Portal 容器都需符合 `.auricui-chat` 作用域。Studio 的 Portal 通常到 body；不要一律改为 Chat 容器。
- 原 `@/` 根据导入者分别指向 Studio 和 Chat；查看 twoTrees 插件。新项目建议使用两个明确别名，避免同名 Popover/Tooltip 导错。
- Tailwind 的 source 扫描范围必须包含移植组件，尤其任意值类；更新原 shell.css 中的 @source 路径。
- 确保安装并实际加载 `@fontsource-variable/inter`，保留 CJK fallback。Chat 声明 Space Grotesk fallback 不代表已经加载该字体，按实际字体加载与 computed style 判断。
- React 19、Vite 7、Tailwind 4、TypeScript 5.9 是来源基线；确切依赖见两个 package.json。Zustand、Lexical、GSAP 按移植功能需要引入，不为静态 UI 全部安装。

## 深色基准（Studio）

| token | value |
| --- | --- |
| --bg | #1a1a1a |
| --canvas | #1f1f1f |
| --panel / --dock-pane | #181818 |
| --dock-shell | #111111 |
| --surface / --surface-2 / --surface-3 | #202020 / #2a2a2a / #313131 |
| --text / --text-dim | #dadada / #b0b0b0 |
| --text-muted / --text-faint | #959595 / #646464 |
| --border / --border-soft / --border-strong | white 6% / 4% / 12% |
| --accent | #1a93fe |
| --ok / --warn / --err | #5eb92d / #ffbf36 / #eb4d4d |

完整变量以原 CSS 为准，Chat 从自己的深色块读取。注意 CardButton.primary 使用 --text 背景与 --panel 文字，并不是统一的蓝色主按钮。Card 半径 12px，按钮高 28px、半径 8px；其他组件独立按源码取值，不把它们强制统一。

## 动画

来源 globals.css 中 `openfilm-rise`（成品包 `auricui-rise`）为 0.4s cubic-bezier(0.2,0.8,0.2,1)，`openfilm-pop`（成品包 `auricui-pop`）为 0.16s 同缓动；ConfirmDialog 单独使用 rise 0.16s ease-out。不要把全局默认时长套给所有弹窗。

查找 `@keyframes`、`animation:`、`transition:`、`animate-`、`duration-`、`requestAnimationFrame` 和 reduced-motion，包含 TSX 内联设置。Chat 还含 greeting、auth、loading、tool 等动效，按具体使用组件移植；未被组件使用的 CSS 不意味着新产品需要增加该场景。
