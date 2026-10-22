import { toSheetItems, type SheetItem } from '@/components/archive/types';
import { formatPeriod, pickRelated, type NewsCardData } from '@/components/news/types';
import { getPosts, getSiteSettings, type Block, type Photo, type Post, type SiteSettings } from '@/lib/content';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import { readOverrides } from '@/lib/cupnotes-store';
import { beanProfile, type BeanProfile } from './bean';

/** Everything a concept page needs about one news post. */
export type NewsView = {
  post: Post;
  /** the post's photos (a bean card and its description, for most bean posts), plain and as sheet items */
  photos: Photo[];
  items: SheetItem[];
  /** the first paragraph, used as the lead, and the paragraphs after it */
  lead: string | null;
  rest: Block[];
  facts: Fact[];
  /** a bean arrival's profile read from its title and caption, and the facts as quiet rows */
  bean: BeanProfile | null;
  rows: Fact[];
  newer: Post | null;
  older: Post | null;
  related: NewsCardData[];
  settings: SiteSettings;
};

export type Fact = { label: string; value: string; href?: string; external?: boolean };

/** The facts box: topic, date, the period it is about, the bean, where to buy, the original. */
function factsOf(post: Post, settings: SiteSettings): Fact[] {
  const topic = post.topic ?? 'notice';
  const facts: Fact[] = [
    { label: '분류', value: TOPIC_LABEL[topic] },
    { label: '올린 날', value: formatDate(post.date) },
  ];
  if (post.period) facts.push({ label: '해당 기간', value: formatPeriod(post.period) });
  if (topic === 'beans') {
    facts.push({ label: '원두', value: post.title.replace(/\s*입고$/, '') });
    facts.push({ label: '구입', value: '매장과 온라인 스토어', href: settings.storeUrl, external: true });
  }
  if (post.permalink) facts.push({ label: '원문', value: '인스타그램에서 보기', href: post.permalink, external: true });
  return facts;
}

/*
 * Quiet label/value rows, as the roasters' product pages show a coffee (Coffee Collective, Tim
 * Wendelboe, Kurasu): for a bean the profile, for a notice its date and period.
 */
function rowsOf(post: Post, bean: BeanProfile | null, settings: SiteSettings): Fact[] {
  const rows: Fact[] = [];
  if (bean) {
    if (bean.origin) rows.push({ label: '산지', value: bean.origin });
    if (bean.farm) rows.push({ label: '농장', value: bean.farm });
    if (bean.lot) rows.push({ label: '이름', value: bean.lot });
    if (bean.variety) rows.push({ label: '품종', value: bean.variety });
    if (bean.process) rows.push({ label: '가공', value: bean.process });
    rows.push({ label: '입고일', value: formatDate(post.date) });
    rows.push(bean.store === 'store-only'
      ? { label: '구입', value: '매장에서만 (소량 입고)' }
      : { label: '구입', value: '매장, 온라인 스토어', href: settings.storeUrl, external: true });
  } else {
    rows.push({ label: '분류', value: TOPIC_LABEL[post.topic ?? 'notice'] });
    rows.push({ label: '올린 날', value: formatDate(post.date) });
    if (post.period) rows.push({ label: '해당 기간', value: formatPeriod(post.period) });
  }
  if (post.permalink) rows.push({ label: '원문', value: '인스타그램에서 보기', href: post.permalink, external: true });
  return rows;
}

const captionText = (blocks: Block[]) => blocks.map((b) => ('text' in b ? b.text : 'items' in b ? b.items.join(' ') : '')).join(' ');

export async function loadNewsView(slug: string): Promise<NewsView | null> {
  const [list, settings, overrides] = await Promise.all([getPosts('news'), getSiteSettings(), readOverrides()]);
  const index = list.findIndex((p) => p.slug === slug);
  if (index < 0) return null;
  const post = list[index];
  const [first, ...after] = post.body;
  const lead = first && first.type === 'paragraph' ? first.text : null;
  // a sample notice carries only a cover, with no size: it stands in as the one photo
  const photos: Photo[] = post.photos?.length
    ? post.photos
    : post.cover?.kind === 'image' ? [{ ...post.cover, kind: 'image', w: 1080, h: 1350 }] : [];
  const bean = post.topic === 'beans' ? beanProfile(post.title, captionText(post.body), overrides) : null;
  return {
    post,
    photos,
    bean,
    rows: rowsOf(post, bean, settings),
    items: toSheetItems([{ ...post, photos }]),
    lead: lead ?? post.summary ?? null,
    rest: lead ? after : post.body,
    facts: factsOf(post, settings),
    newer: list[index - 1] ?? null,
    older: list[index + 1] ?? null,
    related: pickRelated(post, list),
    settings,
  };
}

/** One post of each kind the news holds, so the hub can open every concept on each. */
export async function pickNewsExamples(): Promise<{ label: string; slug: string }[]> {
  const list = await getPosts('news');
  const pick = [
    { label: '원두 입고', post: list.find((p) => p.topic === 'beans' && (p.photos?.length ?? 0) > 1) ?? list.find((p) => p.topic === 'beans') },
    { label: '휴무', post: list.find((p) => p.topic === 'closure') },
    { label: '영업시간', post: list.find((p) => p.topic === 'hours') },
    { label: '행사·할인', post: list.find((p) => p.topic === 'event') },
    { label: '공지', post: list.find((p) => p.topic === 'notice') },
  ];
  const seen = new Set<string>();
  return pick.flatMap(({ label, post }) => {
    if (!post || seen.has(post.slug)) return [];
    seen.add(post.slug);
    return [{ label, slug: post.slug }];
  });
}

/* Only the hub's examples are built ahead; any other post is drawn on its first visit. */
export async function newsLabParams() {
  return (await pickNewsExamples()).map(({ slug }) => ({ slug }));
}

/** The facts as a definition list; links open outside when they leave the site. */
export function FactList({ facts, className }: { facts: Fact[]; className: string }) {
  return (
    <dl className={className}>
      {facts.map((f) => (
        <div key={f.label}>
          <dt>{f.label}</dt>
          <dd>
            {f.href ? (
              <a href={f.href} {...(f.external ? { target: '_blank', rel: 'noopener' } : {})}>{f.value}</a>
            ) : (
              f.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
