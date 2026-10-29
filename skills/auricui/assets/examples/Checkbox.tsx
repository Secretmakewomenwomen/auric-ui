import { useState } from 'react';
import { Checkbox } from 'auricui';
import 'auricui/styles.css';

export default function Example() {
  const [selected, setSelected] = useState(['notes']);
  const items = [{ id: 'notes', label: '笔记' }, { id: 'files', label: '文件' }, { id: 'tasks', label: '任务' }];
  return <div style={{ display: 'grid', gap: 14 }}>
    <Checkbox label="选择全部资料" checked={selected.length === items.length} indeterminate={selected.length > 0 && selected.length < items.length} onCheckedChange={checked => setSelected(checked ? items.map(item => item.id) : [])} />
    {items.map(item => <Checkbox key={item.id} label={item.label} checked={selected.includes(item.id)} onCheckedChange={checked => setSelected(checked ? [...selected, item.id] : selected.filter(id => id !== item.id))} />)}
    <Checkbox label="受保护的内容" description="禁用的选项不能被修改。" disabled />
  </div>;
}
