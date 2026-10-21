import type { Block } from '@/lib/content';

/** Caption text, block by block; captions keep their line breaks, as on Instagram. */
export function TextBlocks({ blocks, className }: { blocks: Block[]; className?: string }) {
  if (!blocks.length) return null;
  return (
    <div className={className}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return <p key={i}>{block.text}</p>;
          case 'heading':
            return <h2 key={i}>{block.text}</h2>;
          case 'quote':
            return <blockquote key={i}><p>{block.text}</p></blockquote>;
          case 'list':
            return <ul key={i}>{block.items.map((t) => <li key={t}>{t}</li>)}</ul>;
          default:
            return null;
        }
      })}
    </div>
  );
}
