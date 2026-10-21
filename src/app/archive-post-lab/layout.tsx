import { LabBack } from '@/components/archive-lab/LabBack';
import { POST_LAB_NAMES } from '@/components/archive-post-lab/concepts';

// every concept page carries a way back to the concept list
export default function ArchivePostLabLayout({ children }: LayoutProps<'/archive-post-lab'>) {
  return (
    <>
      {children}
      <LabBack base="/archive-post-lab" subject="아카이브 상세" names={POST_LAB_NAMES} />
    </>
  );
}
