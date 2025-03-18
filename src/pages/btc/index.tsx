import * as React from 'react';
import WalletContext from '../../contexts/walletContext';
import { epochToAgo, timeoutDelay, cropString } from '../../common/functions'
import { styled } from "@mui/system";
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
  List,
  ListItemButton,
  ListItemText,
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
  Typography
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
  PublishedWithChangesTwoTone,
  QrCode2,
  Refresh,
  Send
} from '@mui/icons-material';
import coinLogoBTC from '../../assets/btc.png';

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
      </IconButton>
    </Box>
  );
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
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
  "& .MuiDialog-paper": {
    borderRadius: "15px",
  },
}));

const BtcQrDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  "& .MuiDialog-paper": {
    borderRadius: "15px",
  },
}));

const BtcElectrumDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  "& .MuiDialog-paper": {
    borderRadius: "15px",
  },
}));

const BtcSubmittDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  "& .MuiDialog-paper": {
    borderRadius: "15px",
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
  maxWidth: "100%",
  margin: "20px, auto",
  padding: "24px",
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
});

const CoinAvatar = styled(Avatar)({
  width: 120,
  height: 120,
  margin: "0 auto 16px",
  transition: "transform 0.3s",
  "&:hover": {
    transform: "scale(1.05)",
  },
});

const WalletButtons = styled(Button)({
  width: "auto",
  backgroundColor: "#05a2e4",
  color: "white",
  padding: "auto",
  "&:hover": {
    backgroundColor: "#02648d",
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

const btcMarks = [
  {
    value: 20,
    label: 'MIN',
  },
  {
    value: 100,
    label: 'DEF',
  },
  {
    value: 150,
    label: 'MAX',
  },
];

function valueTextBtc(value: number) {
  return `${value} SAT`;
}

export default function BitcoinWallet() {
  const { isAuthenticated } = React.useContext(WalletContext);

  if (!isAuthenticated) {
    return (
      <Alert variant="filled" severity="error">
        You must sign in, to use the Bitcoin wallet !!!
      </Alert>
    );
  }

  const [walletInfoBtc, setWalletInfoBtc] = React.useState<any>({});
  const [walletBalanceBtc, setWalletBalanceBtc] = React.useState<any>(null);
  const [isLoadingWalletBalanceBtc, setIsLoadingWalletBalanceBtc] = React.useState<boolean>(true);
  const [allElectrumServersBtc, setAllElectrumServersBtc] = React.useState<any>([]);
  const [currentElectrumServerBtc, setCurrentElectrumServerBtc] = React.useState<any>([]);
  const [allWalletAddressesBtc, setAllWalletAddressesBtc] = React.useState<any>([]);
  const [transactionsBtc, setTransactionsBtc] = React.useState<any>([]);
  const [isLoadingBtcTransactions, setIsLoadingBtcTransactions] = React.useState<boolean>(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [copyBtcAddress, setCopyBtcAddress] = React.useState('');
  const [copyBtcTxHash, setCopyBtcTxHash] = React.useState('');
  const [openBtcQR, setOpenBtcQR] = React.useState(false);
  const [openBtcElectrum, setOpenBtcElectrum] = React.useState(false);
  const [openBtcSend, setOpenBtcSend] = React.useState(false);
  const [btcAmount, setBtcAmount] = React.useState<number>(0);
  const [btcRecipient, setBtcRecipient] = React.useState('');
  const [btcFee, setBtcFee] = React.useState<number>(0);
  const [loadingRefreshBtc, setLoadingRefreshBtc] = React.useState(false);
  const [openTxBtcSubmit, setOpenTxBtcSubmit] = React.useState(false);
  const [openSendBtcSuccess, setOpenSendBtcSuccess] = React.useState(false);
  const [openSendBtcError, setOpenSendBtcError] = React.useState(false);
  const [openBtcAddressBook, setOpenBtcAddressBook] = React.useState(false);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - transactionsBtc.length) : 0;

  const handleOpenBtcQR = () => {
    setOpenBtcQR(true);
  }

  const handleCloseBtcQR = () => {
    setOpenBtcQR(false);
  }

  const handleCloseBtcElectrum = () => {
    setOpenBtcElectrum(false);
  }

  const handleOpenAddressBook = async () => {
    setOpenBtcAddressBook(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setOpenBtcAddressBook(false);
  }

  const handleOpenBtcSend = () => {
    setBtcAmount(0);
    setBtcRecipient('');
    setBtcFee(100);
    setOpenBtcSend(true);
  }

  const validateCanSendBtc = () => {
    if (btcAmount <= 0 || null || !btcAmount) {
      return true;
    }
    if (btcRecipient.length < 34 || '') {
      return true;
    }
    return false;
  }

  const handleCloseBtcSend = () => {
    setBtcAmount(0);
    setBtcFee(0);
    setOpenBtcSend(false);
  }

  const changeCopyBtcStatus = async () => {
    setCopyBtcAddress('Copied !!!');
    await timeoutDelay(2000);
    setCopyBtcAddress('');
  }

  const changeCopyBtcTxHash = async () => {
    setCopyBtcTxHash('Copied !!!');
    await timeoutDelay(2000);
    setCopyBtcTxHash('');
  }

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number,) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeBtcFee = (_: Event, newValue: number | number[]) => {
    setBtcFee(newValue as number);
    setBtcAmount(0);
  };

  const handleCloseSendBtcSuccess = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendBtcSuccess(false);
  };

  const handleCloseSendBtcError = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendBtcError(false);
  };

  const getWalletInfoBtc = async () => {
    try {
      const response = await qortalRequest({
        action: "GET_USER_WALLET",
        coin: "BTC"
      });
      if (!response?.error) {
        setWalletInfoBtc(response);
      }
    } catch (error) {
      setWalletInfoBtc({});
      console.error("ERROR GET BTC WALLET INFO", error);
    }
  }

  React.useEffect(() => {
    if (!isAuthenticated) return;
    getWalletInfoBtc();
  }, [isAuthenticated]);

  const getWalletBalanceBtc = async () => {
    try {
      const response = await qortalRequestWithTimeout({
        action: "GET_WALLET_BALANCE",
        coin: 'BTC'
      }, 300000);
      if (!response?.error) {
        setWalletBalanceBtc(response);
        setIsLoadingWalletBalanceBtc(false);
      }
    } catch (error) {
      setWalletBalanceBtc(null);
      setIsLoadingWalletBalanceBtc(false);
      console.error("ERROR GET BTC BALANCE", error);
    }
  }

  React.useEffect(() => {
    if (!isAuthenticated) return;
    const intervalGetWalletBalanceBtc = setInterval(() => {
      getWalletBalanceBtc();
    }, 180000);
    getWalletBalanceBtc();
    return () => {
      clearInterval(intervalGetWalletBalanceBtc);
    }
  }, [isAuthenticated]);

  const getElectrumServersBtc = async () => {
    try {
      const response = await qortalRequest({
        action: "GET_CROSSCHAIN_SERVER_INFO",
        coin: "BTC"
      });
      if (!response?.error) {
        setAllElectrumServersBtc(response);
        let currentBtcServer = response.filter(function (item: { isCurrent: boolean; }) {
          return item.isCurrent === true;
        });
        setCurrentElectrumServerBtc(currentBtcServer);
      }
    } catch (error) {
      setAllElectrumServersBtc({});
      console.error("ERROR GET BTC SERVERS INFO", error);
    }
  }

  React.useEffect(() => {
    if (!isAuthenticated) return;
    getElectrumServersBtc();
  }, [isAuthenticated]);

  const handleOpenBtcElectrum = async () => {
    await getElectrumServersBtc();
    setOpenBtcElectrum(true);
  }

  const getTransactionsBtc = async () => {
    try {
      setIsLoadingBtcTransactions(true);
      const responseBtcAllAddresses = await qortalRequestWithTimeout({
        action: "GET_USER_WALLET_INFO",
        coin: "BTC",
      }, 120000);
      const responseBtcTransactions = await qortalRequestWithTimeout({
        action: "GET_USER_WALLET_TRANSACTIONS",
        coin: 'BTC'
      }, 300000);
      try {
        await responseBtcAllAddresses;
        if (!responseBtcAllAddresses?.error) {
          setAllWalletAddressesBtc(responseBtcAllAddresses);
        }
      } catch (error) {
        setAllWalletAddressesBtc([]);
        console.error("ERROR GET BTC ALL ADDRESSES", error);
      }
      await responseBtcTransactions;
      if (!responseBtcTransactions?.error) {
        setTransactionsBtc(responseBtcTransactions);
        setIsLoadingBtcTransactions(false);
      }
    } catch (error) {
      setIsLoadingBtcTransactions(false);
      setTransactionsBtc([]);
      console.error("ERROR GET BTC TRANSACTIONS", error);
    }
  }

  React.useEffect(() => {
    if (!isAuthenticated) return;
    getTransactionsBtc();
  }, [isAuthenticated]);

  const handleLoadingRefreshBtc = async () => {
    setLoadingRefreshBtc(true);
    await getTransactionsBtc();
    setLoadingRefreshBtc(false);
  }

  const handleSendMaxBtc = () => {
    const maxBtcAmount = parseFloat((walletBalanceBtc - ((btcFee * 1000) / 1e8)).toFixed(8));
    if (maxBtcAmount <= 0) {
      setBtcAmount(0);
    } else {
      setBtcAmount(maxBtcAmount);
    }
  }

  const BtcQrDialogPage = () => {
    return (
      <BtcQrDialog
        onClose={handleCloseBtcQR}
        aria-labelledby="btc-qr-code"
        open={openBtcQR}
        keepMounted={false}
      >
        <DialogTitle sx={{ m: 0, p: 2, fontSize: '12px' }} id="btc-qr-code">
          Address : {walletInfoBtc?.address}
        </DialogTitle>
        <DialogContent dividers>
          <div style={{ height: "auto", margin: "0 auto", maxWidth: 256, width: "100%" }}>
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={walletInfoBtc?.address}
              viewBox={`0 0 256 256`}
              fgColor={'#393939'}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseBtcQR}>
            CLOSE
          </Button>
        </DialogActions>
      </BtcQrDialog>
    );
  }

  const sendBtcRequest = async () => {
    setOpenTxBtcSubmit(true);
    const btcFeeCalculated = Number(btcFee / 1e8).toFixed(8);
    try {
      const sendRequest = await qortalRequest({
        action: "SEND_COIN",
        coin: "BTC",
        recipient: btcRecipient,
        amount: btcAmount,
        fee: btcFeeCalculated
      });
      if (!sendRequest?.error) {
        setBtcAmount(0);
        setBtcRecipient('');
        setBtcFee(100);
        setOpenTxBtcSubmit(false);
        setOpenSendBtcSuccess(true);
        setIsLoadingWalletBalanceBtc(true);
        await timeoutDelay(3000);
        getWalletBalanceBtc();
      }
    } catch (error) {
      setBtcAmount(0);
      setBtcRecipient('');
      setBtcFee(100);
      setOpenTxBtcSubmit(false);
      setOpenSendBtcError(true);
      setIsLoadingWalletBalanceBtc(true);
      await timeoutDelay(3000);
      getWalletBalanceBtc();
      console.error("ERROR SENDING BTC", error);
    }
  }

  const BtcSendDialogPage = () => {
    return (
      <Dialog
        fullScreen
        open={openBtcSend}
        onClose={handleCloseBtcSend}
        slots={{ transition: Transition }}
      >
        <BtcSubmittDialog
          fullWidth={true}
          maxWidth='xs'
          open={openTxBtcSubmit}
        >
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{
                width: "100%",
                display: 'flex',
                justifyContent: 'center'
              }}>
                <CircularProgress color="success" size={64} />
              </div>
              <div style={{
                width: "100%",
                display: 'flex',
                justifyContent: 'center',
                marginTop: '20px'
              }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 700 }}>
                  Processing Transaction Please Wait...
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
          onClose={handleCloseSendBtcSuccess}>
          <Alert
            onClose={handleCloseSendBtcSuccess}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            Sent BTC transaction was successful!
          </Alert>
        </Snackbar>
        <Snackbar open={openSendBtcError} autoHideDuration={4000} onClose={handleCloseSendBtcError}>
          <Alert
            onClose={handleCloseSendBtcError}
            severity="error"
            variant="filled"
            sx={{ width: '100%' }}
          >
            Something went wrong, please try again!
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
            <Avatar sx={{ width: 28, height: 28 }} alt="BTC Logo" src={coinLogoBTC} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1, display: { xs: 'none', sm: 'block', paddingLeft: '10px', paddingTop: '3px' }
              }}
            >
              Transfer BTC
            </Typography>
            <Button
              disabled={validateCanSendBtc()}
              variant="contained"
              startIcon={<Send />}
              aria-label="send-btc"
              onClick={sendBtcRequest}
              sx={{ backgroundColor: "#05a2e4", color: "white", "&:hover": { backgroundColor: "#02648d", } }}
            >
              SEND
            </Button>
          </Toolbar>
        </AppBar>
        <div style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '20px'
        }}>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            Available Balance:&nbsp;&nbsp;
          </Typography>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {isLoadingWalletBalanceBtc ? <Box sx={{ width: '175px' }}><LinearProgress /></Box> : walletBalanceBtc + " BTC"}
          </Typography>
        </div>
        <div style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '20px'
        }}>
          <Typography
            variant="h5"
            align="center"
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            Max Sendable:&nbsp;&nbsp;
          </Typography>
          <Typography
            variant="h5"
            align="center"
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {(() => {
              const newMaxBtcAmount = parseFloat((walletBalanceBtc - ((btcFee * 1000) / 1e8)).toFixed(8));
              if (newMaxBtcAmount < 0) {
                return Number(0.00000000) + " BTC"
              } else {
                return newMaxBtcAmount + " BTC"
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
              Send Max
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
              const maxBtcCoin = (walletBalanceBtc - (btcFee * 1000) / 1e8);
              const { formattedValue, floatValue } = values;
              return formattedValue === "" || floatValue <= maxBtcCoin;
            }}
            onValueChange={(values) => {
              setBtcAmount(values.floatValue);
            }}
            required
          />
          <TextField
            required
            label="Receiver Address"
            id="btc-address"
            margin="normal"
            value={btcRecipient}
            helperText="BTC address 34 characters long !"
            slotProps={{ htmlInput: { maxLength: 34, minLength: 34 } }}
            onChange={(e) => setBtcRecipient(e.target.value)}
          />
        </Box>
        <div style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '20px',
            flexDirection: 'column',
            width: '50ch'
          }}>
            <Typography id="btc-fee-slider" gutterBottom>
              Current fee per byte : {btcFee} SAT
            </Typography>
            <Slider
              track={false}
              step={5}
              min={20}
              max={150}
              valueLabelDisplay="auto"
              aria-labelledby="btc-fee-slider"
              getAriaValueText={valueTextBtc}
              defaultValue={100}
              marks={btcMarks}
              onChange={handleChangeBtcFee}
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
  }

  const tableLoader = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{
          width: "100%",
          display: 'flex',
          justifyContent: 'center'
        }}>
          <CircularProgress />
        </div>
        <div style={{
          width: "100%",
          display: 'flex',
          justifyContent: 'center',
          marginTop: '20px'
        }}>
          <Typography variant="h5" sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 700 }}>
            Loading Transactions Please Wait...
          </Typography>
        </div>
      </Box>
    );
  }

  const transactionsTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table stickyHeader sx={{ width: '100%' }} aria-label="transactions table" >
          <TableHead>
            <TableRow>
              <StyledTableCell align="left">Sender</StyledTableCell>
              <StyledTableCell align="left">Receiver</StyledTableCell>
              <StyledTableCell align="left">TX Hash</StyledTableCell>
              <StyledTableCell align="left">Total Amount</StyledTableCell>
              <StyledTableCell align="left">Time</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? transactionsBtc.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : transactionsBtc
            ).map((row: {
              inputs: { address: any; addressInWallet: boolean; }[];
              outputs: { address: any; addressInWallet: boolean; }[];
              txHash: string;
              totalAmount: any;
              timestamp: number;
            }, k: React.Key) => (
              <StyledTableRow key={k}>
                <StyledTableCell style={{ width: 'auto' }} align="left">
                  {(() => {
                    if (row?.totalAmount < 0) {
                      let meWasSenderOutputs = row?.outputs.filter(function (item: { addressInWallet: boolean; }) {
                        return item.addressInWallet === true;
                      });
                      if (meWasSenderOutputs[0]?.address) {
                        return <div style={{ color: '#05a2e4' }}>{meWasSenderOutputs[0]?.address}</div>;
                      } else {
                        let meWasSenderInputs = row?.inputs.filter(function (item: { addressInWallet: boolean; }) {
                          return item.addressInWallet === true;
                        });
                        return <div style={{ color: '#05a2e4' }}>{meWasSenderInputs[0]?.address}</div>;
                      }
                    } else {
                      let meWasNotSenderOutputs = row?.outputs.filter(function (item: { addressInWallet: boolean; }) {
                        return item.addressInWallet === false;
                      });
                      if (meWasNotSenderOutputs[0]?.address) {
                        return meWasNotSenderOutputs[0]?.address;
                      } else {
                        let meWasNotSenderInputs = row?.inputs.filter(function (item: { addressInWallet: boolean; }) {
                          return item.addressInWallet === false;
                        });
                        return meWasNotSenderInputs[0]?.address;
                      }
                    }
                  })()}
                </StyledTableCell>
                <StyledTableCell style={{ width: 'auto' }} align="left">
                  {(() => {
                    if (row?.totalAmount < 0) {
                      let meWasNotRecipientOutputs = row?.outputs.filter(function (item: { addressInWallet: boolean; }) {
                        return item.addressInWallet === false;
                      });
                      if (meWasNotRecipientOutputs[0]?.address) {
                        return meWasNotRecipientOutputs[0]?.address;
                      } else {
                        let meWasNotRecipientInputs = row?.inputs.filter(function (item: { addressInWallet: boolean; }) {
                          return item.addressInWallet === false;
                        });
                        return meWasNotRecipientInputs[0]?.address;
                      }
                    } else if (row?.totalAmount > 0) {
                      let meWasRecipientOutputs = row?.outputs.filter(function (item: { addressInWallet: boolean; }) {
                        return item.addressInWallet === true;
                      });
                      if (meWasRecipientOutputs[0]?.address) {
                        return <div style={{ color: '#05a2e4' }}>{meWasRecipientOutputs[0]?.address}</div>
                      } else {
                        let meWasRecipientInputs = row?.inputs.filter(function (item: { addressInWallet: boolean; }) {
                          return item.addressInWallet === true;
                        });
                        return <div style={{ color: '#05a2e4' }}>{meWasRecipientInputs[0]?.address}</div>
                      }
                    }
                  })()}
                </StyledTableCell>
                <StyledTableCell style={{ width: 'auto' }} align="left">
                  {cropString(row?.txHash)}
                  <CustomWidthTooltip placement="top" title={copyBtcTxHash ? copyBtcTxHash : "Copy Hash: " + row?.txHash}>
                    <IconButton aria-label="copy" size="small" onClick={() => { navigator.clipboard.writeText(row?.txHash), changeCopyBtcTxHash() }}>
                      <CopyAllTwoTone fontSize="small" />
                    </IconButton>
                  </CustomWidthTooltip>
                </StyledTableCell>
                <StyledTableCell style={{ width: 'auto' }} align="left">
                  {row?.totalAmount > 0 ?
                    <div style={{ color: '#66bb6a' }}>+{(Number(row?.totalAmount) / 1e8).toFixed(8)}</div> : <div style={{ color: '#f44336' }}>{(Number(row?.totalAmount) / 1e8).toFixed(8)}</div>
                  }
                </StyledTableCell>
                <StyledTableCell style={{ width: 'auto' }} align="left">
                  <CustomWidthTooltip placement="top" title={new Date(row?.timestamp).toLocaleString()}>
                    <div>{epochToAgo(row?.timestamp)}</div>
                  </CustomWidthTooltip>
                </StyledTableCell>
              </StyledTableRow>
            ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter sx={{ width: "100%" }}>
            <TableRow>
              <TablePagination
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
  }

  const setNewCurrentBtcServer = async (typeServer: string, hostServer: string, portServer: number) => {
    try {
      const setServer = await qortalRequest({
        action: "SET_CURRENT_FOREIGN_SERVER",
        coin: "BTC",
        type: typeServer,
        host: hostServer,
        port: portServer
      });
      if (!setServer?.error) {
        await getElectrumServersBtc();
        setOpenBtcElectrum(false);
        await getWalletBalanceBtc();
        await getTransactionsBtc();
      }
    } catch (error) {
      await getElectrumServersBtc();
      setOpenBtcElectrum(false);
      console.error("ERROR GET BTC SERVERS INFO", error);
    }
  }

  const BtcElectrumDialogPage = () => {
    return (
      <BtcElectrumDialog
        onClose={handleCloseBtcQR}
        aria-labelledby="btc-electrum-servers"
        open={openBtcElectrum}
        keepMounted={false}
      >
        <DialogTitle sx={{ m: 0, p: 2, fontSize: '14px' }} id="btc-electrum-servers">
          Available Bitcoin Electrum Servers.
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{
            width: '100%',
            maxWidth: 500,
            position: 'relative',
            overflow: 'auto',
            maxHeight: 400
          }}>
            <List>
              {(
                allElectrumServersBtc
              ).map((server: {
                connectionType: string;
                hostName: string;
                port: number;
              }, i: React.Key) => (
                <ListItemButton key={i} onClick={() => { setNewCurrentBtcServer(server?.connectionType, server?.hostName, server?.port) }}>
                  <ListItemText primary={server?.connectionType + "://" + server?.hostName + ':' + server?.port} key={i} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseBtcElectrum}>
            CLOSE
          </Button>
        </DialogActions>
      </BtcElectrumDialog>
    );
  }

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
            Coming soon...
          </Typography>
        </DialogContent>
      </DialogGeneral>
    );
  }

  return (
    <Box sx={{ width: '100%', marginTop: "20px" }}>
      {BtcSendDialogPage()}
      {BtcQrDialogPage()}
      {BtcElectrumDialogPage()}
      {BtcAddressBookDialogPage()}
      <Typography gutterBottom variant="h5" sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 700 }}>
        Bitcoin Wallet
      </Typography>
      <WalleteCard>
        <CoinAvatar
          src={coinLogoBTC}
          alt="Coinlogo"
        />
        <div style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            Balance:&nbsp;&nbsp;
          </Typography>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {walletBalanceBtc ? walletBalanceBtc + " BTC" : <Box sx={{ width: '175px' }}><LinearProgress /></Box>}
          </Typography>
        </div>
        <div style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            Address:&nbsp;&nbsp;
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {walletInfoBtc?.address}
          </Typography>
          <Tooltip placement="right" title={copyBtcAddress ? copyBtcAddress : "Copy Address"}>
            <IconButton aria-label="copy" size="small" onClick={() => { navigator.clipboard.writeText(walletInfoBtc?.address), changeCopyBtcStatus() }}>
              <CopyAllTwoTone fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
        <div style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            Electrum Server:&nbsp;&nbsp;
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {currentElectrumServerBtc[0]?.hostName ? currentElectrumServerBtc[0]?.hostName + ":" + currentElectrumServerBtc[0]?.port : <Box sx={{ width: '175px' }}><LinearProgress /></Box>}
          </Typography>
          <Tooltip placement="right" title="Change Server">
            <IconButton aria-label="open-electrum" size="small" onClick={handleOpenBtcElectrum}>
              <PublishedWithChangesTwoTone fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: "15px"
        }}>
          <WalletButtons
            loading={isLoadingWalletBalanceBtc}
            loadingPosition="start"
            variant="contained"
            startIcon={<Send style={{ marginBottom: '2px' }} />}
            aria-label="transfer"
            onClick={handleOpenBtcSend}
          >
            Tranfer BTC
          </WalletButtons>
          <div style={{ marginLeft: '20px' }} />
          <WalletButtons
            variant="contained"
            startIcon={<QrCode2 style={{ marginBottom: '2px' }} />}
            aria-label="QRcode"
            onClick={handleOpenBtcQR}
          >
            Show QR Code
          </WalletButtons>
          <div style={{ marginLeft: '20px' }} />
          <WalletButtons
            variant="contained"
            startIcon={<ImportContacts style={{ marginBottom: '2px' }} />}
            aria-label="book"
            onClick={handleOpenAddressBook}
          >
            Address Book
          </WalletButtons>
        </div>
        <div style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" paddingTop={2} paddingBottom={2}>
            Transactions:
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
            Refresh
          </Button>
        </div>
        {isLoadingBtcTransactions ? tableLoader() : transactionsTable()}
      </WalleteCard>
    </Box>
  );
}