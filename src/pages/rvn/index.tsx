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
  Slider,
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
import coinLogoRVN from '../../assets/rvn.png';
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

const RvnQrDialog = styled(Dialog)(({ theme }) => ({
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

const RvnSubmittDialog = styled(Dialog)(({ theme }) => ({
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

const rvnMarks = [
  {
    value: 1000,
    label: 'MIN',
  },
  {
    value: 1500,
    label: 'DEF',
  },
  {
    value: 10000,
    label: 'MAX',
  },
];

function valueTextRvn(value: number) {
  return `${value} SAT`;
}

export default function RavencoinWallet() {
  const { t } = useTranslation(['core']);

  const { isAuthenticated } = useContext(WalletContext);

  const [walletInfoRvn, setWalletInfoRvn] = useState<any>({});
  const [walletBalanceRvn, setWalletBalanceRvn] = useState<any>(null);
  const [isLoadingWalletBalanceRvn, setIsLoadingWalletBalanceRvn] =
    useState<boolean>(true);
  const [transactionsRvn, setTransactionsRvn] = useState<any>([]);
  const [isLoadingRvnTransactions, setIsLoadingRvnTransactions] =
    useState<boolean>(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [copyRvnAddress, setCopyRvnAddress] = useState('');
  const [copyRvnTxHash, setCopyRvnTxHash] = useState('');
  const [openRvnQR, setOpenRvnQR] = useState(false);
  const [openRvnSend, setOpenRvnSend] = useState(false);
  const [rvnAmount, setRvnAmount] = useState<number>(0);
  const [rvnRecipient, setRvnRecipient] = useState('');
  const [addressFormatError, setAddressFormatError] = useState(false);
  const [rvnFee, setRvnFee] = useState<number>(0);
  const [loadingRefreshRvn, setLoadingRefreshRvn] = useState(false);
  const [openTxRvnSubmit, setOpenTxRvnSubmit] = useState(false);
  const [openSendRvnSuccess, setOpenSendRvnSuccess] = useState(false);
  const [openSendRvnError, setOpenSendRvnError] = useState(false);
  const [openRvnAddressBook, setOpenRvnAddressBook] = useState(false);

  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - transactionsRvn.length)
      : 0;

  const handleOpenRvnQR = () => {
    setOpenRvnQR(true);
  };

  const handleCloseRvnQR = () => {
    setOpenRvnQR(false);
  };

  const handleOpenAddressBook = async () => {
    setOpenRvnAddressBook(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setOpenRvnAddressBook(false);
  };

  const handleOpenRvnSend = () => {
    setRvnAmount(0);
    setRvnRecipient('');
    setRvnFee(1500);
    setOpenRvnSend(true);
  };

  const validateCanSendRvn = () => {
    if (rvnAmount <= 0 || null || !rvnAmount) {
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
    const pattern = /^(R[1-9A-HJ-NP-Za-km-z]{33})$/;

    setRvnRecipient(value);

    if (pattern.test(value) || value === '') {
      setAddressFormatError(false);
    } else {
      setAddressFormatError(true);
    }
  };

  const handleCloseRvnSend = () => {
    setRvnAmount(0);
    setRvnFee(0);
    setOpenRvnSend(false);
  };

  const changeCopyRvnStatus = async () => {
    setCopyRvnAddress('Copied');
    await timeoutDelay(2000);
    setCopyRvnAddress('');
  };

  const changeCopyRvnTxHash = async () => {
    setCopyRvnTxHash('Copied');
    await timeoutDelay(2000);
    setCopyRvnTxHash('');
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

  const handleChangeRvnFee = (_: Event, newValue: number | number[]) => {
    setRvnFee(newValue as number);
    setRvnAmount(0);
  };

  const handleCloseSendRvnSuccess = (
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendRvnSuccess(false);
  };

  const handleCloseSendRvnError = (
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendRvnError(false);
  };

  const getWalletInfoRvn = async () => {
    try {
      const response = await qortalRequest({
        action: 'GET_USER_WALLET',
        coin: 'RVN',
      });
      if (!response?.error) {
        setWalletInfoRvn(response);
      }
    } catch (error) {
      setWalletInfoRvn({});
      console.error('ERROR GET RVN WALLET INFO', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    getWalletInfoRvn();
  }, [isAuthenticated]);

  const getWalletBalanceRvn = async () => {
    try {
      const response = await qortalRequestWithTimeout(
        {
          action: 'GET_WALLET_BALANCE',
          coin: 'RVN',
        },
        300000
      );
      if (!response?.error) {
        setWalletBalanceRvn(response);
        setIsLoadingWalletBalanceRvn(false);
      }
    } catch (error) {
      setWalletBalanceRvn(null);
      setIsLoadingWalletBalanceRvn(false);
      console.error('ERROR GET RVN BALANCE', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const intervalGetWalletBalanceRvn = setInterval(() => {
      getWalletBalanceRvn();
    }, 180000);
    getWalletBalanceRvn();
    return () => {
      clearInterval(intervalGetWalletBalanceRvn);
    };
  }, [isAuthenticated]);

  const getTransactionsRvn = async () => {
    try {
      setIsLoadingRvnTransactions(true);

      const responseRvnTransactions = await qortalRequestWithTimeout(
        {
          action: 'GET_USER_WALLET_TRANSACTIONS',
          coin: 'RVN',
        },
        300000
      );

      if (!responseRvnTransactions?.error) {
        setTransactionsRvn(responseRvnTransactions);
        setIsLoadingRvnTransactions(false);
      }
    } catch (error) {
      setIsLoadingRvnTransactions(false);
      setTransactionsRvn([]);
      console.error('ERROR GET RVN TRANSACTIONS', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    getTransactionsRvn();
  }, [isAuthenticated]);

  const handleLoadingRefreshRvn = async () => {
    setLoadingRefreshRvn(true);
    await getTransactionsRvn();
    setLoadingRefreshRvn(false);
  };

  const handleSendMaxRvn = () => {
    const maxRvnAmount = parseFloat(
      (walletBalanceRvn - (rvnFee * 1000) / 1e8).toFixed(8)
    );
    if (maxRvnAmount <= 0) {
      setRvnAmount(0);
    } else {
      setRvnAmount(maxRvnAmount);
    }
  };

  const RvnQrDialogPage = () => {
    return (
      <RvnQrDialog
        onClose={handleCloseRvnQR}
        aria-labelledby="rvn-qr-code"
        open={openRvnQR}
        keepMounted={false}
      >
        <DialogTitle sx={{ m: 0, p: 2, fontSize: '12px' }} id="rvn-qr-code">
          {t('core:address', {
            postProcess: 'capitalizeFirstChar',
          })}{' '}
          {walletInfoRvn?.address}
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
              value={walletInfoRvn?.address}
              viewBox={`0 0 256 256`}
              fgColor={'#393939'}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseRvnQR}>
            {t('core:action.close', {
              postProcess: 'capitalizeFirstChar',
            })}
          </Button>
        </DialogActions>
      </RvnQrDialog>
    );
  };

  const sendRvnRequest = async () => {
    setOpenTxRvnSubmit(true);
    const rvnFeeCalculated = Number(rvnFee / 1e8).toFixed(8);
    try {
      const sendRequest = await qortalRequest({
        action: 'SEND_COIN',
        coin: 'RVN',
        recipient: rvnRecipient,
        amount: rvnAmount,
        fee: rvnFeeCalculated,
      });
      if (!sendRequest?.error) {
        setRvnAmount(0);
        setRvnRecipient('');
        setRvnFee(1500);
        setOpenTxRvnSubmit(false);
        setOpenSendRvnSuccess(true);
        setIsLoadingWalletBalanceRvn(true);
        await timeoutDelay(3000);
        getWalletBalanceRvn();
      }
    } catch (error) {
      setRvnAmount(0);
      setRvnRecipient('');
      setRvnFee(1500);
      setOpenTxRvnSubmit(false);
      setOpenSendRvnError(true);
      setIsLoadingWalletBalanceRvn(true);
      await timeoutDelay(3000);
      getWalletBalanceRvn();
      console.error('ERROR SENDING RVN', error);
    }
  };

  const RvnSendDialogPage = () => {
    return (
      <Dialog
        fullScreen
        open={openRvnSend}
        onClose={handleCloseRvnSend}
        slots={{ transition: Transition }}
      >
        <RvnSubmittDialog fullWidth={true} maxWidth="xs" open={openTxRvnSubmit}>
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
        </RvnSubmittDialog>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={openSendRvnSuccess}
          autoHideDuration={4000}
          slots={{ transition: SlideTransition }}
          onClose={handleCloseSendRvnSuccess}
        >
          <Alert
            onClose={handleCloseSendRvnSuccess}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {t('core:message.generic.sent_transaction', {
              coin: 'RVN',
              postProcess: 'capitalizeAll',
            })}
          </Alert>
        </Snackbar>
        <Snackbar
          open={openSendRvnError}
          autoHideDuration={4000}
          onClose={handleCloseSendRvnError}
        >
          <Alert
            onClose={handleCloseSendRvnError}
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
              onClick={handleCloseRvnSend}
              aria-label="close"
            >
              <Close />
            </IconButton>
            <Avatar
              sx={{ width: 28, height: 28 }}
              alt="RVN Logo"
              src={coinLogoRVN}
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
                coin: 'DGV',
                postProcess: 'capitalizeFirstChar',
              })}
            </Typography>
            <Button
              disabled={validateCanSendRvn()}
              variant="contained"
              startIcon={<Send />}
              aria-label="send-rvn"
              onClick={sendRvnRequest}
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
          </Typography>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {isLoadingWalletBalanceRvn ? (
              <Box sx={{ width: '175px' }}>
                <LinearProgress />
              </Box>
            ) : (
              walletBalanceRvn + ' RVN'
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
              const newMaxRvnAmount = parseFloat(
                (walletBalanceRvn - (rvnFee * 1000) / 1e8).toFixed(8)
              );
              if (newMaxRvnAmount < 0) {
                return Number(0.0) + ' RVN';
              } else {
                return newMaxRvnAmount + ' RVN';
              }
            })()}
          </Typography>
          <div style={{ marginInlineStart: '15px' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSendMaxRvn}
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
            value={rvnAmount}
            allowNegative={false}
            customInput={TextField}
            valueIsNumericString
            variant="outlined"
            label="Amount (RVN)"
            isAllowed={(values) => {
              const maxRvnCoin = walletBalanceRvn - (rvnFee * 1000) / 1e8;
              const { formattedValue, floatValue } = values;
              return formattedValue === '' || (floatValue ?? 0) <= maxRvnCoin;
            }}
            onValueChange={(values) => {
              setRvnAmount(values.floatValue ?? 0);
            }}
            required
          />
          <TextField
            required
            label="{t('core:receiver_address', {
              postProcess: 'capitalizeFirstChar',
            })}"
            id="rvn-address"
            margin="normal"
            value={rvnRecipient}
            onChange={handleRecipientChange}
            error={addressFormatError}
            helperText={
              addressFormatError
                ? t('core:message.error.ravencoin_address_invalid', {
                    postProcess: 'capitalizeFirstChar',
                  })
                : t('core:message.generic.ravencoin_address', {
                    postProcess: 'capitalizeFirstChar',
                  })
            }
          />
        </Box>
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
            <Typography id="rvn-fee-slider" gutterBottom>
              {t('core:message.generic.current_fee', {
                fee: rvnFee,
                postProcess: 'capitalizeFirstChar',
              })}
            </Typography>
            <Slider
              track={false}
              step={100}
              min={1000}
              max={10000}
              valueLabelDisplay="auto"
              aria-labelledby="rvn-fee-slider"
              getAriaValueText={valueTextRvn}
              defaultValue={1500}
              marks={rvnMarks}
              onChange={handleChangeRvnFee}
            />
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
              ? transactionsRvn.slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
              : transactionsRvn
            ).map(
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
                        copyRvnTxHash
                          ? copyRvnTxHash
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
                            changeCopyRvnTxHash());
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
                count={transactionsRvn.length}
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

  const RvnAddressBookDialogPage = () => {
    return (
      <DialogGeneral
        aria-labelledby="rvn-electrum-servers"
        open={openRvnAddressBook}
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
      {RvnSendDialogPage()}
      {RvnQrDialogPage()}
      {RvnAddressBookDialogPage()}
      <Typography
        gutterBottom
        variant="h5"
        sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 700 }}
      >
        {t('core:message.generic.ravencoin_wallet', {
          postProcess: 'capitalizeFirstChar',
        })}
      </Typography>
      <WalleteCard>
        <CoinAvatar src={coinLogoRVN} alt="Coinlogo" />
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
            {walletBalanceRvn ? (
              walletBalanceRvn + ' RVN'
            ) : (
              <Box sx={{ width: '175px' }}>
                <LinearProgress />
              </Box>
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
            {walletInfoRvn?.address}
          </Typography>
          <Tooltip
            placement="right"
            title={
              copyRvnAddress
                ? copyRvnAddress
                : t('core:action.copy_address', {
                    postProcess: 'capitalizeFirstChar',
                  })
            }
          >
            <IconButton
              aria-label="copy"
              size="small"
              onClick={() => {
                (navigator.clipboard.writeText(walletInfoRvn?.address),
                  changeCopyRvnStatus());
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
            loading={isLoadingWalletBalanceRvn}
            loadingPosition="start"
            variant="contained"
            startIcon={<Send style={{ marginBottom: '2px' }} />}
            aria-label="transfer"
            onClick={handleOpenRvnSend}
          >
            {t('core:action.transfer_coin', {
              coin: 'DGV',
              postProcess: 'capitalizeFirstChar',
            })}
          </WalletButtons>
          <WalletButtons
            variant="contained"
            startIcon={<QrCode2 style={{ marginBottom: '2px' }} />}
            aria-label="QRcode"
            onClick={handleOpenRvnQR}
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
            onClick={handleLoadingRefreshRvn}
            loading={loadingRefreshRvn}
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
        {isLoadingRvnTransactions ? tableLoader() : transactionsTable()}
      </WalleteCard>
    </Box>
  );
}
