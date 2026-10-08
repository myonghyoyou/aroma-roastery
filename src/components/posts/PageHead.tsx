/** The heading block of the list pages: a large title, one line on what the page holds, and the sample tag. */
export function PageHead({ title, lead, sample }: { title: string; lead: string; sample: boolean }) {
  return (
    <header className="page-head">
      <div className="page-head-row">
        <h1>{title}</h1>
        {sample && <span className="tag-sample">예시</span>}
      </div>
      <p>{lead}</p>
    </header>
  );
}
