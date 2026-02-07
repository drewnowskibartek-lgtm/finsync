import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { SubscriptionStatus } from '../api/types';

export const useSubscription = () => {
  const [data, setData] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<SubscriptionStatus>('/subscriptions/status')
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
};
