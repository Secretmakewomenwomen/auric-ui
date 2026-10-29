import type { AgentAct, AgentActAsset, AgentAsk } from './agent-activity';
export const TRANSCRIPT_TEXT_MAX = 8_000;
export type PublicTimelineStep =
  | {
    id: string;
    kind: 'act';
    act: AgentAct;
    query?: string;
    asset?: AgentActAsset;
    ask?: AgentAsk;
    running?: boolean;
    turnNo?: number;
  }
  | {
    id: string;
    kind: 'text';
    text: string;
    running?: boolean;
    turnNo?: number;
  };

/** A turn's progress as a client sees it. */
export interface PublicProgressSnapshot {
  assetId: string;
  steps: PublicTimelineStep[];
  finished: boolean;
  updatedAt: number;
}

export function clipTranscriptText(text: string, max: number): string {
  if (text.length <= max) return text;
  const tail = (keep: number) => `\n…(+${text.length - keep})`;
  // keeping one less character can add a digit to the note: converge
  let keep = Math.max(0, max - tail(max).length);
  while (keep > 0 && keep + tail(keep).length > max) keep -= 1;
  return `${text.slice(0, keep)}${tail(keep)}`;
}

/**
 * Merges streamed text without repeats: the full text so far (it starts with the current) replaces it; a repeat
 * changes nothing; anything else is appended.
 */
export function mergeStreamText(cur: string, next: string): string {
  if (!cur) return next;
  if (next.startsWith(cur)) return next;
  if (cur.includes(next)) return cur;
  return cur + next;
}

/** Browser-facing events; validation belongs to the consuming service. */
export type PublicGenerationEvent =
 | {type:'agent-text';turnNo:number;partId?:string;done?:boolean;text:string}
 | {type:'agent-act';callId:string;turnNo:number;act:AgentAct;query?:string;ask?:AgentAsk}
 | {type:'agent-act-done';callId?:string;asset?:AgentActAsset}
 | {type:'agent-thinking';done?:boolean}
 | {type:'ask-settled';id:string;status:'answered'|'skipped'|'timeout';answer?:string}
 | {type:'context';percent:number;compacted?:boolean;parts?:Array<{kind:'system'|'tools'|'summary'|'history';percent:number}>}
 | {type:'completed'|'replied'|'failed'|'cancelled'|'paused'|'confirm'|'confirm-settled'|'resource-wait'|'ask'|'source-changed';[key:string]:unknown};
export interface TurnAttachment {kind:'image'|'document';name:string;thumb?:string;sha256?:string;path?:string;}
