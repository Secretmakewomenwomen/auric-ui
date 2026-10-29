# Personal Agent UI 设计依据

调研日期：2026-10-29。参考 Meta Muse 的官方公开说明，未进行登录后的实机体验；AuricUI 使用自己的组件、配色和数据契约，不复刻其品牌或后端。

- [How We Designed Muse](https://introducing.muse.ai/)（2026-09）：长期对话、后台活动透明、目标跟踪、结构化审批、可独立存在的产物、低打扰主动建议。
- [How We Built Safety Into Muse](https://research.meta.ai/blog/security-and-safety-for-ai-agents-our-approach-with-muse)（2026-09-08）：权限由独立服务执行；前端选择不能替代后端授权；连接器授权需要清晰的作用范围。

本项目的设计取舍：

| 需求 | AuricUI 组件 | 宿主责任 |
| --- | --- | --- |
| 可查看、修正、忘记的记忆 | MemoryCard | 持久化、删除与同步 |
| 长期目标和后台记录 | GoalCard / ActivityTimeline | 目标状态和真实事件 |
| 定期工作 | ScheduleCard | 时区、下次执行时间及调度 |
| 清晰的连接边界 | ConnectorCard / AutonomyControl | OAuth、权限校验与撤销 |
| 值得打扰的主动帮助 | ProactiveSuggestion / BriefingCard | 触发条件、消息排序与频率 |
| 明确的操作决定 | ApprovalCard | 审批状态、执行授权、幂等提交 |

所有状态通过 props 传入；示例只模拟本地交互，不进行真实外部操作。
