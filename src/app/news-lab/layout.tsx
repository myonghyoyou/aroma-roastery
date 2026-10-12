import { LabBack } from '@/components/archive-lab/LabBack';
import { NEWS_LAB_NAMES } from '@/components/news-lab/concepts';

// every news concept page carries a way back to the concept list
export default function NewsLabLayout({ children }: LayoutProps<'/news-lab'>) {
  return (
    <>
      {children}
      <LabBack base="/news-lab" subject="소식" names={NEWS_LAB_NAMES} />
    </>
  );
}
