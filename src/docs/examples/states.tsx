import { useEffect, useId, useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { Table, CardButton, SettingsField, SettingsSwitch, Textarea, RadioGroup, Combobox, Progress, Avatar, Pagination, EmptyState, Skeleton, MenuSelect, Checkbox } from '../../library/index';
import { ToolCall, ApprovalCard, AttachmentChip, ConnectorCard, ContextUsage, Checkpoint, ConversationList, PromptTemplate } from '../../library/agent';

export function CardButtonStatesExample() {
  const [phase, setPhase] = useState<'idle' | 'saving' | 'saved'>('idle');
  useEffect(() => {
    if (phase !== 'saving') return;
    const timer = setTimeout(() => setPhase('saved'), 800);
    return () => clearTimeout(timer);
  }, [phase]);
  return <div style={{ width: '100%', display: 'grid', gap: 16 }}>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <CardButton weight="primary" disabled={phase === 'saving'} aria-busy={phase === 'saving'} onClick={() => setPhase('saving')}>
        {phase === 'saving' ? <LoaderCircle size={13} aria-hidden="true" /> : phase === 'saved' ? <Check size={13} aria-hidden="true" /> : null}
        {phase === 'saving' ? '保存中…' : phase === 'saved' ? '再次保存' : '保存修改'}
      </CardButton>
      <CardButton disabled>没有可保存的修改</CardButton>
      <CardButton weight="danger" disabled>不可删除</CardButton>
    </div>
    <p role="status" style={{ margin: 0, fontSize: 12 }}>{phase === 'saved' ? '保存成功。' : phase === 'saving' ? '正在模拟保存请求…' : '点击保存，查看提交中与成功反馈。'}</p>
  </div>;
}

export function SettingsFieldStatesExample() {
  const id = useId();
  const [value, setValue] = useState('');
  const [attempted, setAttempted] = useState(false);
  const invalid = attempted && !value.trim();
  return <div style={{ width: '100%', display: 'grid', gap: 16 }}>
    <form noValidate onSubmit={event => { event.preventDefault(); setAttempted(true); }} style={{ display: 'grid', gap: 8 }}>
      <label htmlFor={id}>项目名称</label>
      <SettingsField id={id} value={value} required placeholder="例如：个人知识库" onChange={event => setValue(event.target.value)} aria-invalid={invalid} aria-describedby={`${id}-message`} />
      <p id={`${id}-message`} role="status" style={{ margin: 0, color: invalid ? 'var(--err)' : 'var(--text-muted)', fontSize: 12 }}>{invalid ? '请填写项目名称。' : attempted ? '项目名称可用。' : '留空提交可查看校验反馈。'}</p>
      <CardButton type="submit">检查输入</CardButton>
    </form>
    <SettingsField aria-label="只读项目编号" value="PROJECT-2026" readOnly />
    <SettingsField aria-label="禁用字段" value="当前账号没有编辑权限" disabled />
  </div>;
}

export function SettingsSwitchStatesExample() {
  const [checked, setChecked] = useState(false);
  return <div style={{ width: '100%', display: 'grid', gap: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span>邮件通知</span><SettingsSwitch label="邮件通知" checked={checked} onChange={setChecked} /></div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span>组织安全策略 · 已锁定</span><SettingsSwitch label="组织安全策略" checked disabled onChange={() => {}} /></div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span>团队同步 · 未开通</span><SettingsSwitch label="团队同步" checked={false} disabled onChange={() => {}} /></div>
  </div>;
}

export function TextareaStatesExample() {
  const [value, setValue] = useState('');
  const [attempted, setAttempted] = useState(false);
  return <div style={{ width: '100%', display: 'grid', gap: 16 }}>
    <Textarea label="任务说明" value={value} onChange={event => setValue(event.target.value)} placeholder="至少输入 5 个字符" error={attempted && value.trim().length < 5 ? '请补充任务说明，至少 5 个字符。' : undefined} description={`${value.length} / 200 字`} maxLength={200} rows={3} />
    <CardButton onClick={() => setAttempted(true)}>检查说明</CardButton>
    <Textarea label="只读说明" value="这段说明由管理员维护，可以选择和复制。" readOnly rows={2} />
    <Textarea label="暂不可编辑" value="当前任务已归档。" disabled rows={2} />
  </div>;
}

export function RadioGroupStatesExample() {
  const [value, setValue] = useState('daily');
  return <div style={{ width: '100%', display: 'grid', gap: 24 }}>
    <RadioGroup label="简报频率" value={value} onValueChange={setValue} orientation="horizontal" options={[{ value: 'daily', label: '每天' }, { value: 'weekly', label: '每周' }, { value: 'realtime', label: '实时（未开通）', disabled: true }]} />
    <RadioGroup label="组织默认策略 · 只读" defaultValue="ask" disabled options={[{ value: 'ask', label: '执行前确认' }, { value: 'auto', label: '自动执行' }]} />
  </div>;
}

export function ComboboxStatesExample() {
  const [value, setValue] = useState<string>();
  return <div style={{ width: '100%', display: 'grid', gap: 20 }}>
    <Combobox label="选择模型" value={value} onValueChange={setValue} options={[{ value: 'balanced', label: '均衡模型' }, { value: 'advanced', label: '高级模型（未开通）', disabled: true }]} emptyText="没有匹配的模型，请更换关键词。" />
    <Combobox label="空数据" options={[]} onValueChange={() => {}} placeholder="展开查看空结果" emptyText="还没有可用模型。" />
    <Combobox label="暂不可用" disabled options={[]} onValueChange={() => {}} placeholder="正在获取模型列表…" />
  </div>;
}

export function ProgressStatesExample() {
  return <div style={{ width: '100%', display: 'grid', gap: 20 }}>
    <Progress label="等待开始" value={0} showValue />
    <Progress label="正在处理" value={52} showValue />
    <Progress label="处理完成" value={100} showValue />
    <Progress label="正在连接 · 总量未知" showValue />
  </div>;
}

export function AvatarStatesExample() {
  return <div style={{ width: '100%', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
    <div style={{ display: 'grid', gap: 8 }}><Avatar name="Lin Chen" size="sm" /><span>姓名首字母</span></div>
    <div style={{ display: 'grid', gap: 8 }}><Avatar name="林" /><span>中文姓名</span></div>
    <div style={{ display: 'grid', gap: 8 }}><Avatar name="Auric User" src="data:image/png;base64,invalid" size="lg" /><span>图片失败后回退</span></div>
  </div>;
}

export function PaginationStatesExample() {
  const [page, setPage] = useState(1);
  return <div style={{ width: '100%', display: 'grid', gap: 20 }}>
    <div><p>没有数据</p><Pagination page={1} totalPages={0} onPageChange={() => {}} /></div>
    <div><p>只有一页</p><Pagination page={1} totalPages={1} onPageChange={() => {}} /></div>
    <div><p role="status">第 {page} 页，共 12 页</p><Pagination page={page} totalPages={12} onPageChange={setPage} /></div>
  </div>;
}

export function EmptyStateStatesExample() {
  const [state, setState] = useState('empty');
  return <div style={{ width: '100%', display: 'grid', gap: 20 }}>
    <MenuSelect label="列表状态" value={state} onPick={setState} groups={[{ choices: [{ value: 'empty', label: '没有内容' }, { value: 'loading', label: '正在加载' }, { value: 'error', label: '加载失败' }, { value: 'ready', label: '已有内容' }] }]} />
    {state === 'loading' ? <div role="status" aria-label="正在加载任务" style={{ display: 'grid', gap: 12 }}><Skeleton height={18} /><Skeleton width="70%" /></div> : state === 'error' ? <EmptyState title="暂时无法读取任务" description="演示请求失败。可以重试，也可以稍后再来。" action={<CardButton onClick={() => setState('ready')}>重试加载</CardButton>} /> : state === 'empty' ? <EmptyState title="还没有任务" description="创建第一个任务，开始安排今天。" action={<CardButton weight="primary" onClick={() => setState('ready')}>创建任务</CardButton>} /> : <p role="status">已载入任务：整理本周设计反馈。</p>}
  </div>;
}

export function ToolCallStatesExample() {
  const [status, setStatus] = useState<'running' | 'success' | 'error'>('error');
  return <div style={{ width: '100%', display: 'grid', gap: 16 }}>
    <ToolCall name="search_documents" status={status} defaultOpen input={'{"query":"季度报告"}'} output={status === 'success' ? '找到 3 份相关文档。' : undefined} error={status === 'error' ? '连接超时，暂时无法读取资料。' : undefined} />
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <CardButton disabled={status === 'running'} onClick={() => setStatus('running')}>重试</CardButton>
      <CardButton disabled={status !== 'running'} onClick={() => setStatus('success')}>模拟成功</CardButton>
      <CardButton disabled={status !== 'running'} onClick={() => setStatus('error')}>模拟失败</CardButton>
    </div>
  </div>;
}

export function ApprovalCardStatesExample() {
  const [status, setStatus] = useState<'pending' | 'submitting' | 'approved' | 'rejected'>('pending');
  const [fail, setFail] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (status !== 'submitting') return;
    const timer = setTimeout(() => {
      setStatus(fail ? 'pending' : 'approved');
      setError(fail ? '暂时无法提交决定，请重试。' : '');
    }, 800);
    return () => clearTimeout(timer);
  }, [status, fail]);
  return <div style={{ width: '100%', display: 'grid', gap: 16 }}>
    <Checkbox label="模拟提交失败" checked={fail} disabled={status === 'submitting'} onCheckedChange={setFail} />
    <ApprovalCard title="允许整理这个文件夹？" description="仅演示状态变化，不会读取或修改实际文件。" status={status} error={error} onApprove={() => { setError(''); setStatus('submitting'); }} onReject={() => { setError(''); setStatus('rejected'); }} />
    {(status === 'approved' || status === 'rejected') && <CardButton onClick={() => setStatus('pending')}>重新演示</CardButton>}
  </div>;
}

export function AttachmentChipStatesExample() {
  const [removed, setRemoved] = useState(false);
  const [message, setMessage] = useState('');
  return <div style={{ width: '100%', display: 'grid', gap: 12 }}>
    <AttachmentChip name="季度设计评审与产品体验改进建议.pdf" detail="已就绪 · 2.4 MB" onOpen={() => setMessage('已请求打开文件预览。')} />
    <AttachmentChip name="数据归档.zip" status="uploading" onOpen={() => {}} />
    {!removed && <AttachmentChip name="截图.png" status="error" onRemove={() => { setRemoved(true); setMessage('已移除失败的附件。'); }} />}
    <AttachmentChip name="受保护资料.pdf" disabled onOpen={() => {}} onRemove={() => {}} />
    {removed && <CardButton onClick={() => setRemoved(false)}>恢复失败示例</CardButton>}
    <p role="status" style={{ margin: 0, fontSize: 12 }}>{message || '上传中无法打开，失败项可移除，禁用项不可操作。'}</p>
  </div>;
}

export function ConnectorCardStatesExample() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'expired' | 'connecting'>('expired');
  useEffect(() => {
    if (status !== 'connecting') return;
    const timer = setTimeout(() => setStatus('connected'), 800);
    return () => clearTimeout(timer);
  }, [status]);
  return <div style={{ width: '100%', display: 'grid', gap: 16 }}>
    <ConnectorCard name="工作日历" account={status === 'connected' ? 'design@example.com' : undefined} status={status} scopes={status === 'connected' ? ['读取日程'] : []} onConnect={() => setStatus('connecting')} onDisconnect={() => setStatus('disconnected')} />
    <CardButton disabled={status === 'connecting'} onClick={() => setStatus('expired')}>模拟授权过期</CardButton>
    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>连接过程为本地演示，不会打开真实授权页面。</p>
  </div>;
}

export function ContextUsageStatesExample() {
  return <div style={{ width: '100%', display: 'grid', gap: 20 }}>
    <ContextUsage label="正常用量" used={42000} limit={128000} />
    <ContextUsage label="接近容量 · 80% 阈值" used={110000} limit={128000} />
    <ContextUsage label="超出容量" used={140000} limit={128000} />
    <ContextUsage label="总容量未知" used={42000} limit={0} />
  </div>;
}

export function CheckpointStatesExample() {
  const [phase, setPhase] = useState<'idle' | 'restoring' | 'done'>('idle');
  useEffect(() => {
    if (phase !== 'restoring') return;
    const timer = setTimeout(() => setPhase('done'), 800);
    return () => clearTimeout(timer);
  }, [phase]);
  return <div style={{ width: '100%', display: 'grid', gap: 16 }}>
    <Checkpoint title="版本 2 · 编辑之前" description="本地恢复演示" pending={phase === 'restoring'} disabled={phase === 'done'} restoreLabel={phase === 'done' ? '已恢复' : '恢复到此处'} onRestore={() => setPhase('restoring')} />
    <Checkpoint title="受保护的检查点" description="当前没有恢复权限" disabled onRestore={() => {}} />
    {phase === 'done' && <CardButton onClick={() => setPhase('idle')}>重新演示</CardButton>}
  </div>;
}

export function ConversationListStatesExample() {
  const [items, setItems] = useState<{ id: string; title: string; preview: string }[]>([]);
  const [selected, setSelected] = useState<string>();
  const [query, setQuery] = useState('');
  const visible = items.filter(item => `${item.title} ${item.preview}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div style={{ width: '100%', display: 'grid', gap: 12 }}>
    <ConversationList items={visible} value={selected} onValueChange={setSelected} query={query} onQueryChange={setQuery} onCreate={() => { const id = String(items.length + 1); setItems([...items, { id, title: `新会话 ${id}`, preview: '从一个问题开始。' }]); setSelected(id); setQuery(''); }} emptyText={query ? '没有匹配的会话，试试其他关键词。' : '还没有会话，点击右上角新建。'} />
    <p role="status" style={{ margin: 0, fontSize: 12 }}>共 {items.length} 个会话{selected ? `，已选中 ${selected}` : ''}。</p>
  </div>;
}

export function PromptTemplateStatesExample() {
  const [values, setValues] = useState<Record<string, string>>({ topic: '' });
  const [disabled, setDisabled] = useState(false);
  const [result, setResult] = useState('');
  return <div style={{ width: '100%', display: 'grid', gap: 16 }}>
    <Checkbox label="暂时禁用模板" checked={disabled} onCheckedChange={setDisabled} />
    <PromptTemplate template="请帮我整理 {{topic}} 的三条重点。" variables={[{ name: 'topic', label: '主题', required: true, placeholder: '先留空提交，查看校验提示' }]} values={values} onValuesChange={setValues} disabled={disabled} onSubmit={setResult} />
    <p role="status" style={{ margin: 0, fontSize: 12 }}>{result ? `已生成：${result}` : '必填项通过校验后才会生成提示词。'}</p>
  </div>;
}

export function TableStatesExample() {
  const [mode,setMode]=useState<'data'|'loading'|'empty'>('data');
  const [compact,setCompact]=useState(false);
  const rows=Array.from({length:12},(_,i)=>({id:i+1,name:`示例记录 ${i+1}`,count:(i+1)*12}));
  return <div style={{display:'grid',gap:16,width:'100%'}}>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
      <CardButton onClick={()=>setMode('data')}>显示数据</CardButton>
      <CardButton onClick={()=>setMode('loading')}>模拟加载</CardButton>
      <CardButton onClick={()=>setMode('empty')}>清空数据</CardButton>
      <SettingsSwitch label="紧凑行高" checked={compact} onChange={setCompact}/>
    </div>
    <Table label="表格状态示例" rows={mode==='empty'?[]:rows} rowKey={row=>row.id}
      loading={mode==='loading'} density={compact?'compact':'comfortable'} stickyHeader maxHeight={240} minWidth={320}
      emptyContent="还没有记录，点击“显示数据”恢复示例。"
      columns={[
        {key:'name',title:'名称',render:row=>row.name},
        {key:'count',title:'数量',align:'right',render:row=>row.count,compare:(a,b)=>a.count-b.count},
      ]}/>
  </div>;
}
