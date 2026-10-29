import { useState } from 'react';
import { Checkbox, RadioGroup, Textarea, Drawer, CardButton } from 'auricui';
import 'auricui/styles.css';

export default function Example() {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<'left' | 'right' | 'top' | 'bottom'>('right');
  const [enabled, setEnabled] = useState(true);
  return <div style={{ display: 'grid', gap: 18 }}><RadioGroup label="打开方向" value={side} onValueChange={value => setSide(value as typeof side)} orientation="horizontal" options={[{ value: 'left', label: '左侧' }, { value: 'right', label: '右侧' }, { value: 'top', label: '顶部' }, { value: 'bottom', label: '底部' }]} /><CardButton onClick={() => setOpen(true)}>打开抽屉</CardButton><Drawer open={open} onOpenChange={setOpen} title="助手偏好" description="设置这个工作空间中的个人偏好。" side={side} footer={<CardButton weight="primary" onClick={() => setOpen(false)}>完成</CardButton>}><div style={{ display: 'grid', gap: 24 }}><Checkbox label="接收每日简报" checked={enabled} onCheckedChange={setEnabled} /><Textarea label="补充说明" placeholder="例如：早上 9 点前保持安静" /></div></Drawer></div>;
}
