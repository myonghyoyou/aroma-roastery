import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NewsPost } from '@/components/news/NewsPost';
import { cardHref } from '@/components/news/types';
import { beanOf, leadOf, photosOf } from '@/components/news/view';
import { SubPage } from '@/components/site/SubPage';
import { readOverrides } from '@/lib/cupnotes-store';
import { getAdjacentPosts, getPost, getPosts, getSiteSettings } from '@/lib/content';
import { jsonLdHtml, openGraphFor, postJsonLd } from '@/lib/site';
import '@/components/news/news.css';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts('news');
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPost('news', (await params).slug);
  if (!post) return {};
  const path = cardHref(post.slug);
  const image = post.cover?.kind === 'image' ? post.cover.src : post.cover?.poster;
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: path },
    // the post's own photo as its share preview; posts without one keep the site's image
    openGraph: openGraphFor(path, {
      type: 'article', publishedTime: post.date, title: post.title, description: post.summary,
      ...(image ? { images: [{ url: image, alt: post.cover?.alt ?? post.title }] } : {}),
    }),
  };
}

/* A news post: concept F of the post study (see NewsPost). */
export default async function NewsPostPage({ params }: Params) {
  const post = await getPost('news', (await params).slug);
  if (!post) notFound();
  const [{ newer, older }, settings, overrides] = await Promise.all([getAdjacentPosts(post), getSiteSettings(), readOverrides()]);
  const { lead, rest } = leadOf(post);
  return (
    <SubPage current="news">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(postJsonLd(post, cardHref(post.slug)))} />
      <div className="nws nwp-page-wrap">
        <NewsPost
          post={post}
          photos={photosOf(post)}
          bean={beanOf(post, overrides)}
          lead={lead}
          rest={rest}
          newer={newer}
          older={older}
          storeUrl={settings.storeUrl}
          hrefOf={cardHref}
        />
      </div>
    </SubPage>
  );
}
