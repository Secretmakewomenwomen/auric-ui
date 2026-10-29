import { CardButton } from 'auricui';
import { useState } from 'react';
import { MessageBubble, MessageList } from 'auricui/agent';
import 'auricui/styles.css';

export default function Example() {
  const [count,setCount]=useState(8);
  return <div style={{width:'100%'}}><MessageList>{Array.from({length:count},(_,i)=><MessageBubble key={i} role={i%2?'assistant':'user'}>第 {i+1} 条消息。向上滚动查看历史时，新增消息会保留你的阅读位置。</MessageBubble>)}</MessageList><CardButton onClick={()=>setCount(count+1)}>追加消息</CardButton></div>;
}
