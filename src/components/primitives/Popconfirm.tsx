import { useUiText } from '../../i18n/ui';
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { CircleHelp, LoaderCircle, TriangleAlert } from 'lucide-react';
import { CardButton } from '../Card';
import { classes, useControllable } from '../../agent/shared';
import { AnchoredSurface } from './AnchoredSurface';

export interface PopconfirmProps {
  /** 触发按钮的名称；仅图标按钮也必须提供。 */
  label: string;
  /** 自定义触发按钮内容，不要嵌套按钮或链接。 */
  children?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** 确认回调；返回 Promise 时自动显示加载，成功关闭，失败保留浮层。 */
  onConfirm: () => void | Promise<void>;
  /** 取消、Escape、点击外部或再次点击触发按钮时调用。 */
  onCancel?: () => void;
  /** 确认失败回调，方便业务记录错误。 */
  onConfirmError?: (error: unknown) => void;
  /** 确认失败时展示的文案。 */
  errorText?: ReactNode;
  /** 确认按钮内容。 */
  confirmLabel?: ReactNode;
  /** 取消按钮内容。 */
  cancelLabel?: ReactNode;
  /** 危险操作使用红色图标与确认按钮。 */
  danger?: boolean;
  /** 自定义说明图标；false 隐藏。 */
  icon?: ReactNode | false;
  /** 外部业务控制的加载状态；自动 Promise 加载仍然生效。 */
  loading?: boolean;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 关闭过渡结束后调用。 */
  onAfterClose?: () => void;
  /** auto 优先向下，空间不足时向上。 */
  placement?: 'auto' | 'top' | 'bottom';
  /** 浮层与按钮的起始边或结束边对齐。 */
  align?: 'start' | 'end';
  /** 浮层层级，在弹窗中可覆盖。 */
  layer?: number;
  /** 触发按钮的视觉权重。 */
  weight?: 'primary' | 'secondary' | 'quiet' | 'danger';
  /** 触发按钮的附加样式。 */
  className?: string;
  /** 确认面板的附加样式。 */
  panelClassName?: string;
  /** 确认面板的样式，可覆盖宽度等外观。 */
  panelStyle?: CSSProperties;
}

export function Popconfirm({ label, children, title, description, onConfirm, onCancel, onConfirmError,
  errorText, confirmLabel, cancelLabel, danger = false, icon,
  loading = false, disabled = false, open, defaultOpen = false, onOpenChange, onAfterClose,
  placement = 'auto', align = 'start', layer = 10000, weight = 'secondary', className, panelClassName, panelStyle }: PopconfirmProps) {
  const uiText = useUiText();
  if (errorText === undefined) errorText = uiText("操作未完成，请重试。");
  if (confirmLabel === undefined) confirmLabel = uiText("确认");
  if (cancelLabel === undefined) cancelLabel = uiText("取消");

  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const request = useRef(0);
  const confirming = useRef(false);
  const id = useId();
  const expanded = isOpen && !disabled;
  const busy = loading || pending;
  const latestSetOpen = useRef(setOpen);
  latestSetOpen.current = setOpen;
  useEffect(() => { if (disabled && isOpen) latestSetOpen.current(false); }, [disabled, isOpen]);
  useLayoutEffect(() => {
    if (!expanded) { request.current++; confirming.current = false; setPending(false); setFailed(false); }
    return () => { request.current++; confirming.current = false; };
  }, [expanded]);

  const cancel = () => { if (expanded) { setOpen(false); onCancel?.(); } };
  const confirm = async () => {
    if (busy || confirming.current) return;
    const current = ++request.current;
    confirming.current = true;
    setPending(true); setFailed(false);
    try {
      await onConfirm();
      if (current === request.current) setOpen(false);
    } catch (error) {
      if (current === request.current) { setFailed(true); onConfirmError?.(error); }
    } finally {
      if (current === request.current) { confirming.current = false; setPending(false); }
    }
  };
  const Icon = danger ? TriangleAlert : CircleHelp;
  return <>
    <CardButton ref={trigger} weight={weight} disabled={disabled} className={classes('auricui-popconfirm-trigger', className)}
      aria-label={label} aria-haspopup="dialog" aria-expanded={expanded} aria-controls={expanded ? `${id}-dialog` : undefined}
      onClick={() => expanded ? cancel() : setOpen(true)}>{children ?? label}</CardButton>
    <AnchoredSurface open={expanded} anchor={trigger} id={`${id}-dialog`} titleId={`${id}-title`}
      descriptionId={description ? `${id}-description` : undefined} placement={placement} align={align} layer={layer}
      className={classes('auricui-popconfirm-panel', panelClassName)} style={panelStyle} onDismiss={cancel} onAfterClose={onAfterClose}>
      <div className="auricui-popconfirm-main">
        {icon !== false && <span className="auricui-popconfirm-icon" data-danger={danger} aria-hidden="true">{icon ?? <Icon size={16} strokeWidth={1.75} />}</span>}
        <div className="auricui-popconfirm-content">
          <div id={`${id}-title`} className="auricui-popconfirm-title">{title}</div>
          {description && <div id={`${id}-description`} className="auricui-popconfirm-description">{description}</div>}
          {failed && <div className="auricui-popconfirm-error" role="alert">{errorText}</div>}
        </div>
      </div>
      <div className="auricui-popconfirm-actions">
        <CardButton weight="quiet" data-autofocus="true" onClick={cancel}>{cancelLabel}</CardButton>
        <CardButton weight={danger ? 'danger' : 'primary'} disabled={busy} aria-busy={busy} onClick={() => void confirm()}>
          {busy && <LoaderCircle size={13} className="auricui-feedback-spin" aria-hidden="true" />}{confirmLabel}
        </CardButton>
      </div>
      <span className="auricui-feedback-sr" role="status">{busy ? uiText("正在处理") : ''}</span>
    </AnchoredSurface>
  </>;
}
