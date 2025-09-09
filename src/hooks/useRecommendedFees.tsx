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
      const res = await fetch(
        `/arbitrary/resources/searchsimple?service=JSON&identifier=${identifier}&name=${selectedFeePublisher}&prefix=true&limit=1&reverse=true`
      );
      const data: unknown = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const location = data[0] as { name: string; identifier: string };
        const resBridge = await fetch(
          `/arbitrary/JSON/${location.name}/${location.identifier}`
        );
        const dataBridge: unknown = await resBridge.json();
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
