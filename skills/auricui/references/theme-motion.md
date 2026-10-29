# 主题、布局与动画

全局一次导入 `auricui/styles.css`，初始 HTML `data-theme="dark"`；Provider 的 theme 可为 dark/light。Chat 容器 `.auricui-chat` 声明独立的同名变量，不能把两个区域的变量合并。根 Provider 提供唯一 `#auricui-chat-layer.auricui-chat`，确保它和内容处于同一文档主题。

| Studio 深色变量 | 基线 |
| --- | --- |
| --bg / --canvas | #1a1a1a / #1f1f1f |
| --panel / --dock-shell | #181818 / #111111 |
| --surface / --surface-2 / --surface-3 | #202020 / #2a2a2a / #313131 |
| --text / --text-dim / --text-muted | #dadada / #b0b0b0 / #959595 |
| --accent / --ok / --warn / --err | #1a93fe / #5eb92d / #ffbf36 / #eb4d4d |

布局扩展使用语义变量；已有项目的业务区域只需适配布局。Inter Variable 已编译进 CSS，保留中文字体回退。Lucide 图标延用控件原有 size/strokeWidth，应用自己直接 import 图标时声明 lucide-react 依赖，不依赖传递依赖提升。

Card 通常 radius=12px；CardButton 高28px、radius=8px。其他控件按自身规范，不全局改成同一圆角和字号。Popover 自身是定位容器，需要卡片皮肤。由于 Portal 可能挂到 body 或 Chat layer，页面局部 wrapper 的 CSS 变量不会自然传到所有弹层；主题覆盖应同时覆盖对应 Portal，或提升到正确根作用域。

动画采用 CSS keyframes/transition：`auricui-rise` 默认 0.4s cubic-bezier(0.2,0.8,0.2,1)，`auricui-pop` 默认 0.16s；ConfirmDialog 内联 rise 使用 0.16s ease-out。保持组件自己的触发和时长，不给所有弹窗套一个默认值。还包括加载条、shimmer、工具活动等，尊重 prefers-reduced-motion；无需额外安装 Motion/GSAP。

消费应用新增的布局和示例 `.auricui-example-*` 使用自有 CSS。只有启用应用的 Tailwind 构建时才新增相应 utility 类；包内现存类不保证覆盖将来随意写入的 utility。

组件 CSS 含全局基础样式与通用变量，集成到旧站点先检查 body、字体、按钮和全局变量冲突。不要只用局部 wrapper 就宣称完整隔离。最终检查弹层继承、键盘 focus/Escape/外部点击、长文本和 reduced-motion。

## 切换与自定义

完整切换示例见 `assets/examples/Theme.tsx`。Provider 接受 `dark | light`，不自动保存偏好，也没有 `system` 值。需要系统主题时由宿主监听 matchMedia，并传入解析后的值。SSR 从 Cookie 等服务端信息得到初始值，同时写入 html 和 Provider，避免 hydration 与首屏颜色不一致。

```tsx
import 'auricui/styles.css';
import './theme.css'; // 覆盖放在库样式之后
```

```css
:root[data-theme='dark'],
[data-theme='dark'] .auricui-chat {
  --bg: #17181c;
  --panel: #1d1e23;
  --surface: #22232a;
  --card-bg: var(--surface);
  --text: #eeeef2;
  --text-muted: #a5a7b3;
  --accent: #c6bce8;
  --accent-soft: rgba(198, 188, 232, .12);
  --on-accent: #1d172d;
}
```

Chat 自己声明变量，所以同时覆盖它的作用域；Provider 的 Chat layer 会匹配同一选择器。Drawer 和 Citation 挂在 body，局部 wrapper 变量不会跨 Portal；完整应用在 html 上配置主题。CardButton primary 的背景是 `--text`、文字是 `--panel`，不是 `--accent`；品牌按钮使用应用自己的 class，不改整页文本色。

新增组件的统一动效变量：`--auricui-motion-fast:140ms`、`--auricui-motion-normal:220ms`、`--auricui-motion-slow:320ms`、`--auricui-ease-out:cubic-bezier(.2,.8,.2,1)`。覆盖影响使用该变量的动效，不替换原有所有 Chat/Studio 时长。系统 reduced-motion 自动降级。
