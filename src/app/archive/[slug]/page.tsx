import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostSpread, postHeading } from '@/components/archive/PostSpread';
import { sheetHref, toSheetItems } from '@/components/archive/types';
import { SubPage } from '@/components/site/SubPage';
import { getAdjacentPosts, getPost, getPosts } from '@/lib/content';
import '@/components/archive/archive.css';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts('archive');
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPost('archive', (await params).slug);
  if (!post) return {};
  return { title: `${postHeading(post)} | aroma roastery`, description: post.summary };
}

export default async function ArchivePost({ params }: Params) {
  const post = await getPost('archive', (await params).slug);
  if (!post) notFound();
  const { newer, older } = await getAdjacentPosts(post);
  return (
    <SubPage current="archive">
      <div className="arc arc-post">
        <PostSpread post={post} items={toSheetItems([post])} newer={newer} older={older} hrefOf={sheetHref} />
      </div>
    </SubPage>
  );
}
