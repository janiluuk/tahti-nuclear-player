import { useEffect, useState } from 'react';

import { fetchFanConnectStatus } from '../api/revenue';

export function useStripeConfigured(): boolean {
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchFanConnectStatus().then((result) => {
      if (!cancelled) {
        setConfigured(result.data.stripeConfigured);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return configured;
}
