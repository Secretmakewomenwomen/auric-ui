import { useId, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Boxes, Check, CircleCheck, Layers3, RotateCcw } from 'lucide-react';
import { Card, CardButton } from '../components/Card';
import { SettingsField } from '../components/settings/ui';
import { Tag } from '../components/primitives/Tag';
import { Badge } from '../components/primitives/Badge';
import { Progress } from '../components/primitives/Progress';
import { useDocsLocale } from './locale';
import { docsEase, gsap, useGSAP, useMotionAllowed } from './motion/engine';

export function DocsHero({ motion = true }: { motion?: boolean }) {
  const { t } = useDocsLocale();
  const allowed = useMotionAllowed() && motion;
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const nameId = useId();
  const [name, setName] = useState<string | null>(null);
  const [chosen, setChosen] = useState(['interface', 'agent']);
  const [created, setCreated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const projectName = name ?? t('产品发布');

  useGSAP(() => {
    if (!allowed || !root.current) { setPlaying(false); timeline.current = null; return; }
    const narrow = window.matchMedia('(max-width: 680px)').matches;
    const parts = root.current.querySelectorAll('[data-assembly-part]');
    const copy = root.current.querySelectorAll('[data-hero-copy]');
    setPlaying(true);
    const sequence = gsap.timeline({ defaults: { ease: docsEase }, onComplete: () => setPlaying(false) });
    timeline.current = sequence;
    sequence.fromTo(copy, { y: narrow ? 8 : 24, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .075, clearProps: 'transform,opacity' }, 0)
      .fromTo('.docs-assembly-frame', { opacity: 0, y: narrow ? 6 : 16 }, { opacity: 1, y: 0, duration: .55, clearProps: 'transform,opacity' }, .12)
      .fromTo('.docs-assembly-card', { scale: .98, y: narrow ? 4 : 12, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: .55, clearProps: 'transform,opacity' }, .25)
      .fromTo(parts, { y: narrow ? 4 : 10, opacity: 0 }, { y: 0, opacity: 1, duration: .4, stagger: .13, clearProps: 'transform,opacity' }, .45)
      .fromTo('.docs-assembly-tags > span', { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: .32, stagger: .07, clearProps: 'transform,opacity' }, .85)
      .fromTo('.docs-assembly-progress .auricui-progress-track > span', { scaleX: 0 }, { scaleX: 1, duration: .7 }, 1.02)
      .fromTo('.docs-assembly-ready', { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: .32, clearProps: 'transform,opacity' }, 1.65)
      .fromTo('.docs-assembly-caption', { opacity: 0 }, { opacity: 1, duration: .3, clearProps: 'opacity' }, 1.65);
    return () => { timeline.current = null; };
  }, { scope: root, dependencies: [allowed], revertOnUpdate: true });

  const finish = () => { timeline.current?.progress(1).pause(); };
  const replay = () => {
    if (!allowed || !timeline.current) return;
    setPlaying(true);
    timeline.current.restart();
  };

  return <div ref={root} className="docs-hero" data-motion-state={playing ? 'playing' : 'ready'}>
    <div className="docs-hero-copy">
      <div className="docs-page-kicker" data-hero-copy>AURICUI / DEVELOPER DOCUMENTATION</div>
      <h1><span className="docs-hero-line"><span data-hero-copy>{t('细节统一，')}</span></span><span className="docs-hero-line"><span data-hero-copy>{t('构建自由。')}</span></span></h1>
      <p className="docs-lead" data-hero-copy>{t('从日常控件、对话到 Agent 工作台，用可组合的 React 组件构建你的下一个界面。')}</p>
      <div className="docs-hero-actions" data-hero-copy>
        <a className="docs-hero-primary" href="#/overview">{t('探索组件')}<ArrowUpRight size={15} aria-hidden="true" /></a>
        <a className="docs-hero-secondary" href="#/components/dropdown">{t('试用 Dropdown')}<ArrowRight size={14} aria-hidden="true" /></a>
      </div>
      <div className="docs-hero-meta" data-hero-copy><span>React 19</span><i aria-hidden="true" /><span>TypeScript</span><i aria-hidden="true" /><span>{t('为交互而生')}</span></div>
    </div>

    <figure className="docs-assembly" aria-label={t('组件组合演示')}>
      <div className="docs-assembly-frame">
        <div className="docs-assembly-bar"><span><Layers3 size={14} aria-hidden="true" />{t('从组件到界面')}</span><Badge dot tone="success" label={t('实时组件')} /><span className="docs-assembly-live">LIVE</span></div>
        <div className="docs-assembly-stage" onPointerDownCapture={finish} onFocusCapture={finish}>
          <div className="docs-assembly-measure" aria-hidden="true"><span /><span /><span /><span /></div>
          <Card className="docs-assembly-card" icon={<Boxes size={17} />} title={<span data-assembly-part>{t('创建你的工作空间')}</span>}>
            <div className="docs-assembly-field" data-assembly-part>
              <label htmlFor={nameId}>{t('项目名称')}</label>
              <SettingsField id={nameId} value={projectName} onChange={event => { setName(event.target.value); setCreated(false); }} />
            </div>
            <div className="docs-assembly-options" data-assembly-part>
              <span>{t('选择你的构建模块')}</span>
              <div className="docs-assembly-tags" role="group" aria-label={t('构建模块')}>
                {[['interface', '界面'], ['agent', 'Agent'], ['docs', '文档模块']].map(([id, label]) => <Tag key={id} checkable checked={chosen.includes(id)} tone={chosen.includes(id) ? 'info' : 'neutral'} onCheckedChange={checked => { setChosen(current => checked ? [...current, id] : current.filter(value => value !== id)); setCreated(false); }} icon={chosen.includes(id) ? <Check size={12} /> : undefined}>{t(label)}</Tag>)}
              </div>
            </div>
            <div className="docs-assembly-progress" data-assembly-part><Progress label={t('组件已就绪')} value={100} showValue /></div>
            <div className="docs-assembly-ready">
              <span className="docs-assembly-status" role="status"><CircleCheck size={14} aria-hidden="true" />{t(created ? '工作空间已创建' : '准备开始')}</span>
              <CardButton weight="primary" disabled={!projectName.trim() || created} onClick={() => setCreated(true)}>{t(created ? '已创建' : '创建')}<ArrowRight size={13} aria-hidden="true" /></CardButton>
            </div>
          </Card>
        </div>
        <figcaption className="docs-assembly-caption"><span>{t('真实组件，试着操作一下。')}</span><button type="button" onClick={replay} disabled={!allowed} aria-label={t('重播组件组合动效')} title={t(allowed ? '重播组件组合动效' : '已遵循减少动态效果设置')}><RotateCcw size={13} aria-hidden="true" />{t('重播')}</button></figcaption>
      </div>
    </figure>
  </div>;
}
