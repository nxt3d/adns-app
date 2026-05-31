import { RegisterWidget } from '@/components/register/register-widget';
import { RecentRegistrations } from '@/components/register/recent-registrations';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <section className="mb-8 text-center">
        <h1 className="text-display-2">Names for NFTs</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-muted">
          Register an aDNS name and point it at any NFT. Free-mode names live on
          Ethereum mainnet and can carry text, address, content, and data records.
        </p>
      </section>

      <RegisterWidget />

      <RecentRegistrations />
    </div>
  );
}
