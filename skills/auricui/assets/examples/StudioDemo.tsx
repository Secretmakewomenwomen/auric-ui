import { useEffect, useState } from 'react';
import { AuricUIProvider } from 'auricui';
import { ProjectView, configureStudioHost, configureStudioTransport } from 'auricui/studio';
import { createStudioDemo } from 'auricui/demo';
import 'auricui/styles.css';

// One service-owning root per page; run this demo in the browser.
export default function StudioDemo() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const demo = createStudioDemo(setProjectId, setMessage);
    configureStudioTransport(demo.transport);
    configureStudioHost(demo.host);
    setProjectId(demo.projectId);
    return () => {
      configureStudioTransport(null);
      configureStudioHost(null);
      demo.dispose();
    };
  }, []);
  return <AuricUIProvider theme="dark">
    <div style={{height:'100dvh', position:'relative', overflow:'hidden'}}>
      {projectId ? <ProjectView projectId={projectId} onProject={setProjectId} onLeave={() => setMessage('请接入应用自己的返回导航。')} /> : <p role="status">准备本地演示…</p>}
      {message && <p role="status" style={{position:'fixed', bottom:16, left:16, zIndex:100, background:'var(--panel)', color:'var(--text)', padding:12}}>{message}</p>}
    </div>
  </AuricUIProvider>;
}
