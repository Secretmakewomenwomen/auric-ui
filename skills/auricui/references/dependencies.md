# 依赖检查

默认成品包模式：`python3 <Skill目录>/scripts/check_dependencies.py --project <前端包目录>`。脚本只读，不安装或修改配置；退出码 0=通过，1=需处理，2=无法读取清单。无 node_modules 的 Yarn PnP 环境需用其包管理器验证，不能据此断言未安装。

| 类别 | 成品包要求 | 源码移植要求 |
| --- | --- | --- |
| React/React DOM | 两者19，版本一致 | 同左 |
| UI库 | auricui 已声明、安装，公开入口存在 | 从快照适配，处理业务耦合 |
| TypeScript/React类型 | 项目使用 TS 时检查；JS 项目可不安装 | 默认需要 |
| Tailwind | 可选，库样式已编译 | 默认4，匹配 Vite/PostCSS 插件与扫描路径 |
| 图标 | lucide-react 是包依赖；应用直接 import 时需自行声明 | 直接声明安装 |
| 字体 | Inter 已编译在 CSS 中 | @fontsource-variable/inter 并实际导入 |
| 富文本 | Lexical/@lexical/react/Yjs 由包依赖安装 | 按使用功能安装，Lexical各包版本一致 |
| 动画 | 内置 CSS keyframes/transition | 移植原样式和触发逻辑 |

脚本检查 React 主版本、清单与安装状态、React/DOM 一致性、根入口、agent/chat/studio 入口和传递依赖是否存在。它不完整求解 semver，也不检查每个依赖的实际运行兼容性；升级包后仍应运行项目类型检查和构建。`npm ls` 可进一步核验依赖树。

源码模式显式传 `--mode source`，默认检查 React19、TS、Tailwind4、字体与图标；Vite工程检查插件。已有其他构建器保留其配置。scope包名可用 `--library-package @scope/name`。

GSAP、Motion、Zustand 不为套用视觉而必装。依赖通过后人工确认全局 CSS、首屏主题、Chat Portal、原生动画/reduced-motion。消费方不得把技能检查通过等同于交互或视觉验收。

当前成品包使用 Lucide 0.482.0。旧版 0.469.0 声明可能因 ReactSVG 类型报错，项目直接使用图标时请运行严格类型检查确认兼容；不要用 skipLibCheck 掩盖该错误。
