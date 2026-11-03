import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { categories, entries } from '../registry';
import { getDoc } from './catalog';
import { useDocsLocale } from './locale';
import { docsEase, Flip, gsap, useGSAP, useMotionAllowed } from './motion/engine';

export function ComponentOverview({ filter, onFilterChange, motion = true }: { filter: string; onFilterChange: (filter: string) => void; motion?: boolean }) {
  const { t } = useDocsLocale();
  const root = useRef<HTMLDivElement>(null);
  const before = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const entrance = useRef<gsap.core.Tween | null>(null);
  const allowed = useMotionAllowed() && motion;
  const visible = entries.filter(entry => filter === '全部' || entry.category === filter);
  const cards = () => [...root.current!.querySelectorAll<HTMLElement>('.docs-overview-card:not([hidden])')];

  const { contextSafe } = useGSAP(() => {
    if (!root.current || !allowed) return;
    const bottom = root.current.closest('.docs-main')?.getBoundingClientRect().bottom ?? window.innerHeight;
    const initial = cards().filter(card => card.getBoundingClientRect().top < bottom).slice(0, 9);
    if (initial.length) entrance.current = gsap.from(initial, { y: 12, opacity: .15, duration: .4, stagger: .035, ease: docsEase, clearProps: 'transform,opacity' });
    return () => { entrance.current = null; };
  }, { scope: root, dependencies: [allowed], revertOnUpdate: true });

  const { context: flipContext } = useGSAP(() => {
    if (!before.current || !root.current || !allowed) { before.current = null; return; }
    animation.current = Flip.from(before.current, { targets: cards(), duration: .36, scale: true, ease: docsEase,
      onEnter: elements => gsap.fromTo(elements, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .3, stagger: { amount: .15 }, ease: docsEase, clearProps: 'transform,opacity' }),
    });
    before.current = null;
    return () => { animation.current = null; };
  }, { scope: root, dependencies: [filter, allowed], revertOnUpdate: true });

  const select = contextSafe((next: string) => {
    if (next === filter) return;
    entrance.current?.progress(1).kill();
    animation.current?.progress(1);
    // Revert before measuring, rather than after React changes the hidden cards.
    // Otherwise rapid filters can restore styles captured during the initial entrance.
    flipContext.revert();
    if (allowed) {
      const current = cards();
      gsap.killTweensOf(current);
      gsap.set(current, { clearProps: 'transform,opacity' });
      before.current = Flip.getState(current);
    }
    onFilterChange(next);
  });

  return <div ref={root} className="docs-overview">
    <div className="docs-page-kicker">COMPONENTS</div>
    <h1>{t('为下一次交互，找到合适的组件。')}</h1>
    <p className="docs-lead">{t('按功能浏览，进入详情即可预览状态、复制示例和查看属性。')}</p>
    <div className="docs-filter" role="group" aria-label={t('筛选组件分类')}>
      {['全部', 'Agent UI', 'Personal Agent', ...categories.filter(category => !['Agent UI', 'Personal Agent'].includes(category))].map(category => <button key={category} type="button" aria-pressed={filter === category} onClick={() => select(category)}>{t(category)}</button>)}
    </div>
    <div className="docs-overview-count" role="status">{visible.length}{t(' 个组件与组合示例')}</div>
    <div className="docs-overview-grid">
      {entries.map(entry => {
        const doc = getDoc(entry);
        return <a href={`#/components/${entry.id}`} key={entry.id} data-flip-id={entry.id} className="docs-overview-card" hidden={filter !== '全部' && entry.category !== filter}>
          <span className="docs-card-category">{t(entry.category)}{doc.isNew && <i>NEW</i>}</span>
          <strong>{doc.recipe ? entry.english : doc.symbol}</strong><span>{t(entry.name)}</span>
          <p>{t(entry.description)}</p><footer>{doc.recipe ? t('组合示例') : doc.entry}<ArrowUpRight size={14} aria-hidden="true" /></footer>
        </a>;
      })}
    </div>
  </div>;
}
