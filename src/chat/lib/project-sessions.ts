import type { SkillsGiven } from './skill-pages';

/**
 * A project's sessions: their shape on the client, and how the session bar groups them by when they were last used.
 */

export interface ProjectSessionItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  /** How many turns the session has. 0: just opened, nothing said yet. */
  turns: number;
  /** Each agent's own id of this conversation (by agent): its next turn goes on with it, after a restart too. */
  agentSessions?: Record<string, string>;
  /** The skills whose SKILL.md each agent's session has had in this conversation (lib/skill-pages), by agent. */
  skillsGiven?: SkillsGiven;
}

export type SessionRecencyKey = 'today' | 'yesterday' | 'week' | 'earlier';

export interface SessionRecencyGroup {
  key: SessionRecencyKey;
  items: ProjectSessionItem[];
}

function startOfLocalDay(ts: number): number {
  const date = new Date(ts);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Groups into today, yesterday, the past 7 days and earlier, keeping the given order within each group.
 *
 * By updatedAt (else createdAt): a session talked in recently belongs under today, not the day it was created.
 */
export function groupSessionsByRecency(
  items: readonly ProjectSessionItem[],
  now = Date.now(),
): SessionRecencyGroup[] {
  const today = startOfLocalDay(now);
  const yesterday = today - 86_400_000;
  const week = today - 7 * 86_400_000;
  const buckets: Record<SessionRecencyKey, ProjectSessionItem[]> = {
    today: [],
    yesterday: [],
    week: [],
    earlier: [],
  };
  for (const item of items) {
    const at = Date.parse(item.updatedAt || item.createdAt);
    const key: SessionRecencyKey = Number.isNaN(at) || at >= today
      ? 'today'
      : at >= yesterday
        ? 'yesterday'
        : at >= week
          ? 'week'
          : 'earlier';
    buckets[key].push(item);
  }
  const order: SessionRecencyKey[] = ['today', 'yesterday', 'week', 'earlier'];
  return order
    .filter((key) => buckets[key].length > 0)
    .map((key) => ({ key, items: buckets[key] }));
}
