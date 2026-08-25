import type { MembershipStatus } from '../api/types';

const RAW_LABELS: Record<string, string> = {
  PENDING_EMAIL: 'Pending email verification',
  PENDING_PAYMENT: 'Pending payment',
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  RESIGNED: 'Resigned',
};

/**
 * Membership settings shouldn't leak the raw backend enum (e.g.
 * `PENDING_EMAIL`) — a member who is demonstrably already using their
 * account (verified email or otherwise marked a member) reads as "Active"
 * regardless of what the status column says; anything else falls back to
 * a human-readable version of the raw status.
 */
export function membershipStatusLabel(
  membership: Pick<MembershipStatus, 'status' | 'isMember' | 'emailVerified'>,
): string {
  if (membership.isMember || membership.emailVerified) {
    return 'Active';
  }
  return RAW_LABELS[membership.status] ?? membership.status;
}
