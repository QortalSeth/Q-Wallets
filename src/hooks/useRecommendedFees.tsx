import { useCallback, useEffect, useMemo, useState } from 'react';

type FeeEstimate = {
  height: number;
  time: number;
  low_fee_per_kb: number;
  medium_fee_per_kb: number;
  high_fee_per_kb: number;
};

export function isValidFeeEstimate(obj: any): obj is FeeEstimate {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.height === 'number' &&
    typeof obj.time === 'number' &&
    typeof obj.low_fee_per_kb === 'number' &&
    typeof obj.medium_fee_per_kb === 'number' &&
    typeof obj.high_fee_per_kb === 'number'
  );
}

export const useRecommendedFees = ({ selectedCoin }) => {
  const [selectedFeePublisher, setSelectedFeePublisher] =
    useState('JSON.Bridge');
  const [selectFeeType, setSelectFeeType] = useState('medium');
  const [customFee, setCustomFee] = useState(0);
  const [feeData, setFeeData] = useState(null);

  const coin = useMemo(() => {
    if (!selectedCoin) return null;
    return selectedCoin;
  }, [selectedCoin]);

  const getLatestFees = useCallback(async () => {
    try {
      if (!selectedFeePublisher || !coin) return;
      const identifier = `coinInfo-${coin}`;
      const res = await fetch(
        `/arbitrary/resources/searchsimple?service=JSON&identifier=${identifier}&name=${selectedFeePublisher}&prefix=true&limit=1&reverse=true`
      );
      const data = await res.json();
      if (data && data?.length > 0) {
        const location = data[0];
        const resBridge = await fetch(
          `/arbitrary/JSON/${location.name}/${location.identifier}`
        );
        const dataBridge = await resBridge.json();
        setFeeData(dataBridge);
      }
    } catch (error) {
      console.error(error);
    }
  }, [selectedFeePublisher, coin]);

  useEffect(() => {
    getLatestFees();
  }, [getLatestFees]);

  const recommendedFeeData = useMemo(() => {
    if (!feeData) return null;
    const isValid = isValidFeeEstimate(feeData);
    if (!isValid) return null;
    return feeData;
  }, [feeData]);

  const selectFee = useMemo(() => {
    if (!recommendedFeeData) return;
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

  const handleSelectPublisher = useCallback((val) => {
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
