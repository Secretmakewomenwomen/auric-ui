import { useState } from 'react';
import { Combobox } from 'auricui';
import 'auricui/styles.css';

export default function Example() {
  const [value, setValue] = useState('shanghai');
  return <div style={{ display: 'grid', gap: 14 }}><Combobox label="简报使用的时区" value={value} onValueChange={setValue} placeholder="搜索城市或时区…" options={[
    { value: 'shanghai', label: '上海 · Asia/Shanghai' },
    { value: 'tokyo', label: '东京 · Asia/Tokyo' },
    { value: 'london', label: '伦敦 · Europe/London' },
    { value: 'new-york', label: '纽约 · America/New_York' },
    { value: 'custom', label: '自定义时区（未开通）', disabled: true },
  ]} /><p role="status">已选择：{value}</p></div>;
}
