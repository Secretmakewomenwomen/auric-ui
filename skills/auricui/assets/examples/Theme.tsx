import { useState } from 'react';
import { AuricUIProvider, CardButton } from 'auricui';
import 'auricui/styles.css';

export default function Example() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  return <AuricUIProvider theme={theme}>
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', padding: 24 }}>
      <CardButton onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        切换到{theme === 'dark' ? '浅色' : '深色'}
      </CardButton>
    </main>
  </AuricUIProvider>;
}
