import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { ViewShell } from '@tahti-player/ui';

import { fetchTransparencyGrants } from '../api/client';
import type { TransparencyGrantReport } from '../api/types';
import { PageLoading } from '../components/PageStates';

function centsLabel(raw: string | number) {
  const n = Number(raw);
  return Number.isFinite(n) ? `€${(n / 100).toFixed(2)}` : String(raw);
}

export function TransparencyGrantYearView({ year }: { year: number }) {
  const [report, setReport] = useState<TransparencyGrantReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchTransparencyGrants(year).then((result) => {
      setReport(result.data);
      setLoading(false);
    });
  }, [year]);

  return (
    <ViewShell
      title={`Grant report ${year}`}
      subtitle="Annual grant distribution reported from the public transparency API."
      classes={{ root: 'px-0 pt-0 mx-auto max-w-3xl' }}
    >
      <Link
        to="/transparency"
        className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
      >
        Transparency overview →
      </Link>
      {loading ? (
        <PageLoading label="Loading grant report…" />
      ) : !report ? (
        <p className="text-foreground-secondary text-sm">
          No grant report is available for {year}.
        </p>
      ) : (
        <section className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Total" value={centsLabel(report.totalCents)} />
            <Stat label="Grants" value={String(report.grantCount)} />
            <Stat
              label="Disbursed"
              value={report.disbursedAt ? report.disbursedAt.slice(0, 10) : '—'}
            />
          </div>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-border text-foreground-secondary border-b text-xs uppercase">
                <th className="py-2 pr-3 font-medium">Published as</th>
                <th className="py-2 pr-3 font-medium">Amount</th>
                <th className="py-2 font-medium">State</th>
              </tr>
            </thead>
            <tbody>
              {report.grants.map((grant) => (
                <tr
                  key={`${grant.publishedAs}-${grant.amountCents}`}
                  className="border-border border-b"
                >
                  <td className="py-2 pr-3">{grant.publishedAs}</td>
                  <td className="py-2 pr-3">{centsLabel(grant.amountCents)}</td>
                  <td className="text-foreground-secondary py-2 text-xs">
                    {grant.state}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </ViewShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-background rounded-lg border p-3">
      <div className="text-foreground-secondary text-[10px] tracking-wide uppercase">
        {label}
      </div>
      <div className="font-display mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}
