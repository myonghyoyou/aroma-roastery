import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SubPage } from '@/components/site/SubPage';
import { ConceptA } from './ConceptA';
import { ConceptB } from './ConceptB';
import { ConceptC } from './ConceptC';
import { ConceptD } from './ConceptD';
import { ConceptE } from './ConceptE';
import { POST_LAB_NAMES, type PostLabKey } from './concepts';
import { loadPostView } from './shared';
// the lightbox and the sample tag come from the archive's own sheet
import '@/components/archive/archive.css';
import './lab.css';

const CONCEPTS = { a: ConceptA, b: ConceptB, c: ConceptC, d: ConceptD, e: ConceptE };

/** One archive post drawn by one concept of the design study. */
export async function LabPostPage({ k, slug }: { k: PostLabKey; slug: string }) {
  const view = await loadPostView(slug);
  if (!view) notFound();
  const Concept = CONCEPTS[k];
  return (
    <SubPage current="archive">
      <div className={`apl apl--${k}`}>
        <Concept v={view} />
      </div>
    </SubPage>
  );
}

export async function labMetadata(k: PostLabKey, slug: string): Promise<Metadata> {
  const view = await loadPostView(slug);
  return { title: `${k.toUpperCase()} ${POST_LAB_NAMES[k]}: ${view?.heading ?? '기록'} | aroma roastery` };
}
