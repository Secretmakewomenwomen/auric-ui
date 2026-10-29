import { classes } from './shared';
export interface RunMetric { label:string; value:string; }
export interface RunSummaryProps { metrics:RunMetric[]; label?:string; className?:string; }
export function RunSummary({metrics,label='执行概况',className}:RunSummaryProps) {
  return <dl className={classes('auricui-run-summary',className)} aria-label={label}>{metrics.map((metric,i)=><div key={`${metric.label}-${i}`}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}</dl>;
}
