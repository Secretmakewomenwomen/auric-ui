import { useUiText } from '../../i18n/ui';
import { useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { classes } from '../../agent/shared';
import { usePresence } from '../../lib/use-presence';
import type { FeedbackTone } from './feedback';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** 数量或短文字；无效数字不显示，负数按 0 处理。 */
  count?: number | string;
  /** 超过该值显示 n+；辅助技术仍读取实际数量。 */
  overflowCount?: number;
  /** 计数为 0 时仍显示。 */
  showZero?: boolean;
  /** 仅显示状态点，忽略 count。 */
  dot?: boolean;
  /** 语义颜色。 */
  tone?: FeedbackTone;
  /** 可选的状态文字，显示在徽标旁。 */
  text?: ReactNode;
  /** 徽标的可访问名称，例如“8 条未读消息”。 */
  label?: string;
  /** 有 children 时将徽标附着于其右上角。 */
  children?: ReactNode;
  /** 附着徽标的横、纵偏移，单位 px。 */
  offset?: readonly [number, number];
  /** 计数徽标高度：sm 16px，md 18px。 */
  size?: 'sm' | 'md';
}

export function Badge({ count, overflowCount = 99, showZero = false, dot = false, tone = 'danger',
  text, label, children, offset = [0, 0], size = 'md', className, ...props }: BadgeProps) {
  const uiText = useUiText();
  const number = typeof count === 'number' && Number.isFinite(count) ? Math.max(0, Math.floor(count)) : undefined;
  const limit = Number.isFinite(overflowCount) ? Math.max(0, Math.floor(overflowCount)) : 99;
  const visible = dot || (number !== undefined ? number > 0 || showZero : typeof count === 'string' && count.trim().length > 0);
  const value = dot ? '' : number !== undefined ? number > limit ? `${limit}+` : String(number) : count;
  const previous = useRef(value);
  useLayoutEffect(() => { if (visible) previous.current = value; }, [visible, value]);
  const displayed = visible ? value : previous.current;
  const presence = usePresence(visible);
  const attached = children !== undefined && children !== null;
  const name = label ?? (dot ? uiText("有新通知") : number !== undefined ? uiText("${0} 条通知", number) : String(count ?? ''));
  return <span {...props} className={classes('auricui-feedback auricui-badge', className)} data-tone={tone} data-size={size} data-attached={attached}>
    {children}
    {presence.present && <span className="auricui-badge-position" data-dot={dot}
      style={attached ? { right: -offset[0], top: offset[1] } : undefined}>
      <span className="auricui-badge-indicator" data-state={presence.state} aria-hidden={!visible || undefined}>
        <span key={String(displayed)} className="auricui-badge-value" aria-hidden="true">{displayed}</span>
      </span>
    </span>}
    <span className="auricui-feedback-sr" role="status" aria-atomic="true">{visible ? name : ''}</span>
    {text && <span className="auricui-badge-text">{text}</span>}
  </span>;
}
