const LOCAL_QORTAL_NODE_API = 'http://127.0.0.1:12391';
const HTTPS_LOCAL_QORTAL_NODE_API = 'https://127.0.0.1:12391';
const PUBLIC_QORTAL_NODE_API = 'https://ext-node.qortal.link';
const QORTAL_API_TIMEOUT_MS = 5000;

export type QortalNameSearchResult = {
  name: string;
  owner: string;
};

export type QortalNameData = {
  name: string;
  owner: string;
};

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getQortalNodeApiCandidates = () => {
  const candidates: string[] = [];

  if (typeof window !== 'undefined') {
    const origin = stripTrailingSlash(window.location.origin);
    if (/^https?:\/\/(127\.0\.0\.1|localhost):12391$/i.test(origin)) {
      candidates.push(origin);
    }

    candidates.push(
      window.location.protocol === 'https:'
        ? HTTPS_LOCAL_QORTAL_NODE_API
        : LOCAL_QORTAL_NODE_API
    );
  }

  candidates.push(LOCAL_QORTAL_NODE_API, PUBLIC_QORTAL_NODE_API);

  return [...new Set(candidates.map(stripTrailingSlash))];
};

const fetchJsonWithTimeout = async (url: string, signal?: AbortSignal) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, QORTAL_API_TIMEOUT_MS);
  const abortRequest = () => controller.abort();

  signal?.addEventListener('abort', abortRequest, { once: true });

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Qortal API request failed: ${response.status}`);
    }

    return response.json();
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortRequest);
  }
};

const toNameSearchResults = (payload: unknown): QortalNameSearchResult[] => {
  if (!Array.isArray(payload)) return [];

  return payload
    .map((item) => {
      if (!item || typeof item !== 'object') return null;

      const record = item as { name?: unknown; owner?: unknown };
      if (typeof record.name !== 'string' || typeof record.owner !== 'string') {
        return null;
      }

      return {
        name: record.name,
        owner: record.owner,
      };
    })
    .filter((item): item is QortalNameSearchResult => Boolean(item));
};

const toNameData = (payload: unknown): QortalNameData | null => {
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as { name?: unknown; owner?: unknown };
  if (typeof record.name !== 'string' || typeof record.owner !== 'string') {
    return null;
  }

  return {
    name: record.name,
    owner: record.owner,
  };
};

export const getQortalNameData = async (
  name: string,
  signal?: AbortSignal
): Promise<QortalNameData | null> => {
  const trimmedName = name.trim();
  if (!trimmedName) return null;

  let lastError: unknown = null;

  for (const baseApi of getQortalNodeApiCandidates()) {
    if (signal?.aborted) return null;

    try {
      const payload = await fetchJsonWithTimeout(
        `${baseApi}/names/${encodeURIComponent(trimmedName)}`,
        signal
      );
      const result = toNameData(payload);

      if (result) {
        return result;
      }
    } catch (error) {
      lastError = error;
    }
  }

  const searchResults = await searchQortalNames(trimmedName, 10, signal);
  const exactMatch = searchResults.find(
    (result) => result.name.toLowerCase() === trimmedName.toLowerCase()
  );

  if (exactMatch) {
    return exactMatch;
  }

  if (lastError) {
    console.warn('QORT name lookup failed:', lastError);
  }

  return null;
};

export const searchQortalNames = async (
  query: string,
  limit = 10,
  signal?: AbortSignal
) => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const params = new URLSearchParams({
    limit: String(limit),
    prefix: 'true',
    query: trimmedQuery,
  });
  let lastError: unknown = null;

  for (const baseApi of getQortalNodeApiCandidates()) {
    if (signal?.aborted) return [];

    try {
      const payload = await fetchJsonWithTimeout(
        `${baseApi}/names/search?${params.toString()}`,
        signal
      );
      const results = toNameSearchResults(payload);

      if (results.length > 0 || baseApi === PUBLIC_QORTAL_NODE_API) {
        return results;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    console.warn('QORT name search failed:', lastError);
  }

  return [];
};
