import type { ComponentType } from 'react';
import * as examples from './examples/agent';
import { agentCatalog } from './agent-catalog';
export function AgentDemo({id}:{id:string}) {
  const item=agentCatalog.find(item=>item[0]===id);
  const Component=item?(examples as Record<string,ComponentType>)[`${item[1]}Example`]:null;
  return Component?<div className="docs-agent-example"><Component/></div>:null;
}
