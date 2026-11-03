import { useSampleText } from './studio/lib/sample-i18n';
import { useState } from 'react';
import { CardButton } from './components/Card';
import { SettingsGroup, SettingsItem, SettingsSwitch } from './components/settings/ui';
import { SettingsSelect } from './components/settings/SettingsSelect';

export function Preferences({ notify }: { notify: (text: string) => void }) {
  const demoText = useSampleText();


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
      <SettingsGroup title={demoText("编辑偏好")}>
        <SettingsItem
          title={demoText("自动保存")}
          description={demoText("在本地保留工作中的调整")}
          control={
            <SettingsSwitch
              label={demoText("偏好自动保存")}
              checked={auto}
              onChange={setAuto}
            />
          }
        />
        <SettingsItem
          title={demoText("完成通知")}
          description={demoText("任务结束时显示轻提示")}
          control={
            <SettingsSwitch
              label={demoText("偏好完成通知")}
              checked={alerts}
              onChange={setAlerts}
            />
          }
        />
        <SettingsItem
          title={demoText("预览质量")}
          description={demoText("选择当前工作区的渲染质量")}
          control={
            <SettingsSelect
              label={demoText("预览质量")}
              value={quality}
              onChange={setQuality}
              options={[
                { value: "standard", label: demoText("标准") },
                { value: "high", label: demoText("高清") },
                { value: "auto", label: demoText("自动") },
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
            notify(demoText("偏好设置已保存到本机"));
          }}
        >{demoText("保存偏好")}</CardButton>
      </div>
    </>
  );
}
