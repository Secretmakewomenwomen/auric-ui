import { useEffect, useMemo, useRef, useState } from 'react';
import type { CodeBlockProps } from '../agent/CodeBlock';
import { Check, Copy, ChevronDown } from 'lucide-react';

// Tokenize the whole document so block comments and template strings can span lines.
const tokenPattern = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(?:import|export|from|const|let|var|function|return|if|else|new|type|interface|extends|as|default|async|await|throw|typeof|keyof|undefined|void)\b|\b(?:true|false|null|\d+(?:\.\d+)?)\b|<\/?[A-Za-z][\w.]*(?=[\s/>])|\b[A-Z][\w]*\b|\b[a-zA-Z_$][\w$]*(?=\s*=)|[{}[\]().,:;=+!?/>-])/g;
function highlight(code: string) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  for (const match of code.matchAll(tokenPattern)) {
    const at = match.index;
    nodes.push(code.slice(last, at));
    const value = match[0];
    const kind = value.startsWith('//') || value.startsWith('/*') ? 'comment' : /^["'`]/.test(value) ? 'string' : /^<\/?/.test(value) ? 'tag' : /^(true|false|null|\d)/.test(value) ? 'number' : /^(import|export|from|const|let|var|function|return|if|else|new|type|interface|extends|as|default|async|await|throw|typeof|keyof|undefined|void)$/.test(value) ? 'keyword' : /^[A-Z]/.test(value) ? 'type' : /^[\w$]/.test(value) ? 'attribute' : 'punctuation';
    nodes.push(<span className={`docs-token-${kind}`} key={at}>{value}</span>);
    last = at + value.length;
  }
  nodes.push(code.slice(last));
  return nodes;
}

export function CodeEditor({ code, ...props }: CodeBlockProps) {
  const [value, setValue] = useState(code);
  const [editing, setEditing] = useState(false);
  const pre = useRef<HTMLPreElement>(null);
  useEffect(() => { setValue(code); setEditing(false); }, [code]);
  const highlighted = useMemo(() => highlight(value), [value]);
  const [closed, setClosed] = useState(props.defaultCollapsed ?? false);
  const [copied, setCopied] = useState(false);
  return <div className="docs-code-editor auricui-code">
    <header className="auricui-code-header"><span>{props.filename ?? 'tsx'}</span><div>
      <small>{props.language ?? 'tsx'}</small>
      <button className="auricui-agent-button" type="button" aria-label="复制代码" title="复制代码" onClick={() => { void navigator.clipboard.writeText(value).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 2000); }).catch(error => props.onCopyError?.(error)); }}>{copied ? <Check size={14}/> : <Copy size={14}/>}</button>
      {props.collapsible && <button className="auricui-agent-button" type="button" aria-label={closed ? props.expandLabel : props.collapseLabel} aria-expanded={!closed} onClick={() => setClosed(!closed)}><ChevronDown size={14}/></button>}
    </div></header>
    {!closed && <div className="docs-editor-surface">
      <pre ref={pre} aria-hidden="true"><code>{highlighted}{'\n'}</code></pre>
      <textarea aria-label="编辑 TypeScript 示例代码" value={value} spellCheck={false} onFocus={() => setEditing(true)} onChange={event => setValue(event.target.value)} onScroll={event => { if (pre.current) { pre.current.scrollTop = event.currentTarget.scrollTop; pre.current.scrollLeft = event.currentTarget.scrollLeft; } }} />
    </div>}
    {editing && value !== code && <button type="button" className="docs-editor-reset" onClick={() => setValue(code)}>重置代码</button>}
    <span className="auricui-sr-only" role="status">{copied ? '已复制' : ''}</span>
  </div>;
}
