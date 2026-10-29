import { useState, type Key } from 'react';
import { Inbox } from 'lucide-react';
import { Table, Checkbox, RadioGroup, Textarea, Progress, Skeleton, EmptyState, Avatar, Breadcrumb, Tabs, Pagination, Drawer, Tree, Combobox, CardButton } from '../../library/index';

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
  return <div style={{ display: 'grid', gap: 16 }}><p role="status">第 {page} 页，共 12 页</p><Pagination page={page} totalPages={12} onPageChange={setPage} /></div>;
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
