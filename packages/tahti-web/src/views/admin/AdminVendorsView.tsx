import { useEffect, useState } from 'react';

import { Badge } from '@nuclearplayer/ui';

import {
  fetchAdminIntegrationStatus,
  type AdminIntegrationStatus,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

const CRITICAL_VENDORS = [
  {
    name: 'Fiber ISP',
    service: 'Business fiber (symmetric gigabit, static IP)',
    dpaRequired: false,
    status: 'pending',
    blocker:
      'Confirm production circuit, static IP, support contact, and failover test.',
  },
  {
    name: 'UpCloud',
    service: 'VPS / object storage disaster recovery',
    dpaRequired: true,
    status: 'pending',
    blocker:
      'Confirm production account, R2/backup ownership, restore test, and DPA.',
  },
  {
    name: 'Stripe',
    service: 'Payments — platform and Connect payouts',
    dpaRequired: true,
    status: 'pending',
    blocker:
      'Confirm live keys, webhook signing secret, Connect payouts, and DPA.',
  },
  {
    name: 'Domain registrar',
    service: 'tahti.live DNS',
    dpaRequired: false,
    status: 'pending',
    blocker:
      'Confirm domain ownership, renewal access, DNS records, and incident contact.',
  },
] as const;

const INTEGRATION_VENDORS = [
  {
    name: 'Mixcloud',
    service: 'OAuth / archive uploads',
    dpaRequired: true,
    status: 'pending',
    blocker: 'Confirm production OAuth callback, scopes, and DPA.',
  },
  {
    name: 'Revelator',
    service: 'DSP distribution — ISRC registration, royalty pull-back',
    dpaRequired: true,
    status: 'blocked',
    blocker:
      'Provider API key and production distribution contract are not configured.',
  },
  {
    name: 'Email provider',
    service: 'SMTP, newsletter dispatch, bounce webhook',
    dpaRequired: true,
    status: 'blocked',
    blocker:
      'Production SMTP credentials, sender domain, bounce webhook, and DPA are missing.',
  },
  {
    name: 'hCaptcha',
    service: 'Bot protection on signup and login',
    dpaRequired: false,
    status: 'pending',
    blocker:
      'Confirm production site/secret keys and verify fail-closed behavior.',
  },
  {
    name: 'Bandcamp',
    service: 'Import own releases into the archive',
    dpaRequired: true,
    status: 'blocked',
    blocker:
      'Import write endpoint and provider approval are still missing in the sibling API.',
  },
  {
    name: 'SoundCloud',
    service: 'Import own downloadable tracks into the archive',
    dpaRequired: true,
    status: 'pending',
    blocker:
      'Confirm production OAuth app, download scopes, callback, and DPA.',
  },
  {
    name: 'Google Drive',
    service: 'Cloud-storage import into the archive',
    dpaRequired: true,
    status: 'pending',
    blocker: 'Confirm production OAuth app, storage scopes, callback, and DPA.',
  },
  {
    name: 'Twitter / X',
    service: 'Auto-post broadcast and release announcements',
    dpaRequired: false,
    status: 'blocked',
    blocker:
      'Provider app review, publishing credentials, and server-side posting contract are missing.',
  },
  {
    name: 'Instagram',
    service: 'Auto-post broadcast and release announcements',
    dpaRequired: false,
    status: 'blocked',
    blocker:
      'Provider app review, publishing credentials, and server-side posting contract are missing.',
  },
  {
    name: 'AcoustID',
    service: 'Track fingerprint / metadata lookup',
    dpaRequired: false,
    status: 'pending',
    blocker:
      'Confirm production API key, rate limits, attribution, and privacy terms.',
  },
] as const;

type VendorStatus = 'live' | 'pending' | 'blocked';

type Vendor = {
  name: string;
  service: string;
  dpaRequired: boolean;
  status: VendorStatus;
  blocker: string;
};

const STATUS_LABEL: Record<VendorStatus, string> = {
  live: 'Live',
  pending: 'Verify before live',
  blocked: 'Blocking launch',
};

const STATUS_COLOR: Record<VendorStatus, 'green' | 'yellow' | 'red'> = {
  live: 'green',
  pending: 'yellow',
  blocked: 'red',
};

function VendorTable({ vendors }: { vendors: readonly Vendor[] }) {
  return (
    <ul className="divide-border divide-y">
      {vendors.map((v) => (
        <li
          key={v.name}
          className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm first:pt-0 last:pb-0"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 font-medium">
              {v.name}
              <Badge variant="pill" color={STATUS_COLOR[v.status]}>
                {STATUS_LABEL[v.status]}
              </Badge>
            </div>
            <div className="text-foreground-secondary text-xs">{v.service}</div>
            <div className="text-foreground-secondary mt-1 text-xs">
              <span className="font-semibold">Launch check:</span> {v.blocker}
            </div>
          </div>
          {v.dpaRequired ? (
            <Badge variant="pill" color="orange">
              DPA required
            </Badge>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function AdminVendorsContent() {
  const [integrations, setIntegrations] = useState<AdminIntegrationStatus[]>(
    [],
  );

  useEffect(() => {
    void fetchAdminIntegrationStatus().then((res) => setIntegrations(res.data));
  }, []);

  const integrationVendors: Vendor[] = INTEGRATION_VENDORS.map((vendor) => {
    const liveStatus = integrations.find((row) => row.name === vendor.name);
    return {
      ...vendor,
      status: liveStatus?.live ? 'live' : vendor.status,
      blocker: liveStatus?.live ? liveStatus.detail : vendor.blocker,
    };
  });
  const allVendors: Vendor[] = [...CRITICAL_VENDORS, ...integrationVendors];
  const blockers = allVendors.filter((vendor) => vendor.status === 'blocked');
  const pending = allVendors.filter((vendor) => vendor.status === 'pending');

  return (
    <div className="flex flex-col gap-6">
      <StudioPageHeader
        title="Vendors & DPA tracking"
        subtitle="Association-owned accounts. Credentials live in the board vault, never here."
      />

      <StudioPanel
        title={`${blockers.length} launch blockers · ${pending.length} checks pending`}
        description="A vendor is not considered live until its credentials, contract, callback/webhook, DPA, and operational test are confirmed."
      >
        {blockers.length > 0 ? (
          <ul className="text-foreground-secondary flex flex-col gap-2 text-sm">
            {blockers.map((vendor) => (
              <li key={vendor.name}>
                <span className="text-foreground font-medium">
                  {vendor.name}:
                </span>{' '}
                {vendor.blocker}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm">No explicit launch blockers are recorded.</p>
        )}
      </StudioPanel>

      {integrations.length > 0 && (
        <StudioPanel title="Distribution status">
          <ul className="flex flex-col gap-2">
            {integrations.map((row) => (
              <li key={row.name} className="flex items-center gap-3 text-sm">
                <Badge variant="pill" color={row.live ? 'green' : 'red'}>
                  {row.live ? 'Live' : 'Blocking launch'}
                </Badge>
                <div>
                  <div className="font-medium">{row.name}</div>
                  <div className="text-foreground-secondary text-xs">
                    {row.detail}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </StudioPanel>
      )}

      <StudioPanel title="Critical vendors">
        <VendorTable vendors={CRITICAL_VENDORS} />
      </StudioPanel>

      <StudioPanel title="Integrations">
        <VendorTable vendors={integrationVendors} />
      </StudioPanel>
    </div>
  );
}

export function AdminVendorsView() {
  return (
    <AdminGate>
      <div className="admin-page-layout mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/vendors" />
        <AdminVendorsContent />
      </div>
    </AdminGate>
  );
}
