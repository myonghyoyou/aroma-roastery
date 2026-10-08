import { PostRoute, postMetadata, postStaticParams } from '@/lib/post-route';

export function generateStaticParams() {
  return postStaticParams('archive');
}

export async function generateMetadata({ params }: PageProps<'/archive/[slug]'>) {
  return postMetadata('archive', (await params).slug);
}

export default async function ArchivePost({ params }: PageProps<'/archive/[slug]'>) {
  return <PostRoute type="archive" slug={(await params).slug} />;
}
