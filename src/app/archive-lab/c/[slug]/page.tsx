import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FilmDetail } from '@/components/archive-lab/c/FilmDetail';
import { SubPage } from '@/components/site/SubPage';
import { getAdjacentPosts, getPost, getPosts } from '@/lib/content';
import '@/components/archive-lab/c/c.css';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts('archive');
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost('archive', (await params).slug);
  if (!post) return {};
  return { title: `${post.title} | aroma roastery`, description: post.summary };
}

export default async function LabCArchivePost({ params }: Props) {
  const post = await getPost('archive', (await params).slug);
  if (!post) notFound();
  const { newer, older } = await getAdjacentPosts(post);
  return (
    <SubPage current="archive">
      <FilmDetail post={post} newer={newer} older={older} />
    </SubPage>
  );
}
