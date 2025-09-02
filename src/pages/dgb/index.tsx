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
import coinLogoDGB from '../../assets/dgb.png';

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

const DgbQrDialog = styled(Dialog)(({ theme }) => ({
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

const DgbSubmittDialog = styled(Dialog)(({ theme }) => ({
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
  const { isAuthenticated } = React.useContext(WalletContext);

  if (!isAuthenticated) {
    return (
      <Alert variant="filled" severity="error">
        You must sign in, to use the Digibyte wallet.
      </Alert>
    );
  }

  const [walletInfoDgb, setWalletInfoDgb] = React.useState<any>({});
  const [walletBalanceDgb, setWalletBalanceDgb] = React.useState<any>(null);
  const [isLoadingWalletBalanceDgb, setIsLoadingWalletBalanceDgb] = React.useState<boolean>(true);
  const [transactionsDgb, setTransactionsDgb] = React.useState<any>([]);
  const [isLoadingDgbTransactions, setIsLoadingDgbTransactions] = React.useState<boolean>(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [copyDgbAddress, setCopyDgbAddress] = React.useState('');
  const [copyDgbTxHash, setCopyDgbTxHash] = React.useState('');
  const [openDgbQR, setOpenDgbQR] = React.useState(false);
  const [openDgbSend, setOpenDgbSend] = React.useState(false);
  const [dgbAmount, setDgbAmount] = React.useState<number>(0);
  const [dgbRecipient, setDgbRecipient] = React.useState('');
  const [addressFormatError, setAddressFormatError] = React.useState(false);
  const [dgbFee, setDgbFee] = React.useState<number>(0);
  const [loadingRefreshDgb, setLoadingRefreshDgb] = React.useState(false);
  const [openTxDgbSubmit, setOpenTxDgbSubmit] = React.useState(false);
  const [openSendDgbSuccess, setOpenSendDgbSuccess] = React.useState(false);
  const [openSendDgbError, setOpenSendDgbError] = React.useState(false);
  const [openDgbAddressBook, setOpenDgbAddressBook] = React.useState(false);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - transactionsDgb.length) : 0;

  const handleOpenDgbQR = () => {
    setOpenDgbQR(true);
  }

  const handleCloseDgbQR = () => {
    setOpenDgbQR(false);
  }

  const handleOpenAddressBook = async () => {
    setOpenDgbAddressBook(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setOpenDgbAddressBook(false);
  }

  const handleOpenDgbSend = () => {
    setDgbAmount(0);
    setDgbRecipient('');
    setDgbFee(10);
    setOpenDgbSend(true);
  }

  const validateCanSendDgb = () => {
    if (dgbAmount <= 0 || null || !dgbAmount) {
      return true;
    }
    if (dgbRecipient.length < 34 || '') {
      return true;
    }
    return false;
  }

    const handleRecipientChange = (e) => {
        const value = e.target.value;
        const pattern = /^(D[1-9A-HJ-NP-Za-km-z]{33}|S[1-9A-HJ-NP-Za-km-z]{33}|dgb1[2-9A-HJ-NP-Za-z]{39})$/

        setDgbRecipient(value);

        if( pattern.test(value) || value === '') {
            setAddressFormatError(false);
        }
        else {
            setAddressFormatError(true);
        }
    };

    const handleCloseDgbSend = () => {
    setDgbAmount(0);
    setDgbFee(0);
    setOpenDgbSend(false);
  }

  const changeCopyDgbStatus = async () => {
    setCopyDgbAddress('Copied');
    await timeoutDelay(2000);
    setCopyDgbAddress('');
  }

  const changeCopyDgbTxHash = async () => {
    setCopyDgbTxHash('Copied');
    await timeoutDelay(2000);
    setCopyDgbTxHash('');
  }

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number,) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDgbFee = (_: Event, newValue: number | number[]) => {
    setDgbFee(newValue as number);
    setDgbAmount(0);
  };

  const handleCloseSendDgbSuccess = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendDgbSuccess(false);
  };

  const handleCloseSendDgbError = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendDgbError(false);
  };

  const getWalletInfoDgb = async () => {
    try {
      const response = await qortalRequest({
        action: "GET_USER_WALLET",
        coin: "DGB"
      });
      if (!response?.error) {
        setWalletInfoDgb(response);
      }
    } catch (error) {
      setWalletInfoDgb({});
      console.error("ERROR GET DGB WALLET INFO", error);
    }
  }

  React.useEffect(() => {
    if (!isAuthenticated) return;
    getWalletInfoDgb();
  }, [isAuthenticated]);

  const getWalletBalanceDgb = async () => {
    try {
      const response = await qortalRequestWithTimeout({
        action: "GET_WALLET_BALANCE",
        coin: 'DGB'
      }, 300000);
      if (!response?.error) {
        setWalletBalanceDgb(response);
        setIsLoadingWalletBalanceDgb(false);
      }
    } catch (error) {
      setWalletBalanceDgb(null);
      setIsLoadingWalletBalanceDgb(false);
      console.error("ERROR GET DGB BALANCE", error);
    }
  }

  React.useEffect(() => {
    if (!isAuthenticated) return;
    const intervalGetWalletBalanceDgb = setInterval(() => {
      getWalletBalanceDgb();
    }, 180000);
    getWalletBalanceDgb();
    return () => {
      clearInterval(intervalGetWalletBalanceDgb);
    }
  }, [isAuthenticated]);

  const getTransactionsDgb = async () => {
    try {
      setIsLoadingDgbTransactions(true);
      
      const responseDgbTransactions = await qortalRequestWithTimeout({
        action: "GET_USER_WALLET_TRANSACTIONS",
        coin: 'DGB'
      }, 300000);
     
      if (!responseDgbTransactions?.error) {
        setTransactionsDgb(responseDgbTransactions);
        setIsLoadingDgbTransactions(false);
      }
    } catch (error) {
      setIsLoadingDgbTransactions(false);
      setTransactionsDgb([]);
      console.error("ERROR GET DGB TRANSACTIONS", error);
    }
  }

  React.useEffect(() => {
    if (!isAuthenticated) return;
    getTransactionsDgb();
  }, [isAuthenticated]);

  const handleLoadingRefreshDgb = async () => {
    setLoadingRefreshDgb(true);
    await getTransactionsDgb();
    setLoadingRefreshDgb(false);
  }

  const handleSendMaxDgb = () => {
    const maxDgbAmount = parseFloat((walletBalanceDgb - ((dgbFee * 1000) / 1e8)).toFixed(8));
    if (maxDgbAmount <= 0) {
      setDgbAmount(0);
    } else {
      setDgbAmount(maxDgbAmount);
    }
  }

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
          <div style={{ height: "auto", margin: "0 auto", maxWidth: 256, width: "100%" }}>
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={walletInfoDgb?.address}
              viewBox={`0 0 256 256`}
              fgColor={'#393939'}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseDgbQR}>
            CLOSE
          </Button>
        </DialogActions>
      </DgbQrDialog>
    );
  }

  const sendDgbRequest = async () => {
    setOpenTxDgbSubmit(true);
    const dgbFeeCalculated = Number(dgbFee / 1e8).toFixed(8);
    try {
      const sendRequest = await qortalRequest({
        action: "SEND_COIN",
        coin: "DGB",
        recipient: dgbRecipient,
        amount: dgbAmount,
        fee: dgbFeeCalculated
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
      console.error("ERROR SENDING DGB", error);
    }
  }

  const DgbSendDialogPage = () => {
    return (
      <Dialog
        fullScreen
        open={openDgbSend}
        onClose={handleCloseDgbSend}
        slots={{ transition: Transition }}
      >
        <DgbSubmittDialog
          fullWidth={true}
          maxWidth='xs'
          open={openTxDgbSubmit}
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
        </DgbSubmittDialog>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={openSendDgbSuccess}
          autoHideDuration={4000}
          slots={{ transition: SlideTransition }}
          onClose={handleCloseSendDgbSuccess}>
          <Alert
            onClose={handleCloseSendDgbSuccess}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            Sent DGB transaction was successful.
          </Alert>
        </Snackbar>
        <Snackbar open={openSendDgbError} autoHideDuration={4000} onClose={handleCloseSendDgbError}>
          <Alert
            onClose={handleCloseSendDgbError}
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
              onClick={handleCloseDgbSend}
              aria-label="close"
            >
              <Close />
            </IconButton>
            <Avatar sx={{ width: 28, height: 28 }} alt="DGB Logo" src={coinLogoDGB} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1, display: { xs: 'none', sm: 'block', paddingLeft: '10px', paddingTop: '3px' }
              }}
            >
              Transfer DGB
            </Typography>
            <Button
              disabled={validateCanSendDgb()}
              variant="contained"
              startIcon={<Send />}
              aria-label="send-dgb"
              onClick={sendDgbRequest}
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
            {isLoadingWalletBalanceDgb ? <Box sx={{ width: '175px' }}><LinearProgress /></Box> : walletBalanceDgb + " DGB"}
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
              const newMaxDgbAmount = parseFloat((walletBalanceDgb - ((dgbFee * 1000) / 1e8)).toFixed(8));
              if (newMaxDgbAmount < 0) {
                return Number(0.00000000) + " DGB"
              } else {
                return newMaxDgbAmount + " DGB"
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
            value={dgbAmount}
            allowNegative={false}
            customInput={TextField}
            valueIsNumericString
            variant="outlined"
            label="Amount (DGB)"
            isAllowed={(values) => {
              const maxDgbCoin = (walletBalanceDgb - (dgbFee * 1000) / 1e8);
              const { formattedValue, floatValue } = values;
              return formattedValue === "" || floatValue <= maxDgbCoin;
            }}
            onValueChange={(values) => {
              setDgbAmount(values.floatValue);
            }}
            required
          />
          <TextField
            required
            label="Receiver Address"
            id="dgb-address"
            margin="normal"
            value={dgbRecipient}
            onChange={handleRecipientChange}
            error={addressFormatError}
            helperText={addressFormatError ? 'Invalid DGB address' : 'DGB addresses should be 34 characters long for BIP44 (D prefix) and BIP49 (S prefix) or 43 characters long for BIP84 (dgb1 prefix).'}
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
              ? transactionsDgb.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : transactionsDgb
            ).map((row: {
              inputs: { address: any; addressInWallet: boolean; amount: any; }[];
              outputs: { address: any; addressInWallet: boolean; amount: any;}[];
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
                  <CustomWidthTooltip placement="top" title={copyDgbTxHash ? copyDgbTxHash : "Copy Hash: " + row?.txHash}>
                    <IconButton aria-label="copy" size="small" onClick={() => { navigator.clipboard.writeText(row?.txHash), changeCopyDgbTxHash() }}>
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
  }

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
            Coming soon...
          </Typography>
        </DialogContent>
      </DialogGeneral>
    );
  }

  return (
    <Box sx={{ width: '100%', marginTop: "20px" }}>
      {DgbSendDialogPage()}
      {DgbQrDialogPage()}
      {DgbAddressBookDialogPage()}
      <Typography gutterBottom variant="h5" sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 700 }}>
        Digibyte Wallet
      </Typography>
      <WalleteCard>
        <CoinAvatar
          src={coinLogoDGB}
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
            {walletBalanceDgb ? walletBalanceDgb + " DGB" : <Box sx={{ width: '175px' }}><LinearProgress /></Box>}
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
            {walletInfoDgb?.address}
          </Typography>
          <Tooltip placement="right" title={copyDgbAddress ? copyDgbAddress : "Copy Address"}>
            <IconButton aria-label="copy" size="small" onClick={() => { navigator.clipboard.writeText(walletInfoDgb?.address), changeCopyDgbStatus() }}>
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
            loading={isLoadingWalletBalanceDgb}
            loadingPosition="start"
            variant="contained"
            startIcon={<Send style={{ marginBottom: '2px' }} />}
            aria-label="transfer"
            onClick={handleOpenDgbSend}
          >
            Transfer DGB
          </WalletButtons>
          <WalletButtons
            variant="contained"
            startIcon={<QrCode2 style={{ marginBottom: '2px' }} />}
            aria-label="QRcode"
            onClick={handleOpenDgbQR}
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
            onClick={handleLoadingRefreshDgb}
            loading={loadingRefreshDgb}
            loadingPosition="start"
            startIcon={<Refresh />}
            variant="outlined"
            style={{ borderRadius: 50 }}
          >
            Refresh
          </Button>
        </div>
        {isLoadingDgbTransactions ? tableLoader() : transactionsTable()}
      </WalleteCard>
    </Box>
  );
}
