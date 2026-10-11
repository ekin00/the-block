import { useEffect, useState } from 'react';

const CLOCK_INTERVAL_MS = 30_000;

export function useAuctionClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const refresh = () => setNow(new Date());
    const intervalId = window.setInterval(refresh, CLOCK_INTERVAL_MS);
    document.addEventListener('visibilitychange', refresh);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  return now;
}
