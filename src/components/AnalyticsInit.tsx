'use client';

import { useEffect } from 'react';

export default function AnalyticsInit() {
  useEffect(() => {
    import('@/lib/firebase').then(({ getAnalyticsInstance }) => getAnalyticsInstance());
  }, []);
  return null;
}
