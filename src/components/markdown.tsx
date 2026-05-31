import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Server-rendered markdown with GitHub-flavoured extensions. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-adns">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
