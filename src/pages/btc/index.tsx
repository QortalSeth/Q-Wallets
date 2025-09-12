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
import coinLogoBTC from '../../assets/btc.png';
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

const BtcQrDialog = styled(Dialog)(({ theme }) => ({
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

const BtcSubmittDialog = styled(Dialog)(({ theme }) => ({
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

export default function BitcoinWallet() {
  const { t } = useTranslation(['core']);

  const { isAuthenticated } = useContext(WalletContext);

  const [walletInfoBtc, setWalletInfoBtc] = useState<any>({});
  const [isLoadingWalletInfoBtc, setIsLoadingWalletInfoBtc] =
    useState<boolean>(false);
  const [walletBalanceBtc, setWalletBalanceBtc] = useState<any>(null);
  const [isLoadingWalletBalanceBtc, setIsLoadingWalletBalanceBtc] =
    useState<boolean>(true);
  const [transactionsBtc, setTransactionsBtc] = useState<any>([]);
  const [isLoadingBtcTransactions, setIsLoadingBtcTransactions] =
    useState<boolean>(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [copyBtcAddress, setCopyBtcAddress] = useState('');
  const [copyBtcTxHash, setCopyBtcTxHash] = useState('');
  const [openBtcQR, setOpenBtcQR] = useState(false);
  const [openBtcSend, setOpenBtcSend] = useState(false);
  const [btcAmount, setBtcAmount] = useState<number>(0);
  const [btcRecipient, setBtcRecipient] = useState('');
  const [addressFormatError, setAddressFormatError] = useState(false);

  const [loadingRefreshBtc, setLoadingRefreshBtc] = useState(false);
  const [openTxBtcSubmit, setOpenTxBtcSubmit] = useState(false);
  const [openSendBtcSuccess, setOpenSendBtcSuccess] = useState(false);
  const [openSendBtcError, setOpenSendBtcError] = useState(false);
  const [openBtcAddressBook, setOpenBtcAddressBook] = useState(false);
  const [inputFee, setInputFee] = useState(0);
  const [walletInfoError, setWalletInfoError] = useState<string | null>(null);
  const [walletBalanceError, setWalletBalanceError] = useState<string | null>(
    null
  );
  const isTransferDisabled =
    isLoadingWalletBalanceBtc ||
    !!walletBalanceError ||
    walletBalanceBtc == null ||
    Number(walletBalanceBtc) <= 0;

  const btcFeeCalculated = +(+inputFee / 1000 / 1e8).toFixed(8);
  const estimatedFeeCalculated = +btcFeeCalculated * 500;
  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - transactionsBtc.length)
      : 0;

  const handleOpenBtcQR = () => {
    setOpenBtcQR(true);
  };

  const handleCloseBtcQR = () => {
    setOpenBtcQR(false);
  };

  const handleOpenAddressBook = async () => {
    setOpenBtcAddressBook(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setOpenBtcAddressBook(false);
  };

  const handleOpenBtcSend = () => {
    setBtcAmount(0);
    setBtcRecipient('');
    setOpenBtcSend(true);
  };

  const validateCanSendBtc = () => {
    if (btcAmount <= 0 || null || !btcAmount) {
      return true;
    }
    if (addressFormatError || '') {
      return true;
    }
    return false;
  };

  const handleRecipientChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    const pattern =
      /^(1[1-9A-HJ-NP-Za-km-z]{33}|3[1-9A-HJ-NP-Za-km-z]{33}|bc1[02-9A-HJ-NP-Za-z]{39})$/;

    setBtcRecipient(value);

    if (pattern.test(value) || value === '') {
      setAddressFormatError(false);
    } else {
      setAddressFormatError(true);
    }
  };

  const handleCloseBtcSend = () => {
    setBtcAmount(0);
    setOpenBtcSend(false);
  };

  const changeCopyBtcStatus = async () => {
    setCopyBtcAddress('Copied');
    await timeoutDelay(2000);
    setCopyBtcAddress('');
  };

  const changeCopyBtcTxHash = async () => {
    setCopyBtcTxHash('Copied');
    await timeoutDelay(2000);
    setCopyBtcTxHash('');
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

  const handleCloseSendBtcSuccess = (
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendBtcSuccess(false);
  };

  const handleCloseSendBtcError = (
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendBtcError(false);
  };

  const getWalletInfoBtc = async () => {
    setIsLoadingWalletInfoBtc(true);
    try {
      setWalletInfoError(null);
      const response = await qortalRequest({
        action: 'GET_USER_WALLET',
        coin: 'BTC',
      });
      if (response?.error) {
        setWalletInfoBtc({});
        setWalletInfoError(
          typeof response.error === 'string'
            ? response.error
            : t('core:message.error.loading_address', {
                postProcess: 'capitalizeFirstChar',
              })
        );
      } else {
        setWalletInfoBtc(response);
        setWalletInfoError(null);
      }
    } catch (error: any) {
      setWalletInfoBtc({});
      setWalletInfoError(
        error?.message ? String(error.message) : String(error)
      );
      console.error('ERROR GET BTC WALLET INFO', error);
    } finally {
      setIsLoadingWalletInfoBtc(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    getWalletInfoBtc();
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
    const intervalgetTransactionsBtc = setInterval(() => {
      getTransactionsBtc();
    }, 180000);
    getTransactionsBtc();
    return () => {
      clearInterval(intervalgetTransactionsBtc);
    };
  }, [isAuthenticated]);

  const getTransactionsBtc = async () => {
    try {
      setIsLoadingBtcTransactions(true);
      setIsLoadingWalletBalanceBtc(true);
      setWalletBalanceError(null);

      const responseBtcTransactions = await qortalRequestWithTimeout(
        {
          action: 'GET_USER_WALLET_TRANSACTIONS',
          coin: 'BTC',
        },
        300000
      );

      if (responseBtcTransactions?.error) {
        setTransactionsBtc([]);
        setWalletBalanceBtc(null);
        setWalletBalanceError(
          typeof responseBtcTransactions.error === 'string'
            ? responseBtcTransactions.error
            : 'Failed to load balance'
        );
      } else {
        setTransactionsBtc(responseBtcTransactions);
        const computed = computeBalanceFromTransactions(
          responseBtcTransactions || []
        );
        setWalletBalanceBtc(computed);
        setWalletBalanceError(null);
      }
    } catch (error: any) {
      setTransactionsBtc([]);
      setWalletBalanceBtc(null);
      setWalletBalanceError(
        error?.message ? String(error.message) : String(error)
      );
      console.error('ERROR GET BTC TRANSACTIONS', error);
    } finally {
      setIsLoadingBtcTransactions(false);
      setIsLoadingWalletBalanceBtc(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    let intervalId: any;
    (async () => {
      await getWalletInfoBtc();
      await getTransactionsBtc();
      await getTransactionsBtc();
      intervalId = setInterval(() => {
        getTransactionsBtc();
      }, 180000);
    })();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  const handleLoadingRefreshBtc = async () => {
    setLoadingRefreshBtc(true);
    await getTransactionsBtc();
    setLoadingRefreshBtc(false);
  };

  const handleSendMaxBtc = () => {
    const maxBtcAmount = +walletBalanceBtc - estimatedFeeCalculated;
    if (maxBtcAmount <= 0) {
      setBtcAmount(0);
    } else {
      setBtcAmount(maxBtcAmount);
    }
  };

  const BtcQrDialogPage = () => {
    return (
      <BtcQrDialog
        onClose={handleCloseBtcQR}
        aria-labelledby="btc-qr-code"
        open={openBtcQR}
        keepMounted={false}
      >
        <DialogTitle sx={{ m: 0, p: 2, fontSize: '12px' }} id="btc-qr-code">
          {t('core:address', {
            postProcess: 'capitalizeFirstChar',
          })}{' '}
          {walletInfoError ? walletInfoError : walletInfoBtc?.address}
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
              value={walletInfoBtc?.address || ''}
              viewBox={`0 0 256 256`}
              fgColor={'#393939'}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseBtcQR}>
            {t('core:action.close', {
              postProcess: 'capitalizeFirstChar',
            })}
          </Button>
        </DialogActions>
      </BtcQrDialog>
    );
  };

  const sendBtcRequest = async () => {
    if (!btcFeeCalculated) return;
    setOpenTxBtcSubmit(true);
    try {
      const sendRequest = await qortalRequest({
        action: 'SEND_COIN',
        coin: 'BTC',
        recipient: btcRecipient,
        amount: btcAmount,
        fee: btcFeeCalculated,
      });
      if (!sendRequest?.error) {
        setBtcAmount(0);
        setBtcRecipient('');
        setOpenTxBtcSubmit(false);
        setOpenSendBtcSuccess(true);
        setIsLoadingWalletBalanceBtc(true);
        await timeoutDelay(3000);
        await getTransactionsBtc();
      }
    } catch (error) {
      setBtcAmount(0);
      setBtcRecipient('');
      setOpenTxBtcSubmit(false);
      setOpenSendBtcError(true);
      setIsLoadingWalletBalanceBtc(true);
      await timeoutDelay(3000);
      getTransactionsBtc();
      console.error('ERROR SENDING BTC', error);
    }
  };

  const BtcSendDialogPage = () => {
    return (
      <Dialog
        fullScreen
        open={openBtcSend}
        onClose={handleCloseBtcSend}
        slots={{ transition: Transition }}
      >
        <BtcSubmittDialog fullWidth={true} maxWidth="xs" open={openTxBtcSubmit}>
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
        </BtcSubmittDialog>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={openSendBtcSuccess}
          autoHideDuration={4000}
          slots={{ transition: SlideTransition }}
          onClose={handleCloseSendBtcSuccess}
        >
          <Alert
            onClose={handleCloseSendBtcSuccess}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {t('core:message.generic.sent_transaction', {
              coin: 'BTC',
              postProcess: 'capitalizeAll',
            })}
          </Alert>
        </Snackbar>
        <Snackbar
          open={openSendBtcError}
          autoHideDuration={4000}
          onClose={handleCloseSendBtcError}
        >
          <Alert
            onClose={handleCloseSendBtcError}
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
              onClick={handleCloseBtcSend}
              aria-label="close"
            >
              <Close />
            </IconButton>
            <Avatar
              sx={{ width: 28, height: 28 }}
              alt="BTC Logo"
              src={coinLogoBTC}
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
                coin: 'BTC',
                postProcess: 'capitalizeFirstChar',
              })}
            </Typography>
            <Button
              disabled={validateCanSendBtc()}
              variant="contained"
              startIcon={<Send />}
              aria-label="send-btc"
              onClick={sendBtcRequest}
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
            {isLoadingWalletBalanceBtc ? (
              <Box sx={{ width: '175px' }}>
                <LinearProgress />
              </Box>
            ) : walletBalanceError ? (
              walletBalanceError
            ) : (
              walletBalanceBtc + ' BTC'
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
              const newMaxBtcAmount =
                +walletBalanceBtc - estimatedFeeCalculated;
              if (newMaxBtcAmount < 0) {
                return Number(0.0) + ' BTC';
              } else {
                return newMaxBtcAmount + ' BTC';
              }
            })()}
          </Typography>
          <div style={{ marginInlineStart: '15px' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSendMaxBtc}
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
            value={btcAmount}
            allowNegative={false}
            customInput={TextField}
            valueIsNumericString
            variant="outlined"
            label="Amount (BTC)"
            isAllowed={(values) => {
              const maxBtcCoin = +walletBalanceBtc - estimatedFeeCalculated;
              const { formattedValue, floatValue } = values;
              return formattedValue === '' || (floatValue ?? 0) <= maxBtcCoin;
            }}
            onValueChange={(values) => {
              setBtcAmount(values.floatValue ?? 0);
            }}
            required
          />
          <TextField
            required
            label="{t('core:receiver_address', {
              postProcess: 'capitalizeFirstChar',
            })}"
            id="btc-address"
            margin="normal"
            value={btcRecipient}
            onChange={handleRecipientChange}
            error={addressFormatError}
            helperText={
              addressFormatError
                ? t('core:message.error.bitcoin_address_invalid', {
                    postProcess: 'capitalizeFirstChar',
                  })
                : t('core:message.generic.bitcoin_address', {
                    postProcess: 'capitalizeFirstChar',
                  })
            }
          />
        </Box>
        <FeeManager coin="BTC" onChange={setInputFee} />
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
              ? transactionsBtc.slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
              : transactionsBtc
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
                        copyBtcTxHash
                          ? copyBtcTxHash
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
                            changeCopyBtcTxHash());
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
                count={transactionsBtc.length}
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

  const BtcAddressBookDialogPage = () => {
    return (
      <DialogGeneral
        aria-labelledby="btc-electrum-servers"
        open={openBtcAddressBook}
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
      {BtcSendDialogPage()}
      {BtcQrDialogPage()}
      {BtcAddressBookDialogPage()}
      <Typography
        gutterBottom
        variant="h5"
        sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 700 }}
      >
        {t('core:message.generic.bitcoin_wallet', {
          postProcess: 'capitalizeFirstChar',
        })}
      </Typography>
      <WalleteCard>
        <CoinAvatar src={coinLogoBTC} alt="Coinlogo" />
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
            {isLoadingWalletBalanceBtc ? (
              <Box sx={{ width: '175px' }}>
                <LinearProgress />
              </Box>
            ) : walletBalanceError ? (
              walletBalanceError
            ) : (
              walletBalanceBtc + ' BTC'
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
            {walletInfoError ? walletInfoError : walletInfoBtc?.address || '—'}
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
                  onClick={getWalletInfoBtc}
                  disabled={isLoadingWalletInfoBtc}
                >
                  {isLoadingWalletInfoBtc ? (
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
              walletInfoBtc?.address
                ? copyBtcAddress
                  ? copyBtcAddress
                  : t('core:action.copy_address', {
                      postProcess: 'capitalizeFirstChar',
                    })
                : t('core:message.generic.no_address', {
                    postProcess: 'capitalizeFirstChar',
                  })
            }
          >
            <span>
              <IconButton
                aria-label="copy"
                size="small"
                disabled={!walletInfoBtc?.address}
                onClick={() => {
                  if (walletInfoBtc?.address) {
                    navigator.clipboard.writeText(walletInfoBtc?.address);
                  }
                  changeCopyBtcStatus();
                }}
              >
                <CopyAllTwoTone fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip
            placement="right"
            title={
              copyBtcAddress
                ? copyBtcAddress
                : t('core:action.copy_address', {
                    postProcess: 'capitalizeFirstChar',
                  })
            }
          >
            <IconButton
              aria-label="copy"
              size="small"
              onClick={() => {
                (navigator.clipboard.writeText(walletInfoBtc?.address),
                  changeCopyBtcStatus());
              }}
            >
              <CopyAllTwoTone fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '15px',
            justifyContent: 'center',
            marginTop: '15px',
            width: '100%',
          }}
        >
          <WalletButtons
            loading={isLoadingWalletBalanceBtc}
            loadingPosition="start"
            variant="contained"
            startIcon={<Send style={{ marginBottom: '2px' }} />}
            aria-label="transfer"
            onClick={handleOpenBtcSend}
            disabled={isTransferDisabled}
          >
            {t('core:action.transfer_coin', {
              coin: 'BTC',
              postProcess: 'capitalizeFirstChar',
            })}
          </WalletButtons>
          <WalletButtons
            variant="contained"
            startIcon={<QrCode2 style={{ marginBottom: '2px' }} />}
            aria-label="QRcode"
            onClick={handleOpenBtcQR}
            disabled={!walletInfoBtc?.address}
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
            onClick={handleLoadingRefreshBtc}
            loading={loadingRefreshBtc}
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
        {isLoadingBtcTransactions ? tableLoader() : transactionsTable()}
      </WalleteCard>
    </Box>
  );
}
