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

## Skill 维护流程

先修改 `skills/auricui/` 中的指南、示例和工具；不要编辑打包生成的 `packages/auricui-skill/skill/`。新增组件的用法需要编写到指南中，工作流自动同步的是公开 API 索引、组件库快照和文档站的独立示例，不会自动补写全部组件教程。`assets/examples/components/` 是生成目录；其中的示例请在 `src/docs/examples/` 修改，维护脚本会同步并检查编译。Skill 入口保持精简，新增详细说明放进按任务读取的参考文件。

在仓库根目录执行（也可用 `npm run maintain:skill -- 参数`）：

```bash
# 日常检查：构建、同步、打包和全部验证；不改变版本号
bash scripts/maintain-skill.sh

# 从刚生成的安装包更新本机 Codex Skill，不发布 npm
bash scripts/maintain-skill.sh --install-global

# 发布新版 Skill，并更新本机 Codex Skill
bash scripts/maintain-skill.sh --publish --install-global

# 安装到其他工具的技能父目录；路径相对于执行命令时的目录
bash scripts/maintain-skill.sh --install-dir ./my-agent-skills
```

脚本依次运行完整构建和检查，覆盖组件测试、包消费、文档示例与 Skill 安装器。仅在传入 `--publish` 时调用 `release:skill`，递增 Skill 版本并发布到 npm 的 `latest` 渠道；发布成功后会更新本地文档站及下载包。执行发布前自行完成 `npm login`。

本机安装直接使用本次打包的 tgz，不从 npm 的 `latest` 重新下载，避免安装到旧版本。已有 Skill 会按安装器规则备份。全局安装位置为 `CODEX_HOME/skills`，未配置时是 `~/.codex/skills`；自定义目录会追加 `auricui`。安装后刷新技能列表或新开 Agent 会话。

任何阶段失败都会停止。如果 npm 发布已成功、后续刷新文档失败，修复后运行默认工作流即可，避免重复使用 `--publish` 再增加版本。若仅安装失败，可复用现有安装包：

```bash
bash scripts/maintain-skill.sh --install-only --install-global
```

`--install-only` 不重新构建或检查，要求当前版本的安装包和打包记录存在。它不能与 `--publish` 一起使用。只发布 Skill 不会发布 `auricui` 组件库；修改了组件库并准备同时发布时，仍使用 `npm run release:all`。工作流不提交 Git、不推送 Docker 镜像，也不更新服务器。

## 文件与发布边界

提交源码、配置、锁文件和许可证。不要提交 `dist/`、`artifacts/`、`public/downloads/`、`packages/auricui-skill/skill/`、Skill 中的 tgz、验证缓存或生成文件；它们由构建流程还原。`deploy/registry/` 和本地工作记录不属于公开仓库。

`.env`、凭据、证书私钥和真实服务器配置只保存在本地。公共配置示例使用占位值。贡献中使用的第三方内容须保留来源与许可，参见 [第三方声明](./THIRD-PARTY-NOTICES.md)。

PR 请说明具体问题、修改后的行为及验证结果，视觉变更可附截图。普通贡献者无需运行 `release` 或 Docker 发布命令；CI 只检查，不发布。
