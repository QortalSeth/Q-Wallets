import {
  ChangeEvent,
  forwardRef,
  Key,
  MouseEvent,
  ReactElement,
  Ref,
  SyntheticEvent,
  useContext,
  useEffect,
  useState,
} from 'react';
import WalletContext from '../../contexts/walletContext';
import { epochToAgo, timeoutDelay, cropString } from '../../common/functions';
import { styled } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography,
} from '@mui/material';
import { NumericFormat } from 'react-number-format';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import Slide, { SlideProps } from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import QRCode from 'react-qr-code';
import {
  Close,
  CopyAllTwoTone,
  FirstPage,
  ImportContacts,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPage,
  QrCode2,
  Refresh,
  Send,
} from '@mui/icons-material';
import coinLogoLTC from '../../assets/ltc.png';
import { FeeManager } from '../../components/FeeManager';
import { useTranslation } from 'react-i18next';

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const { t } = useTranslation(['core']);
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label={t('core:page.first', {
          postProcess: 'capitalizeAll',
        })}
      >
        {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label={t('core:page.previous', {
          postProcess: 'capitalizeAll',
        })}
      >
        {theme.direction === 'rtl' ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label={t('core:page.next', {
          postProcess: 'capitalizeAll',
        })}
      >
        {theme.direction === 'rtl' ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label={t('core:page.last', {
          postProcess: 'capitalizeAll',
        })}
      >
        {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
      </IconButton>
    </Box>
  );
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<unknown>;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

const DialogGeneral = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiDialog-paper': {
    borderRadius: '15px',
  },
}));

const LtcQrDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiDialog-paper': {
    borderRadius: '15px',
  },
}));

const LtcSubmittDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiDialog-paper': {
    borderRadius: '15px',
  },
}));

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500,
  },
});

const WalleteCard = styled(Card)({
  maxWidth: '100%',
  margin: '20px, auto',
  padding: '24px',
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
});

const CoinAvatar = styled(Avatar)({
  width: 120,
  height: 120,
  margin: '0 auto 16px',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
});

const WalletButtons = styled(Button)({
  width: 'auto',
  backgroundColor: '#05a2e4',
  color: 'white',
  padding: 'auto',
  '&:hover': {
    backgroundColor: '#02648d',
  },
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#02648d',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function LitecoinWallet() {
  const { t } = useTranslation(['core']);

  const { isAuthenticated } = useContext(WalletContext);

  const [walletInfoLtc, setWalletInfoLtc] = useState<any>({});
  const [isLoadingWalletInfoLtc, setIsLoadingWalletInfoLtc] =
    useState<boolean>(false);
  const [walletBalanceLtc, setWalletBalanceLtc] = useState<any>(null);
  const [isLoadingWalletBalanceLtc, setIsLoadingWalletBalanceLtc] =
    useState<boolean>(true);
  const [transactionsLtc, setTransactionsLtc] = useState<any>([]);
  const [isLoadingLtcTransactions, setIsLoadingLtcTransactions] =
    useState<boolean>(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [copyLtcAddress, setCopyLtcAddress] = useState('');
  const [copyLtcTxHash, setCopyLtcTxHash] = useState('');
  const [openLtcQR, setOpenLtcQR] = useState(false);
  const [openLtcSend, setOpenLtcSend] = useState(false);
  const [ltcAmount, setLtcAmount] = useState<number>(0);
  const [ltcRecipient, setLtcRecipient] = useState('');
  const [addressFormatError, setAddressFormatError] = useState(false);

  const [loadingRefreshLtc, setLoadingRefreshLtc] = useState(false);
  const [openTxLtcSubmit, setOpenTxLtcSubmit] = useState(false);
  const [openSendLtcSuccess, setOpenSendLtcSuccess] = useState(false);
  const [openSendLtcError, setOpenSendLtcError] = useState(false);
  const [openLtcAddressBook, setOpenLtcAddressBook] = useState(false);
  const [inputFee, setInputFee] = useState(0);
  const [walletInfoError, setWalletInfoError] = useState<string | null>(null);
  const [walletBalanceError, setWalletBalanceError] = useState<string | null>(
    null
  );
  const isTransferDisabled =
    isLoadingWalletBalanceLtc ||
    !!walletBalanceError ||
    walletBalanceLtc == null ||
    Number(walletBalanceLtc) <= 0;

  const ltcFeeCalculated = +(+inputFee / 1000 / 1e8).toFixed(8);
  const estimatedFeeCalculated = +ltcFeeCalculated * 1000;

  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - transactionsLtc.length)
      : 0;

  const handleOpenLtcQR = () => {
    setOpenLtcQR(true);
  };

  const handleCloseLtcQR = () => {
    setOpenLtcQR(false);
  };

  const handleOpenAddressBook = async () => {
    setOpenLtcAddressBook(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setOpenLtcAddressBook(false);
  };

  const handleOpenLtcSend = () => {
    setLtcAmount(0);
    setLtcRecipient('');

    setOpenLtcSend(true);
  };

  const validateCanSendLtc = () => {
    if (ltcAmount <= 0 || null || !ltcAmount) {
      return true;
    }
    if (addressFormatError || '') {
      return true;
    }
    return false;
  };

  const handleRecipientChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    const pattern =
      /^(L[1-9A-HJ-NP-Za-km-z]{33}|M[1-9A-HJ-NP-Za-km-z]{33}|ltc1[2-9A-HJ-NP-Za-z]{39})$/;

    setLtcRecipient(value);

    if (pattern.test(value) || value === '') {
      setAddressFormatError(false);
    } else {
      setAddressFormatError(true);
    }
  };

  const handleCloseLtcSend = () => {
    setLtcAmount(0);

    setOpenLtcSend(false);
  };

  const changeCopyLtcStatus = async () => {
    setCopyLtcAddress('Copied');
    await timeoutDelay(2000);
    setCopyLtcAddress('');
  };

  const changeCopyLtcTxHash = async () => {
    setCopyLtcTxHash('Copied');
    await timeoutDelay(2000);
    setCopyLtcTxHash('');
  };

  const handleChangePage = (
    _event: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSendLtcSuccess = (
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendLtcSuccess(false);
  };

  const handleCloseSendLtcError = (
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendLtcError(false);
  };

  const getWalletInfoLtc = async () => {
    setIsLoadingWalletInfoLtc(true);
    try {
      setWalletInfoError(null);
      const response = await qortalRequest({
        action: 'GET_USER_WALLET',
        coin: 'LTC',
      });
      if (response?.error) {
        setWalletInfoLtc({});
        setWalletInfoError(
          typeof response.error === 'string'
            ? response.error
            : 'Failed to load address' // TODO translate
        );
      } else {
        setWalletInfoLtc(response);
        setWalletInfoError(null);
      }
    } catch (error: any) {
      setWalletInfoLtc({});
      setWalletInfoError(
        error?.message ? String(error.message) : String(error)
      );
      console.error('ERROR GET LTC WALLET INFO', error);
    } finally {
      setIsLoadingWalletInfoLtc(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    getWalletInfoLtc();
  }, [isAuthenticated]);

  function computeBalanceFromTransactions(txs: any[]): number {
    if (!Array.isArray(txs)) return 0;
    let satoshis = 0;
    for (const tx of txs) {
      // Only count confirmed txs (those with a timestamp)
      if (!tx?.timestamp) continue;
      const inSat = (tx?.inputs || [])
        .filter((i: any) => i?.addressInWallet)
        .reduce((acc: number, cur: any) => acc + Number(cur?.amount || 0), 0);
      const outSat = (tx?.outputs || [])
        .filter((o: any) => o?.addressInWallet)
        .reduce((acc: number, cur: any) => acc + Number(cur?.amount || 0), 0);
      satoshis += outSat - inSat; // net effect on wallet
    }
    return +(satoshis / 1e8).toFixed(8);
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    const intervalgetTransactionsLtc = setInterval(() => {
      getTransactionsLtc();
    }, 180000);
    getTransactionsLtc();
    return () => {
      clearInterval(intervalgetTransactionsLtc);
    };
  }, [isAuthenticated]);

  const getTransactionsLtc = async () => {
    try {
      setIsLoadingLtcTransactions(true);
      setIsLoadingWalletBalanceLtc(true);
      setWalletBalanceError(null);

      const responseLtcTransactions = await qortalRequestWithTimeout(
        {
          action: 'GET_USER_WALLET_TRANSACTIONS',
          coin: 'LTC',
        },
        300000
      );

      if (responseLtcTransactions?.error) {
        setTransactionsLtc([]);
        setWalletBalanceLtc(null);
        setWalletBalanceError(
          typeof responseLtcTransactions.error === 'string'
            ? responseLtcTransactions.error
            : 'Failed to load balance'
        );
      } else {
        setTransactionsLtc(responseLtcTransactions);
        const computed = computeBalanceFromTransactions(
          responseLtcTransactions || []
        );
        setWalletBalanceLtc(computed);
        setWalletBalanceError(null);
      }
    } catch (error: any) {
      setTransactionsLtc([]);
      setWalletBalanceLtc(null);
      setWalletBalanceError(
        error?.message ? String(error.message) : String(error)
      );
      console.error('ERROR GET LTC TRANSACTIONS', error);
    } finally {
      setIsLoadingLtcTransactions(false);
      setIsLoadingWalletBalanceLtc(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    let intervalId: any;
    (async () => {
      await getWalletInfoLtc();
      await getTransactionsLtc();
      intervalId = setInterval(() => {
        getTransactionsLtc();
      }, 180000);
    })();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  const handleLoadingRefreshLtc = async () => {
    setLoadingRefreshLtc(true);
    await getTransactionsLtc();
    setLoadingRefreshLtc(false);
  };

  const handleSendMaxLtc = () => {
    const maxLtcAmount = +walletBalanceLtc - estimatedFeeCalculated;
    if (maxLtcAmount <= 0) {
      setLtcAmount(0);
    } else {
      setLtcAmount(maxLtcAmount);
    }
  };

  const LtcQrDialogPage = () => {
    return (
      <LtcQrDialog
        onClose={handleCloseLtcQR}
        aria-labelledby="ltc-qr-code"
        open={openLtcQR}
        keepMounted={false}
      >
        <DialogTitle sx={{ m: 0, p: 2, fontSize: '12px' }} id="ltc-qr-code">
          {t('core:address', {
            postProcess: 'capitalizeFirstChar',
          })}{' '}
          {walletInfoError ? walletInfoError : walletInfoLtc?.address}
        </DialogTitle>
        <DialogContent dividers>
          <div
            style={{
              height: 'auto',
              margin: '0 auto',
              maxWidth: 256,
              width: '100%',
            }}
          >
            <QRCode
              size={256}
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              value={walletInfoLtc?.address || ''}
              viewBox={`0 0 256 256`}
              fgColor={'#393939'}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseLtcQR}>
            {t('core:action.close', {
              postProcess: 'capitalizeFirstChar',
            })}
          </Button>
        </DialogActions>
      </LtcQrDialog>
    );
  };

  const sendLtcRequest = async () => {
    if (!ltcFeeCalculated) return;
    setOpenTxLtcSubmit(true);

    try {
      const sendRequest = await qortalRequest({
        action: 'SEND_COIN',
        coin: 'LTC',
        recipient: ltcRecipient,
        amount: ltcAmount,
        fee: ltcFeeCalculated,
      });
      if (!sendRequest?.error) {
        setLtcAmount(0);
        setLtcRecipient('');

        setOpenTxLtcSubmit(false);
        setOpenSendLtcSuccess(true);
        setIsLoadingWalletBalanceLtc(true);
        await timeoutDelay(3000);
        await getTransactionsLtc();
      }
    } catch (error) {
      setLtcAmount(0);
      setLtcRecipient('');

      setOpenTxLtcSubmit(false);
      setOpenSendLtcError(true);
      setIsLoadingWalletBalanceLtc(true);
      await timeoutDelay(3000);
      await getTransactionsLtc();
      console.error('ERROR SENDING LTC', error);
    }
  };

  const LtcSendDialogPage = () => {
    return (
      <Dialog
        fullScreen
        open={openLtcSend}
        onClose={handleCloseLtcSend}
        slots={{ transition: Transition }}
      >
        <LtcSubmittDialog fullWidth={true} maxWidth="xs" open={openTxLtcSubmit}>
          <DialogContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <CircularProgress color="success" size={64} />
              </div>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '20px',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: 'primary.main',
                    fontStyle: 'italic',
                    fontWeight: 700,
                  }}
                >
                  {t('core:message.generic.processing_transaction', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </Typography>
              </div>
            </Box>
          </DialogContent>
        </LtcSubmittDialog>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={openSendLtcSuccess}
          autoHideDuration={4000}
          slots={{ transition: SlideTransition }}
          onClose={handleCloseSendLtcSuccess}
        >
          <Alert
            onClose={handleCloseSendLtcSuccess}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {t('core:message.generic.sent_transaction', {
              coin: 'LTC',
              postProcess: 'capitalizeAll',
            })}
          </Alert>
        </Snackbar>
        <Snackbar
          open={openSendLtcError}
          autoHideDuration={4000}
          onClose={handleCloseSendLtcError}
        >
          <Alert
            onClose={handleCloseSendLtcError}
            severity="error"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {t('core:message.error.something_went_wrong', {
              postProcess: 'capitalizeAll',
            })}
          </Alert>
        </Snackbar>
        <AppBar sx={{ position: 'static' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseLtcSend}
              aria-label="close"
            >
              <Close />
            </IconButton>
            <Avatar
              sx={{ width: 28, height: 28 }}
              alt="LTC Logo"
              src={coinLogoLTC}
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
                display: {
                  xs: 'none',
                  sm: 'block',
                  paddingLeft: '10px',
                  paddingTop: '3px',
                },
              }}
            >
              {t('core:action.transfer_coin', {
                coin: 'LTC',
                postProcess: 'capitalizeFirstChar',
              })}
            </Typography>
            <Button
              disabled={validateCanSendLtc()}
              variant="contained"
              startIcon={<Send />}
              aria-label="send-ltc"
              onClick={sendLtcRequest}
              sx={{
                backgroundColor: '#05a2e4',
                color: 'white',
                '&:hover': { backgroundColor: '#02648d' },
              }}
            >
              {t('core:action.send', {
                postProcess: 'capitalizeAll',
              })}
            </Button>
          </Toolbar>
        </AppBar>
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '20px',
          }}
        >
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            {t('core:balance_available', {
              postProcess: 'capitalizeFirstChar',
            })}
            &nbsp;&nbsp;
          </Typography>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {isLoadingWalletBalanceLtc ? (
              <Box sx={{ width: '175px' }}>
                <LinearProgress />
              </Box>
            ) : walletBalanceError ? (
              walletBalanceError
            ) : (
              walletBalanceLtc + ' LTC'
            )}
          </Typography>
        </div>
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '20px',
          }}
        >
          <Typography
            variant="h5"
            align="center"
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            {t('core:max_sendable', {
              postProcess: 'capitalizeAll',
            })}
            &nbsp;&nbsp;
          </Typography>
          <Typography
            variant="h5"
            align="center"
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {(() => {
              const newMaxLtcAmount =
                +walletBalanceLtc - estimatedFeeCalculated;
              if (newMaxLtcAmount < 0) {
                return Number(0.0) + ' LTC';
              } else {
                return newMaxLtcAmount + ' LTC';
              }
            })()}
          </Typography>
          <div style={{ marginInlineStart: '15px' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSendMaxLtc}
              style={{ borderRadius: 50 }}
            >
              {t('core:action.send_max', {
                postProcess: 'capitalizeAll',
              })}
            </Button>
          </div>
        </div>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '20px',
            flexDirection: 'column',
            '& .MuiTextField-root': { width: '50ch' },
          }}
        >
          <NumericFormat
            decimalScale={8}
            defaultValue={0}
            value={ltcAmount}
            allowNegative={false}
            customInput={TextField}
            valueIsNumericString
            variant="outlined"
            label="Amount (LTC)"
            isAllowed={(values) => {
              const maxLtcCoin = +walletBalanceLtc - estimatedFeeCalculated;
              const { formattedValue, floatValue } = values;
              return formattedValue === '' || (floatValue ?? 0) <= maxLtcCoin;
            }}
            onValueChange={(values) => {
              setLtcAmount(values.floatValue ?? 0);
            }}
            required
          />
          <TextField
            required
            label="{t('core:receiver_address', {
              postProcess: 'capitalizeFirstChar',
            })}"
            id="ltc-address"
            margin="normal"
            value={ltcRecipient}
            onChange={handleRecipientChange}
            error={addressFormatError}
            helperText={
              addressFormatError
                ? t('core:message.error.litecoin_address_invalid', {
                    postProcess: 'capitalizeFirstChar',
                  })
                : t('core:message.generic.litecoin_address', {
                    postProcess: 'capitalizeFirstChar',
                  })
            }
          />
        </Box>
        <FeeManager coin="LTC" onChange={setInputFee} />
      </Dialog>
    );
  };

  const tableLoader = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </div>
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px',
          }}
        >
          <Typography
            variant="h5"
            sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 700 }}
          >
            {t('core:message.generic.loading_transactions', {
              postProcess: 'capitalizeFirstChar',
            })}
          </Typography>
        </div>
      </Box>
    );
  };

  const transactionsTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table
          stickyHeader
          sx={{ width: '100%' }}
          aria-label="transactions table"
        >
          <TableHead>
            <TableRow>
              <StyledTableCell align="left">
                {t('core:sender', {
                  postProcess: 'capitalizeFirstChar',
                })}
              </StyledTableCell>
              <StyledTableCell align="left">
                {t('core:receiver', {
                  postProcess: 'capitalizeFirstChar',
                })}
              </StyledTableCell>
              <StyledTableCell align="left">
                {t('core:transaction_hash', {
                  postProcess: 'capitalizeFirstChar',
                })}
              </StyledTableCell>
              <StyledTableCell align="left">
                {t('core:total_amount', {
                  postProcess: 'capitalizeFirstChar',
                })}
              </StyledTableCell>
              <StyledTableCell align="left">
                {t('core:fee.fee', {
                  postProcess: 'capitalizeFirstChar',
                })}
              </StyledTableCell>
              <StyledTableCell align="left">
                {t('core:time', {
                  postProcess: 'capitalizeFirstChar',
                })}
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? transactionsLtc.slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
              : transactionsLtc
            )?.map(
              (
                row: {
                  inputs: {
                    address: any;
                    addressInWallet: boolean;
                    amount: number;
                  }[];
                  outputs: {
                    address: any;
                    addressInWallet: boolean;
                    amount: number;
                  }[];
                  txHash: string;
                  totalAmount: any;
                  feeAmount: any;
                  timestamp: number;
                },
                k: Key
              ) => (
                <StyledTableRow key={k}>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row.inputs.map((input, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          color: input.addressInWallet ? undefined : 'grey',
                        }}
                      >
                        <span style={{ flex: 1, textAlign: 'left' }}>
                          {input.address}
                        </span>
                        <span style={{ flex: 1, textAlign: 'right' }}>
                          {(Number(input.amount) / 1e8).toFixed(8)}
                        </span>
                      </div>
                    ))}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row.outputs.map((output, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          color: output.addressInWallet ? undefined : 'grey',
                        }}
                      >
                        <span style={{ flex: 1, textAlign: 'left' }}>
                          {output.address}
                        </span>
                        <span style={{ flex: 1, textAlign: 'right' }}>
                          {(Number(output.amount) / 1e8).toFixed(8)}
                        </span>
                      </div>
                    ))}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {cropString(row?.txHash)}
                    <CustomWidthTooltip
                      placement="top"
                      title={
                        copyLtcTxHash
                          ? copyLtcTxHash
                          : t('core:action.copy_hash', {
                              hash: row?.txHash,
                              postProcess: 'capitalizeFirstChar',
                            })
                      }
                    >
                      <IconButton
                        aria-label="copy"
                        size="small"
                        onClick={() => {
                          (navigator.clipboard.writeText(row?.txHash),
                            changeCopyLtcTxHash());
                        }}
                      >
                        <CopyAllTwoTone fontSize="small" />
                      </IconButton>
                    </CustomWidthTooltip>
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.totalAmount > 0 ? (
                      <div style={{ color: '#66bb6a' }}>
                        +{(Number(row?.totalAmount) / 1e8).toFixed(8)}
                      </div>
                    ) : (
                      <div style={{ color: '#f44336' }}>
                        {(Number(row?.totalAmount) / 1e8).toFixed(8)}
                      </div>
                    )}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="right">
                    {row?.totalAmount <= 0 ? (
                      <div style={{ color: '#f44336' }}>
                        -{(Number(row?.feeAmount) / 1e8).toFixed(8)}
                      </div>
                    ) : (
                      <div style={{ color: 'grey' }}>
                        -{(Number(row?.feeAmount) / 1e8).toFixed(8)}
                      </div>
                    )}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    <CustomWidthTooltip
                      placement="top"
                      title={
                        row?.timestamp
                          ? new Date(row?.timestamp).toLocaleString()
                          : t('core:message.generic.waiting_confirmation', {
                              postProcess: 'capitalizeFirstChar',
                            })
                      }
                    >
                      <div>
                        {row?.timestamp
                          ? epochToAgo(row?.timestamp)
                          : t('core:message.generic.unconfirmed_transaction', {
                              postProcess: 'capitalizeFirstChar',
                            })}
                      </div>
                    </CustomWidthTooltip>
                  </StyledTableCell>
                </StyledTableRow>
              )
            )}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter sx={{ width: '100%' }}>
            <TableRow>
              <TablePagination
                labelRowsPerPage={t('core:rows_per_page', {
                  postProcess: 'capitalizeFirstChar',
                })}
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={5}
                count={transactionsLtc.length}
                rowsPerPage={rowsPerPage}
                page={page}
                slotProps={{
                  select: {
                    inputProps: {
                      'aria-label': 'rows per page',
                    },
                    native: true,
                  },
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    );
  };

  const LtcAddressBookDialogPage = () => {
    return (
      <DialogGeneral
        aria-labelledby="ltc-electrum-servers"
        open={openLtcAddressBook}
        keepMounted={false}
      >
        <DialogContent>
          <Typography
            variant="h5"
            align="center"
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {t('core:message.generic.coming_soon', {
              postProcess: 'capitalizeFirstChar',
            })}
          </Typography>
        </DialogContent>
      </DialogGeneral>
    );
  };

  return (
    <Box sx={{ width: '100%', marginTop: '20px' }}>
      {LtcSendDialogPage()}
      {LtcQrDialogPage()}
      {LtcAddressBookDialogPage()}
      <Typography
        gutterBottom
        variant="h5"
        sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 700 }}
      >
        {t('core:message.generic.litecoin_wallet', {
          postProcess: 'capitalizeFirstChar',
        })}
      </Typography>
      <WalleteCard>
        <CoinAvatar src={coinLogoLTC} alt="Coinlogo" />
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            {t('core:balance', {
              postProcess: 'capitalizeFirstChar',
            })}
            &nbsp;&nbsp;
          </Typography>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {isLoadingWalletBalanceLtc ? (
              <Box sx={{ width: '175px' }}>
                <LinearProgress />
              </Box>
            ) : walletBalanceError ? (
              walletBalanceError
            ) : (
              walletBalanceLtc + ' LTC'
            )}
          </Typography>
        </div>
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            {t('core:address', {
              postProcess: 'capitalizeFirstChar',
            })}
            &nbsp;&nbsp;
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {walletInfoError ? walletInfoError : walletInfoLtc?.address || '—'}
          </Typography>

          {walletInfoError && (
            <Tooltip
              placement="top"
              title={t('core:action.retry', {
                postProcess: 'capitalizeFirstChar',
              })}
            >
              <span>
                <IconButton
                  aria-label="retry"
                  size="small"
                  onClick={getWalletInfoLtc}
                  disabled={isLoadingWalletInfoLtc}
                >
                  {isLoadingWalletInfoLtc ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Refresh fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          )}
          <Tooltip
            placement="right"
            title={
              copyLtcAddress
                ? copyLtcAddress
                : t('core:action.copy_address', {
                    postProcess: 'capitalizeFirstChar',
                  })
            }
          >
            <IconButton
              aria-label="copy"
              size="small"
              onClick={() => {
                (navigator.clipboard.writeText(walletInfoLtc?.address),
                  changeCopyLtcStatus());
              }}
            >
              <CopyAllTwoTone fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            marginTop: '15px',
          }}
        >
          <WalletButtons
            loading={isLoadingWalletBalanceLtc}
            loadingPosition="start"
            variant="contained"
            startIcon={<Send style={{ marginBottom: '2px' }} />}
            aria-label="transfer"
            onClick={handleOpenLtcSend}
            disabled={isTransferDisabled}
          >
            {t('core:action.transfer_coin', {
              coin: 'LTC',
              postProcess: 'capitalizeFirstChar',
            })}
          </WalletButtons>
          <WalletButtons
            variant="contained"
            startIcon={<QrCode2 style={{ marginBottom: '2px' }} />}
            aria-label="QRcode"
            onClick={handleOpenLtcQR}
            disabled={!walletInfoLtc?.address}
          >
            {t('core:action.show_qrcode', {
              postProcess: 'capitalizeFirstChar',
            })}
          </WalletButtons>
          <WalletButtons
            variant="contained"
            startIcon={<ImportContacts style={{ marginBottom: '2px' }} />}
            aria-label="book"
            onClick={handleOpenAddressBook}
          >
            {t('core:address_book', {
              postProcess: 'capitalizeFirstChar',
            })}
          </WalletButtons>
        </div>
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" paddingTop={2} paddingBottom={2}>
            {t('core:transactions', {
              postProcess: 'capitalizeAll',
            })}
          </Typography>
          <Button
            size="small"
            onClick={handleLoadingRefreshLtc}
            loading={loadingRefreshLtc}
            loadingPosition="start"
            startIcon={<Refresh />}
            variant="outlined"
            style={{ borderRadius: 50 }}
          >
            {t('core:action.refresh', {
              postProcess: 'capitalizeFirstChar',
            })}
          </Button>
        </div>
        {isLoadingLtcTransactions ? tableLoader() : transactionsTable()}
      </WalleteCard>
    </Box>
  );
}
