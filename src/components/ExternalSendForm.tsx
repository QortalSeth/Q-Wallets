import type { ReactNode } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  LinearProgress,
  Slider,
  SliderProps,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  AccountBalanceWalletOutlined,
  CenterFocusWeak,
  Close,
  ContactsOutlined,
  CreditCardOutlined,
  FileUploadOutlined,
  InfoOutlined,
  Send,
  Tune,
} from '@mui/icons-material';
import { NumericFormat as _NumericFormat } from 'react-number-format';

const NumericFormat = _NumericFormat as React.FC<
  React.ComponentProps<typeof _NumericFormat> & Record<string, unknown>
>;

type ExternalSendFormProps = {
  addressError: boolean;
  addressHelperText: ReactNode;
  addressInputId: string;
  amount: number;
  balance: number | string;
  balanceError?: string | null;
  coinLogo: string;
  feeContent: ReactNode;
  isBalanceLoading: boolean;
  maxSendable: number;
  onAmountChange: (amount: number) => void;
  onClose: () => void;
  onOpenAddressBook?: () => void;
  onRecipientChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onSendMax: () => void;
  recipient: string;
  sendDisabled: boolean;
  showAddressBookButton?: boolean;
  showBalanceMeter?: boolean;
  symbol: string;
};

type ExternalFeeSliderProps = {
  defaultValue: number;
  fee: number;
  getAriaValueText: NonNullable<SliderProps['getAriaValueText']>;
  marks: SliderProps['marks'];
  max: number;
  min: number;
  onChange: NonNullable<SliderProps['onChange']>;
  sliderId: string;
  step: number;
};

const compactValue = (value: number | string, symbol: string) =>
  `${value} ${symbol}`;

const maxOrZero = (value: number) =>
  Number.isFinite(value) && value > 0 ? value : 0;

const fieldSx = {
  '& .MuiInputLabel-root': {
    color: 'text.secondary',
    fontSize: { xs: 10.5, sm: 11 },
    fontWeight: 800,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  '& .MuiFormHelperText-root': {
    color: 'text.secondary',
    fontSize: { xs: 12, sm: 12 },
    fontWeight: 600,
    lineHeight: 1.35,
    mt: 0.8,
  },
  '& .MuiOutlinedInput-root': {
    bgcolor: 'rgba(0,8,16,0.2)',
    borderRadius: 1.4,
    minHeight: { xs: 58, sm: 64 },
    px: { xs: 1.05, sm: 1.25 },
    '& fieldset': {
      borderColor: 'rgba(116,158,180,0.32)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(24,189,242,0.55)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: 1,
    },
  },
  '& .MuiOutlinedInput-input': {
    color: 'text.primary',
    fontSize: { xs: 18, sm: 20 },
    fontWeight: 700,
    py: 0,
    '&::placeholder': {
      color: 'text.secondary',
      opacity: 0.72,
    },
  },
} as const;

export function ExternalSendForm({
  addressError,
  addressHelperText,
  addressInputId,
  amount,
  balance,
  balanceError,
  coinLogo,
  feeContent,
  isBalanceLoading,
  maxSendable,
  onAmountChange,
  onClose,
  onOpenAddressBook,
  onRecipientChange,
  onSend,
  onSendMax,
  recipient,
  sendDisabled,
  showAddressBookButton = false,
  showBalanceMeter = false,
  symbol,
}: ExternalSendFormProps) {
  const safeMax = maxOrZero(maxSendable);

  return (
    <>
      <AppBar
        sx={{
          bgcolor: 'transparent',
          backgroundColor: 'transparent',
          backgroundImage: 'none',
          borderBottom: 'none',
          boxShadow: 'none',
          position: 'static',
        }}
      >
        <Toolbar
          sx={{
            minHeight: 64,
            px: 3,
          }}
        >
          <IconButton
            color="inherit"
            onClick={onClose}
            aria-label="close"
            sx={{
              color: 'text.primary',
              mr: 1.1,
              p: 0.55,
              '& svg': { fontSize: 25 },
              '&:hover': { bgcolor: 'rgba(116,158,180,0.08)' },
            }}
          >
            <Close />
          </IconButton>
          <Avatar
            sx={{
              bgcolor: 'transparent',
              boxShadow: '0 0 20px rgba(24,189,242,0.16)',
              height: 32,
              mr: 1.25,
              width: 32,
            }}
            alt={`${symbol} Logo`}
            src={coinLogo}
          />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              color: 'text.primary',
              flexGrow: 1,
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: 0,
              lineHeight: 1,
            }}
          >
            Transfer {symbol}
          </Typography>
          <Button
            disabled={sendDisabled}
            variant="contained"
            startIcon={<Send />}
            aria-label={`send-${symbol.toLowerCase()}`}
            onClick={onSend}
            sx={{
              bgcolor: 'primary.main',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 1.4,
              boxShadow: '0 14px 32px rgba(24,189,242,0.26)',
              color: 'white',
              fontSize: 14,
              fontWeight: 800,
              minHeight: 36,
              minWidth: 102,
              px: 2,
              '& .MuiButton-startIcon svg': {
                fontSize: 20,
              },
              '&:hover': {
                bgcolor: '#16baf2',
                boxShadow: '0 16px 36px rgba(24,189,242,0.34)',
              },
              '&:disabled': {
                bgcolor: 'rgba(116,158,180,0.18)',
                borderColor: 'rgba(116,158,180,0.08)',
                boxShadow: 'none',
                color: 'rgba(255,255,255,0.38)',
              },
            }}
          >
            SEND
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: 'grid',
          gap: 1.65,
          px: 3,
          pb: showBalanceMeter ? 1.1 : 2.5,
          pt: 0.5,
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: 'rgba(0,8,16,0.2)',
            border: '1px solid rgba(116,158,180,0.24)',
            borderRadius: 1.5,
            display: 'grid',
            gap: 2.2,
            gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' },
            minHeight: showBalanceMeter ? 96 : 84,
            px: 2,
            py: 1.2,
          }}
        >
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.15 }}>
            <Box
              sx={{
                alignItems: 'center',
                bgcolor: 'rgba(24,189,242,0.09)',
                borderRadius: '50%',
                color: 'primary.main',
                display: 'grid',
                flexShrink: 0,
                height: 38,
                placeItems: 'center',
                width: 38,
              }}
            >
              <AccountBalanceWalletOutlined sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.1,
                }}
              >
                Available balance
              </Typography>
              <Typography
                sx={{
                  color: 'text.primary',
                  fontSize: 18,
                  fontWeight: 800,
                  lineHeight: 1.2,
                  mt: 0.45,
                  overflowWrap: 'anywhere',
                }}
              >
                {isBalanceLoading ? (
                  <Box sx={{ width: 150, maxWidth: '100%' }}>
                    <LinearProgress />
                  </Box>
                ) : balanceError ? (
                  balanceError
                ) : (
                  compactValue(balance, symbol)
                )}
              </Typography>
              {showBalanceMeter && (
                <Box
                  aria-hidden
                  sx={{
                    bgcolor: 'rgba(24,189,242,0.13)',
                    borderRadius: 999,
                    height: 4,
                    mt: 0.8,
                    overflow: 'hidden',
                    width: 198,
                    maxWidth: '100%',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      borderRadius: 999,
                      boxShadow: '0 0 10px rgba(24,189,242,0.4)',
                      height: '100%',
                      width: '58%',
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
          <Box
            aria-hidden
            sx={{
              bgcolor: 'rgba(116,158,180,0.18)',
              display: { xs: 'none', sm: 'block' },
              height: 38,
              width: 1,
            }}
          />
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.15 }}>
            <Box
              sx={{
                alignItems: 'center',
                bgcolor: 'rgba(24,189,242,0.09)',
                borderRadius: '50%',
                color: 'primary.main',
                display: 'grid',
                flexShrink: 0,
                height: 38,
                placeItems: 'center',
                width: 38,
              }}
            >
              <FileUploadOutlined sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.1,
                }}
              >
                Max sendable
              </Typography>
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  gap: 1,
                  mt: 0.45,
                  minWidth: 0,
                }}
              >
                <Typography
                  sx={{
                    color: 'text.primary',
                    fontSize: 18,
                    fontWeight: 800,
                    lineHeight: 1.2,
                    minWidth: 0,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {compactValue(safeMax, symbol)}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={onSendMax}
                  sx={{
                    borderColor: 'rgba(24,189,242,0.38)',
                    borderRadius: 999,
                    color: 'primary.main',
                    flexShrink: 0,
                    fontSize: 12,
                    fontWeight: 800,
                    minHeight: 30,
                    px: 1.5,
                  }}
                >
                  SEND MAX
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        <NumericFormat
          decimalScale={8}
          defaultValue={0}
          value={amount}
          allowNegative={false}
          customInput={TextField as React.ComponentType<any>}
          valueIsNumericString
          label={`Amount (${symbol})`}
          placeholder="0"
          fullWidth
          isAllowed={(values) => {
            const { formattedValue, floatValue } = values;
            return formattedValue === '' || (floatValue ?? 0) <= safeMax;
          }}
          onValueChange={(values) => {
            onAmountChange(values.floatValue ?? 0);
          }}
          required
          helperText={`Enter the amount of ${symbol} to send`}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Avatar
                    src={coinLogo}
                    alt=""
                    sx={{
                      bgcolor: 'rgba(24,189,242,0.05)',
                      height: 28,
                      opacity: 0.75,
                      width: 28,
                    }}
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: 14, sm: 16 },
                      fontWeight: 800,
                    }}
                  >
                    {symbol}
                  </Typography>
                </InputAdornment>
              ),
            },
          }}
          sx={{ ...fieldSx, mt: 1.5 }}
        />

        <TextField
          required
          label="Receiver address"
          id={addressInputId}
          value={recipient}
          onChange={onRecipientChange}
          error={addressError}
          fullWidth
          placeholder={`Enter ${symbol} address`}
          helperText={addressHelperText}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <CreditCardOutlined
                    sx={{ color: 'text.secondary', fontSize: 22 }}
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.8 }}>
                    {showAddressBookButton && onOpenAddressBook && (
                      <IconButton
                        aria-label="Open address book"
                        onClick={onOpenAddressBook}
                        sx={{
                          border: '1px solid rgba(116,158,180,0.16)',
                          borderRadius: 1,
                          color: 'text.secondary',
                          height: 32,
                          width: 32,
                          '&:hover': {
                            bgcolor: 'rgba(24,189,242,0.08)',
                            color: 'primary.main',
                          },
                        }}
                      >
                        <ContactsOutlined sx={{ fontSize: 18 }} />
                      </IconButton>
                    )}
                    <Box
                      sx={{
                        alignItems: 'center',
                        border: '1px solid rgba(24,189,242,0.18)',
                        borderRadius: 1,
                        color: 'primary.main',
                        display: 'grid',
                        height: 32,
                        placeItems: 'center',
                        width: 32,
                      }}
                    >
                      <CenterFocusWeak sx={{ fontSize: 18 }} />
                    </Box>
                  </Box>
                </InputAdornment>
              ),
            },
          }}
          sx={fieldSx}
        />

        {feeContent}
      </Box>
    </>
  );
}

export function ExternalFeeSlider({
  defaultValue,
  fee,
  getAriaValueText,
  marks,
  max,
  min,
  onChange,
  sliderId,
  step,
}: ExternalFeeSliderProps) {
  return (
    <>
      <Box
        sx={{
          alignItems: 'center',
          bgcolor: 'rgba(0,8,16,0.2)',
          border: '1px solid rgba(116,158,180,0.18)',
          borderRadius: 1.4,
          display: 'grid',
          gap: { xs: 1.5, sm: 1.7 },
          gridTemplateColumns: { xs: '1fr', sm: '178px minmax(0, 1fr) auto' },
          minHeight: 68,
          px: 1.7,
          py: 0.85,
        }}
      >
        <Box>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 0,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            Current fee per byte
          </Typography>
          <Typography
            sx={{
              color: 'text.primary',
              fontSize: 20,
              fontWeight: 800,
              lineHeight: 1.1,
              mt: 0.55,
            }}
          >
            {fee} SAT
          </Typography>
        </Box>
        <Box sx={{ px: { xs: 0.5, sm: 1.2 } }}>
          <Slider
            track={false}
            step={step}
            min={min}
            max={max}
            valueLabelDisplay="auto"
            aria-labelledby={sliderId}
            getAriaValueText={getAriaValueText}
            defaultValue={defaultValue}
            marks={marks}
            onChange={onChange}
            sx={{
              color: 'primary.main',
              '& .MuiSlider-mark': {
                bgcolor: 'rgba(255,255,255,0.4)',
                height: 3,
                width: 3,
              },
              '& .MuiSlider-markLabel': {
                color: 'text.secondary',
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
              },
              '& .MuiSlider-rail': {
                bgcolor: 'rgba(116,158,180,0.28)',
                height: 3,
              },
              '& .MuiSlider-thumb': {
                boxShadow: '0 0 18px rgba(24,189,242,0.36)',
                height: 20,
                width: 20,
              },
            }}
          />
        </Box>
        <Button
          variant="outlined"
          startIcon={<Tune />}
          sx={{
            borderColor: 'rgba(116,158,180,0.2)',
            borderRadius: 1.2,
            color: 'text.primary',
            fontSize: 12,
            fontWeight: 800,
            minHeight: 38,
            minWidth: 112,
            px: 1.35,
            whiteSpace: 'nowrap',
            '&:hover': {
              bgcolor: 'rgba(116,158,180,0.08)',
              borderColor: 'rgba(24,189,242,0.45)',
            },
          }}
        >
          Custom fee
        </Button>
      </Box>
      <Box
        sx={{
          alignItems: 'center',
          bgcolor: 'rgba(0,8,16,0.2)',
          border: '1px solid rgba(116,158,180,0.14)',
          borderRadius: 1.2,
          display: 'flex',
          gap: 1.3,
          minHeight: 42,
          px: 1.5,
        }}
      >
        <InfoOutlined sx={{ color: 'primary.main', fontSize: 21 }} />
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: { xs: 13, sm: 14 },
            fontWeight: 600,
          }}
        >
          Low fees may result in slow or unconfirmed transactions
        </Typography>
      </Box>
    </>
  );
}
