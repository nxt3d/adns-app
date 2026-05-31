import Link from 'next/link';
import { AvailabilityCheck } from '@/components/home/availability-check';
import { ExampleProjects } from '@/components/home/example-projects';

export default function HomePage() {
  return (
    <>
      {/* Above the fold: single availability check, centered, spare. */}
      <section className="mx-auto flex min-h-[68vh] w-full max-w-2xl flex-col justify-center px-4 py-12 sm:px-6">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-brand-strong">
          Domain names for agent projects
        </p>
        <h1 className="font-display text-display-2 tracking-tight text-ink">
          Get your project name
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-ink-muted">
          Claim your brand on aDNS, then issue a clean subname to every holder or
          agent — <span className="font-mono text-ink">agent-1.yourproject.adns.eth</span>.
        </p>
        <div className="mt-7">
          <AvailabilityCheck />
        </div>
      </section>

      {/* Below the fold. */}
      <section className="border-t border-line bg-paper-warm">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <Positioning
              title="For NFT collections"
              body="Register your collection name and give every holder a memorable subname under your brand."
            />
            <Positioning
              title="For agent projects"
              body="Give each agent a clean, resolvable identity — names that carry records and point at NFTs."
            />
            <Positioning
              title="For agencies"
              body="Manage naming hierarchies across multiple projects from one registry on Ethereum mainnet."
            />
          </div>

          <ExampleProjects />

          <div className="mt-12 text-center">
            <Link
              href="/docs"
              className="focus-ring inline-flex items-center rounded-pill border border-line bg-paper px-5 py-2.5 text-sm font-bold text-ink-muted transition hover:border-brand hover:text-brand-fg"
            >
              Read the docs →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Positioning({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-card border border-line bg-paper p-6">
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{body}</p>
    </div>
  );
}
