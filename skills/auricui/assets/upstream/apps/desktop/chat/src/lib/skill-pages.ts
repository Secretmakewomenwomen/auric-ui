/**
 * A skill named in a message (its pill) is for that message. Its SKILL.md goes to the agent with it, unseen in the
 * chat, once per conversation: the agent keeps it in its own session from then on, so naming the skill again sends only
 * its name. What each agent's session was given is kept with the conversation (`skillsGiven`, by agent); a session the
 * agent could not take up again starts with nothing. Reads nothing, so `node --test` can use it.
 */

/** Per agent: its own session id (null before it has one) and the skills whose pages that session was given. */
export type SkillsGiven = Record<string, { session: string | null; names: string[] }>;

/** The skills named in this message whose pages go with it: those `agent`'s current `session` has not had. */
export function pagesToSend(named: readonly string[], given: Readonly<SkillsGiven> | undefined, agent: string, session: string | null): string[] {
  const had = given?.[agent];
  const known = new Set(had && had.session === session ? had.names : []);
  return [...new Set(named)].filter((name) => !known.has(name));
}

/**
 * What `agent` has been given once a message goes with the pages of `sent`. `session`: its session the message went to;
 * `fresh`: one just started that has nothing from before (the pages it holds are those of this message only).
 */
export function givenAfter(given: Readonly<SkillsGiven> | undefined, agent: string, session: string | null, sent: readonly string[], { fresh = false } = {}): SkillsGiven {
  const out: SkillsGiven = {};
  for (const [by, had] of Object.entries(given ?? {})) out[by] = { session: had.session, names: [...had.names] };
  const had = out[agent];
  const before = !fresh && had && had.session === session ? had.names : [];
  out[agent] = { session, names: [...new Set([...before, ...sent])] };
  return out;
}
