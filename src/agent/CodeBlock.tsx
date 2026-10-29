import { useId, type ReactNode } from 'react';
import { Check, Copy, ChevronDown, AlertCircle } from 'lucide-react';
import { classes, useControllable, useCopy } from './shared';

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  lineNumbers?: boolean;
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Optional highlighter supplied by the host. No HTML is injected by this component. */
  renderLine?: (line: string, index: number) => ReactNode;
  onCopyError?: (error: Error) => void;
  copyLabel?: string;
  copiedLabel?: string;
  errorLabel?: string;
  expandLabel?: string;
  collapseLabel?: string;
  className?: string;
}

/** Portable code viewer; the raw string is always what gets copied. */
export function CodeBlock({ code, language = 'text', filename, lineNumbers = false, collapsible = false, collapsed, defaultCollapsed = false,
  onCollapsedChange, renderLine, onCopyError, copyLabel = '复制代码', copiedLabel = '已复制', errorLabel = '复制失败，请手动选择代码', expandLabel = '展开代码', collapseLabel = '折叠代码', className }: CodeBlockProps) {
  const id = useId();
  const [closed, setClosed] = useControllable(collapsed, defaultCollapsed, onCollapsedChange);
  const { status, copy } = useCopy(onCopyError);
  const hidden = collapsible && closed;
  return <section className={classes('auricui-code', className)} aria-label={filename ?? `${language} code`}>
    <header className="auricui-code-header"><span>{filename ?? language}</span><div>
      {filename && <small>{language}</small>}
      <button className="auricui-agent-button" type="button" aria-label={copyLabel} title={copyLabel} onClick={() => void copy(code)}>
        <span key={status} className="auricui-agent-icon" aria-hidden="true">{status === 'copied' ? <Check size={14}/> : status === 'error' ? <AlertCircle size={14}/> : <Copy size={14}/>}</span>
      </button>
      {collapsible && <button className="auricui-agent-button" type="button" aria-label={hidden ? expandLabel : collapseLabel} aria-expanded={!hidden} aria-controls={id} onClick={() => setClosed(!closed)}><ChevronDown size={14} className="auricui-chevron" data-open={!hidden}/></button>}
    </div></header>
    <div className="auricui-collapse" data-open={!hidden} inert={hidden || undefined} aria-hidden={hidden || undefined} id={id}>
      <div><pre tabIndex={hidden ? -1 : 0}><code>{code.split('\n').map((line, index) => <span className="auricui-code-line" key={index}>{lineNumbers && <span className="auricui-line-number" aria-hidden="true">{index + 1}</span>}<span>{renderLine ? renderLine(line, index) : line}{'\n'}</span></span>)}</code></pre></div>
    </div>
    <span className="auricui-sr-only" role="status">{status === 'copied' ? copiedLabel : status === 'error' ? errorLabel : ''}</span>
  </section>;
}
