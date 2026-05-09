import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import {
  AccountBalanceWalletOutlined,
  CenterFocusWeak,
  CheckCircleOutline,
  Close,
  DescriptionOutlined,
  PersonOutline,
} from '@mui/icons-material';
import { Coin } from 'qapp-core';
import { useTranslation } from 'react-i18next';
import { DialogGeneral } from '../../styles/page-styles';
import { AddressBookEntry } from '../../utils/Types';
import { validateAddress } from '../../utils/addressValidation';
import {
  ADDRESSBOOK_NAME_LENGTH,
  ADDRESSBOOK_NOTE_LENGTH,
  EMPTY_STRING,
} from '../../common/constants';
import {
  searchQortalNames,
  type QortalNameSearchResult,
} from '../../utils/qortalNodeApi';
import coinLogoARRR from '../../assets/arrr.png';
import coinLogoBTC from '../../assets/btc.png';
import coinLogoDGB from '../../assets/dgb.png';
import coinLogoDOGE from '../../assets/doge.png';
import coinLogoLTC from '../../assets/ltc.png';
import coinLogoQORT from '../../assets/qort.png';
import coinLogoRVN from '../../assets/rvn.png';

const ADDRESS_LOOKUP_DEBOUNCE_MS = 350;
const ADDRESS_MIN_LENGTH = 3;

const coinLogos: Partial<Record<Coin, string>> = {
  [Coin.ARRR]: coinLogoARRR,
  [Coin.BTC]: coinLogoBTC,
  [Coin.DGB]: coinLogoDGB,
  [Coin.DOGE]: coinLogoDOGE,
  [Coin.LTC]: coinLogoLTC,
  [Coin.QORT]: coinLogoQORT,
  [Coin.RVN]: coinLogoRVN,
};

const fieldLabelSx = {
  color: 'text.secondary',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 0,
  lineHeight: 1,
  mb: 0.9,
  textTransform: 'uppercase',
} as const;

const formFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'rgba(0, 8, 16, 0.2)',
    borderRadius: 1.1,
    minHeight: 48,
    px: 1.2,
    '& fieldset': {
      borderColor: 'rgba(116,158,180,0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(116,158,180,0.48)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(24,189,242,0.72)',
      borderWidth: 1,
    },
  },
  '& .MuiOutlinedInput-input': {
    color: 'text.primary',
    fontSize: 15,
    fontWeight: 600,
    py: 0,
    '&::placeholder': {
      color: 'text.secondary',
      opacity: 0.72,
    },
  },
  '& .MuiFormHelperText-root': {
    color: 'text.secondary',
    fontSize: 12.5,
    fontWeight: 600,
    lineHeight: 1.25,
    ml: 1.2,
    mt: 0.85,
  },
} as const;

interface AddressFormDialogProps {
  open: boolean;
  onClose: () => void;
  coinType: Coin;
  entry?: AddressBookEntry;
  onSave: (entry: Omit<AddressBookEntry, 'id' | 'createdAt'>) => void;
  prefillName?: string;
  prefillAddress?: string;
  saveError?: string;
}

export const AddressFormDialog: React.FC<AddressFormDialogProps> = ({
  open,
  onClose,
  coinType,
  entry,
  onSave,
  prefillName,
  prefillAddress,
  saveError,
}) => {
  const { t } = useTranslation(['core']);
  const coinLogo = coinLogos[coinType] || coinLogoQORT;

  const [name, setName] = useState(EMPTY_STRING);
  const [address, setAddress] = useState(EMPTY_STRING);
  const [note, setNote] = useState(EMPTY_STRING);

  const [nameError, setNameError] = useState(EMPTY_STRING);
  const [addressError, setAddressError] = useState(EMPTY_STRING);
  const [noteError, setNoteError] = useState(EMPTY_STRING);

  // QORT-specific state for username resolution
  const [addressValidating, setAddressValidating] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [nameSearchOpen, setNameSearchOpen] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState<
    QortalNameSearchResult[]
  >([]);

  const isEditMode = !!entry;

  // Load entry data when editing
  useEffect(() => {
    if (open) {
      if (entry) {
        setName(entry.name);
        setAddress(entry.address);
        setNote(entry.note);
      } else {
        // Reset form for new entry or use prefill data
        setName(prefillName || EMPTY_STRING);
        setAddress(prefillAddress || EMPTY_STRING);
        setNote(EMPTY_STRING);
      }
      // Clear errors when dialog opens
      setNameError(EMPTY_STRING);
      setAddressError(EMPTY_STRING);
      setNoteError(EMPTY_STRING);
      setAddressValidating(false);
      setAddressConfirmed(!!entry);
      setNameSearchOpen(false);
      setNameSuggestions([]);
    }
  }, [open, entry, prefillName, prefillAddress]);

  // QORT name search - lets users choose a registered name and then confirm its owner address.
  useEffect(() => {
    const query = name.trim();

    if (coinType !== Coin.QORT || !query || query.length < ADDRESS_MIN_LENGTH) {
      setNameSuggestions([]);
      setNameSearchOpen(false);
      setAddressValidating(false);
      return;
    }

    setAddressValidating(true);
    let cancelled = false;
    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        const results = await searchQortalNames(query, 10, controller.signal);

        if (cancelled) return;
        setNameSuggestions(results);
        setNameSearchOpen(results.length > 0);
      } catch (err: any) {
        if (!cancelled && err.name !== 'AbortError') {
          console.error('Name lookup failed:', err.message);
          setNameSuggestions([]);
          setNameSearchOpen(false);
        }
      } finally {
        if (!cancelled) {
          setAddressValidating(false);
        }
      }
    }, ADDRESS_LOOKUP_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [name, coinType, t]);

  const validateName = (value: string): boolean => {
    if (!value.trim()) {
      setNameError(
        t('core:address_book_name_required', {
          postProcess: 'capitalizeFirstChar',
        })
      );
      return false;
    }
    if (value.length > ADDRESSBOOK_NAME_LENGTH) {
      setNameError(
        t('core:address_book_name_max_length', {
          postProcess: 'capitalizeFirstChar',
        })
      );
      return false;
    }
    setNameError(EMPTY_STRING);
    return true;
  };

  const validateAddressField = (value: string): boolean => {
    if (!value.trim()) {
      setAddressError(
        t('core:address_book_address_required', {
          postProcess: 'capitalizeFirstChar',
        })
      );
      return false;
    }
    if (!validateAddress(coinType, value)) {
      setAddressError(
        t('core:address_book_address_invalid', {
          coinType: coinType,
          postProcess: 'capitalizeFirstChar',
        })
      );
      return false;
    }
    setAddressError(EMPTY_STRING);
    return true;
  };

  const validateNote = (value: string): boolean => {
    if (value.length > ADDRESSBOOK_NOTE_LENGTH) {
      setNoteError(
        t('core:address_book_note_max_length', {
          max_note: ADDRESSBOOK_NOTE_LENGTH,
          postProcess: 'capitalizeFirstChar',
        })
      );
      return false;
    }
    setNoteError(EMPTY_STRING);
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    validateName(value);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setAddress(value);
    setAddressConfirmed(false);
    validateAddressField(value);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNote(value);
    validateNote(value);
  };

  const handleSave = () => {
    // Validate all fields
    const isNameValid = validateName(name);
    const isAddressValid = validateAddressField(address);
    const isNoteValid = validateNote(note);

    if (isNameValid && isAddressValid && isNoteValid) {
      onSave({
        name: name.trim(),
        address: address.trim(),
        note: note.trim(),
        coinType,
      });
    }
  };

  const handleSelectNameSuggestion = (suggestion: QortalNameSearchResult) => {
    setName(suggestion.name);
    setAddress(suggestion.owner ?? EMPTY_STRING);
    setAddressConfirmed(false);
    setNameSearchOpen(false);
    setNameSuggestions([]);
    validateName(suggestion.name);
    validateAddressField(suggestion.owner ?? EMPTY_STRING);
  };

  const handleConfirmAddress = () => {
    if (validateAddressField(address)) {
      setAddressConfirmed(true);
    }
  };

  const isFormValid =
    name.trim() !== EMPTY_STRING &&
    address.trim() !== EMPTY_STRING &&
    !nameError &&
    !addressError &&
    !noteError &&
    (coinType === Coin.QORT ? !addressValidating && addressConfirmed : true);

  return (
    <DialogGeneral
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      disableScrollLock
      slotProps={{
        paper: {
          sx: {
            bgcolor: 'rgba(4, 18, 31, 0.98)',
            backgroundImage:
              'radial-gradient(circle at 16% 0%, rgba(24,189,242,0.1), transparent 34%), linear-gradient(180deg, rgba(7, 27, 42, 0.98) 0%, rgba(4, 13, 23, 0.99) 100%)',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow:
              '0 28px 72px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.04)',
            overflow: 'hidden',
            width: 'min(675px, calc(100vw - 32px))',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          alignItems: 'center',
          bgcolor: 'rgba(10, 28, 42, 0.74)',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'center',
          minHeight: 74,
          px: 6,
          py: 0,
          position: 'relative',
        }}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.35 }}>
          <Box
            component="img"
            src={coinLogo}
            alt=""
            sx={{
              filter: 'drop-shadow(0 0 15px rgba(24,189,242,0.38))',
              height: 30,
              width: 30,
            }}
          />
          <Typography
            sx={{
              color: 'text.primary',
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: 0,
              lineHeight: 1,
            }}
          >
            {isEditMode
              ? t('core:address_book_edit', {
                  postProcess: 'capitalizeFirstChar',
                })
              : t('core:address_book_add_new', {
                  postProcess: 'capitalizeFirstChar',
                })}
          </Typography>
        </Box>
        <IconButton
          aria-label={t('core:action.close', {
            postProcess: 'capitalizeFirstChar',
          })}
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            '&:hover': {
              bgcolor: 'rgba(116,158,180,0.08)',
              color: 'text.primary',
            },
            '& svg': {
              fontSize: 25,
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          overflow: 'visible',
          px: '28px !important',
          pb: '20px !important',
          pt: '26px !important',
        }}
      >
        <Box sx={{ display: 'grid', gap: 2.15 }}>
          <Box sx={{ position: 'relative' }}>
            <Typography sx={fieldLabelSx}>
              {t('core:address_book_name', {
                postProcess: 'capitalizeFirstChar',
              })}{' '}
              *
            </Typography>
            <TextField
              required
              fullWidth
              aria-label={t('core:address_book_name', {
                postProcess: 'capitalizeFirstChar',
              })}
              placeholder="Enter name"
              value={name}
              onChange={handleNameChange}
              error={!!nameError}
              helperText={nameError || EMPTY_STRING}
              slotProps={{
                htmlInput: {
                  maxLength: ADDRESSBOOK_NAME_LENGTH,
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline
                        sx={{ color: 'text.secondary', fontSize: 22 }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box
                        sx={{ alignItems: 'center', display: 'flex', gap: 1 }}
                      >
                        {coinType === Coin.QORT && addressValidating && (
                          <CircularProgress size={16} />
                        )}
                        <Typography
                          sx={{
                            color: 'text.secondary',
                            fontSize: 14,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {name.length}/{ADDRESSBOOK_NAME_LENGTH}
                        </Typography>
                      </Box>
                    </InputAdornment>
                  ),
                },
              }}
              sx={formFieldSx}
            />
            {coinType === Coin.QORT && nameSearchOpen && (
              <Box
                sx={{
                  bgcolor: 'rgba(5, 16, 27, 0.98)',
                  border: '1px solid rgba(116,158,180,0.2)',
                  borderRadius: 1,
                  boxShadow: '0 18px 40px rgba(0,0,0,0.32)',
                  left: 0,
                  maxHeight: 216,
                  overflowY: 'auto',
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 6px)',
                  zIndex: 1500,
                }}
              >
                {nameSuggestions.map((suggestion) => (
                  <Box
                    component="button"
                    type="button"
                    key={`${suggestion.name}-${suggestion.owner}`}
                    onClick={() => handleSelectNameSuggestion(suggestion)}
                    sx={{
                      alignItems: 'center',
                      appearance: 'none',
                      bgcolor: 'transparent',
                      border: 0,
                      color: 'text.primary',
                      cursor: 'pointer',
                      display: 'grid',
                      font: 'inherit',
                      gap: 0.35,
                      justifyItems: 'start',
                      px: 2,
                      py: 1.1,
                      textAlign: 'left',
                      width: '100%',
                      '&:hover': {
                        bgcolor: 'rgba(24,189,242,0.08)',
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                      {suggestion.name}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'text.secondary',
                        fontSize: 12,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%',
                      }}
                    >
                      {suggestion.owner}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {coinType === Coin.QORT && (
            <Box sx={{ alignItems: 'center', display: 'flex', gap: 2 }}>
              <Box
                sx={{
                  bgcolor: 'rgba(116,158,180,0.18)',
                  flex: 1,
                  height: '1px',
                }}
              />
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 0,
                }}
              >
                OR
              </Typography>
              <Box
                sx={{
                  bgcolor: 'rgba(116,158,180,0.18)',
                  flex: 1,
                  height: '1px',
                }}
              />
            </Box>
          )}

          <Box>
            <Typography sx={fieldLabelSx}>
              {t('core:address_book_address', {
                postProcess: 'capitalizeFirstChar',
              })}{' '}
              *
            </Typography>
            <TextField
              required
              fullWidth
              aria-label={t('core:address_book_address', {
                postProcess: 'capitalizeFirstChar',
              })}
              placeholder={`Enter ${coinType} address`}
              value={address}
              onChange={handleAddressChange}
              error={!!addressError}
              helperText={
                addressError ||
                (coinType === Coin.QORT
                  ? addressConfirmed
                    ? 'Address confirmed'
                    : 'Confirm this address before saving.'
                  : EMPTY_STRING)
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBalanceWalletOutlined
                        sx={{ color: 'text.secondary', fontSize: 21 }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment:
                    coinType === Coin.QORT ? (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="Confirm address"
                          disabled={!address.trim() || !!addressError}
                          onClick={handleConfirmAddress}
                          edge="end"
                          sx={{
                            color: addressConfirmed
                              ? 'success.main'
                              : 'primary.main',
                            '&:disabled': {
                              color: 'text.disabled',
                            },
                          }}
                        >
                          {addressConfirmed ? (
                            <CheckCircleOutline sx={{ fontSize: 22 }} />
                          ) : (
                            <CenterFocusWeak sx={{ fontSize: 22 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ) : undefined,
                },
              }}
              sx={{
                ...formFieldSx,
                '& .MuiFormHelperText-root': {
                  ...formFieldSx['& .MuiFormHelperText-root'],
                  color: addressConfirmed ? 'success.main' : 'text.secondary',
                },
              }}
            />
          </Box>

          <Box>
            <Typography sx={fieldLabelSx}>
              {t('core:address_book_note', {
                postProcess: 'capitalizeFirstChar',
              })}{' '}
              (optional)
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                aria-label={t('core:address_book_note', {
                  postProcess: 'capitalizeFirstChar',
                })}
                placeholder="Add a note (optional)"
                value={note}
                onChange={handleNoteChange}
                error={!!noteError}
                helperText={noteError || EMPTY_STRING}
                multiline
                rows={3}
                slotProps={{
                  htmlInput: {
                    maxLength: ADDRESSBOOK_NOTE_LENGTH,
                  },
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: 'flex-start', mt: 0.9 }}
                      >
                        <DescriptionOutlined
                          sx={{ color: 'text.secondary', fontSize: 21 }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  ...formFieldSx,
                  '& .MuiOutlinedInput-root': {
                    ...formFieldSx['& .MuiOutlinedInput-root'],
                    alignItems: 'flex-start',
                    minHeight: 94,
                    pb: 2.2,
                    pt: 1.05,
                  },
                  '& .MuiOutlinedInput-input': {
                    ...formFieldSx['& .MuiOutlinedInput-input'],
                    lineHeight: 1.45,
                    pr: 7,
                  },
                }}
              />
              <Typography
                sx={{
                  bottom: noteError ? 30 : 10,
                  color: 'text.secondary',
                  fontSize: 14,
                  fontWeight: 700,
                  position: 'absolute',
                  right: 16,
                }}
              >
                {note.length}/{ADDRESSBOOK_NOTE_LENGTH}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          justifyContent: 'space-between',
          pb: '14px !important',
          pt: '14px !important',
          px: '28px !important',
        }}
      >
        <Box
          sx={{
            color: 'error.main',
            fontSize: 13,
            fontWeight: 600,
            maxWidth: '48%',
          }}
        >
          {saveError}
        </Box>
        <Box sx={{ display: 'flex', gap: 1.2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: 'rgba(116,158,180,0.22)',
              borderRadius: 1.2,
              color: 'primary.main',
              fontSize: 15,
              fontWeight: 800,
              minHeight: 38,
              minWidth: 86,
              px: 2,
              '&:hover': {
                bgcolor: 'rgba(116,158,180,0.08)',
                borderColor: 'rgba(116,158,180,0.38)',
              },
            }}
          >
            {t('core:address_book_cancel', {
              postProcess: 'capitalizeFirstChar',
            })}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!isFormValid}
            sx={{
              bgcolor: 'primary.main',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 1.2,
              boxShadow: '0 12px 28px rgba(24,189,242,0.24)',
              color: 'white',
              fontSize: 15,
              fontWeight: 800,
              minHeight: 38,
              minWidth: 86,
              px: 2,
              '&:hover': {
                bgcolor: '#16baf2',
                boxShadow: '0 14px 32px rgba(24,189,242,0.32)',
              },
              '&:disabled': {
                bgcolor: 'rgba(116,158,180,0.16)',
                borderColor: 'rgba(116,158,180,0.08)',
                boxShadow: 'none',
                color: 'rgba(255,255,255,0.34)',
              },
            }}
          >
            {t('core:address_book_save', {
              postProcess: 'capitalizeFirstChar',
            })}
          </Button>
        </Box>
      </DialogActions>
    </DialogGeneral>
  );
};
