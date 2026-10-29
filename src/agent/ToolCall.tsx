import type { ReactNode } from 'react';
import { ReasoningDisclosure } from './ReasoningDisclosure';
import { CodeBlock } from './CodeBlock';
import { AgentStatus, type AgentState } from './AgentStatus';
export interface ToolCallProps {
  name: string;
  status: AgentState;
  input?: string;
  output?: ReactNode;
  error?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}
export function ToolCall({name,status,input,output,error,...props}:ToolCallProps) {
  return <ReasoningDisclosure {...props} title={name} meta={<AgentStatus status={status}/>}>{input !== undefined && <CodeBlock code={input} language="json" filename="Input"/>}{output !== undefined && <div className="auricui-tool-output">{output}</div>}{error && <p className="auricui-agent-error" role="alert">{error}</p>}</ReasoningDisclosure>;
}
