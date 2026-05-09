import {
  Box,
  Button,
  Divider,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { useEffect } from 'react';
import { useRecommendedFees } from '../hooks/useRecommendedFees';
import { useTranslation } from 'react-i18next';

type FeeManagerProps = {
  coin: string;
  onChange: (fee: number) => void;
};

export const FeeManager = ({ coin, onChange }: FeeManagerProps) => {
  const { t } = useTranslation('core');

  const {
    selectedFeePublisher,
    setSelectedFeePublisher,
    currentFee,
    selectFeeType,
    setSelectFeeType,
    customFee,
    setCustomFee,
  } = useRecommendedFees({ selectedCoin: coin });

  useEffect(() => {
    onChange(currentFee ?? 0);
  }, [currentFee, onChange]);

  return (
    <Box
      sx={{
        bgcolor: 'rgba(0,8,16,0.2)',
        border: '1px solid rgba(116,158,180,0.18)',
        borderRadius: 1.4,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.05,
          justifyContent: 'center',
          px: 1.7,
          py: 1.25,
        }}
      >
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 0,
            textTransform: 'uppercase',
          }}
        >
          {t('core:fee.publisher', {
            postProcess: 'capitalizeAll',
          })}
        </Typography>

        <Select
          size="small"
          value={selectedFeePublisher}
          onChange={(e: { target: { value: string } }) => {
            if (e.target.value) {
              setSelectedFeePublisher(e.target.value);
            }
          }}
          sx={{
            bgcolor: 'rgba(0,8,16,0.24)',
            borderRadius: 1.2,
            color: 'text.primary',
            fontSize: 14,
            fontWeight: 800,
            minWidth: 153,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
            '& .MuiSelect-icon': {
              color: 'text.primary',
            },
          }}
        >
          <MenuItem value="Foreign-Fee-Publisher">
            Foreign-Fee-Publisher
          </MenuItem>
          <MenuItem value="JSON.Bridge">JSON.Bridge</MenuItem>
        </Select>

        <Button
          variant="outlined"
          onClick={() =>
            setSelectFeeType((current) =>
              current === 'custom' ? 'medium' : 'custom'
            )
          }
          sx={{
            borderColor: 'rgba(116,158,180,0.2)',
            borderRadius: 1.2,
            color: 'text.primary',
            fontSize: 12,
            fontWeight: 800,
            minHeight: 34,
            minWidth: 120,
            px: 1.7,
            '&:hover': {
              bgcolor: 'rgba(116,158,180,0.08)',
              borderColor: 'rgba(24,189,242,0.45)',
            },
          }}
        >
          {t('core:fee.custom', {
            postProcess: 'capitalizeAll',
          })}
        </Button>

        {selectFeeType === 'custom' && (
          <TextField
            type="number"
            value={customFee}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCustomFee(+e.target.value)
            }
            autoComplete="off"
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">sat/kB</InputAdornment>
                ),
              },
            }}
            sx={{
              maxWidth: 180,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(0,8,16,0.2)',
                borderRadius: 1.1,
              },
            }}
          />
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(116,158,180,0.14)' }} />
      <Box
        sx={{
          alignItems: 'center',
          display: 'grid',
          gap: 1.4,
          gridTemplateColumns: {
            xs: '1fr',
            sm: '22px 138px 1px minmax(0, 1fr)',
          },
          minHeight: 44,
          px: 2,
          py: 0.9,
        }}
      >
        <InfoOutlined sx={{ color: 'primary.main', fontSize: 20 }} />
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: { xs: 12, sm: 13 },
            fontWeight: 600,
            textDecoration: 'underline',
            textDecorationColor: 'rgba(116,158,180,0.36)',
            textUnderlineOffset: 5,
          }}
        >
          {t('core:fee.current', {
            fee: currentFee,
            postProcess: 'capitalizeFirstChar',
          })}
        </Typography>
        <Box
          aria-hidden
          sx={{
            bgcolor: 'rgba(116,158,180,0.16)',
            display: { xs: 'none', sm: 'block' },
            height: 24,
            width: 1,
          }}
        />
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: { xs: 12, sm: 13 },
            fontWeight: 600,
          }}
        >
          {t('core:message.generic.low_fee_transation', {
            postProcess: 'capitalizeFirstChar',
          })}
        </Typography>
      </Box>
    </Box>
  );
};
