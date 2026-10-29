import { CardButton } from 'auricui';
import { useState } from 'react';
import { ApprovalCard } from 'auricui/agent';
import 'auricui/styles.css';

export default function Example() {
  const [status,setStatus]=useState<'pending'|'approved'|'rejected'>('pending');
  return <div style={{display:'grid',gap:16,width:'100%'}}><ApprovalCard title="发送这封邮件？" description="收件人：design@example.com" status={status} onApprove={()=>setStatus('approved')} onReject={()=>setStatus('rejected')}><p>主题：本周设计评审</p></ApprovalCard>{status!=='pending'&&<CardButton onClick={()=>setStatus('pending')}>重新演示</CardButton>}</div>;
}
