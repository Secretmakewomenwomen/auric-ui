import { useState } from 'react';
import { CardButton } from './components/Card';
import { SettingsGroup, SettingsItem, SettingsSwitch } from './components/settings/ui';
import { SettingsSelect } from './components/settings/SettingsSelect';

export function Preferences({ notify }: { notify: (text: string) => void }) {
  const [saved] = useState(() => {
    try {
      return (
        JSON.parse((localStorage.getItem("auricui.preferences") ?? localStorage.getItem("frame-ui.preferences")) || "{}") || {}
      );
    } catch {
      return {};
    }
  });
  const [auto, setAuto] = useState<boolean>(
      typeof saved.auto === "boolean" ? saved.auto : true
    ),
    [alerts, setAlerts] = useState<boolean>(
      typeof saved.alerts === "boolean" ? saved.alerts : false
    ),
    [quality, setQuality] = useState<string>(
      ["standard", "high", "auto"].includes(saved.quality)
        ? saved.quality
        : "standard"
    );
  return (
    <>
      <SettingsGroup title="编辑偏好">
        <SettingsItem
          title="自动保存"
          description="在本地保留工作中的调整"
          control={
            <SettingsSwitch
              label="偏好自动保存"
              checked={auto}
              onChange={setAuto}
            />
          }
        />
        <SettingsItem
          title="完成通知"
          description="任务结束时显示轻提示"
          control={
            <SettingsSwitch
              label="偏好完成通知"
              checked={alerts}
              onChange={setAlerts}
            />
          }
        />
        <SettingsItem
          title="预览质量"
          description="选择当前工作区的渲染质量"
          control={
            <SettingsSelect
              label="预览质量"
              value={quality}
              onChange={setQuality}
              options={[
                { value: "standard", label: "标准" },
                { value: "high", label: "高清" },
                { value: "auto", label: "自动" },
              ]}
            />
          }
        />
      </SettingsGroup>
      <div className="flex justify-end">
        <CardButton
          weight="primary"
          onClick={() => {
            localStorage.setItem(
              "auricui.preferences",
              JSON.stringify({ auto, alerts, quality })
            );
            notify("偏好设置已保存到本机");
          }}
        >
          保存偏好
        </CardButton>
      </div>
    </>
  );
}
