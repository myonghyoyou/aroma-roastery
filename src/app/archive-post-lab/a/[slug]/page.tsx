import type { Metadata } from 'next';
import { LabPostPage, labMetadata } from '@/components/archive-post-lab/LabPostPage';
import { postLabParams } from '@/components/archive-post-lab/shared';

type Params = { params: Promise<{ slug: string }> };

export const generateStaticParams = postLabParams;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return labMetadata('a', (await params).slug);
}

export default async function Page({ params }: Params) {
  return <LabPostPage k="a" slug={(await params).slug} />;
}
