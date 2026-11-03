import { useUiText } from '../../i18n/ui';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import type { HTMLAttributes, MouseEvent, ReactNode } from 'react';
import { classes, useControllable } from '../../agent/shared';
import { usePresence } from '../../lib/use-presence';
import type { FeedbackTone } from './feedback';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onClose'> {
  title: ReactNode;
  description?: ReactNode;
  /** 语义类型；danger 默认使用 alert，其余使用 status 语义。 */
  tone?: FeedbackTone;
  /** 自定义图标；false 隐藏图标。 */
  icon?: ReactNode | false;
  /** 操作区域，可放入按钮或链接。 */
  action?: ReactNode;
  /** 显示关闭按钮。 */
  closable?: boolean;
  /** 关闭按钮的可访问名称。 */
  closeLabel?: string;
  /** 关闭请求；调用 event.preventDefault() 可以阻止关闭。 */
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** 受控可见状态。 */
  visible?: boolean;
  /** 初始可见状态。 */
  defaultVisible?: boolean;
  /** 请求改变可见状态。 */
  onVisibleChange?: (visible: boolean) => void;
  /** 完成退场后调用，可用于清理列表数据。 */
  onAfterClose?: () => void;
}

const icons = { neutral: Info, info: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleAlert };

export function Alert({ title, description, tone = 'info', icon, action, closable = false, closeLabel,
  onClose, visible, defaultVisible = true, onVisibleChange, onAfterClose, children, className, role, ...props }: AlertProps) {
  const uiText = useUiText();
  if (closeLabel === undefined) closeLabel = uiText("关闭提示");

  const [isVisible, setVisible] = useControllable(visible, defaultVisible, onVisibleChange);
  const presence = usePresence(isVisible, onAfterClose);
  const Icon = icons[tone];
  if (!presence.present) return null;
  return <div {...props} className={classes('auricui-feedback auricui-alert', className)} data-tone={tone}
    data-state={presence.state} inert={!isVisible} aria-hidden={!isVisible || undefined}>
    <div className="auricui-alert-clip"><div className="auricui-alert-surface">
      {icon !== false && <span className="auricui-alert-icon" aria-hidden="true">{icon ?? <Icon size={16} strokeWidth={1.75} />}</span>}
      <div className="auricui-alert-content">
        <div role={role ?? (tone === 'danger' ? 'alert' : 'status')} aria-atomic="true">
          <div className="auricui-alert-title">{title}</div>
          {description && <div className="auricui-alert-description">{description}</div>}
        </div>
        {children && <div className="auricui-alert-description">{children}</div>}
        {action && <div className="auricui-alert-actions">{action}</div>}
      </div>
      {closable && <button type="button" className="auricui-feedback-close" aria-label={closeLabel}
        onClick={event => { onClose?.(event); if (!event.defaultPrevented) setVisible(false); }}><X size={14} aria-hidden="true" /></button>}
    </div></div>
  </div>;
}
