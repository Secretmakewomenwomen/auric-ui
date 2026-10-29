import type { HostAgent } from '@studio/lib/host';

/**
 * What Settings › Agents offers for an agent that is not found: Locate (the program is somewhere else), and Install,
 * either its official installer run here (`run`) or its install page (`page`). Claude Code waiting in the Claude app
 * gets neither: the app downloads it once its Code tab is opened, as the row says.
 */
export function missingActions(agent: Pick<HostAgent, 'setupRequired' | 'install' | 'installer'>, host: { locate: boolean; install: boolean }) {
  if (agent.setupRequired === 'code-tab') return { locate: false, install: null };
  const install: 'run' | 'page' | null = agent.installer && host.install ? 'run' : agent.install ? 'page' : null;
  return { locate: host.locate, install };
}

/**
 * The organization an account's line names, unless it only says the email again: a personal Claude account's
 * organization is "<email>'s Organization".
 */
export function accountOrg(account: { org?: string | null; email?: string | null }): string | null {
  if (!account.org) return null;
  return account.email && account.org === `${account.email}'s Organization` ? null : account.org;
}
