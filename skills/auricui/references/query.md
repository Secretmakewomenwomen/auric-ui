# 按需查询组件

无需读取大 JSON 索引。直接运行 `scripts/inspect_api.py`，脚本会在本地筛选后输出结果；无 `--project` 时使用附带组件库，传入项目路径时优先读安装包。

## 找组件

```bash
python3 <Skill目录>/scripts/inspect_api.py --search 表格 --project <项目目录>
python3 <Skill目录>/scripts/inspect_api.py --entry agent --search memory --limit 5
python3 <Skill目录>/scripts/inspect_api.py --entry studio --offset 20 --limit 20
```

搜索支持组件名、文档中登记的中英文名称与描述；不带 `--entry` 的搜索跨五个入口。未提供搜索时默认列出 core 的前 20 条。类型导出也可查询，导出数量不等于组件数量。

## 确认参数

```bash
python3 <Skill目录>/scripts/inspect_api.py --entry core --symbol Table --project <项目目录>
python3 <Skill目录>/scripts/inspect_api.py --entry studio --symbol configureStudioTransport --project <项目目录>
python3 <Skill目录>/scripts/inspect_api.py --entry demo --symbol createStudioDemo
```

默认只输出目标声明、同一文件内关联的类型和必要 import。声明中的 `?` 表示可选；继承的原生 React 属性遵循 React 定义，类型声明未包含的运行时默认值不能猜测。非公开辅助类型可以用 `ComponentProps<typeof Component>` 推导，不能因此深层导入。

需要查看其他文件的类型时，使用输出中可定位的相对声明路径：

```bash
python3 <Skill目录>/scripts/inspect_api.py --file dist/types/studio/lib/host.d.ts --project <项目目录>
```

`--file` 和 `--full` 显式打印整份声明，仅在定向查询不足时使用。跨文件相对导入中的 `.js` 对应 `.d.ts`，`.mjs` 对应 `.d.mts`。

## 只读取一个示例

```bash
python3 <Skill目录>/scripts/inspect_api.py --entry core --symbol Table --example --project <项目目录>
# 明确选择表格状态示例
python3 <Skill目录>/scripts/inspect_api.py --entry core --symbol Table --example TableStates
```

示例由文档站实际示例同步生成，每份独立保存为 TSX。优先使用同名示例；有多个例子时可按查询输出的候选名选择。没有示例时工具会明确返回提示，不拿其他组件的示例充数。生成示例只反映已展示的功能，完整参数以声明为准。

项目安装版本与附带基线不同时：参数从已安装包读取；名称/描述和示例仍来自基线，工具会提示这一点。先核对实际签名再使用示例；更新 Skill 不会升级应用依赖。若安装包的 exports 或声明格式不受查询器支持，工具会报错，此时直接检查该包的公开入口声明，不改用旧基线冒充当前 API。

首次接入或依赖异常时才运行：

```bash
python3 <Skill目录>/scripts/check_dependencies.py --project <项目目录>
```

不需要重复打印所有组件和已经读过的声明。选定组件后按当前任务继续实现；只有遇到相关问题再加载主题、服务或排错指南。
