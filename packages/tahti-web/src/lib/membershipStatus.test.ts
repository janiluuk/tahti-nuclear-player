import { describe, expect, it } from 'vitest';

import { membershipStatusLabel } from './membershipStatus';

describe('membershipStatusLabel', () => {
  it('shows Active for a member even if the raw status lags behind', () => {
    expect(
      membershipStatusLabel({
        status: 'PENDING_EMAIL',
        isMember: true,
        emailVerified: false,
      }),
    ).toBe('Active');
  });

  it('shows Active once the email is verified', () => {
    expect(
      membershipStatusLabel({
        status: 'PENDING_EMAIL',
        isMember: false,
        emailVerified: true,
      }),
    ).toBe('Active');
  });

  it('maps PENDING_EMAIL to a friendly label when not yet active', () => {
    expect(
      membershipStatusLabel({
        status: 'PENDING_EMAIL',
        isMember: false,
        emailVerified: false,
      }),
    ).toBe('Pending email verification');
  });

  it('falls back to the raw status for an unmapped value', () => {
    expect(
      membershipStatusLabel({
        status: 'SOMETHING_NEW',
        isMember: false,
        emailVerified: false,
      }),
    ).toBe('SOMETHING_NEW');
  });
});
