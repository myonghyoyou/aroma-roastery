import type { Metadata } from 'next';
import { LabNewsPage, labNewsMetadata } from '@/components/news-post-lab/LabNewsPage';
import { newsLabParams } from '@/components/news-post-lab/shared';

type Params = { params: Promise<{ slug: string }> };

export const generateStaticParams = newsLabParams;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return labNewsMetadata('d', (await params).slug);
}

export default async function Page({ params }: Params) {
  return <LabNewsPage k="d" slug={(await params).slug} />;
}
