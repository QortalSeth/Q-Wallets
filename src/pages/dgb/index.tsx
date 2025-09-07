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
import coinLogoDGB from '../../assets/dgb.png';
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

const DgbQrDialog = styled(Dialog)(({ theme }) => ({
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

const DgbSubmittDialog = styled(Dialog)(({ theme }) => ({
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

const dgbMarks = [
  {
    value: 1,
    label: 'MIN',
  },
  {
    value: 10,
    label: 'DEF',
  },
  {
    value: 100,
    label: 'MAX',
  },
];

function valueTextDgb(value: number) {
  return `${value} SAT`;
}

export default function DigibyteWallet() {
  const { t } = useTranslation(['core']);

  const { isAuthenticated } = useContext(WalletContext);

  const [walletInfoDgb, setWalletInfoDgb] = useState<any>({});
  const [walletBalanceDgb, setWalletBalanceDgb] = useState<any>(null);
  const [isLoadingWalletBalanceDgb, setIsLoadingWalletBalanceDgb] =
    useState<boolean>(true);
  const [transactionsDgb, setTransactionsDgb] = useState<any>([]);
  const [isLoadingDgbTransactions, setIsLoadingDgbTransactions] =
    useState<boolean>(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [copyDgbAddress, setCopyDgbAddress] = useState('');
  const [copyDgbTxHash, setCopyDgbTxHash] = useState('');
  const [openDgbQR, setOpenDgbQR] = useState(false);
  const [openDgbSend, setOpenDgbSend] = useState(false);
  const [dgbAmount, setDgbAmount] = useState<number>(0);
  const [dgbRecipient, setDgbRecipient] = useState('');
  const [addressFormatError, setAddressFormatError] = useState(false);
  const [dgbFee, setDgbFee] = useState<number>(0);
  const [loadingRefreshDgb, setLoadingRefreshDgb] = useState(false);
  const [openTxDgbSubmit, setOpenTxDgbSubmit] = useState(false);
  const [openSendDgbSuccess, setOpenSendDgbSuccess] = useState(false);
  const [openSendDgbError, setOpenSendDgbError] = useState(false);
  const [openDgbAddressBook, setOpenDgbAddressBook] = useState(false);

  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - transactionsDgb.length)
      : 0;

  const handleOpenDgbQR = () => {
    setOpenDgbQR(true);
  };

  const handleCloseDgbQR = () => {
    setOpenDgbQR(false);
  };

  const handleOpenAddressBook = async () => {
    setOpenDgbAddressBook(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setOpenDgbAddressBook(false);
  };

  const handleOpenDgbSend = () => {
    setDgbAmount(0);
    setDgbRecipient('');
    setDgbFee(10);
    setOpenDgbSend(true);
  };

  const validateCanSendDgb = () => {
    if (dgbAmount <= 0 || null || !dgbAmount) {
      return true;
    }
    if (dgbRecipient.length < 34 || '') {
      return true;
    }
    return false;
  };

  const handleRecipientChange = (e) => {
    const value = e.target.value;
    const pattern =
      /^(D[1-9A-HJ-NP-Za-km-z]{33}|S[1-9A-HJ-NP-Za-km-z]{33}|dgb1[2-9A-HJ-NP-Za-z]{39})$/;

    setDgbRecipient(value);

    if (pattern.test(value) || value === '') {
      setAddressFormatError(false);
    } else {
      setAddressFormatError(true);
    }
  };

  const handleCloseDgbSend = () => {
    setDgbAmount(0);
    setDgbFee(0);
    setOpenDgbSend(false);
  };

  const changeCopyDgbStatus = async () => {
    setCopyDgbAddress('Copied');
    await timeoutDelay(2000);
    setCopyDgbAddress('');
  };

  const changeCopyDgbTxHash = async () => {
    setCopyDgbTxHash('Copied');
    await timeoutDelay(2000);
    setCopyDgbTxHash('');
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

  const handleChangeDgbFee = (_: Event, newValue: number | number[]) => {
    setDgbFee(newValue as number);
    setDgbAmount(0);
  };

  const handleCloseSendDgbSuccess = (
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendDgbSuccess(false);
  };

  const handleCloseSendDgbError = (
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendDgbError(false);
  };

  const getWalletInfoDgb = async () => {
    try {
      const response = await qortalRequest({
        action: 'GET_USER_WALLET',
        coin: 'DGB',
      });
      if (!response?.error) {
        setWalletInfoDgb(response);
      }
    } catch (error) {
      setWalletInfoDgb({});
      console.error('ERROR GET DGB WALLET INFO', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    getWalletInfoDgb();
  }, [isAuthenticated]);

  const getWalletBalanceDgb = async () => {
    try {
      const response = await qortalRequestWithTimeout(
        {
          action: 'GET_WALLET_BALANCE',
          coin: 'DGB',
        },
        300000
      );
      if (!response?.error) {
        setWalletBalanceDgb(response);
        setIsLoadingWalletBalanceDgb(false);
      }
    } catch (error) {
      setWalletBalanceDgb(null);
      setIsLoadingWalletBalanceDgb(false);
      console.error('ERROR GET DGB BALANCE', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const intervalGetWalletBalanceDgb = setInterval(() => {
      getWalletBalanceDgb();
    }, 180000);
    getWalletBalanceDgb();
    return () => {
      clearInterval(intervalGetWalletBalanceDgb);
    };
  }, [isAuthenticated]);

  const getTransactionsDgb = async () => {
    try {
      setIsLoadingDgbTransactions(true);

      const responseDgbTransactions = await qortalRequestWithTimeout(
        {
          action: 'GET_USER_WALLET_TRANSACTIONS',
          coin: 'DGB',
        },
        300000
      );

      if (!responseDgbTransactions?.error) {
        setTransactionsDgb(responseDgbTransactions);
        setIsLoadingDgbTransactions(false);
      }
    } catch (error) {
      setIsLoadingDgbTransactions(false);
      setTransactionsDgb([]);
      console.error('ERROR GET DGB TRANSACTIONS', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    getTransactionsDgb();
  }, [isAuthenticated]);

  const handleLoadingRefreshDgb = async () => {
    setLoadingRefreshDgb(true);
    await getTransactionsDgb();
    setLoadingRefreshDgb(false);
  };

  const handleSendMaxDgb = () => {
    const maxDgbAmount = parseFloat(
      (walletBalanceDgb - (dgbFee * 1000) / 1e8).toFixed(8)
    );
    if (maxDgbAmount <= 0) {
      setDgbAmount(0);
    } else {
      setDgbAmount(maxDgbAmount);
    }
  };

  const DgbQrDialogPage = () => {
    return (
      <DgbQrDialog
        onClose={handleCloseDgbQR}
        aria-labelledby="dgb-qr-code"
        open={openDgbQR}
        keepMounted={false}
      >
        <DialogTitle sx={{ m: 0, p: 2, fontSize: '12px' }} id="dgb-qr-code">
          Address : {walletInfoDgb?.address}
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
              value={walletInfoDgb?.address}
              viewBox={`0 0 256 256`}
              fgColor={'#393939'}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseDgbQR}>
            {t('core:action.close', {
              postProcess: 'capitalizeFirstChar',
            })}
          </Button>
        </DialogActions>
      </DgbQrDialog>
    );
  };

  const sendDgbRequest = async () => {
    setOpenTxDgbSubmit(true);
    const dgbFeeCalculated = Number(dgbFee / 1e8).toFixed(8);
    try {
      const sendRequest = await qortalRequest({
        action: 'SEND_COIN',
        coin: 'DGB',
        recipient: dgbRecipient,
        amount: dgbAmount,
        fee: dgbFeeCalculated,
      });
      if (!sendRequest?.error) {
        setDgbAmount(0);
        setDgbRecipient('');
        setDgbFee(10);
        setOpenTxDgbSubmit(false);
        setOpenSendDgbSuccess(true);
        setIsLoadingWalletBalanceDgb(true);
        await timeoutDelay(3000);
        getWalletBalanceDgb();
      }
    } catch (error) {
      setDgbAmount(0);
      setDgbRecipient('');
      setDgbFee(10);
      setOpenTxDgbSubmit(false);
      setOpenSendDgbError(true);
      setIsLoadingWalletBalanceDgb(true);
      await timeoutDelay(3000);
      getWalletBalanceDgb();
      console.error('ERROR SENDING DGB', error);
    }
  };

  const DgbSendDialogPage = () => {
    return (
      <Dialog
        fullScreen
        open={openDgbSend}
        onClose={handleCloseDgbSend}
        slots={{ transition: Transition }}
      >
        <DgbSubmittDialog fullWidth={true} maxWidth="xs" open={openTxDgbSubmit}>
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
                  Processing Transaction Please Wait...
                </Typography>
              </div>
            </Box>
          </DialogContent>
        </DgbSubmittDialog>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={openSendDgbSuccess}
          autoHideDuration={4000}
          slots={{ transition: SlideTransition }}
          onClose={handleCloseSendDgbSuccess}
        >
          <Alert
            onClose={handleCloseSendDgbSuccess}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {t('core:message.generic.sent_transaction', {
              coin: 'DGB',
              postProcess: 'capitalizeAll',
            })}
          </Alert>
        </Snackbar>
        <Snackbar
          open={openSendDgbError}
          autoHideDuration={4000}
          onClose={handleCloseSendDgbError}
        >
          <Alert
            onClose={handleCloseSendDgbError}
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
              onClick={handleCloseDgbSend}
              aria-label="close"
            >
              <Close />
            </IconButton>
            <Avatar
              sx={{ width: 28, height: 28 }}
              alt="DGB Logo"
              src={coinLogoDGB}
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
                coin: 'DGB',
                postProcess: 'capitalizeFirstChar',
              })}
            </Typography>
            <Button
              disabled={validateCanSendDgb()}
              variant="contained"
              startIcon={<Send />}
              aria-label="send-dgb"
              onClick={sendDgbRequest}
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
            {isLoadingWalletBalanceDgb ? (
              <Box sx={{ width: '175px' }}>
                <LinearProgress />
              </Box>
            ) : (
              walletBalanceDgb + ' DGB'
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
              const newMaxDgbAmount = parseFloat(
                (walletBalanceDgb - (dgbFee * 1000) / 1e8).toFixed(8)
              );
              if (newMaxDgbAmount < 0) {
                return Number(0.0) + ' DGB';
              } else {
                return newMaxDgbAmount + ' DGB';
              }
            })()}
          </Typography>
          <div style={{ marginInlineStart: '15px' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSendMaxDgb}
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
            value={dgbAmount}
            allowNegative={false}
            customInput={TextField}
            valueIsNumericString
            variant="outlined"
            label="Amount (DGB)"
            isAllowed={(values) => {
              const maxDgbCoin = walletBalanceDgb - (dgbFee * 1000) / 1e8;
              const { formattedValue, floatValue } = values;
              return (
                formattedValue === '' ||
                (typeof floatValue === 'number' && floatValue <= maxDgbCoin)
              );
            }}
            onValueChange={(values) => {
              setDgbAmount(values.floatValue ?? 0);
            }}
            required
          />
          <TextField
            required
            label="{t('core:receiver_address', {
              postProcess: 'capitalizeFirstChar',
            })}"
            id="dgb-address"
            margin="normal"
            value={dgbRecipient}
            onChange={handleRecipientChange}
            error={addressFormatError}
            helperText={
              addressFormatError
                ? t('core:message.error.digibyte_address_invalid', {
                    postProcess: 'capitalizeFirstChar',
                  })
                : t('core:message.generic.digibyte_address', {
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
            <Typography id="dgb-fee-slider" gutterBottom>
              Current fee per byte : {dgbFee} SAT
            </Typography>
            <Slider
              track={false}
              step={5}
              min={1}
              max={100}
              valueLabelDisplay="auto"
              aria-labelledby="dgb-fee-slider"
              getAriaValueText={valueTextDgb}
              defaultValue={10}
              marks={dgbMarks}
              onChange={handleChangeDgbFee}
            />
            <Typography
              align="center"
              sx={{ fontWeight: 600, fontSize: '14px', marginTop: '15px' }}
            >
              Low fees may result in slow or unconfirmed transactions.
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
                {t('core:fee', {
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
              ? transactionsDgb.slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
              : transactionsDgb
            ).map(
              (
                row: {
                  inputs: {
                    address: any;
                    addressInWallet: boolean;
                    amount: any;
                  }[];
                  outputs: {
                    address: any;
                    addressInWallet: boolean;
                    amount: any;
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
                        copyDgbTxHash
                          ? copyDgbTxHash
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
                            changeCopyDgbTxHash());
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
                count={transactionsDgb.length}
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

  const DgbAddressBookDialogPage = () => {
    return (
      <DialogGeneral
        aria-labelledby="btc-electrum-servers"
        open={openDgbAddressBook}
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
      {DgbSendDialogPage()}
      {DgbQrDialogPage()}
      {DgbAddressBookDialogPage()}
      <Typography
        gutterBottom
        variant="h5"
        sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 700 }}
      >
        {t('core:message.generic.digibyte_wallet', {
          postProcess: 'capitalizeFirstChar',
        })}
      </Typography>
      <WalleteCard>
        <CoinAvatar src={coinLogoDGB} alt="Coinlogo" />
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
            {walletBalanceDgb ? (
              walletBalanceDgb + ' DGB'
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
            {walletInfoDgb?.address}
          </Typography>
          <Tooltip
            placement="right"
            title={
              copyDgbAddress
                ? copyDgbAddress
                : t('core:action.copy_address', {
                    postProcess: 'capitalizeFirstChar',
                  })
            }
          >
            <IconButton
              aria-label="copy"
              size="small"
              onClick={() => {
                (navigator.clipboard.writeText(walletInfoDgb?.address),
                  changeCopyDgbStatus());
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
            loading={isLoadingWalletBalanceDgb}
            loadingPosition="start"
            variant="contained"
            startIcon={<Send style={{ marginBottom: '2px' }} />}
            aria-label="transfer"
            onClick={handleOpenDgbSend}
          >
            {t('core:action.transfer_coin', {
              coin: 'DGB',
              postProcess: 'capitalizeFirstChar',
            })}
          </WalletButtons>
          <WalletButtons
            variant="contained"
            startIcon={<QrCode2 style={{ marginBottom: '2px' }} />}
            aria-label="QRcode"
            onClick={handleOpenDgbQR}
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
              postProcess: 'capitalizeFirstChar',
            })}
          </Typography>
          <Button
            size="small"
            onClick={handleLoadingRefreshDgb}
            loading={loadingRefreshDgb}
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
        {isLoadingDgbTransactions ? tableLoader() : transactionsTable()}
      </WalleteCard>
    </Box>
  );
}
