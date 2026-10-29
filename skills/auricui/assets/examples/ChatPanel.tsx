'use client';
import { useEffect, useRef, useState } from 'react';
import { CardButton, Markdown, PromptEditor, type PromptEditorHandle,
  type PromptEditorState } from 'auricui/chat';
import './examples.css';

export type Reply = (draft: PromptEditorState, signal: AbortSignal) => AsyncIterable<string>;
type Message = { id: string; role: 'user' | 'assistant'; text: string };
const emptyDraft: PromptEditorState = { text: '', references: [] };

/** Mount under one AuricUIProvider with auricui/styles.css imported at the app root.
 * reply is supplied by your backend adapter; it yields text deltas, not cumulative text.
 * This simple example displays user text as plain text. Add PromptWithPills when enabling references.
 */
export function ChatPanel({ reply }: { reply: Reply }) {
  const editor = useRef<PromptEditorHandle>(null);
  const latest = useRef<PromptEditorState>(emptyDraft);
  const request = useRef<AbortController | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => () => { request.current?.abort(); request.current = null; }, []);

  const send = async () => {
    const input = latest.current;
    if (request.current || !input.text.trim()) return;
    const controller = new AbortController();
    request.current = controller;
    const answerId = crypto.randomUUID();
    setError(''); setBusy(true);
    setMessages(items => [...items,
      { id: crypto.randomUUID(), role: 'user', text: input.text },
      { id: answerId, role: 'assistant', text: '' },
    ]);
    editor.current?.clear(); latest.current = emptyDraft; setDraft(emptyDraft);
    try {
      for await (const delta of reply(input, controller.signal)) {
        if (controller.signal.aborted || request.current !== controller) break;
        setMessages(items => items.map(item => item.id === answerId ? {...item, text:item.text + delta} : item));
      }
    } catch (cause) {
      if (!controller.signal.aborted && request.current === controller) {
        setError(cause instanceof Error ? cause.message : '回复失败，请重试');
      }
    } finally {
      if (request.current === controller) { request.current = null; setBusy(false); }
    }
  };
  const stop = () => {
    request.current?.abort(); request.current = null; setBusy(false);
  };
  return <section className="auricui-chat auricui-example-chat" aria-label="AI 对话">
    <div className="auricui-example-messages" aria-busy={busy}>
      {messages.length === 0 && <p>输入内容开始对话。</p>}
      {messages.map(item => <article key={item.id} className="auricui-example-message">
        <small>{item.role === 'user' ? '你' : '助手'}</small>
        {item.role === 'assistant' ? <Markdown text={item.text || (busy ? '正在回复…' : '回复已停止')} /> : <p>{item.text}</p>}
      </article>)}
    </div>
    {error && <p className="auricui-example-error" role="alert">{error}</p>}
    <div className="auricui-example-composer">
      <PromptEditor ref={editor} defaultValue="" references={emptyDraft.references}
        onChange={value => { latest.current = value; setDraft(value); }} onSubmit={() => { void send(); }}
        placeholder="发送消息…" removeLabel="删除引用" ariaLabel="消息输入"
        minHeight={72} maxHeight={240} contentClassName="auricui-example-editor" disabled={busy} />
      <div className="auricui-example-actions">
        <CardButton weight="primary" disabled={!busy && !draft.text.trim()}
          onClick={busy ? stop : () => { void send(); }}>{busy ? '停止' : '发送'}</CardButton>
      </div>
    </div>
  </section>;
}
