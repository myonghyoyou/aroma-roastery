import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostSpread, postHeading } from '@/components/archive/PostSpread';
import { sheetHref, toSheetItems } from '@/components/archive/types';
import { ARCHIVE_IN_MENU } from '@/components/site/SiteHeader';
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
  return {
    title: postHeading(post),
    description: post.summary,
    alternates: { canonical: sheetHref(post.slug) },
    // out of search while the archive is out of the menu
    ...(ARCHIVE_IN_MENU ? {} : { robots: { index: false, follow: true } }),
  };
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
