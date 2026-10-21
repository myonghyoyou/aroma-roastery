import { LabBack } from '@/components/archive-lab/LabBack';
import { NEWS_POST_NAMES } from '@/components/news-post-lab/concepts';

// every concept page carries a way back to the concept list
export default function NewsPostLabLayout({ children }: LayoutProps<'/news-post-lab'>) {
  return (
    <>
      {children}
      <LabBack base="/news-post-lab" subject="소식 상세" names={NEWS_POST_NAMES} />
    </>
  );
}
