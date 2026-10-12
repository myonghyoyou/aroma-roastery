import { LabBack } from '@/components/archive-lab/LabBack';

const NAMES = { a: '로스팅 로그', b: '연도 타임라인', c: '필름 스트립', d: '컨택트 시트', e: '저널 스프레드' };

// every archive concept page carries a way back to the concept list
export default function ArchiveLabLayout({ children }: LayoutProps<'/archive-lab'>) {
  return (
    <>
      {children}
      <LabBack base="/archive-lab" subject="아카이브" names={NAMES} />
    </>
  );
}
