import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAuctionClock } from './useAuctionClock';

describe('useAuctionClock', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('refreshes every 30 seconds and on visibility changes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-10T12:00:00Z'));
    const { result } = renderHook(() => useAuctionClock());
    const initialNow = result.current;

    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(result.current.getTime()).toBe(initialNow.getTime() + 30_000);

    vi.setSystemTime(new Date('2026-10-10T12:02:00Z'));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.toISOString()).toBe('2026-10-10T12:02:00.000Z');
  });

  it('cleans up the interval and visibility listener on unmount', () => {
    vi.useFakeTimers();
    const clearInterval = vi.spyOn(window, 'clearInterval');
    const removeListener = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useAuctionClock());

    unmount();

    expect(clearInterval).toHaveBeenCalledTimes(1);
    expect(removeListener).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    );
  });
});
