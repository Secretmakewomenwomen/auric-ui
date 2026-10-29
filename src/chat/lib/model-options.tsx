import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AgentIconId } from "../components/AgentIcons";
import type { MenuOption } from "./agent-menu-rows";

export type LocalAgentId = AgentIconId | "byok";
export interface RosterAgent {
  id: LocalAgentId;
  name: string;
  status: "ready" | "checking" | "missing" | "waiting" | "setup";
}
export interface ModelSelection {
  agent: LocalAgentId;
  prefs: Partial<Record<LocalAgentId, Record<string, unknown>>>;
}
export interface ModelOptionsProps {
  agents: RosterAgent[];
  options: Partial<Record<LocalAgentId, MenuOption[]>>;
  value: ModelSelection;
  onChange: (value: ModelSelection) => void;
  onOpenSettings?: () => void;
  errors?: Partial<Record<LocalAgentId, { code?: string; text: string }>>;
  onRetry?: (agent: LocalAgentId) => void;
  children: ReactNode;
}
const ModelOptionsContext = createContext<Omit<
  ModelOptionsProps,
  "children"
> | null>(null);
export function ModelOptionsProvider({
  children,
  ...value
}: ModelOptionsProps) {
  return (
    <ModelOptionsContext.Provider value={value}>
      {children}
    </ModelOptionsContext.Provider>
  );
}
/** The host supplies its own catalogue and persistence. This module does not call a service. */
export function useLocalAgents() {
  const context = useContext(ModelOptionsContext);
  if (!context) throw new Error("ModelPopover requires ModelOptionsProvider");
  return useMemo(
    () => ({
      roster: context.agents,
      options: context.options,
      selected: context.value.agent,
      prefs: context.value.prefs,
      optionsError: context.errors ?? {},
      pick: (agent: LocalAgentId) =>
        context.onChange({ ...context.value, agent }),
      setPref: (agent: LocalAgentId, key: string, value: unknown) =>
        context.onChange({
          ...context.value,
          prefs: {
            ...context.value.prefs,
            [agent]: { ...context.value.prefs[agent], [key]: value },
          },
        }),
      ensureOptions: (agent: LocalAgentId, _options?: { retry: boolean }) =>
        context.onRetry?.(agent),
      openSettings: () => context.onOpenSettings?.(),
    }),
    [context]
  );
}
type State = ReturnType<typeof useLocalAgents>;
export const currentAgent = (state: State) => state.selected;
export const shownAgents = (roster: RosterAgent[]) => roster;
export const agentOptions = (state: State, agent: LocalAgentId) =>
  state.options[agent];
export const effectivePrefs = (
  prefs: ModelSelection["prefs"],
  agent: LocalAgentId,
  _roster: RosterAgent[],
  _options?: MenuOption[]
) => prefs[agent] ?? {};
export const optionValue = (
  options: MenuOption[] | undefined,
  prefs: Record<string, unknown>,
  id: string
) => prefs[id] ?? options?.find((o) => o.id === id)?.options?.[0]?.value;
export const optionLabel = (
  options: MenuOption[] | undefined,
  id: string,
  value: unknown
) =>
  options?.find((o) => o.id === id)?.options?.find((o) => o.value === value)
    ?.name;
export const offeredOption = (
  _agent: LocalAgentId,
  _roster: RosterAgent[],
  _option: MenuOption
) => true;
export const offeredChoices = (
  _agent: LocalAgentId,
  option: MenuOption,
  _chosen: unknown
) => option.options ?? [];
export function agentModelSummary(
  options: MenuOption[] | undefined,
  prefs: Record<string, unknown>
) {
  const name = (category: string) => {
    const option = options?.find((o) => o.category === category);
    return option
      ? optionLabel(
          options,
          option.id,
          optionValue(options, prefs, option.id)
        ) ?? null
      : null;
  };
  return { model: name("model"), effort: name("thought_level") };
}
