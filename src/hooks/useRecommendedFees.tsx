import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';

export type FeeEstimate = {
  height: number;
  time: number;
  low_fee_per_kb: number;
  medium_fee_per_kb: number;
  high_fee_per_kb: number;
};

export function isValidFeeEstimate(obj: unknown): obj is FeeEstimate {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).height === 'number' &&
    typeof (obj as any).time === 'number' &&
    typeof (obj as any).low_fee_per_kb === 'number' &&
    typeof (obj as any).medium_fee_per_kb === 'number' &&
    typeof (obj as any).high_fee_per_kb === 'number'
  );
}

export type FeeType = 'low' | 'medium' | 'high' | 'custom';

const LOCAL_QORTAL_NODE_API = 'http://127.0.0.1:12391';
const HTTPS_LOCAL_QORTAL_NODE_API = 'https://127.0.0.1:12391';
const PUBLIC_QORTAL_NODE_API = 'https://ext-node.qortal.link';
const FEE_REQUEST_TIMEOUT_MS = 6000;

type UseRecommendedFeesArgs = {
  selectedCoin?: string | null;
};

type UseRecommendedFeesReturn = {
  data: FeeEstimate | null;
  currentFee: number | null;
  setSelectedFeePublisher: (value: string) => void;
  selectedFeePublisher: string;
  setSelectFeeType: Dispatch<SetStateAction<FeeType>>;
  selectFeeType: FeeType;
  setCustomFee: Dispatch<SetStateAction<number>>;
  customFee: number;
};

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getQortalNodeApiCandidates = () => {
  const candidates = [''];

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

  candidates.push(LOCAL_QORTAL_NODE_API, HTTPS_LOCAL_QORTAL_NODE_API);
  candidates.push(PUBLIC_QORTAL_NODE_API);

  return [...new Set(candidates.map(stripTrailingSlash))];
};

const getUrlForPath = (baseApi: string, path: string) =>
  baseApi ? `${baseApi}${path}` : path;

const fetchJsonWithTimeout = async (url: string): Promise<unknown> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, FEE_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Fee request failed: ${response.status}`);
    }

    return response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const fetchQortalJson = async (path: string): Promise<unknown> => {
  let lastError: unknown = null;

  for (const baseApi of getQortalNodeApiCandidates()) {
    try {
      return await fetchJsonWithTimeout(getUrlForPath(baseApi, path));
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

export const useRecommendedFees = ({
  selectedCoin,
}: UseRecommendedFeesArgs): UseRecommendedFeesReturn => {
  const [selectedFeePublisher, setSelectedFeePublisher] =
    useState<string>('JSON.Bridge');
  const [selectFeeType, setSelectFeeType] = useState<FeeType>('medium');
  const [customFee, setCustomFee] = useState<number>(0);
  const [feeData, setFeeData] = useState<unknown>(null);

  const coin = useMemo<string | null>(() => {
    if (!selectedCoin) return null;
    return selectedCoin;
  }, [selectedCoin]);

  const getLatestFees = useCallback(async (): Promise<void> => {
    try {
      if (!selectedFeePublisher || !coin) return;
      const identifier = `coinInfo-${coin}`;
      const searchParams = new URLSearchParams({
        identifier,
        limit: '1',
        name: selectedFeePublisher,
        prefix: 'true',
        reverse: 'true',
        service: 'JSON',
      });
      const data = await fetchQortalJson(
        `/arbitrary/resources/searchsimple?${searchParams.toString()}`
      );
      if (Array.isArray(data) && data.length > 0) {
        const location = data[0] as { name: string; identifier: string };
        const dataBridge = await fetchQortalJson(
          `/arbitrary/JSON/${encodeURIComponent(
            location.name
          )}/${encodeURIComponent(location.identifier)}`
        );
        setFeeData(dataBridge);
      }
    } catch (error) {
      console.error(error);
    }
  }, [selectedFeePublisher, coin]);

  useEffect(() => {
    getLatestFees();
  }, [getLatestFees]);

  const recommendedFeeData = useMemo<FeeEstimate | null>(() => {
    if (!feeData) return null;
    const isValid = isValidFeeEstimate(feeData);
    if (!isValid) return null;
    return feeData;
  }, [feeData]);

  const selectFee = useMemo<number | null>(() => {
    if (!recommendedFeeData) return null;
    if (selectFeeType === 'high') {
      return recommendedFeeData.high_fee_per_kb;
    }
    if (selectFeeType === 'low') {
      return recommendedFeeData.low_fee_per_kb;
    }
    if (selectFeeType === 'medium') {
      return recommendedFeeData.medium_fee_per_kb;
    }
    return null;
  }, [recommendedFeeData, selectFeeType]);

  const handleSelectPublisher = useCallback((val: string) => {
    setFeeData(null);
    setSelectedFeePublisher(val);
  }, []);

  return {
    data: recommendedFeeData,
    currentFee: selectFeeType === 'custom' ? customFee : selectFee,
    setSelectedFeePublisher: handleSelectPublisher,
    selectedFeePublisher,
    setSelectFeeType,
    selectFeeType,
    setCustomFee,
    customFee,
  };
};
