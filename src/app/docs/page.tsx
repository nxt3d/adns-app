import type { Metadata } from 'next';
import { getDoc } from '@/lib/docs';
import { Markdown } from '@/components/markdown';
import { DocsNav } from '@/components/docs-nav';

export const metadata: Metadata = {
  title: 'Docs',
  description: 'Learn how ADNS names work — naming, the BYONFT model, and integration.',
};

export default function DocsIndexPage() {
  const doc = getDoc('index');
  return (
    <div className="grid gap-10 md:grid-cols-[200px_minmax(0,1fr)]">
      <aside className="md:sticky md:top-24 md:self-start">
        <DocsNav activeSlug="index" />
      </aside>
      <article>{doc ? <Markdown>{doc.body}</Markdown> : <p>Doc not found.</p>}</article>
    </div>
  );
}
