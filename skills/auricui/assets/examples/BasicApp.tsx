'use client';
import { useState } from 'react';
import { AuricUIProvider, Card, CardActions, CardButton, ConfirmDialog,
  SettingsDialog, SettingsPage, SettingsGroup, SettingsItem, SettingsField,
  SettingsSwitch, SettingsSelect, Toast, useToast } from 'auricui';
import 'auricui/styles.css';
import './examples.css';

export function BasicApp() {
  const [name, setName] = useState('我的应用');
  const [enabled, setEnabled] = useState(true);
  const [language, setLanguage] = useState('zh');
  const [settings, setSettings] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const toast = useToast();
  return <AuricUIProvider theme="dark">
    <main className="auricui-example-page">
      <Card title={name} body="应用设置示例">
        <CardActions>
          <CardButton onClick={() => setSettings(true)}>设置</CardButton>
          <CardButton weight="primary" onClick={() => setConfirm(true)}>重置设置</CardButton>
        </CardActions>
      </Card>
      <SettingsDialog open={settings} onClose={() => setSettings(false)} pages={[{
        id: 'general', title: '通用', group: '应用', icon: null,
        content: <SettingsPage><SettingsGroup title="偏好设置">
          <SettingsItem title="名称" control={<SettingsField aria-label="应用名称" value={name} onChange={e => setName(e.target.value)} />} />
          <SettingsItem title="通知" control={<SettingsSwitch label="启用通知" checked={enabled} onChange={setEnabled} />} />
          <SettingsItem title="语言" control={<SettingsSelect label="语言" value={language} onChange={setLanguage} options={[{value:'zh',label:'中文'},{value:'en',label:'English'}]} />} />
        </SettingsGroup></SettingsPage>,
      }]} />
      <ConfirmDialog open={confirm} title="重置设置？" description="恢复此示例的默认设置。"
        confirmLabel="重置" cancelLabel="取消" danger onCancel={() => setConfirm(false)}
        onConfirm={() => { setName('我的应用'); setEnabled(true); setLanguage('zh'); setConfirm(false); toast.show('已恢复默认设置'); }} />
      <Toast toast={toast.current} />
    </main>
  </AuricUIProvider>;
}
