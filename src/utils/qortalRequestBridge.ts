type QortalBridgeWindow = Window & {
  qortalRequest?: (options: QortalRequestOptions) => Promise<any>;
  qortalRequestWithTimeout?: (
    options: QortalRequestOptions,
    time: number
  ) => Promise<any>;
  __qWalletFetchBridgeInstalled?: boolean;
};

const DEFAULT_REQUEST_TIMEOUT = 120_000;
const BRIDGE_FETCH_TIMEOUT = 8_000;
const QORT_PAYMENT_UNIT_FEE = 100_000;
const QORT_ADDRESS_PATTERN = /^Q[1-9A-HJ-NP-Za-km-z]{33}$/;

const getErrorMessage = (error: unknown) => {
  if (!error) return 'Qortal request failed';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message);
  }
  return 'Qortal request failed';
};

const createQortalRequest = (timeoutMs = DEFAULT_REQUEST_TIMEOUT) => {
  return (options: QortalRequestOptions) =>
    new Promise((resolve, reject) => {
      if (!window.parent || window.parent === window) {
        reject(new Error('Qortal request bridge is unavailable'));
        return;
      }

      const channel = new MessageChannel();
      const timeoutId = window.setTimeout(() => {
        channel.port1.close();
        reject(new Error(`Qortal request timed out: ${options.action}`));
      }, timeoutMs);

      channel.port1.onmessage = (event) => {
        window.clearTimeout(timeoutId);
        channel.port1.close();

        if (event.data?.error) {
          reject(new Error(getErrorMessage(event.data.error)));
          return;
        }

        resolve(event.data?.result);
      };

      window.parent.postMessage(
        {
          ...options,
          requestedHandler: 'UI',
        },
        '*',
        [channel.port2]
      );
    });
};

const requestThroughBridge = (
  bridgeWindow: QortalBridgeWindow,
  options: QortalRequestOptions,
  timeoutMs = BRIDGE_FETCH_TIMEOUT
) => {
  if (typeof bridgeWindow.qortalRequestWithTimeout === 'function') {
    return bridgeWindow.qortalRequestWithTimeout(options, timeoutMs);
  }

  return bridgeWindow.qortalRequest?.(options);
};

const createJsonResponse = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    status: init?.status ?? 200,
  });

const parseNumberParam = (value: string | null) => {
  if (value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseBooleanParam = (value: string | null) => {
  if (value === null) return undefined;
  return value === 'true';
};

const installQortalApiFetchBridge = (bridgeWindow: QortalBridgeWindow) => {
  if (bridgeWindow.__qWalletFetchBridgeInstalled) return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const method =
      init?.method ||
      (input instanceof Request ? input.method : undefined) ||
      'GET';

    if (method.toUpperCase() !== 'GET') {
      return originalFetch(input, init);
    }

    const rawUrl =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    const url = new URL(rawUrl, window.location.origin);
    const isLocalRelativeRequest =
      rawUrl.startsWith('/') || url.origin === window.location.origin;

    if (!isLocalRelativeRequest) {
      return originalFetch(input, init);
    }

    const balanceAddress = url.pathname.match(
      /^\/addresses\/balance\/([^/]+)$/
    )?.[1];

    if (balanceAddress) {
      const result = await bridgeWindow.qortalRequest?.({
        action: 'GET_BALANCE',
        address: decodeURIComponent(balanceAddress),
      });
      return createJsonResponse(result);
    }

    const addressToValidate = url.pathname.match(
      /^\/addresses\/validate\/([^/]+)$/
    )?.[1];

    if (addressToValidate) {
      return createJsonResponse(
        QORT_ADDRESS_PATTERN.test(decodeURIComponent(addressToValidate))
      );
    }

    const nameToLookup = url.pathname.match(/^\/names\/([^/]+)$/)?.[1];

    if (nameToLookup) {
      try {
        const result = await requestThroughBridge(bridgeWindow, {
          action: 'GET_NAME_DATA',
          name: decodeURIComponent(nameToLookup),
        });
        if (!result) {
          return createJsonResponse({ error: 'Name not found' }, { status: 404 });
        }

        return createJsonResponse(result);
      } catch (error) {
        return createJsonResponse(
          { error: getErrorMessage(error) },
          { status: 404 }
        );
      }
    }

    if (
      url.pathname === '/transactions/unitfee' &&
      url.searchParams.get('txType') === 'PAYMENT'
    ) {
      return createJsonResponse(QORT_PAYMENT_UNIT_FEE);
    }

    if (
      url.pathname === '/transactions/search' ||
      url.pathname === '/transactions/unconfirmed'
    ) {
      const searchParams = url.searchParams;
      const result = await bridgeWindow.qortalRequest?.({
        action: 'SEARCH_TRANSACTIONS',
        txType: searchParams.getAll('txType') as any,
        address: searchParams.get('address') ?? undefined,
        confirmationStatus:
          url.pathname === '/transactions/unconfirmed'
            ? 'UNCONFIRMED'
            : (searchParams.get('confirmationStatus') as any) ?? undefined,
        creator: searchParams.get('creator') ?? undefined,
        limit: parseNumberParam(searchParams.get('limit')),
        offset: parseNumberParam(searchParams.get('offset')),
        reverse: parseBooleanParam(searchParams.get('reverse')),
        unconfirmed: url.pathname === '/transactions/unconfirmed',
      } as QortalRequestOptions);
      return createJsonResponse(result);
    }

    return originalFetch(input, init);
  };

  bridgeWindow.__qWalletFetchBridgeInstalled = true;
};

export const installQortalRequestBridge = () => {
  const bridgeWindow = window as QortalBridgeWindow;

  if (typeof bridgeWindow.qortalRequest !== 'function') {
    bridgeWindow.qortalRequest = createQortalRequest();
    bridgeWindow.qortalRequestWithTimeout = (options, time) =>
      createQortalRequest(time)(options);
  }

  if (!bridgeWindow._qdnBase) {
    installQortalApiFetchBridge(bridgeWindow);
  }
};
