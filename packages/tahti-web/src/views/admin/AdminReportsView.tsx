import { useEffect, useState } from 'react';

import { Button, Input, ViewShell } from '@tahti-player/ui';

import {
  fetchAdminAnnualReports,
  generateAdminAnnualReport,
  type AdminAnnualReport,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminPageLayout } from '../../components/AdminNav';
import { PageEmpty, PageLoading } from '../../components/PageStates';
import { StudioPanel } from '../../components/StudioPanel';

export function AdminReportsView() {
  const [reports, setReports] = useState<AdminAnnualReport[]>([]);
  const [year, setYear] = useState(String(new Date().getUTCFullYear() - 1));
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchAdminAnnualReports().then((result) => {
      setReports(result.data);
      setLoading(false);
    });
  }, []);

  return (
    <AdminGate>
      <div className="admin-page-layout px-1 py-2">
        <AdminPageLayout current="/admin/reports">
          <div className="flex max-w-4xl flex-col gap-6">
            <ViewShell
              title="Annual reports"
              subtitle="Generate and publish yearly nonprofit activity reports from the governance records."
              classes={{ root: 'px-0 pt-0' }}
            >
              <StudioPanel title="Generate report">
                <div className="flex flex-wrap items-end gap-2">
                  <label className="text-foreground-secondary flex flex-col gap-1 text-xs">
                    Year
                    <Input
                      value={year}
                      onChange={(event) => setYear(event.target.value)}
                      inputMode="numeric"
                      className="w-28"
                    />
                  </label>
                  <Button
                    size="sm"
                    disabled={busy || !/^20\d{2}$/.test(year)}
                    onClick={() => {
                      setBusy(true);
                      void generateAdminAnnualReport(Number(year)).then(
                        (result) => {
                          setBusy(false);
                          if (result.data) {
                            setReports((current) => [
                              result.data!,
                              ...current.filter(
                                (item) => item.year !== result.data!.year,
                              ),
                            ]);
                          }
                        },
                      );
                    }}
                  >
                    {busy ? 'Generating…' : 'Generate report'}
                  </Button>
                </div>
              </StudioPanel>
              <StudioPanel title="Generated reports">
                {loading ? (
                  <PageLoading label="Loading reports…" />
                ) : reports.length === 0 ? (
                  <PageEmpty title="No annual reports generated yet" />
                ) : (
                  <ul className="divide-border divide-y">
                    {reports.map((report) => (
                      <li
                        key={report.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                      >
                        <span>
                          <span className="font-medium">
                            Annual report {report.year}
                          </span>
                          <span className="text-foreground-secondary ml-2 text-xs">
                            {new Date(report.generatedAt).toLocaleDateString()}
                          </span>
                        </span>
                        {report.downloadUrl && (
                          <a
                            href={report.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs underline-offset-2 hover:underline"
                          >
                            Download
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </StudioPanel>
            </ViewShell>
          </div>
        </AdminPageLayout>
      </div>
    </AdminGate>
  );
}
