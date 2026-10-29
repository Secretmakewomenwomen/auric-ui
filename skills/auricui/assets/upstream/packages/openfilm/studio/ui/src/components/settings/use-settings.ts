import React from 'react';
import { studioHost } from '../../lib/host';
import type { SettingsSection } from './SettingsModal';

/** Both editor and launcher follow the native Settings command; each page has its own dialog. */
export function useSettings() {
  const [section, setSection] = React.useState<SettingsSection | null>(null);
  React.useEffect(() => studioHost?.settings?.onOpen(() => setSection('general')), []);
  return [section, setSection] as const;
}
