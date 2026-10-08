import { PostRoute, postMetadata, postStaticParams } from '@/lib/post-route';

export function generateStaticParams() {
  return postStaticParams('news');
}

export async function generateMetadata({ params }: PageProps<'/news/[slug]'>) {
  return postMetadata('news', (await params).slug);
}

export default async function NewsPost({ params }: PageProps<'/news/[slug]'>) {
  return <PostRoute type="news" slug={(await params).slug} />;
}
