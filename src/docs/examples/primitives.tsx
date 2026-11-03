import { useState, type Key } from 'react';
import { Archive, Check, Copy, Download, Inbox, MoreHorizontal, Pencil, Tag as TagIcon, Trash2 } from 'lucide-react';
import { Table, Checkbox, RadioGroup, Textarea, Progress, Skeleton, EmptyState, Avatar, Breadcrumb, Tabs, Pagination, Drawer, Tree, Combobox, Dropdown, Tag, Badge, Alert, Popconfirm, CardButton } from '../../library/index';

export function TagExample() {
  const [selected, setSelected] = useState('设计');
  const [visible, setVisible] = useState(true);
  return <div style={{ display: 'grid', gap: 22, width: '100%' }}>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Tag icon={<TagIcon />}>草稿</Tag><Tag tone="info">进行中</Tag><Tag tone="success" icon={<Check />}>已发布</Tag><Tag tone="warning">待审核</Tag><Tag tone="danger" variant="outline">需修改</Tag>
    </div>
    <div style={{ display: 'grid', gap: 10 }}>
      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>按类型筛选</span>
      <div role="group" aria-label="类型筛选" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['设计', '开发', '文档'].map(value => <Tag key={value} checkable checked={selected === value} onCheckedChange={checked => setSelected(checked ? value : '')}>{value}</Tag>)}
        <Tag checkable disabled>归档</Tag>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', minHeight: 28 }}>
      <Tag size="sm" closable visible={visible} onVisibleChange={setVisible} closeLabel="移除临时标签">临时标签</Tag>
      <CardButton weight="quiet" disabled={visible} onClick={() => setVisible(true)}>恢复标签</CardButton>
    </div>
    <p role="status" style={{ margin: 0, color: 'var(--text-muted)', fontSize: 12 }}>{selected ? `当前筛选：${selected}` : '显示所有类型'}</p>
  </div>;
}

export function BadgeExample() {
  const [count, setCount] = useState(8);
  return <div style={{ display: 'grid', gap: 28, width: '100%' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', paddingTop: 8 }}>
      <Badge count={count} label={`${count} 条未读消息`}><CardButton aria-label="收件箱"><Inbox size={15} />收件箱</CardButton></Badge>
      <Badge count={128} tone="info"><Avatar name="项目通知" /></Badge>
      <Badge dot tone="success" label="助手在线"><Avatar name="Auric Assistant" /></Badge>
      <Badge count="NEW" tone="neutral" />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <Badge dot tone="success" text="已连接" label="连接正常" />
      <Badge dot tone="warning" text="等待同步" label="同步待处理" />
      <Badge dot tone="neutral" text="离线" label="当前离线" />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <CardButton disabled={count === 0} onClick={() => setCount(Math.max(0, count - 1))}>减少</CardButton>
      <CardButton onClick={() => setCount(count + 1)}>增加</CardButton>
      <CardButton weight="quiet" onClick={() => setCount(0)}>全部已读</CardButton>
      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>未读 {count} 条</span>
    </div>
  </div>;
}

export function AlertExample() {
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  return <div style={{ width: '100%', display: 'grid', gap: 12 }}>
    <Alert tone="success" title="所有更改已保存" description="下次打开项目时，可以从这里继续。" />
    <Alert tone="info" title="邀请成员一起协作" description={expanded ? '成员加入后可查看资料、添加评论，并跟进项目进度。' : '为项目添加成员，让沟通与进展保持同步。'}
      action={<CardButton weight="quiet" onClick={() => setExpanded(!expanded)}>{expanded ? '收起说明' : '了解协作方式'}</CardButton>} />
    <Alert tone="warning" title="存储空间接近上限" description="可以清理不再使用的素材，为新的内容留出空间。" closable visible={visible} onVisibleChange={setVisible} closeLabel="关闭空间提醒" />
    <div><CardButton weight="quiet" disabled={visible} onClick={() => setVisible(true)}>恢复空间提醒</CardButton></div>
  </div>;
}

export function PopconfirmExample() {
  const [result, setResult] = useState('选择一个操作进行确认。');
  return <div style={{ display: 'grid', gap: 18 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <Popconfirm label="归档项目" title="归档这个项目？" description="归档后仍可在项目列表中找到并恢复。" confirmLabel="归档" icon={<Archive size={16} />}
        onConfirm={() => setResult('项目已归档。')} onCancel={() => setResult('已取消归档。')}><Archive size={14} />归档项目</Popconfirm>
      <Popconfirm label="移除项目" title="移除这个项目？" description="此操作只从当前列表移除，不会删除项目文件。" confirmLabel="移除" danger align="end"
        onConfirm={() => setResult('已从列表移除项目。')}><Trash2 size={14} />移除项目</Popconfirm>
    </div>
    <p role="status" style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{result}</p>
  </div>;
}

export function DropdownExample() {
  const [action, setAction] = useState('选择一个操作，查看反馈。');
  const items = [
    { id: 'rename', label: '重命名', icon: <Pencil size={15} />, shortcut: '⌘ R', onSelect: () => setAction('已选择：重命名') },
    { id: 'copy', label: '创建副本', icon: <Copy size={15} />, shortcut: '⌘ D', onSelect: () => setAction('已创建项目副本。') },
    { id: 'export', label: '导出项目', icon: <Download size={15} />, disabled: true, hint: '项目保存后即可导出。' },
    { id: 'divider', separator: true as const },
    { id: 'delete', label: '删除项目', icon: <Trash2 size={15} />, danger: true, onSelect: () => setAction('已选择删除；此示例不会删除实际数据。') },
  ];
  return <div style={{ display: 'grid', gap: 18 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <Dropdown label="项目操作" items={items} />
      <Dropdown label="更多操作" items={items} align="end" showArrow={false} weight="quiet"><MoreHorizontal size={16} /></Dropdown>
      <Dropdown label="暂无权限" items={items} disabled />
    </div>
    <p role="status" style={{ margin: 0, color: 'var(--text-muted)', fontSize: 12 }}>{action}</p>
  </div>;
}

export function CheckboxExample() {
  const [selected, setSelected] = useState(['notes']);
  const items = [{ id: 'notes', label: '笔记' }, { id: 'files', label: '文件' }, { id: 'tasks', label: '任务' }];
  return <div style={{ display: 'grid', gap: 14 }}>
    <Checkbox label="选择全部资料" checked={selected.length === items.length} indeterminate={selected.length > 0 && selected.length < items.length} onCheckedChange={checked => setSelected(checked ? items.map(item => item.id) : [])} />
    {items.map(item => <Checkbox key={item.id} label={item.label} checked={selected.includes(item.id)} onCheckedChange={checked => setSelected(checked ? [...selected, item.id] : selected.filter(id => id !== item.id))} />)}
    <Checkbox label="受保护的内容" description="禁用的选项不能被修改。" disabled />
  </div>;
}
export function RadioGroupExample() {
  const [value, setValue] = useState('ask');
  return <RadioGroup label="通知方式" value={value} onValueChange={setValue} options={[
    { value: 'ask', label: '仅重要事项', description: '有需要你决定的事情时提醒。' },
    { value: 'all', label: '所有更新', description: '任务有新进展时提醒。' },
    { value: 'off', label: '暂不提醒' },
    { value: 'team', label: '团队通知（未开通）', disabled: true },
  ]} />;
}
export function TextareaExample() {
  const [value, setValue] = useState('请优先使用中文，给我简洁、可执行的建议。');
  return <Textarea label="沟通偏好" value={value} onChange={event => setValue(event.target.value)} rows={4} maxLength={200} description={`${value.length} / 200 字`} placeholder="告诉助手你喜欢的沟通方式…" />;
}
export function ProgressExample() {
  const [value, setValue] = useState(35);
  return <div style={{ display: 'grid', gap: 20 }}><Progress label="文件处理进度" value={value} showValue /><Progress label="正在连接服务" showValue /><CardButton disabled={value >= 100} onClick={() => setValue(Math.min(100, value + 15))}>模拟进展</CardButton></div>;
}
export function SkeletonExample() {
  return <div role="status" aria-label="正在加载内容" style={{ display: 'flex', gap: 14, alignItems: 'center' }}><Skeleton width={40} height={40} rounded /><div style={{ flex: 1, display: 'grid', gap: 10 }}><Skeleton width="55%" height={13} /><Skeleton height={10} /><Skeleton width="80%" height={10} /></div></div>;
}
export function EmptyStateExample() {
  const [created, setCreated] = useState(false);
  return created ? <p role="status">已创建第一个任务。</p> : <EmptyState title="还没有任务" description="从一个小目标开始，让助手帮你安排下一步。" icon={<Inbox size={25} />} action={<CardButton weight="primary" onClick={() => setCreated(true)}>创建任务</CardButton>} />;
}
export function AvatarExample() {
  return <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><Avatar name="He Huan" size="sm" /><Avatar name="Auric Assistant" /><Avatar name="林" size="lg" /></div>;
}
export function BreadcrumbExample() {
  const [location, setLocation] = useState('设计规范');
  return <div style={{ display: 'grid', gap: 14 }}><Breadcrumb items={[{ label: '工作空间', onClick: () => setLocation('工作空间') }, { label: '项目', onClick: () => setLocation('项目') }, { label: '设计规范' }]} /><p role="status">当前位置：{location}</p></div>;
}
export function TabsExample() {
  return <Tabs label="项目详情" defaultValue="overview" items={[
    { value: 'overview', label: '概览', content: <p>所有资料、进展和待办在这里汇总。</p> },
    { value: 'notes', label: '笔记', content: <Textarea label="项目笔记" defaultValue="今天完成组件交互检查。" /> },
    { value: 'archive', label: '归档', content: null, disabled: true },
    { value: 'activity', label: '动态', content: <p>最近更新：补充基础交互组件。</p> },
  ]} />;
}
export function PaginationExample() {
  const [page, setPage] = useState(1);
  return <div style={{ display: 'grid', gap: 16 }}><p role="status">{`第 ${page} 页，共 12 页`}</p><Pagination page={page} totalPages={12} onPageChange={setPage} /></div>;
}
export function DrawerExample() {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<'left' | 'right' | 'top' | 'bottom'>('right');
  const [enabled, setEnabled] = useState(true);
  return <div style={{ display: 'grid', gap: 18 }}><RadioGroup label="打开方向" value={side} onValueChange={value => setSide(value as typeof side)} orientation="horizontal" options={[{ value: 'left', label: '左侧' }, { value: 'right', label: '右侧' }, { value: 'top', label: '顶部' }, { value: 'bottom', label: '底部' }]} /><CardButton onClick={() => setOpen(true)}>打开抽屉</CardButton><Drawer open={open} onOpenChange={setOpen} title="助手偏好" description="设置这个工作空间中的个人偏好。" side={side} footer={<CardButton weight="primary" onClick={() => setOpen(false)}>完成</CardButton>}><div style={{ display: 'grid', gap: 24 }}><Checkbox label="接收每日简报" checked={enabled} onCheckedChange={setEnabled} /><Textarea label="补充说明" placeholder="例如：早上 9 点前保持安静" /></div></Drawer></div>;
}
export function TreeExample() {
  const [selected, setSelected] = useState('guide');
  return <div style={{ display: 'grid', gap: 16 }}><Tree label="知识库目录" value={selected} onValueChange={setSelected} defaultExpanded={['workspace']} nodes={[
    { id: 'workspace', label: '工作空间', children: [
      { id: 'guide', label: '使用指南.md' },
      { id: 'projects', label: '项目', children: [{ id: 'auric', label: 'AuricUI.md' }, { id: 'ideas', label: 'Ideas.md' }] },
      { id: 'locked', label: '已锁定资料', disabled: true },
    ] },
    { id: 'personal', label: '个人笔记', children: [{ id: 'reading', label: '阅读清单.md' }] },
  ]} /><p role="status">已选择：{selected}</p></div>;
}
export function ComboboxExample() {
  const [value, setValue] = useState('shanghai');
  return <div style={{ display: 'grid', gap: 14 }}><Combobox label="简报使用的时区" value={value} onValueChange={setValue} placeholder="搜索城市或时区…" options={[
    { value: 'shanghai', label: '上海 · Asia/Shanghai' },
    { value: 'tokyo', label: '东京 · Asia/Tokyo' },
    { value: 'london', label: '伦敦 · Europe/London' },
    { value: 'new-york', label: '纽约 · America/New_York' },
    { value: 'custom', label: '自定义时区（未开通）', disabled: true },
  ]} /><p role="status">已选择：{value}</p></div>;
}

export function TableExample() {
  const [selected,setSelected]=useState<Key[]>([]);
  const [opened,setOpened]=useState('');
  const rows=[
    {id:'docs',name:'组件文档',status:'已发布',updated:'2026-10-29',visits:1280},
    {id:'studio',name:'编辑工作台',status:'待评审',updated:'2026-10-28',visits:360},
    {id:'archive',name:'历史归档',status:'只读',updated:'2026-10-21',visits:96},
  ];
  return <div style={{width:'100%',display:'grid',gap:12}}>
    <Table label="项目列表" rows={rows} rowKey={row=>row.id} minWidth={540}
      selection={{selectedKeys:selected,onChange:setSelected,isDisabled:row=>row.id==='archive',getLabel:row=>`选择${row.name}`}}
      columns={[
        {key:'name',title:'项目',render:row=><strong style={{fontWeight:500}}>{row.name}</strong>,compare:(a,b)=>a.name.localeCompare(b.name)},
        {key:'status',title:'状态',render:row=>row.status},
        {key:'visits',title:'访问量',align:'right',render:row=>row.visits.toLocaleString(),compare:(a,b)=>a.visits-b.visits},
        {key:'updated',title:'更新时间',render:row=>row.updated,compare:(a,b)=>a.updated.localeCompare(b.updated)},
        {key:'actions',title:'操作',align:'right',render:row=><CardButton weight="quiet" aria-label={`查看${row.name}`} onClick={()=>setOpened(row.name)}>查看</CardButton>},
      ]}/>
    <p role="status">已选择 {selected.length} 项{opened?` · 正在查看：${opened}`:''}</p>
  </div>;
}
