import React, { useState, useEffect } from 'react';
import {
  Dialog,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  DialogContent,
  TextField,
  Box,
  Button,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, Close, Save, Search } from '@mui/icons-material';
import { Coin, useGlobal } from 'qapp-core';
import { useTranslation } from 'react-i18next';
import { Transition } from '../../styles/page-styles';
import { AddressBookEntry } from '../../utils/Types';
import {
  getAddressBook,
  searchAddresses,
  deleteAddress,
  addAddress,
  updateAddress,
} from '../../utils/addressBookStorage';
import { publishToQDN } from '../../utils/addressBookQDN';
import { AddressBookTable } from './AddressBookTable';
import { AddressFormDialog } from './AddressFormDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import {
  EMPTY_STRING,
  ADDRESSBOOK_ROWS_PER_PAGE,
} from '../../common/constants';
import coinLogoARRR from '../../assets/arrr.png';
import coinLogoBTC from '../../assets/btc.png';
import coinLogoDGB from '../../assets/dgb.png';
import coinLogoDOGE from '../../assets/doge.png';
import coinLogoLTC from '../../assets/ltc.png';
import coinLogoQORT from '../../assets/qort.png';
import coinLogoRVN from '../../assets/rvn.png';

const coinLogos: Partial<Record<Coin, string>> = {
  [Coin.ARRR]: coinLogoARRR,
  [Coin.BTC]: coinLogoBTC,
  [Coin.DGB]: coinLogoDGB,
  [Coin.DOGE]: coinLogoDOGE,
  [Coin.LTC]: coinLogoLTC,
  [Coin.QORT]: coinLogoQORT,
  [Coin.RVN]: coinLogoRVN,
};

interface AddressBookDialogProps {
  open: boolean;
  onClose: () => void;
  coinType: Coin;
  onSelectAddress?: (address: string, name: string) => void;
  prefillData?: { name: string; address: string } | null;
}

export const AddressBookDialog: React.FC<AddressBookDialogProps> = ({
  open,
  onClose,
  coinType,
  onSelectAddress,
  prefillData,
}) => {
  const { t } = useTranslation(['core']);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const coinLogo = coinLogos[coinType] || coinLogoQORT;

  const [entries, setEntries] = useState<AddressBookEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState(EMPTY_STRING);
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<
    AddressBookEntry | undefined
  >(undefined);
  const [deletingEntry, setDeletingEntry] = useState<
    AddressBookEntry | undefined
  >(undefined);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ADDRESSBOOK_ROWS_PER_PAGE);
  const [saveError, setSaveError] = useState<string>(EMPTY_STRING);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasUnsyncedChanges, setHasUnsyncedChanges] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  // Get authenticated username for QDN sync
  const userName = useGlobal().auth.name;

  // Load entries when dialog opens or coinType changes
  useEffect(() => {
    if (open) {
      setPage(0);
      loadEntries();
      // Reset unsynced changes flag when dialog opens
      setHasUnsyncedChanges(false);
    }
  }, [open, coinType]);

  // Open form with prefilled data when prefillData is provided
  useEffect(() => {
    if (open && prefillData) {
      // Don't set editingEntry, just open the form
      // The prefill data will be passed as props to AddressFormDialog
      setEditingEntry(undefined);
      setOpenForm(true);
    }
  }, [open, prefillData]);

  // Filter entries when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = searchAddresses(coinType, searchQuery);
      setEntries(filtered);
    } else {
      loadEntries();
    }
    // Reset to first page when search query changes
    setPage(0);
  }, [searchQuery, coinType]);

  const loadEntries = () => {
    const allEntries = getAddressBook(coinType);
    setEntries(allEntries);
  };

  const handleAddNew = () => {
    setEditingEntry(undefined);
    setSaveError(EMPTY_STRING);
    setOpenForm(true);
  };

  const handleEdit = (entry: AddressBookEntry) => {
    setEditingEntry(entry);
    setSaveError(EMPTY_STRING);
    setOpenForm(true);
  };

  const handleDeleteClick = (entry: AddressBookEntry) => {
    setDeletingEntry(entry);
    setOpenDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingEntry) {
      deleteAddress(deletingEntry.id, coinType);
      loadEntries();
      setOpenDeleteConfirm(false);
      setDeletingEntry(undefined);
      setHasUnsyncedChanges(true);

      // Adjust page if we deleted the last item on the current page
      const newTotalEntries = entries.length - 1;
      const maxPage = Math.max(0, Math.ceil(newTotalEntries / rowsPerPage) - 1);
      if (page > maxPage) {
        setPage(maxPage);
      }
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteConfirm(false);
    setDeletingEntry(undefined);
  };

  const handleSave = (entry: Omit<AddressBookEntry, 'id' | 'createdAt'>) => {
    try {
      if (editingEntry) {
        // Update existing entry
        updateAddress(editingEntry.id, coinType, {
          name: entry.name,
          address: entry.address,
          note: entry.note,
        });
      } else {
        // Add new entry
        addAddress(entry);
      }
      loadEntries();
      setOpenForm(false);
      setEditingEntry(undefined);
      setSaveError(EMPTY_STRING);
      setHasUnsyncedChanges(true);
    } catch (error: any) {
      console.error('Error saving address:', error);
      // Set the error message to display in the form
      const errorMessage =
        error?.message || t('core:message.error.something_went_wrong');
      setSaveError(
        errorMessage === 'Address already exists in the address book'
          ? t('core:message.error.address_already_exists')
          : errorMessage
      );
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setEditingEntry(undefined);
    setSaveError(EMPTY_STRING);
  };

  const handleUse = (entry: AddressBookEntry) => {
    if (onSelectAddress) {
      console.log(`Address Book: Using address ${entry.name} for ${coinType}`);
      onSelectAddress(entry.address, entry.name);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSyncToQDN = async () => {
    setIsSyncing(true);

    try {
      const currentEntries = getAddressBook(coinType);
      await publishToQDN(coinType, currentEntries, userName || undefined);

      // Show success notification
      console.log(`Address Book: Successfully synced ${coinType} to QDN`);
      // Reset unsynced changes flag after successful sync
      setHasUnsyncedChanges(false);
      // Show success snackbar
      setShowSyncSuccess(true);
    } catch (error) {
      console.error('Failed to sync to QDN:', error);
      // Optional: Show error notification to user
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCloseSyncSuccess = () => {
    setShowSyncSuccess(false);
  };

  return (
    <>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={onClose}
        slots={{ transition: Transition }}
        maxWidth={false}
        disableScrollLock
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'rgba(4, 18, 31, 0.98)',
              backgroundImage:
                'radial-gradient(circle at 11% 0%, rgba(24,189,242,0.14), transparent 30%), radial-gradient(circle at 86% 100%, rgba(24,189,242,0.06), transparent 28%), linear-gradient(180deg, rgba(8, 29, 45, 0.98) 0%, rgba(4, 15, 25, 0.99) 100%)',
              border: (t) => `1px solid ${t.palette.divider}`,
              borderRadius: fullScreen ? 0 : 1.5,
              boxShadow:
                '0 32px 90px rgba(0,0,0,0.55), 0 0 42px rgba(24,189,242,0.07), inset 0 1px 0 rgba(255,255,255,0.04)',
              maxHeight: fullScreen ? '100dvh' : 'calc(100dvh - 48px)',
              overflowX: 'hidden',
              width: fullScreen ? '100%' : 'min(900px, calc(100vw - 32px))',
            },
          },
        }}
      >
        <AppBar
          sx={{
            bgcolor: 'transparent',
            backgroundColor: 'transparent',
            backgroundImage: 'none',
            borderBottom: 'none',
            boxShadow: 'none',
            color: 'text.primary',
            position: 'relative',
          }}
        >
          <Toolbar
            sx={{
              minHeight: { xs: 62, sm: 64, md: 66 },
              px: { xs: 1.6, md: 2 },
              position: 'relative',
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                gap: { xs: 1, md: 1.1 },
                justifyContent: 'center',
                minWidth: 0,
                width: '100%',
              }}
            >
              <Box
                component="img"
                src={coinLogo}
                alt=""
                sx={{
                  filter: 'drop-shadow(0 0 16px rgba(24,189,242,0.45))',
                  height: { xs: 32, md: 34 },
                  width: { xs: 32, md: 34 },
                }}
              />
              <Typography
                sx={{
                  color: 'text.primary',
                  fontSize: { xs: 19, sm: 20, md: 21 },
                  fontWeight: 800,
                  letterSpacing: 0,
                  lineHeight: 1.05,
                  minWidth: 0,
                  overflow: 'hidden',
                  textAlign: 'center',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                component="div"
              >
                {t('core:address_book_title', {
                  coinType: coinType,
                  postProcess: 'capitalizeFirstChar',
                })}
              </Typography>
            </Box>
            <IconButton
              color="inherit"
              onClick={onClose}
              aria-label={t('core:action.close', {
                postProcess: 'capitalizeFirstChar',
              })}
              sx={{
                position: 'absolute',
                right: { xs: 1.2, md: 1.6 },
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'text.secondary',
                p: { xs: 0.7, md: 1 },
                '&:hover': {
                  bgcolor: 'rgba(116,158,180,0.08)',
                  color: 'text.primary',
                },
                '& svg': {
                  fontSize: { xs: 28, md: 29 },
                },
              }}
            >
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>

        <DialogContent
          sx={{
            overflowX: 'hidden',
            p: { xs: 1.5, sm: 1.8, md: 2 },
            scrollbarGutter: 'stable',
          }}
        >
          <Box sx={{ mx: 'auto', width: '100%' }}>
            <Box
              sx={{
                alignItems: { xs: 'stretch', md: 'center' },
                display: 'grid',
                gap: { xs: 1, md: 1 },
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'minmax(0, 1fr) 150px 190px',
                },
                mb: { xs: 1.3, md: 1.4 },
              }}
            >
              <TextField
                fullWidth
                aria-label={t('core:address_book_search', {
                  postProcess: 'capitalizeFirstChar',
                })}
                placeholder={t('core:address_book_search', {
                  postProcess: 'capitalizeFirstChar',
                })}
                variant="outlined"
                value={searchQuery}
                onChange={handleSearchChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search
                          sx={{
                            color: 'text.secondary',
                            fontSize: { xs: 24, md: 32 },
                          }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(0, 8, 16, 0.2)',
                    borderRadius: 1.2,
                    minHeight: { xs: 44, md: 44 },
                    '& fieldset': {
                      borderColor: 'rgba(116,158,180,0.24)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(116,158,180,0.42)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(24,189,242,0.75)',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    color: 'text.secondary',
                    fontSize: { xs: 13, md: 13 },
                    fontWeight: 600,
                    py: { xs: 1.1, md: 1.1 },
                    '&::placeholder': {
                      color: 'text.secondary',
                      opacity: 0.88,
                    },
                  },
                  '& .MuiInputAdornment-root svg': {
                    fontSize: { xs: 20, md: 22 },
                  },
                }}
              />
              <Button
                startIcon={<Save />}
                onClick={handleSyncToQDN}
                disabled={isSyncing || !hasUnsyncedChanges}
                variant="outlined"
                size="small"
                sx={{
                  bgcolor: 'rgba(116,158,180,0.055)',
                  borderColor: 'rgba(116,158,180,0.18)',
                  color: 'text.secondary',
                  fontSize: { xs: 12.5, md: 13 },
                  fontWeight: 700,
                  minHeight: { xs: 42, md: 44 },
                  px: { xs: 1.2, md: 1.3 },
                  whiteSpace: 'nowrap',
                  '& .MuiButton-startIcon': {
                    mr: { xs: 0.65, md: 1 },
                    '& svg': {
                      fontSize: { xs: 17, md: 18 },
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(116,158,180,0.09)',
                    borderColor: 'rgba(116,158,180,0.34)',
                    color: 'text.primary',
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(116,158,180,0.035)',
                    borderColor: 'rgba(116,158,180,0.1)',
                  },
                }}
              >
                {t('core:address_book_sync_qdn', {
                  postProcess: 'capitalizeFirstChar',
                })}
                {isSyncing && '...'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddNew}
                size="small"
                sx={{
                  bgcolor: 'rgba(24,189,242,0.08)',
                  borderColor: 'rgba(24,189,242,0.82)',
                  color: 'primary.main',
                  fontSize: { xs: 12.5, md: 13 },
                  fontWeight: 700,
                  minHeight: { xs: 42, md: 44 },
                  px: { xs: 1.2, md: 1.3 },
                  whiteSpace: 'nowrap',
                  '& .MuiButton-startIcon': {
                    mr: { xs: 0.65, md: 1 },
                    '& svg': {
                      fontSize: { xs: 18, md: 19 },
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(24,189,242,0.13)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                {t('core:address_book_add_new', {
                  postProcess: 'capitalizeFirstChar',
                })}
              </Button>
            </Box>

            {entries.length === 0 ? (
              <Box
                sx={{
                  alignItems: 'center',
                  bgcolor: 'rgba(255,255,255,0.018)',
                  border: (t) => `1px solid ${t.palette.divider}`,
                  borderRadius: 1.2,
                  display: 'flex',
                  justifyContent: 'center',
                  minHeight: { xs: 156, md: 170 },
                }}
              >
                <Typography
                  sx={{
                    color: 'text.secondary',
                    fontSize: { xs: 14, md: 15 },
                    fontWeight: 500,
                  }}
                >
                  {t('core:address_book_empty', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </Typography>
              </Box>
            ) : (
              <AddressBookTable
                entries={entries}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onUse={onSelectAddress ? handleUse : undefined}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Form Dialog */}
      <AddressFormDialog
        open={openForm}
        onClose={handleFormClose}
        coinType={coinType}
        entry={editingEntry}
        onSave={handleSave}
        prefillName={prefillData?.name}
        prefillAddress={prefillData?.address}
        saveError={saveError}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={openDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        entryName={deletingEntry?.name || EMPTY_STRING}
      />

      {/* QDN Sync Success Notification */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={showSyncSuccess}
        autoHideDuration={4000}
        onClose={handleCloseSyncSuccess}
      >
        <Alert
          onClose={handleCloseSyncSuccess}
          severity="success"
          sx={{ width: '100%' }}
        >
          {t('core:message.success.qdn_sync', {
            coinType: coinType,
            defaultValue: `Successfully synced ${coinType} address book to QDN`,
            postProcess: 'capitalizeFirstChar',
          })}
        </Alert>
      </Snackbar>
    </>
  );
};
