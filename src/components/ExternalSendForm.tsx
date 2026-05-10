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
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccountBalanceWalletOutlined,
  CheckCircleOutline,
  Close,
  ContactsOutlined,
  CreditCardOutlined,
  FileUploadOutlined,
  InfoOutlined,
  Send,
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
  balance: number | string | null | undefined;
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

const compactValue = (
  value: number | string | null | undefined,
  symbol: string
) => {
  if (value === null || value === undefined || value === '') {
    return `0 ${symbol}`;
  }

  if (typeof value === 'number' && !Number.isFinite(value)) {
    return `0 ${symbol}`;
  }

  return `${value} ${symbol}`;
};

const maxOrZero = (value: number) =>
  Number.isFinite(value) && value > 0 ? value : 0;

const sendLabelSx = {
  color: 'text.secondary',
  fontSize: { xs: 13, sm: 13.5 },
  fontWeight: 600,
  lineHeight: 1.3,
} as const;

const mutedLabelSx = {
  color: 'text.secondary',
  fontSize: { xs: 12.5, sm: 13 },
  fontWeight: 500,
} as const;

const helperSx = {
  color: 'text.secondary',
  fontSize: { xs: 12.5, sm: 13 },
  fontWeight: 500,
  lineHeight: 1.45,
  ml: 1.6,
  mt: 0.85,
} as const;

const fieldSx = {
  '& .MuiFormHelperText-root': {
    ...helperSx,
  },
  '& .MuiOutlinedInput-root': {
    bgcolor: 'rgba(0,8,16,0.13)',
    borderRadius: 1.2,
    minHeight: { xs: 56, sm: 60 },
    px: { xs: 1.05, sm: 1.25 },
    transition: 'background-color 160ms ease',
    '& fieldset': {
      borderColor: 'rgba(116,158,180,0.16)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(116,158,180,0.3)',
    },
    '&.Mui-focused': {
      bgcolor: 'rgba(0,8,16,0.2)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(24,189,242,0.62)',
      borderWidth: 1,
    },
  },
  '& .MuiOutlinedInput-input': {
    color: 'text.primary',
    fontSize: { xs: 16, sm: 16.5 },
    fontWeight: 500,
    py: 0,
    '&::placeholder': {
      color: 'text.secondary',
      fontWeight: 400,
      opacity: 0.58,
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
          color: 'text.primary',
          position: 'static',
        }}
      >
        <Toolbar
          sx={{
            minHeight: '60px !important',
            px: { xs: 2.4, sm: 2.75 },
          }}
        >
          <IconButton
            color="inherit"
            onClick={onClose}
            aria-label="close"
            sx={{
              color: 'text.secondary',
              mr: { xs: 1, sm: 1.25 },
              p: 0.55,
              '& svg': { fontSize: 24 },
              '&:hover': {
                bgcolor: 'rgba(116,158,180,0.08)',
                color: 'text.primary',
              },
            }}
          >
            <Close />
          </IconButton>
          <Avatar
            sx={{
              bgcolor: 'transparent',
              boxShadow: '0 0 16px rgba(24,189,242,0.2)',
              height: 32,
              mr: { xs: 1.2, sm: 1.3 },
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
              fontWeight: 700,
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
              boxShadow: '0 10px 24px rgba(24,189,242,0.2)',
              color: 'white',
              fontSize: { xs: 13, sm: 13.5 },
              fontWeight: 700,
              minHeight: 36,
              minWidth: 98,
              px: 2,
              '& .MuiButton-startIcon svg': {
                fontSize: 19,
              },
              '&:hover': {
                bgcolor: '#16baf2',
                boxShadow: '0 16px 36px rgba(24,189,242,0.34)',
              },
              '&:disabled': {
                bgcolor: 'rgba(116,158,180,0.18)',
                borderColor: 'rgba(116,158,180,0.08)',
                boxShadow: 'none',
                color: 'rgba(255,255,255,0.44)',
              },
            }}
          >
            Send
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: 'grid',
          gap: 2.25,
          px: { xs: 2.4, sm: 2.75 },
          pb: 2.45,
          pt: 1.5,
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: 'rgba(9, 32, 49, 0.38)',
            border: '1px solid rgba(116,158,180,0.14)',
            borderRadius: 1.15,
            display: 'grid',
            gap: { xs: 1.8, sm: 2.4 },
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'minmax(0, 0.88fr) 1px minmax(0, 1.12fr)',
            },
            minHeight: 92,
            px: { xs: 1.7, sm: 2.15 },
            py: { xs: 1.6, sm: 1.65 },
          }}
        >
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.25 }}>
            <Box
              sx={{
                alignItems: 'center',
                bgcolor: 'rgba(24,189,242,0.08)',
                borderRadius: '50%',
                color: 'primary.main',
                display: 'grid',
                flexShrink: 0,
                height: 34,
                placeItems: 'center',
                width: 34,
              }}
            >
              <AccountBalanceWalletOutlined sx={{ fontSize: 18 }} />
            </Box>
            <Box sx={{ display: 'grid', gap: 0.45, minWidth: 0 }}>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                Available balance
              </Typography>
              <Typography
                sx={{
                  color: balanceError ? 'text.secondary' : 'text.primary',
                  fontSize: balanceError
                    ? { xs: 13, sm: 13.5 }
                    : { xs: 17, sm: 17 },
                  fontWeight: balanceError ? 500 : 650,
                  lineHeight: balanceError ? 1.18 : 1.2,
                  overflowWrap: 'anywhere',
                  whiteSpace: balanceError ? 'normal' : 'nowrap',
                }}
              >
                {isBalanceLoading ? (
                  <Box sx={{ width: 150, maxWidth: '100%' }}>
                    <LinearProgress />
                  </Box>
                ) : balanceError ? (
                  <Tooltip title={balanceError}>
                    <Box
                      component="span"
                      sx={{
                        alignItems: 'center',
                        display: 'inline-flex',
                        gap: 0.55,
                      }}
                    >
                      <InfoOutlined sx={{ color: 'primary.main', fontSize: 15 }} />
                      Balance unavailable
                    </Box>
                  </Tooltip>
                ) : (
                  compactValue(balance, symbol)
                )}
              </Typography>
              {showBalanceMeter && !isBalanceLoading && !balanceError && (
                <Box
                  aria-hidden
                  sx={{
                    bgcolor: 'rgba(24,189,242,0.13)',
                    borderRadius: 999,
                    height: 4,
                    mt: 0.1,
                    overflow: 'hidden',
                    width: 150,
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
              bgcolor: 'rgba(116,158,180,0.12)',
              display: { xs: 'none', sm: 'block' },
              height: 54,
              width: 1,
            }}
          />
          <Box
            sx={{
              alignItems: 'center',
              display: 'grid',
              gap: 1.2,
              gridTemplateColumns: 'auto minmax(0, 1fr) auto',
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                bgcolor: 'rgba(24,189,242,0.08)',
                borderRadius: '50%',
                color: 'primary.main',
                display: 'grid',
                flexShrink: 0,
                height: 34,
                placeItems: 'center',
                width: 34,
              }}
            >
              <FileUploadOutlined sx={{ fontSize: 18 }} />
            </Box>
            <Box sx={{ display: 'grid', gap: 0.45, minWidth: 0 }}>
              <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.65 }}>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    fontSize: 13,
                    fontWeight: 500,
                    lineHeight: 1.2,
                  }}
                >
                  Max sendable
                </Typography>
                <Tooltip title="Maximum amount available after reserving the sending fee">
                  <InfoOutlined
                    sx={{
                      color: 'text.secondary',
                      fontSize: 15,
                      opacity: 0.8,
                    }}
                  />
                </Tooltip>
              </Box>
              <Typography
                sx={{
                  color: 'text.primary',
                  fontSize: { xs: 17, sm: 17 },
                  fontWeight: 650,
                  lineHeight: 1.2,
                  minWidth: 0,
                  overflowWrap: 'anywhere',
                  whiteSpace: 'nowrap',
                }}
              >
                {compactValue(safeMax, symbol)}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={onSendMax}
              sx={{
                borderColor: 'rgba(24,189,242,0.28)',
                borderRadius: 999,
                color: 'text.primary',
                flexShrink: 0,
                fontSize: 12,
                fontWeight: 600,
                minHeight: 32,
                minWidth: 82,
                px: 1.8,
                '&:hover': {
                  bgcolor: 'rgba(24,189,242,0.08)',
                  borderColor: 'rgba(24,189,242,0.44)',
                  color: 'primary.main',
                },
              }}
            >
              Send max
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gap: 0.85 }}>
          <Typography sx={sendLabelSx}>
            Amount{' '}
            <Box component="span" sx={mutedLabelSx}>
              ({symbol})
            </Box>{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>
              *
            </Box>
          </Typography>
          <NumericFormat
            decimalScale={8}
            defaultValue={0}
            value={amount}
            allowNegative={false}
            customInput={TextField as React.ComponentType<any>}
            valueIsNumericString
            placeholder="0.00"
            fullWidth
            isAllowed={(values) => {
              const { formattedValue, floatValue } = values;
              return formattedValue === '' || (floatValue ?? 0) <= safeMax;
            }}
            onValueChange={(values) => {
              onAmountChange(values.floatValue ?? 0);
            }}
            required
            slotProps={{
              htmlInput: {
                'aria-label': `${symbol} amount`,
              },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Avatar
                      src={coinLogo}
                      alt=""
                      sx={{
                        bgcolor: 'rgba(24,189,242,0.07)',
                        height: { xs: 28, sm: 30 },
                        opacity: 0.82,
                        width: { xs: 28, sm: 30 },
                      }}
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Box sx={{ display: 'grid', justifyItems: 'end' }}>
                      <Typography
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: 13, sm: 13.5 },
                          fontWeight: 600,
                          lineHeight: 1.1,
                        }}
                      >
                        {symbol}
                      </Typography>
                      <Button
                        variant="text"
                        onClick={onSendMax}
                        sx={{
                          color: 'primary.main',
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: 1.1,
                          minHeight: 0,
                          minWidth: 0,
                          mt: 0.35,
                          p: 0,
                          '&:hover': {
                            bgcolor: 'transparent',
                            color: '#37d0ff',
                          },
                        }}
                      >
                        Max
                      </Button>
                    </Box>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              ...fieldSx,
              '& .MuiOutlinedInput-input': {
                color: 'text.primary',
                fontSize: { xs: 17.5, sm: 18 },
                fontWeight: 500,
                py: 0,
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'grid', gap: 0.85 }}>
          <Typography sx={sendLabelSx}>
            Receiver address{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>
              *
            </Box>
          </Typography>
          <TextField
            required
            id={addressInputId}
            value={recipient}
            onChange={onRecipientChange}
            error={addressError}
            fullWidth
            placeholder={`Enter ${symbol} address`}
            helperText={addressError ? addressHelperText : undefined}
            slotProps={{
              htmlInput: {
                'aria-label': `${symbol} receiver address`,
              },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCardOutlined
                      sx={{ color: 'text.secondary', fontSize: 21 }}
                    />
                  </InputAdornment>
                ),
                endAdornment: showAddressBookButton && onOpenAddressBook ? (
                  <InputAdornment position="end">
                    <Tooltip title="Open address book">
                      <IconButton
                        aria-label="Open address book"
                        onClick={onOpenAddressBook}
                        sx={{
                          border: '1px solid rgba(116,158,180,0.12)',
                          borderRadius: 1,
                          color: 'primary.main',
                          height: { xs: 32, sm: 34 },
                          width: { xs: 32, sm: 34 },
                          '&:hover': {
                            bgcolor: 'rgba(24,189,242,0.08)',
                            borderColor: 'rgba(24,189,242,0.34)',
                            color: '#37d0ff',
                          },
                        }}
                      >
                        <ContactsOutlined sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ) : undefined,
              },
            }}
            sx={{
              ...fieldSx,
              '& .MuiFormHelperText-root': {
                ...helperSx,
                color: addressError ? 'error.main' : 'text.secondary',
              },
            }}
          />
        </Box>

        {feeContent}

        <Box
          sx={{
            alignItems: 'flex-start',
            bgcolor: 'rgba(34, 227, 138, 0.045)',
            border: '1px solid rgba(34, 227, 138, 0.1)',
            borderRadius: 1.2,
            display: 'flex',
            gap: 1.15,
            mt: -0.35,
            px: 1.5,
            py: 1.25,
          }}
        >
          <CheckCircleOutline
            sx={{ color: 'success.main', fontSize: 19, mt: 0.1 }}
          />
          <Box sx={{ display: 'grid', gap: 0.35 }}>
            <Typography
              sx={{
                color: 'text.primary',
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.25,
              }}
            >
              Always double-check the address before sending.
            </Typography>
            <Typography
              sx={{
                color: 'text.secondary',
                fontSize: 12.5,
                fontWeight: 400,
                lineHeight: 1.35,
              }}
            >
              Transactions cannot be reversed after broadcast.
            </Typography>
          </Box>
        </Box>
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
          bgcolor: 'rgba(0,8,16,0.13)',
          border: '1px solid rgba(116,158,180,0.14)',
          borderRadius: 1.15,
          display: 'grid',
          gap: { xs: 1.35, sm: 1.55 },
          gridTemplateColumns: { xs: '1fr', sm: '148px minmax(0, 1fr)' },
          minHeight: 64,
          px: 1.55,
          py: 0.85,
        }}
      >
        <Box>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: 12.5,
              fontWeight: 500,
              letterSpacing: 0,
              whiteSpace: 'nowrap',
            }}
          >
            Fee per byte
          </Typography>
          <Typography
            sx={{
              color: 'text.primary',
              fontSize: 17,
              fontWeight: 650,
              lineHeight: 1.1,
              mt: 0.45,
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
            value={fee || defaultValue}
            valueLabelDisplay="auto"
            aria-labelledby={sliderId}
            getAriaValueText={getAriaValueText}
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
                fontWeight: 500,
              },
              '& .MuiSlider-rail': {
                bgcolor: 'rgba(116,158,180,0.28)',
                height: 3,
              },
              '& .MuiSlider-thumb': {
                boxShadow: '0 0 16px rgba(24,189,242,0.3)',
                height: 18,
                width: 18,
              },
            }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          alignItems: 'center',
          color: 'text.secondary',
          display: 'inline-flex',
          gap: 0.75,
          justifySelf: 'end',
          mt: -0.75,
          opacity: 0.74,
          px: 0.4,
        }}
      >
        <InfoOutlined sx={{ color: 'primary.main', fontSize: 16 }} />
        <Tooltip title="Low fees may result in slow or unconfirmed transactions">
          <Typography sx={{ fontSize: { xs: 12.5, sm: 13 }, fontWeight: 500 }}>
            Confirmation speed depends on the selected fee
          </Typography>
        </Tooltip>
      </Box>
    </>
  );
}
