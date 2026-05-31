import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDoc, DOC_ORDER } from '@/lib/docs';
import { Markdown } from '@/components/markdown';
import { DocsNav } from '@/components/docs-nav';

export function generateStaticParams() {
  return DOC_ORDER.filter((s) => s !== 'index').map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return { title: 'Docs' };
  return { title: doc.title, description: doc.description };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc || slug === 'index') notFound();
  return (
    <div className="grid gap-10 md:grid-cols-[200px_minmax(0,1fr)]">
      <aside className="md:sticky md:top-24 md:self-start">
        <DocsNav activeSlug={slug} />
      </aside>
      <article>
        <Markdown>{doc.body}</Markdown>
      </article>
    </div>
  );
}
