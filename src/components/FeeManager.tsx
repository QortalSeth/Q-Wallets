import {
  Box,
  Button,
  Collapse,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
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
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

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

  const feeValue = currentFee ?? '--';
  const feeIsLong =
    typeof currentFee === 'number' &&
    Number.isFinite(currentFee) &&
    Math.abs(currentFee) > 9999;
  const feeText = `Fee ${feeValue} sat/kB`;
  const feeTooltipTitle = `${t('core:fee.current', {
    fee: feeValue,
    postProcess: 'capitalizeFirstChar',
  })}. ${t('core:message.generic.low_fee_transation', {
    postProcess: 'capitalizeFirstChar',
  })}`;

  return (
    <Box
      sx={{
        bgcolor: 'rgba(0,8,16,0.13)',
        border: '1px solid rgba(116,158,180,0.14)',
        borderRadius: 1.15,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          display: 'grid',
          gap: { xs: 1, sm: 1.15 },
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'minmax(88px, 0.75fr) minmax(132px, 1.25fr) auto minmax(92px, 0.8fr)',
          },
          px: { xs: 1.45, sm: 1.55 },
          py: 1.05,
        }}
      >
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: 12.5,
            fontWeight: 500,
            letterSpacing: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {t('core:fee.publisher', {
            postProcess: 'capitalizeFirstChar',
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
            fontSize: 13,
            fontWeight: 600,
            minWidth: 0,
            width: '100%',
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
          aria-pressed={selectFeeType === 'custom'}
          aria-expanded={selectFeeType === 'custom'}
          onClick={() =>
            setSelectFeeType((current) =>
              current === 'custom' ? 'medium' : 'custom'
            )
          }
          sx={{
            bgcolor:
              selectFeeType === 'custom'
                ? 'rgba(24,189,242,0.08)'
                : 'transparent',
            borderColor:
              selectFeeType === 'custom'
                ? 'rgba(24,189,242,0.54)'
                : 'rgba(116,158,180,0.2)',
            borderRadius: 1.2,
            color: selectFeeType === 'custom' ? 'primary.main' : 'text.primary',
            fontSize: 12,
            fontWeight: 600,
            minHeight: 32,
            minWidth: 112,
            px: 1.35,
            textTransform: 'none',
            '&:hover': {
              bgcolor: 'rgba(116,158,180,0.08)',
              borderColor: 'rgba(24,189,242,0.45)',
            },
          }}
        >
          {t('core:fee.custom', {
            postProcess: 'capitalizeFirstChar',
          })}
        </Button>

        <Tooltip title={feeTooltipTitle}>
          <Box
            sx={{
              alignItems: 'center',
              color: 'text.secondary',
              display: 'inline-flex',
              gap: 0.55,
              justifySelf: { xs: 'start', sm: 'stretch' },
              minWidth: { sm: 0 },
              opacity: 0.72,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <InfoOutlined
              sx={{ color: 'text.secondary', fontSize: 15, opacity: 0.82 }}
            />
            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: 500,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {feeIsLong ? 'Fee set' : feeText}
            </Typography>
          </Box>
        </Tooltip>

        <Collapse
          in={selectFeeType === 'custom'}
          timeout={reduceMotion ? 0 : 360}
          unmountOnExit
          sx={{
            gridColumn: { xs: '1', sm: '2 / 3' },
            maxWidth: '100%',
            '& .MuiCollapse-wrapperInner': {
              opacity: selectFeeType === 'custom' ? 1 : 0,
              transform:
                selectFeeType === 'custom'
                  ? 'translateY(0)'
                  : 'translateY(-8px)',
              transition: reduceMotion
                ? 'none'
                : 'opacity 280ms ease-out, transform 360ms cubic-bezier(0.2, 0, 0, 1)',
            },
          }}
        >
          <TextField
            type="number"
            value={customFee}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCustomFee(+e.target.value)
            }
            autoComplete="off"
            placeholder="0"
            size="small"
            fullWidth
            slotProps={{
              htmlInput: {
                inputMode: 'numeric',
                min: 0,
              },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography
                      sx={{
                        color: 'text.secondary',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      sat/kB
                    </Typography>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              maxWidth: '100%',
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(0,8,16,0.24)',
                borderRadius: 1.1,
                color: 'text.primary',
                fontSize: 14,
                fontWeight: 500,
                minHeight: 38,
                '& fieldset': {
                  borderColor: 'rgba(116,158,180,0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(116,158,180,0.34)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(24,189,242,0.62)',
                  borderWidth: 1,
                },
              },
              '& .MuiOutlinedInput-input': {
                py: 0,
                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none',
                  margin: 0,
                },
              },
              '& input[type=number]': {
                MozAppearance: 'textfield',
              },
            }}
          />
        </Collapse>

        {feeIsLong && (
          <Tooltip title={feeTooltipTitle}>
            <Box
              sx={{
                alignItems: 'center',
                color: 'text.secondary',
                display: 'inline-flex',
                gap: 0.55,
                gridColumn: {
                  xs: '1',
                  sm: selectFeeType === 'custom' ? '3 / 5' : '2 / 5',
                },
                justifySelf: { xs: 'start', sm: 'end' },
                opacity: 0.72,
                whiteSpace: 'nowrap',
              }}
            >
              <InfoOutlined
                sx={{ color: 'text.secondary', fontSize: 15, opacity: 0.82 }}
              />
              <Typography sx={{ fontSize: 12.5, fontWeight: 500 }}>
                {feeText}
              </Typography>
            </Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};
