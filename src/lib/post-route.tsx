import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostArticle } from '@/components/posts/PostArticle';
import { SubPage } from '@/components/site/SubPage';
import { getAdjacentPosts, getPost, getPosts, type PostType } from '@/lib/content';

/* Shared pieces of the /archive/[slug] and /news/[slug] routes. */

export async function postStaticParams(type: PostType) {
  const posts = await getPosts(type);
  return posts.map((p) => ({ slug: p.slug }));
}

export async function postMetadata(type: PostType, slug: string): Promise<Metadata> {
  const post = await getPost(type, slug);
  if (!post) return {};
  return { title: `${post.title} | aroma roastery`, description: post.summary };
}

export async function PostRoute({ type, slug }: { type: PostType; slug: string }) {
  const post = await getPost(type, slug);
  if (!post) notFound();
  const { newer, older } = await getAdjacentPosts(post);
  return (
    <SubPage current={type}>
      <PostArticle post={post} newer={newer} older={older} />
    </SubPage>
  );
}
