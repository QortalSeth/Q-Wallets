import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchQortalNames, getQortalNameData } from '../qortalNodeApi';

const okJson = (payload: unknown) => ({
  ok: true,
  json: async () => payload,
});

describe('qortalNodeApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    // Silence the warnings the module logs on the failure paths under test.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('searchQortalNames', () => {
    it('returns an empty array without calling the API for a blank query', async () => {
      const fetchMock = vi.mocked(fetch);

      expect(await searchQortalNames('   ')).toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns an empty array without calling the API when the signal is already aborted', async () => {
      const fetchMock = vi.mocked(fetch);

      expect(await searchQortalNames('alice', 10, AbortSignal.abort())).toEqual(
        []
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('builds the search URL with trimmed query and limit, and returns parsed results', async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValue(
        okJson([{ name: 'Alice', owner: 'QAlice' }]) as unknown as Response
      );

      const results = await searchQortalNames('  Alice  ', 5);

      expect(results).toEqual([{ name: 'Alice', owner: 'QAlice' }]);
      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toBe('/names/search?limit=5&prefix=true&query=Alice');
    });

    it('discards malformed entries (missing/invalid name or owner)', async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValue(
        okJson([
          { name: 'Alice', owner: 'QAlice' },
          { name: 'NoOwner' },
          { owner: 'QNoName' },
          { name: 42, owner: 'QNumber' },
          null,
          'not-an-object',
        ]) as unknown as Response
      );

      expect(await searchQortalNames('a')).toEqual([
        { name: 'Alice', owner: 'QAlice' },
      ]);
    });

    it('returns an empty array when the payload is not an array', async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValue(
        okJson({ name: 'Alice', owner: 'QAlice' }) as unknown as Response
      );

      expect(await searchQortalNames('alice')).toEqual([]);
    });

    it('returns an empty array when the network request rejects', async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockRejectedValue(new Error('network down'));

      expect(await searchQortalNames('alice')).toEqual([]);
    });

    it('returns an empty array when the response is not ok', async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValue({
        ok: false,
        status: 503,
      } as unknown as Response);

      expect(await searchQortalNames('alice')).toEqual([]);
    });
  });

  describe('getQortalNameData', () => {
    it('returns null without calling the API for a blank name', async () => {
      const fetchMock = vi.mocked(fetch);

      expect(await getQortalNameData('  ')).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('resolves directly from the /names/{name} endpoint when it returns valid data', async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValue(
        okJson({ name: 'Alice', owner: 'QAlice' }) as unknown as Response
      );

      expect(await getQortalNameData('Alice')).toEqual({
        name: 'Alice',
        owner: 'QAlice',
      });
      // Only the direct lookup is needed; no fallback search.
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toBe('/names/Alice');
    });

    it('falls back to a case-insensitive exact search match when the direct lookup is invalid', async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockImplementation((async (url: string) => {
        if (url.startsWith('/names/search')) {
          return okJson([
            { name: 'alice', owner: 'QAlice' },
            { name: 'aliceother', owner: 'QOther' },
          ]) as unknown as Response;
        }
        // Direct /names/{name} returns an unusable payload.
        return okJson({}) as unknown as Response;
      }) as unknown as typeof fetch);

      expect(await getQortalNameData('Alice')).toEqual({
        name: 'alice',
        owner: 'QAlice',
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('falls back to search when the direct lookup throws, then returns the exact match', async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockImplementation((async (url: string) => {
        if (url.startsWith('/names/search')) {
          return okJson([
            { name: 'Alice', owner: 'QAlice' },
          ]) as unknown as Response;
        }
        throw new Error('direct lookup failed');
      }) as unknown as typeof fetch);

      expect(await getQortalNameData('Alice')).toEqual({
        name: 'Alice',
        owner: 'QAlice',
      });
    });

    it('returns null when neither the direct lookup nor the search yields an exact match', async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockImplementation((async (url: string) => {
        if (url.startsWith('/names/search')) {
          return okJson([
            { name: 'alicia', owner: 'QAlicia' },
          ]) as unknown as Response;
        }
        return okJson({}) as unknown as Response;
      }) as unknown as typeof fetch);

      expect(await getQortalNameData('Alice')).toBeNull();
    });
  });
});
