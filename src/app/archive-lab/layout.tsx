import { LabBack } from '@/components/archive-lab/LabBack';

// every archive concept page carries a way back to the concept list
export default function ArchiveLabLayout({ children }: LayoutProps<'/archive-lab'>) {
  return (
    <>
      {children}
      <LabBack />
    </>
  );
}
