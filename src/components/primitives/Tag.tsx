import { useUiText } from '../../i18n/ui';
import { X } from 'lucide-react';
import type { HTMLAttributes, MouseEvent, ReactNode } from 'react';
import { classes, useControllable } from '../../agent/shared';
import { usePresence } from '../../lib/use-presence';
import type { FeedbackTone } from './feedback';

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClose' | 'children'> {
  children: ReactNode;
  /** 语义颜色，继承当前深色或浅色主题。 */
  tone?: FeedbackTone;
  /** 轻填充或描边样式。 */
  variant?: 'soft' | 'outline';
  /** sm 为 20px，md 为 24px。 */
  size?: 'sm' | 'md';
  icon?: ReactNode;
  /** 将标签内容渲染为可切换选中的按钮。 */
  checkable?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  /** 请求切换选中状态；受控模式下同步更新 checked。 */
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** 显示独立关闭按钮，不与选择按钮嵌套。 */
  closable?: boolean;
  /** 自定义关闭图标。 */
  closeIcon?: ReactNode;
  /** 关闭按钮的可访问名称。 */
  closeLabel?: string;
  /** 关闭请求；调用 event.preventDefault() 可以阻止关闭。 */
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** 受控可见状态；关闭后仍保留退场动画。 */
  visible?: boolean;
  /** 初始可见状态。 */
  defaultVisible?: boolean;
  /** 可见状态变化的请求。 */
  onVisibleChange?: (visible: boolean) => void;
  /** 退场动画完成后调用，可在这里从列表移除标签。 */
  onAfterClose?: () => void;
}

export function Tag({ children, tone = 'neutral', variant = 'soft', size = 'md', icon,
  checkable = false, checked, defaultChecked = false, onCheckedChange, disabled = false,
  closable = false, closeIcon, closeLabel, onClose, visible, defaultVisible = true,
  onVisibleChange, onAfterClose, className, ...props }: TagProps) {
  const uiText = useUiText();
  if (closeLabel === undefined) closeLabel = uiText("移除标签");

  const [selected, setSelected] = useControllable(checked, defaultChecked, onCheckedChange);
  const [isVisible, setVisible] = useControllable(visible, defaultVisible, onVisibleChange);
  const presence = usePresence(isVisible, onAfterClose);
  if (!presence.present) return null;
  const content = <>{icon && <span className="auricui-tag-icon" aria-hidden="true">{icon}</span>}<span className="auricui-tag-label">{children}</span></>;
  return <span {...props} className={classes('auricui-feedback auricui-tag', className)}
    data-tone={tone} data-variant={variant} data-size={size} data-checked={checkable && selected}
    data-disabled={disabled} data-state={presence.state} inert={!isVisible} aria-hidden={!isVisible || undefined}>
    <span className="auricui-tag-clip"><span className="auricui-tag-surface">
      {checkable ? <button type="button" className="auricui-tag-content" aria-pressed={selected} disabled={disabled}
        onClick={() => setSelected(!selected)}>{content}</button> : <span className="auricui-tag-content">{content}</span>}
      {closable && <button type="button" className="auricui-tag-close" aria-label={closeLabel} disabled={disabled}
        onClick={event => { event.stopPropagation(); onClose?.(event); if (!event.defaultPrevented) setVisible(false); }}>
        {closeIcon ?? <X size={12} aria-hidden="true" />}
      </button>}
    </span></span>
  </span>;
}
