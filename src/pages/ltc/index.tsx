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
import coinLogoLTC from '../../assets/ltc.png';
import { useRecommendedFees } from '../../hooks/useRecommendedFees';
import { CoinActionContainer, CoinActionRow, CustomLabel, HeaderRow } from '../../styles/Fees-styles';
import { FeeManager } from '../../components/FeeManager';

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

const LtcQrDialog = styled(Dialog)(({ theme }) => ({
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

const LtcSubmittDialog = styled(Dialog)(({ theme }) => ({
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

const ltcMarks = [
  {
    value: 10,
    label: 'MIN',
  },
  {
    value: 30,
    label: 'DEF',
  },
  {
    value: 100,
    label: 'MAX',
  },
];

function valueTextLtc(value: number) {
  return `${value} SAT`;
}

export default function LitecoinWallet() {
  const { isAuthenticated } = React.useContext(WalletContext);

  if (!isAuthenticated) {
    return (
      <Alert variant="filled" severity="error">
        You must sign in, to use the Litecoin wallet.
      </Alert>
    );
  }

  const [walletInfoLtc, setWalletInfoLtc] = React.useState<any>({});
  const [walletBalanceLtc, setWalletBalanceLtc] = React.useState<any>(null);
  const [isLoadingWalletBalanceLtc, setIsLoadingWalletBalanceLtc] = React.useState<boolean>(true);
  const [transactionsLtc, setTransactionsLtc] = React.useState<any>([]);
  const [isLoadingLtcTransactions, setIsLoadingLtcTransactions] = React.useState<boolean>(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [copyLtcAddress, setCopyLtcAddress] = React.useState('');
  const [copyLtcTxHash, setCopyLtcTxHash] = React.useState('');
  const [openLtcQR, setOpenLtcQR] = React.useState(false);
  const [openLtcSend, setOpenLtcSend] = React.useState(false);
  const [ltcAmount, setLtcAmount] = React.useState<number>(0);
  const [ltcRecipient, setLtcRecipient] = React.useState('');
  const [addressFormatError, setAddressFormatError] = React.useState(false);

  const [loadingRefreshLtc, setLoadingRefreshLtc] = React.useState(false);
  const [openTxLtcSubmit, setOpenTxLtcSubmit] = React.useState(false);
  const [openSendLtcSuccess, setOpenSendLtcSuccess] = React.useState(false);
  const [openSendLtcError, setOpenSendLtcError] = React.useState(false);
  const [openLtcAddressBook, setOpenLtcAddressBook] = React.useState(false);
  const [inputFee, setInputFee] = React.useState(0)
 
 const ltcFeeCalculated = +(+inputFee / 1000 / 1e8).toFixed(8)
 const estimatedFeeCalculated = +ltcFeeCalculated * 1000

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - transactionsLtc.length) : 0;

  const handleOpenLtcQR = () => {
    setOpenLtcQR(true);
  }

  const handleCloseLtcQR = () => {
    setOpenLtcQR(false);
  }

  const handleOpenAddressBook = async () => {
    setOpenLtcAddressBook(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setOpenLtcAddressBook(false);
  }

  const handleOpenLtcSend = () => {
    setLtcAmount(0);
    setLtcRecipient('');

    setOpenLtcSend(true);
  }

  const validateCanSendLtc = () => {
    if (ltcAmount <= 0 || null || !ltcAmount) {
      return true;
    }
    if (addressFormatError || '') {
      return true;
    }
    return false;
  }

    const handleRecipientChange = (e) => {
        const value = e.target.value;
        const pattern = /^(L[1-9A-HJ-NP-Za-km-z]{33}|M[1-9A-HJ-NP-Za-km-z]{33}|ltc1[2-9A-HJ-NP-Za-z]{39})$/

        setLtcRecipient(value);

        if( pattern.test(value) || value === '') {
            setAddressFormatError(false);
        }
        else {
            setAddressFormatError(true);
        }
    };

    const handleCloseLtcSend = () => {
    setLtcAmount(0);
    
    setOpenLtcSend(false);
  }

  const changeCopyLtcStatus = async () => {
    setCopyLtcAddress('Copied');
    await timeoutDelay(2000);
    setCopyLtcAddress('');
  }

  const changeCopyLtcTxHash = async () => {
    setCopyLtcTxHash('Copied');
    await timeoutDelay(2000);
    setCopyLtcTxHash('');
  }

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number,) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSendLtcSuccess = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendLtcSuccess(false);
  };

  const handleCloseSendLtcError = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendLtcError(false);
  };

  const getWalletInfoLtc = async () => {
    try {
      const response = await qortalRequest({
        action: "GET_USER_WALLET",
        coin: "LTC"
      });
      if (!response?.error) {
        setWalletInfoLtc(response);
      }
    } catch (error) {
      setWalletInfoLtc({});
      console.error("ERROR GET LTC WALLET INFO", error);
    }
  }

  React.useEffect(() => {
    if (!isAuthenticated) return;
    getWalletInfoLtc();
  }, [isAuthenticated]);

  const getWalletBalanceLtc = async () => {
    try {
      const response = await qortalRequestWithTimeout({
        action: "GET_WALLET_BALANCE",
        coin: 'LTC'
      }, 300000);
      if (!response?.error) {
        setWalletBalanceLtc(response);
        setIsLoadingWalletBalanceLtc(false);
      }
    } catch (error) {
      setWalletBalanceLtc(null);
      setIsLoadingWalletBalanceLtc(false);
      console.error("ERROR GET LTC BALANCE", error);
    }
  }

  React.useEffect(() => {
    if (!isAuthenticated) return;
    const intervalGetWalletBalanceLtc = setInterval(() => {
      getWalletBalanceLtc();
    }, 180000);
    getWalletBalanceLtc();
    return () => {
      clearInterval(intervalGetWalletBalanceLtc);
    }
  }, [isAuthenticated]);


  const getTransactionsLtc = async () => {
    try {
      setIsLoadingLtcTransactions(true);

      const responseLtcTransactions = await qortalRequestWithTimeout({
        action: "GET_USER_WALLET_TRANSACTIONS",
        coin: 'LTC'
      }, 300000);
     
      if (!responseLtcTransactions?.error) {
        setTransactionsLtc(responseLtcTransactions);
        setIsLoadingLtcTransactions(false);
      }
    } catch (error) {
      setIsLoadingLtcTransactions(false);
      setTransactionsLtc([]);
      console.error("ERROR GET LTC TRANSACTIONS", error);
    }
  }

  React.useEffect(() => {
    if (!isAuthenticated) return;
    getTransactionsLtc();
  }, [isAuthenticated]);

  const handleLoadingRefreshLtc = async () => {
    setLoadingRefreshLtc(true);
    await getTransactionsLtc();
    setLoadingRefreshLtc(false);
  }

  const handleSendMaxLtc = () => {
    const maxLtcAmount = +walletBalanceLtc - estimatedFeeCalculated
    if (maxLtcAmount <= 0) {
      setLtcAmount(0);
    } else {
      setLtcAmount(maxLtcAmount);
    }
  }

  const LtcQrDialogPage = () => {
    return (
      <LtcQrDialog
        onClose={handleCloseLtcQR}
        aria-labelledby="ltc-qr-code"
        open={openLtcQR}
        keepMounted={false}
      >
        <DialogTitle sx={{ m: 0, p: 2, fontSize: '12px' }} id="ltc-qr-code">
          Address : {walletInfoLtc?.address}
        </DialogTitle>
        <DialogContent dividers>
          <div style={{ height: "auto", margin: "0 auto", maxWidth: 256, width: "100%" }}>
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={walletInfoLtc?.address}
              viewBox={`0 0 256 256`}
              fgColor={'#393939'}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseLtcQR}>
            CLOSE
          </Button>
        </DialogActions>
      </LtcQrDialog>
    );
  }

  const sendLtcRequest = async () => {
    if(!ltcFeeCalculated) return
    setOpenTxLtcSubmit(true);

    try {
      const sendRequest = await qortalRequest({
        action: "SEND_COIN",
        coin: "LTC",
        recipient: ltcRecipient,
        amount: ltcAmount,
        fee: ltcFeeCalculated
      });
      if (!sendRequest?.error) {
        setLtcAmount(0);
        setLtcRecipient('');

        setOpenTxLtcSubmit(false);
        setOpenSendLtcSuccess(true);
        setIsLoadingWalletBalanceLtc(true);
        await timeoutDelay(3000);
        getWalletBalanceLtc();
      }
    } catch (error) {
      setLtcAmount(0);
      setLtcRecipient('');

      setOpenTxLtcSubmit(false);
      setOpenSendLtcError(true);
      setIsLoadingWalletBalanceLtc(true);
      await timeoutDelay(3000);
      getWalletBalanceLtc();
      console.error("ERROR SENDING LTC", error);
    }
  }

  const LtcSendDialogPage = () => {
    return (
      <Dialog
        fullScreen
        open={openLtcSend}
        onClose={handleCloseLtcSend}
        slots={{ transition: Transition }}
      >
        <LtcSubmittDialog
          fullWidth={true}
          maxWidth='xs'
          open={openTxLtcSubmit}
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
        </LtcSubmittDialog>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={openSendLtcSuccess}
          autoHideDuration={4000}
          slots={{ transition: SlideTransition }}
          onClose={handleCloseSendLtcSuccess}>
          <Alert
            onClose={handleCloseSendLtcSuccess}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            Sent LTC transaction was successful.
          </Alert>
        </Snackbar>
        <Snackbar open={openSendLtcError} autoHideDuration={4000} onClose={handleCloseSendLtcError}>
          <Alert
            onClose={handleCloseSendLtcError}
            severity="error"
            variant="filled"
            sx={{ width: '100%' }}
          >
            Something went wrong, please try again.
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
            <Avatar sx={{ width: 28, height: 28 }} alt="LTC Logo" src={coinLogoLTC} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1, display: { xs: 'none', sm: 'block', paddingLeft: '10px', paddingTop: '3px' }
              }}
            >
              Transfer LTC
            </Typography>
            <Button
              disabled={validateCanSendLtc()}
              variant="contained"
              startIcon={<Send />}
              aria-label="send-ltc"
              onClick={sendLtcRequest}
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
            {isLoadingWalletBalanceLtc ? <Box sx={{ width: '175px' }}><LinearProgress /></Box> : walletBalanceLtc + " LTC"}
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
              const newMaxLtcAmount = +walletBalanceLtc - estimatedFeeCalculated
              if (newMaxLtcAmount < 0) {
                return Number(0.00000000) + " LTC"
              } else {
                return newMaxLtcAmount + " LTC"
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
            value={ltcAmount}
            allowNegative={false}
            customInput={TextField}
            valueIsNumericString
            variant="outlined"
            label="Amount (LTC)"
            isAllowed={(values) => {
              const maxLtcCoin = +walletBalanceLtc - estimatedFeeCalculated
              const { formattedValue, floatValue } = values;
              return formattedValue === "" || floatValue <= maxLtcCoin;
            }}
            onValueChange={(values) => {
              setLtcAmount(values.floatValue);
            }}
            required
          />
          <TextField
            required
            label="Receiver Address"
            id="ltc-address"
            margin="normal"
            value={ltcRecipient}
            onChange={handleRecipientChange}
            error={addressFormatError}
            helperText={addressFormatError ? 'Invalid LTC address' : 'LTC addresses should be 34 characters long for BIP44 (L prefix) and BIP49 (M prefix) or 43 characters long for BIP84 (ltc1 prefix).'}
          />
        </Box>
       <FeeManager coin='LTC' onChange={setInputFee} />
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
              <StyledTableCell align="left">Fee</StyledTableCell>
              <StyledTableCell align="left">Time</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? transactionsLtc.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : transactionsLtc
            )?.map((row: {
              inputs: { address: any; addressInWallet: boolean; amount: number;}[];
              outputs: { address: any; addressInWallet: boolean; amount: number;}[];
              txHash: string;
              totalAmount: any;
              feeAmount: any;
              timestamp: number;
            }, k: React.Key) => (
              <StyledTableRow key={k}>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row.inputs.map((input, index) => (
                          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', color: input.addressInWallet ? undefined : 'grey'  }}>
                                <span style={{ flex: 1, textAlign: 'left' }}>{input.address}</span>
                                <span style={{ flex: 1, textAlign: 'right' }}>{(Number(input.amount) / 1e8).toFixed(8)}</span>
                          </div>
                      ))}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row.outputs.map((output, index) => (
                          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', color: output.addressInWallet ? undefined : 'grey'  }}>
                              <span style={{ flex: 1, textAlign: 'left' }}>{output.address}</span>
                              <span style={{ flex: 1, textAlign: 'right' }}>{(Number(output.amount) / 1e8).toFixed(8)}</span>
                          </div>
                      ))}
                  </StyledTableCell>
                <StyledTableCell style={{ width: 'auto' }} align="left">
                  {cropString(row?.txHash)}
                  <CustomWidthTooltip placement="top" title={copyLtcTxHash ? copyLtcTxHash : "Copy Hash: " + row?.txHash}>
                    <IconButton aria-label="copy" size="small" onClick={() => { navigator.clipboard.writeText(row?.txHash), changeCopyLtcTxHash() }}>
                      <CopyAllTwoTone fontSize="small" />
                    </IconButton>
                  </CustomWidthTooltip>
                </StyledTableCell>
                <StyledTableCell style={{ width: 'auto' }} align="left">
                  {row?.totalAmount > 0 ?
                    <div style={{ color: '#66bb6a' }}>+{(Number(row?.totalAmount) / 1e8).toFixed(8)}</div> : <div style={{ color: '#f44336' }}>{(Number(row?.totalAmount) / 1e8).toFixed(8)}</div>
                  }
                </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="right">
                      {row?.totalAmount <= 0 ?
                          <div style={{ color: '#f44336' }}>-{(Number(row?.feeAmount) / 1e8).toFixed(8)}</div>
                          :
                          <div style={{ color: 'grey' }}>-{(Number(row?.feeAmount) / 1e8).toFixed(8)}</div>
                      }
                </StyledTableCell>
                <StyledTableCell style={{ width: 'auto' }} align="left">
                  <CustomWidthTooltip placement="top" title={row?.timestamp ? new Date(row?.timestamp).toLocaleString() : "Waiting for Confirmation"}>
                    <div>{row?.timestamp ? epochToAgo(row?.timestamp) : "UNCONFIRMED"}</div>
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
  }

  const LtcAddressBookDialogPage = () => {
    return (
      <DialogGeneral
        aria-labelledby="btc-electrum-servers"
        open={openLtcAddressBook}
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
      {LtcSendDialogPage()}
      {LtcQrDialogPage()}
      {LtcAddressBookDialogPage()}
      <Typography gutterBottom variant="h5" sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 700 }}>
        Litecoin Wallet
      </Typography>
      <WalleteCard>
        <CoinAvatar
          src={coinLogoLTC}
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
            {walletBalanceLtc ? walletBalanceLtc + " LTC" : <Box sx={{ width: '175px' }}><LinearProgress /></Box>}
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
            {walletInfoLtc?.address}
          </Typography>
          <Tooltip placement="right" title={copyLtcAddress ? copyLtcAddress : "Copy Address"}>
            <IconButton aria-label="copy" size="small" onClick={() => { navigator.clipboard.writeText(walletInfoLtc?.address), changeCopyLtcStatus() }}>
              <CopyAllTwoTone fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
        <div style={{
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          marginTop: '15px'
        }}>
          <WalletButtons
            loading={isLoadingWalletBalanceLtc}
            loadingPosition="start"
            variant="contained"
            startIcon={<Send style={{ marginBottom: '2px' }} />}
            aria-label="transfer"
            onClick={handleOpenLtcSend}
          >
            Transfer LTC
          </WalletButtons>
          <WalletButtons
            variant="contained"
            startIcon={<QrCode2 style={{ marginBottom: '2px' }} />}
            aria-label="QRcode"
            onClick={handleOpenLtcQR}
          >
            Show QR Code
          </WalletButtons>
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
            onClick={handleLoadingRefreshLtc}
            loading={loadingRefreshLtc}
            loadingPosition="start"
            startIcon={<Refresh />}
            variant="outlined"
            style={{ borderRadius: 50 }}
          >
            Refresh
          </Button>
        </div>
        {isLoadingLtcTransactions ? tableLoader() : transactionsTable()}
      </WalleteCard>
    </Box>
  );
}
