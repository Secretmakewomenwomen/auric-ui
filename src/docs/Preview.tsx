import type { ComponentType } from 'react';
import * as agent from './examples/agent';
import * as core from './examples/core';
import * as chat from './examples/chat';
import * as primitives from './examples/primitives';
import * as recipes from './examples/recipes';
import * as states from './examples/states';
import * as studio from './examples/studio';
import type { Entry } from '../registry';
import { getDoc } from './catalog';
const all:Record<string,ComponentType>={...agent,...core,...chat,...recipes,...primitives,...states,...studio};
export function Preview({entry,notify,example}:{entry:Entry;notify:(text:string)=>void;example?:string}) {
  const doc=getDoc(entry);
  const Example=all[`${example??doc.example??doc.symbol}Example`];
  if(!Example)throw new Error(`Missing documentation example: ${entry.id}`);
  return <div className="docs-agent-example"><Example/></div>;
}
