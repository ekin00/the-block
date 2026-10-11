import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, ApiError, BASE_URL, setOnUnauthorized } from './api';

const mockResponse = (status, body) => ({
  status,
  ok: status >= 200 && status < 300,
  text: () =>
    Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
});

describe('api client', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setOnUnauthorized(null);
  });

  it('returns null for 204 No Content without parsing JSON', async () => {
    fetch.mockResolvedValue(mockResponse(204, ''));
    await expect(api.delete('/api/favorites/some-id')).resolves.toBeNull();
  });

  it('preserves the backend error message and status verbatim', async () => {
    fetch.mockResolvedValue(
      mockResponse(422, { error: 'Bid must exceed the current bid.' }),
    );
    const failure = await api.post('/api/bid-tracker', {}).catch((e) => e);
    expect(failure).toBeInstanceOf(ApiError);
    expect(failure.status).toBe(422);
    expect(failure.message).toBe('Bid must exceed the current bid.');
  });

  it('does not throw SyntaxError on non-JSON error pages', async () => {
    fetch.mockResolvedValue(mockResponse(500, '<html>Internal Server Error</html>'));
    const failure = await api.get('/api/the-block').catch((e) => e);
    expect(failure).toBeInstanceOf(ApiError);
    expect(failure.status).toBe(500);
    expect(failure.message).toContain('500');
  });

  it('resolves the base URL from VITE_API_BASE_URL with a localhost fallback', () => {
    // Test env sets no VITE_API_BASE_URL, so the dev fallback applies.
    expect(BASE_URL).toBe('http://localhost:5000');
  });

  it('honors VITE_API_BASE_URL when set', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');
    vi.resetModules();
    const fresh = await import('./api.jsx?env-override');
    expect(fresh.BASE_URL).toBe('https://api.example.test');
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('passes an AbortSignal through to fetch', async () => {
    fetch.mockResolvedValue(mockResponse(200, []));
    const controller = new AbortController();
    await api.get('/api/the-block', { signal: controller.signal });
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/the-block',
      expect.objectContaining({ signal: controller.signal }),
    );
  });

  it('invokes the registered unauthorized handler on 401 and throws the backend message verbatim', async () => {
    const handler = vi.fn();
    setOnUnauthorized(handler);
    fetch.mockResolvedValue(mockResponse(401, { error: 'Unknown user.' }));
    const failure = await api.get('/api/the-block').catch((e) => e);
    expect(failure).toBeInstanceOf(ApiError);
    expect(failure.status).toBe(401);
    expect(failure.message).toBe('Unknown user.');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('falls back to a default message on 401 without a JSON body', async () => {
    setOnUnauthorized(vi.fn());
    fetch.mockResolvedValue(mockResponse(401, ''));
    const failure = await api.get('/api/the-block').catch((e) => e);
    expect(failure.message).toBe('Unknown user. Please join again.');
  });

  it('returns parsed JSON for successful responses', async () => {
    fetch.mockResolvedValue(mockResponse(200, [{ id: 'v1' }]));
    await expect(api.get('/api/the-block')).resolves.toEqual([{ id: 'v1' }]);
  });

  it('sends the X-User-Id header for the joined user', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 7, name: 'GUEST7' }));
    fetch.mockResolvedValue(mockResponse(200, []));
    await api.get('/api/the-block');
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-User-Id': 7 }),
      }),
    );
  });
});
