import fs from 'node:fs';
import path from 'node:path';

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs');

/** Display order of the docs in the sidebar. `index` is the landing doc. */
export const DOC_ORDER = [
  'index',
  'naming',
  'byonft',
  'adnsip-25',
  'integration',
  'apex',
] as const;

export interface Doc {
  slug: string;
  title: string;
  description: string;
  body: string;
}

function stripFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    meta[k] = v;
  }
  return { meta, body: raw.slice(m[0].length) };
}

export function getDoc(slug: string): Doc | null {
  const file = path.join(DOCS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const { meta, body } = stripFrontmatter(raw);
  // These docs use MDX <Callout> wrappers; we render with plain markdown, so
  // turn the wrapper into a blockquote and drop the closing tag.
  const cleaned = body
    .replace(/<Callout[^>]*>/g, '\n> ')
    .replace(/<\/Callout>/g, '\n');
  return {
    slug,
    title: meta.title || slug,
    description: meta.description || '',
    body: cleaned,
  };
}

export function getAllDocs(): Doc[] {
  return DOC_ORDER.map((s) => getDoc(s)).filter((d): d is Doc => d !== null);
}
