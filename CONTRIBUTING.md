# 参与贡献

欢迎修复问题、完善可访问性、增加组件示例和改进文档。较大的 API 或交互变更，请先在 Issue 中说明使用场景与预期行为。

## 本地开发

需要 Node.js 22.12+（`.nvmrc` 固定为 22 系列）、npm，以及用于 Skill 检查的 Python 3。构建脚本使用 `tar`；macOS、Linux 和 Windows WSL 均可提供这些工具。

在仓库根目录执行：

```bash
npm ci
npm run build
npm run dev
```

打开 <http://127.0.0.1:5178/#/start>。首次构建自动生成库与 Skill 的本地安装包、API 文档和下载资源，不需要 npm 发布权限、Docker、私有仓库或服务器配置。之后修改组件可直接使用开发服务器；修改公开属性、示例或包内容后，重新运行 `npm run build`。

## 提交前检查

```bash
npm run build
npm run check
```

`check` 包含组件测试、真实 tgz 的类型/ESM/SSR/浏览器构建检查、文档示例编译和 Skill 安装器检查。CI 执行相同顺序。自动检查不能代替交互验收：UI 变更请在浏览器检查键盘操作、焦点、禁用状态、深浅主题、窄屏及减少动态效果设置，并在 PR 中说明实际验证范围。

## 修改位置

- 通用组件：`src/components/primitives/`；Agent 组件：`src/agent/`。
- Chat、Studio 与编辑算法：`src/chat/`、`src/studio/`、`src/engine/`。
- 公开导出：`src/library/`；包配置：`packages/auricui/`。
- 示例：`src/docs/examples/`；页面登记与属性说明：`src/docs/catalog.ts`、`scripts/docs-metadata.mjs`。
- 测试与构建：`scripts/`；Skill 源码：`skills/auricui/`。

组件预览和可复制示例必须使用同一实现。新增组件请补公开导出、样式、适当的行为测试和可运行示例。业务功能通过数据和回调接入；涉及 Studio 服务契约时，应明确依赖，不能把演示数据描述为生产服务。

## 文件与发布边界

提交源码、配置、锁文件和许可证。不要提交 `dist/`、`artifacts/`、`public/downloads/`、`packages/auricui-skill/skill/`、Skill 中的 tgz、验证缓存或生成文件；它们由构建流程还原。`deploy/registry/` 和本地工作记录不属于公开仓库。

`.env`、凭据、证书私钥和真实服务器配置只保存在本地。公共配置示例使用占位值。贡献中使用的第三方内容须保留来源与许可，参见 [第三方声明](./THIRD-PARTY-NOTICES.md)。

PR 请说明具体问题、修改后的行为及验证结果，视觉变更可附截图。普通贡献者无需运行 `release` 或 Docker 发布命令；CI 只检查，不发布。
