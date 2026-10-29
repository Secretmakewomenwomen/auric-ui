import { classes, usageMetrics } from './shared';

export interface ContextUsageProps {
  used: number;
  limit: number;
  label?: string;
  unit?: string;
  warningAt?: number;
  className?: string;
}

export function ContextUsage({ used, limit, label = '上下文用量', unit = 'tokens', warningAt = 0.8, className }: ContextUsageProps) {
  const { valid, percent, over } = usageMetrics(used, limit);
  const threshold = Number.isFinite(warningAt) ? Math.max(0, Math.min(1, warningAt)) : 0.8;
  const text = valid ? `${used.toLocaleString('en-US')} / ${limit.toLocaleString('en-US')} ${unit}` : '—';
  return <div className={classes('auricui-context', className)} data-tone={over ? 'danger' : valid && percent >= threshold * 100 ? 'warning' : 'normal'}>
    <div className="auricui-context-heading"><span>{label}</span><span>{text}</span></div>
    <div className="auricui-context-track" role={valid ? "meter" : undefined} aria-label={valid ? label : undefined} aria-valuemin={valid ? 0 : undefined} aria-valuemax={valid ? 100 : undefined} aria-valuenow={valid ? percent : undefined} aria-valuetext={valid ? text : undefined}>
      <span style={{ transform: `scaleX(${percent / 100})` }}/>
    </div>
  </div>;
}
