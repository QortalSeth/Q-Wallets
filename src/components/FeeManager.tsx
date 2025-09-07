import {
  Box,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import React, { useEffect } from 'react';
import {
  CoinActionContainer,
  CoinActionRow,
  CustomLabel,
  HeaderRow,
} from '../styles/Fees-styles';
import { useRecommendedFees } from '../hooks/useRecommendedFees';

export const FeeManager = ({ coin, onChange }) => {
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
    event: React.MouseEvent<HTMLElement>,
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
              {t('core:fee', {
                postProcess: 'capitalizeFirstChar',
              })}{' '}
              publisher
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
                <ToggleButton value="low">Low</ToggleButton>
                <ToggleButton value="medium">Medium</ToggleButton>
                <ToggleButton value="high">High</ToggleButton>
              </>
            )}

            <ToggleButton value="custom">Custom</ToggleButton>
          </ToggleButtonGroup>
          {selectFeeType === 'custom' && (
            <CoinActionRow>
              <HeaderRow>
                <Box>
                  <CustomLabel htmlFor="standard-adornment-name">
                    Custom fee
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
          Current fee : {currentFee} sat/kB
        </Typography>

        <Typography
          align="center"
          sx={{ fontWeight: 600, fontSize: '14px', marginTop: '15px' }}
        >
          Low fees may result in slow or unconfirmed transactions.
        </Typography>
      </Box>
    </div>
  );
};
