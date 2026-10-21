import Link from 'next/link';
import { MediaView } from '@/components/archive/MediaView';
import { TextBlocks } from '@/components/archive/TextBlocks';
import { Zoomable } from '@/components/archive/Zoomable';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import type { Post } from '@/lib/content';
import { newsLabHref } from './concepts';
import type { NewsView } from './shared';

/*
 * B, after Square Mile: an editorial page that ends in the shop. Date and title, the first photo
 * wide, the lead in bold, the text and the other photos, the previous and next stories with their
 * titles, then a closing block: the online store for a bean, the hours and the maps for a notice.
 */
export function ConceptB({ v }: { v: NewsView }) {
  const { post, items, lead, rest, newer, older, settings } = v;
  const topic = post.topic ?? 'notice';
  const [hero, ...more] = items;
  return (
    <article className="npl-b" data-topic={topic}>
      <header className="npl-b-head">
        <p className="npl-meta"><span className="npl-topic">{TOPIC_LABEL[topic]}</span><time dateTime={post.date}>{formatDate(post.date)}</time></p>
        <h1 className="npl-b-title">{post.title}</h1>
      </header>

      {hero && <figure className="npl-b-hero"><MediaView photo={hero.photo} className="npl-b-hero-img" eager /></figure>}

      <div className="npl-b-col">
        {lead && <p className="npl-b-lead">{lead}</p>}
        <TextBlocks blocks={rest} className="npl-text" />
        {more.length > 0 && <Zoomable items={more} title={post.title} listClassName="npl-b-more" mediaClassName="npl-img" />}
        {post.permalink && <p className="npl-b-orig"><a href={post.permalink} target="_blank" rel="noopener">인스타그램 원문 보기</a></p>}
      </div>

      <nav className="npl-b-stories" aria-label="앞뒤 소식">
        <Story post={newer} label="최근 소식" dir="newer" />
        <Story post={older} label="이전 소식" dir="older" />
      </nav>

      {topic === 'beans' ? (
        <section className="npl-b-shop" aria-labelledby="npl-b-shop-h">
          <h2 id="npl-b-shop-h">매장과 온라인 스토어에서 만나 보세요</h2>
          <p>{post.title.replace(/\s*입고$/, '')} 원두는 매장에서 마시고, 온라인 스토어에서 홀빈과 드립백으로 살 수 있습니다. 소량 입고된 원두는 스토어에 없을 수 있습니다.</p>
          <a className="npl-btn npl-btn--solid" href={settings.storeUrl} target="_blank" rel="noopener">온라인 스토어 바로가기</a>
        </section>
      ) : (
        <section className="npl-b-shop" aria-labelledby="npl-b-shop-h">
          <h2 id="npl-b-shop-h">평소 영업시간</h2>
          <dl className="npl-b-hours">
            {settings.hours.map((h) => <div key={h.label}><dt>{h.label}</dt><dd>{h.value}</dd></div>)}
          </dl>
          <p className="npl-b-maps">
            <a className="npl-btn" href={settings.mapUrl} target="_blank" rel="noopener">네이버 지도</a>
            <a className="npl-btn" href={settings.kakaoMapUrl} target="_blank" rel="noopener">카카오맵</a>
          </p>
        </section>
      )}

      <p className="npl-b-list"><Link href="/news" className="npl-btn">소식 목록</Link></p>
    </article>
  );
}

function Story({ post, label, dir }: { post: Post | null; label: string; dir: 'newer' | 'older' }) {
  const cls = `npl-b-story npl-b-story--${dir}`;
  if (!post) return <span className={`${cls} is-off`}><span className="npl-b-story-label">{label}</span><span>없음</span></span>;
  return (
    <Link href={newsLabHref('b', post.slug)} className={cls}>
      <span className="npl-b-story-label">{dir === 'newer' ? '‹ ' : ''}{label}{dir === 'older' ? ' ›' : ''}</span>
      <span className="npl-b-story-title">{post.title}</span>
    </Link>
  );
}
