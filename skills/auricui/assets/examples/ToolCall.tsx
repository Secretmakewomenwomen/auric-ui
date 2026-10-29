import { CardButton } from 'auricui';
import { useState } from 'react';
import { ToolCall } from 'auricui/agent';
import 'auricui/styles.css';

export default function Example() {
  const [done,setDone]=useState(false);
  return <div style={{display:'grid',gap:16,width:'100%'}}><ToolCall name="search_documents" status={done?'success':'running'} defaultOpen input={'{"query": "设计规范"}'} output={done?'找到 3 份相关文档。':'正在检索…'}/><CardButton onClick={()=>setDone(!done)}>{done?'重新演示':'模拟完成'}</CardButton></div>;
}
