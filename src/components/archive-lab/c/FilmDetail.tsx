import Link from 'next/link';
import type { Block, Photo, Post } from '@/lib/content';
import { CATEGORY_LABEL, formatDate } from '@/lib/post-utils';
import { FrameLightbox } from './FrameLightbox';
import { frameLabel, LAB_C_LEAF, LAB_C_LIST, labCHref } from './shared';

type Frame = { photo: Photo; index: number };
type Group = { kind: 'pair'; frames: [Frame, Frame] } | { kind: 'wide'; frame: Frame } | { kind: 'single'; frame: Frame };
type TextBlock = Exclude<Block, { type: 'gallery' } | { type: 'media' }>;

const isWide = (p: Photo) => p.w / p.h > 1.1;

/*
 * The paired rhythm: two upright (or square) photos side by side, then one wide photo across.
 * Photos keep the order of the post's photos array inside each kind; when one kind runs out the
 * other continues (wide photos stay full width, a last upright photo stands alone with its caption beside it).
 */
function planGroups(photos: Photo[]): Group[] {
  const tall: Frame[] = [];
  const wide: Frame[] = [];
  photos.forEach((photo, index) => (isWide(photo) ? wide : tall).push({ photo, index }));
  const groups: Group[] = [];
  let wantPair = true;
  while (tall.length || wide.length) {
    if (wantPair && tall.length >= 2) {
      groups.push({ kind: 'pair', frames: [tall.shift()!, tall.shift()!] });
    } else if (wide.length) {
      groups.push({ kind: 'wide', frame: wide.shift()! });
    } else if (tall.length >= 2) {
      groups.push({ kind: 'pair', frames: [tall.shift()!, tall.shift()!] });
    } else {
      groups.push({ kind: 'single', frame: tall.shift()! });
    }
    wantPair = !wantPair;
  }
  return groups;
}

function FrameFigure({ frame, total, eager, grow }: { frame: Frame; total: number; eager: boolean; grow?: boolean }) {
  const { photo, index } = frame;
  return (
    <figure
      className="lab-c-fig"
      id={`lab-c-f${index + 1}`}
      style={grow ? { flexGrow: photo.w / photo.h } : undefined}
    >
      <button type="button" className="lab-c-fig-btn" data-lab-c-frame={index} aria-label={`사진 ${index + 1} 크게 보기: ${photo.alt}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.src}
          width={photo.w}
          height={photo.h}
          alt={photo.alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="lab-c-fig-img"
        />
      </button>
      <figcaption className="lab-c-cap">
        <span className="lab-c-cap-no">{frameLabel(index, total)}</span>
        <span>{photo.caption ?? photo.alt}</span>
      </figcaption>
    </figure>
  );
}

function GroupView({ group, total, eager }: { group: Group; total: number; eager: boolean }) {
  if (group.kind === 'pair') {
    return (
      <div className="lab-c-pair">
        {group.frames.map((f) => <FrameFigure key={f.index} frame={f} total={total} eager={eager} grow />)}
      </div>
    );
  }
  return (
    <div className={group.kind === 'wide' ? 'lab-c-wide' : 'lab-c-single'}>
      <FrameFigure frame={group.frame} total={total} eager={eager} />
    </div>
  );
}

function TextView({ block }: { block: TextBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="lab-c-p">{block.text}</p>;
    case 'heading':
      return <h2 className="lab-c-h">{block.text}</h2>;
    case 'quote':
      return <blockquote className="lab-c-quote">{block.text}</blockquote>;
    case 'list':
      return <ul className="lab-c-ul">{block.items.map((t) => <li key={t}>{t}</li>)}</ul>;
  }
}

/** Header, then text woven between the photo groups, then links to the neighbouring posts. */
export function FilmDetail({ post, newer, older }: { post: Post; newer: Post | null; older: Post | null }) {
  const photos = post.photos ?? [];
  const total = photos.length;
  const groups = planGroups(photos);
  const texts = post.body.filter((b): b is TextBlock => b.type !== 'gallery' && b.type !== 'media');

  /* One text block before the first group, one after each group, the rest at the end. */
  const flow: ({ t: 'text'; block: TextBlock } | { t: 'group'; group: Group })[] = [];
  let ti = 0;
  if (texts[ti]) flow.push({ t: 'text', block: texts[ti++] });
  groups.forEach((g, gi) => {
    flow.push({ t: 'group', group: g });
    const remainingGroups = groups.length - gi - 1;
    const remainingTexts = texts.length - ti;
    /* keep the closing note for the end; otherwise place one text block between groups */
    if (remainingTexts > 1 || (remainingTexts === 1 && remainingGroups === 0)) {
      if (texts[ti]) flow.push({ t: 'text', block: texts[ti++] });
    }
  });
  while (texts[ti]) flow.push({ t: 'text', block: texts[ti++] });

  const firstGroup = flow.findIndex((f) => f.t === 'group');
  return (
    <article className="lab-c-article">
      <header className="lab-c-dhead">
        <p className="lab-c-dmeta">
          <Link href={LAB_C_LIST} className="lab-c-back">아카이브</Link>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.category && (
            <span className="lab-c-cat">
              <i className="lab-c-dot" style={{ background: LAB_C_LEAF[post.category] }} aria-hidden="true" />
              {CATEGORY_LABEL[post.category]}
            </span>
          )}
          {post.sample && <span className="tag-sample">예시</span>}
        </p>
        <h1 className="lab-c-dtitle">{post.title}</h1>
        <p className="lab-c-dsummary">{post.summary}</p>
        <p className="lab-c-dcount">
          <span className="lab-c-roll">{String(total).padStart(2, '0')} FRAMES</span>
          <span>사진 {total}장, 누르면 크게 볼 수 있습니다</span>
        </p>
      </header>

      <FrameLightbox photos={photos} title={post.title}>
        <div className="lab-c-flow">
          {flow.map((item, i) =>
            item.t === 'text' ? (
              <TextView key={`t${i}`} block={item.block} />
            ) : (
              <GroupView key={`g${i}`} group={item.group} total={total} eager={i === firstGroup} />
            ),
          )}
        </div>
      </FrameLightbox>

      <nav className="lab-c-adj" aria-label="다른 기록">
        {newer ? (
          <Link href={labCHref(newer.slug)} className="lab-c-adj-item" rel="prev">
            <span className="lab-c-adj-label">최근 기록</span>
            <strong>{newer.title}</strong>
          </Link>
        ) : <span />}
        {older ? (
          <Link href={labCHref(older.slug)} className="lab-c-adj-item is-older" rel="next">
            <span className="lab-c-adj-label">지난 기록</span>
            <strong>{older.title}</strong>
          </Link>
        ) : <span />}
      </nav>
      <p className="lab-c-backlist"><Link href={LAB_C_LIST}>아카이브 목록</Link></p>
    </article>
  );
}
