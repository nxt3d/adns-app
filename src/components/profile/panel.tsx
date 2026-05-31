import type { ReactNode } from 'react';

export function Panel({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-card border border-line bg-paper p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-ink-subtle">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export const inputCls =
  'focus-ring w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-subtle disabled:opacity-60';

export const btnCls =
  'focus-ring shrink-0 rounded-pill bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-brand-fg disabled:opacity-50';
