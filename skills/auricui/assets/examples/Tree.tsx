import { useState } from 'react';
import { Tree } from 'auricui';
import 'auricui/styles.css';

export default function Example() {
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
