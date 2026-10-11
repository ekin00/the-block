import { useCallback, useEffect, useState } from 'react';

const CLOCK_INTERVAL_MS = 30_000;

/**
 * One shared ticking `now` plus `refreshNow` for callers that learn about a
 * phase change from the server (e.g. Buy Now closing the auction) and should
 * not wait for the next tick.
 */
export function useAuctionClockControls() {
  const [now, setNow] = useState(() => new Date());
  const refreshNow = useCallback(() => setNow(new Date()), []);

  useEffect(() => {
    const intervalId = window.setInterval(refreshNow, CLOCK_INTERVAL_MS);
    document.addEventListener('visibilitychange', refreshNow);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshNow);
    };
  }, [refreshNow]);

  return { now, refreshNow };
}

export function useAuctionClock() {
  return useAuctionClockControls().now;
}
