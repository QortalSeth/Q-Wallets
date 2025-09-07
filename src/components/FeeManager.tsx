import {
  Box,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { MouseEvent, useEffect } from 'react';
import {
  CoinActionContainer,
  CoinActionRow,
  CustomLabel,
  HeaderRow,
} from '../styles/Fees-styles';
import { useRecommendedFees } from '../hooks/useRecommendedFees';
import { useTranslation } from 'react-i18next';

export const FeeManager = ({ coin, onChange }) => {
  const { t } = useTranslation('core');

  const {
    selectedFeePublisher,
    setSelectedFeePublisher,
    currentFee,
    selectFeeType,
    setSelectFeeType,
    data,
    customFee,
    setCustomFee,
  } = useRecommendedFees({ selectedCoin: coin });

  const handleChangeRecommended = (
    event: MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    if (newAlignment) {
      setSelectFeeType(newAlignment);
    }
  };

  useEffect(() => {
    onChange(currentFee);
  }, [currentFee]);
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '20px',
          flexDirection: 'column',
          width: '50ch',
        }}
      >
        <CoinActionContainer
          sx={{
            border: '1px solid #3F3F3F',
            borderRadius: '5px',
            padding: '5px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography>
              {t('core:fee.publisher', {
                postProcess: 'capitalizeFirstChar',
              })}
            </Typography>
            <Select
              size="small"
              value={selectedFeePublisher}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedFeePublisher(e.target.value);
                }
              }}
            >
              <MenuItem value={'Foreign-Fee-Publisher'}>
                Foreign-Fee-Publisher
              </MenuItem>
              <MenuItem value={'JSON.Bridge'}>JSON.Bridge</MenuItem>
            </Select>
          </Box>

          <ToggleButtonGroup
            color="primary"
            value={selectFeeType}
            exclusive
            onChange={handleChangeRecommended}
            aria-label="Platform"
          >
            {data && (
              <>
                <ToggleButton value="low">
                  {t('core:fee.low', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </ToggleButton>
                <ToggleButton value="medium">
                  {t('core:fee.medium', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </ToggleButton>
                <ToggleButton value="high">
                  {t('core:fee.high', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </ToggleButton>
              </>
            )}

            <ToggleButton value="custom">
              {t('core:fee.custom', {
                postProcess: 'capitalizeFirstChar',
              })}
            </ToggleButton>
          </ToggleButtonGroup>

          {selectFeeType === 'custom' && (
            <CoinActionRow>
              <HeaderRow>
                <Box>
                  <CustomLabel htmlFor="standard-adornment-name">
                    {t('core:fee.custom', {
                      postProcess: 'capitalizeFirstChar',
                    })}
                  </CustomLabel>

                  <TextField
                    id="standard-adornment-name"
                    type="number"
                    value={customFee}
                    onChange={(e) => setCustomFee(+e.target.value)}
                    autoComplete="off"
                  />
                </Box>
              </HeaderRow>
            </CoinActionRow>
          )}
        </CoinActionContainer>

        <Typography
          id="ltc-fee-slider"
          sx={{
            marginTop: '15px',
          }}
        >
          {t('core:fee.current', {
            fee: currentFee,
            postProcess: 'capitalizeFirstChar',
          })}
        </Typography>

        <Typography
          align="center"
          sx={{ fontWeight: 600, fontSize: '14px', marginTop: '15px' }}
        >
          {t('core:message.generic.low_fee_transation', {
            postProcess: 'capitalizeFirstChar',
          })}
        </Typography>
      </Box>
    </div>
  );
};
