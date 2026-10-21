import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SubPage } from '@/components/site/SubPage';
import { ConceptA } from './ConceptA';
import { ConceptB } from './ConceptB';
import { ConceptC } from './ConceptC';
import { ConceptD } from './ConceptD';
import { ConceptE } from './ConceptE';
import { NEWS_POST_NAMES, type NewsPostLabKey } from './concepts';
import { loadNewsView } from './shared';
// the lightbox comes from the archive, the related cards from the news list
import '@/components/archive/archive.css';
import '@/components/news/news.css';
import './lab.css';

const CONCEPTS = { a: ConceptA, b: ConceptB, c: ConceptC, d: ConceptD, e: ConceptE };

/** One news post drawn by one concept of the design study. */
export async function LabNewsPage({ k, slug }: { k: NewsPostLabKey; slug: string }) {
  const view = await loadNewsView(slug);
  if (!view) notFound();
  const Concept = CONCEPTS[k];
  return (
    <SubPage current="news">
      <div className={`nws npl npl--${k}`}>
        <Concept v={view} />
      </div>
    </SubPage>
  );
}

export async function labNewsMetadata(k: NewsPostLabKey, slug: string): Promise<Metadata> {
  const view = await loadNewsView(slug);
  return { title: `${k.toUpperCase()} ${NEWS_POST_NAMES[k]}: ${view?.post.title ?? '소식'} | aroma roastery` };
}
