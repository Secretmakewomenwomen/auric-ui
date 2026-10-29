import { CardButton } from 'auricui';
import { useState } from 'react';
import { MemoryCard } from 'auricui/agent';
import 'auricui/styles.css';

export default function Example() {
  const [content,setContent]=useState('我偏好简洁的回答，重要事项使用列表。');
  const [forgotten,setForgotten]=useState(false);
  return forgotten?<CardButton onClick={()=>setForgotten(false)}>重新演示记忆</CardButton>:<MemoryCard content={content} source="你的明确偏好" updatedAt="今天 09:00" onEdit={()=>setContent('我喜欢先看到结论，再阅读详细说明。')} onForget={()=>setForgotten(true)}/>;
}
