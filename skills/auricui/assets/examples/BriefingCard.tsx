import { useState } from 'react';
import { BriefingCard } from 'auricui/agent';
import 'auricui/styles.css';

export default function Example() {
  const [selected,setSelected]=useState('');
  return <div style={{width:'100%'}}><BriefingCard title="早上好" subtitle="今天有一些值得关注的小事。" items={[{id:'1',title:'产品设计评审',detail:'准备好你的三个关键问题',meta:'10:30',onSelect:()=>setSelected('产品设计评审')},{id:'2',title:'阅读计划',detail:'本周已经完成 2 天',meta:'20 分钟'}]} footer="根据你提供的日程与目标整理"/>{selected&&<p role="status" style={{fontSize:12,marginTop:12}}>已选择：{selected}</p>}</div>;
}
