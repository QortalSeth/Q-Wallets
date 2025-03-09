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
  Paper,
  Slide,
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
import { TransitionProps } from '@mui/material/transitions';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import QRCode from 'react-qr-code';
import { FaRegPaperPlane, FaBook, FaQrcode } from 'react-icons/fa6';
import {
  FirstPage,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPage,
  CopyAllTwoTone,
  Close,
  Send
} from '@mui/icons-material';
import coinLogoLTC from '../../assets/ltc.png';

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

const LtcQrDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
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
  width: "20%",
  marginTop: "16px",
  backgroundColor: "#05a2e4",
  color: "white",
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
    console.log("WE ARE NOT LOGGED IN");
    return (
      <Alert variant="filled" severity="error">
        You must sign in, to use the Litecoin wallet !!!
      </Alert>
    );
  }

  const [walletInfoLtc, setWalletInfoLtc] = React.useState<any>({});
  const [walletBalanceLtc, setWalletBalanceLtc] = React.useState<any>(null);
  const [isLoadingWalletBalanceLtc, setIsLoadingWalletBalanceLtc] = React.useState<boolean>(true);
  const [allWalletAddressesLtc, setAllWalletAddressesLtc] = React.useState<any>([]);
  const [transactionsLtc, setTransactionsLtc] = React.useState<any>([]);
  const [isLoadingLtcTransactions, setIsLoadingLtcTransactions] = React.useState<boolean>(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [copyLtcAddress, setCopyLtcAddress] = React.useState('');
  const [copyLtcTxHash, setCopyLtcTxHash] = React.useState('');
  const [openLtcQR, setOpenLtcQR] = React.useState(false);
  const [openLtcSend, setOpenLtcSend] = React.useState(false);
  const [amountLtc, setAmountLtc] = React.useState<number>(0);
  const [feeLtc, setFeeLtc] = React.useState<number>(0);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - transactionsLtc.length) : 0;

  const handleOpenLtcQR = () => {
    setOpenLtcQR(true);
  }

  const handleCloseLtcQR = () => {
    setOpenLtcQR(false);
  }

  const handleOpenLtcSend = () => {
    setAmountLtc(0);
    setFeeLtc(30);
    setOpenLtcSend(true);
  }

  const handleCloseLtcSend = () => {
    setAmountLtc(0);
    setFeeLtc(0);
    setOpenLtcSend(false);
  }

  const changeCopyLtcStatus = async () => {
    setCopyLtcAddress('Copied !!!');
    await timeoutDelay(2000);
    setCopyLtcAddress('');
  }

  const changeCopyLtcTxHash = async () => {
    setCopyLtcTxHash('Copied !!!');
    await timeoutDelay(2000);
    setCopyLtcTxHash('');
  }

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number,) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeLtcAmount = (_: Event, newValue: number | number[]) => {
    setAmountLtc(newValue as number);
  };

  const handleChangeLtcFee = (_: Event, newValue: number | number[]) => {
    setFeeLtc(newValue as number);
  };

  const getWalletInfoLtc = async () => {
    try {
      const response = await qortalRequest({
        action: "GET_USER_WALLET",
        coin: "LTC"
      });
      if (!response?.error) {
        setWalletInfoLtc(response);
        console.log("GET LTC WALLET INFO", response);
      }
    } catch (error) {
      setWalletInfoLtc({});
      console.log("ERROR GET LTC WALLET INFO", error);
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
        console.log("GET LTC BALANCE", response);
      }
    } catch (error) {
      setWalletBalanceLtc(null);
      setIsLoadingWalletBalanceLtc(false);
      console.log("ERROR GET LTC BALANCE", error);
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
      const responseLtcAllAddresses = await qortalRequestWithTimeout({
        action: "GET_USER_WALLET_INFO",
        coin: "LTC",
      }, 120000);
      const responseLtcTransactions = await qortalRequestWithTimeout({
        action: "GET_USER_WALLET_TRANSACTIONS",
        coin: 'LTC'
      }, 300000);
      try {
        await responseLtcAllAddresses;
        if (!responseLtcAllAddresses?.error) {
          setAllWalletAddressesLtc(responseLtcAllAddresses);
          console.log("GET LTC ALL ADDRESSES", responseLtcAllAddresses);
        }
      } catch (error) {
        setAllWalletAddressesLtc([]);
        console.log("ERROR GET LTC ALL ADDRESSES", error);
      }
      await responseLtcTransactions;
      if (!responseLtcTransactions?.error) {
        setTransactionsLtc(responseLtcTransactions);
        setIsLoadingLtcTransactions(false);
        console.log("GET LTC TRANSACTIONS", responseLtcTransactions);
      }
    } catch (error) {
      setIsLoadingLtcTransactions(false);
      setTransactionsLtc([]);
      console.log("ERROR GET LTC TRANSACTIONS", error);
    }
  }

  React.useEffect(() => {
    if (!isAuthenticated) return;
    getTransactionsLtc();
  }, [isAuthenticated]);

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

  const LtcSendDialogPage = () => {
    return (
      <Dialog
        fullScreen
        open={openLtcSend}
        onClose={handleCloseLtcSend}
        slots={{ transition: Transition }}
      >
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
              variant="contained"
              startIcon={<Send />}
              aria-label="send"
              onClick={handleOpenLtcSend}
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
            {walletBalanceLtc + " LTC"}
          </Typography>
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
            value={amountLtc}
            allowNegative={false}
            customInput={TextField}
            valueIsNumericString
            variant="outlined"
            label="Amount (LTC)"
            onValueChange={(values) => {
              setAmountLtc(values.floatValue);
            }}
            required
          />
          <TextField
            required
            label="Receiver Adress"
            id="ltcaddress"
            margin="normal"
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
            <Typography id="doge-fee-slider" gutterBottom>
              Current fee per byte : {feeLtc} SAT
            </Typography>
            <Slider
              track={false}
              step={5}
              min={10}
              max={100}
              valueLabelDisplay="auto"
              aria-labelledby="doge-fee-slider"
              getAriaValueText={valueTextLtc}
              defaultValue={30}
              marks={ltcMarks}
              onChange={handleChangeLtcFee}
            />
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
              ? transactionsLtc.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : transactionsLtc
            ).map((row: {
              name: React.Key;
              inputs: { address: any; }[];
              outputs: { address: any; }[];
              txHash: string;
              totalAmount: any;
              timestamp: number;
            }) => (
              <StyledTableRow key={row.name}>
                <StyledTableCell style={{ width: 'auto' }} align="left">
                  {(() => {
                    if (allWalletAddressesLtc.some(ltcAll => ltcAll.address === row?.inputs[0].address)) {
                      return <div style={{ color: '#05a2e4' }}>{row?.inputs[0].address}</div>;
                    } else {
                      return row?.inputs[0].address;
                    }
                  })()}
                </StyledTableCell>
                <StyledTableCell style={{ width: 'auto' }} align="left">
                  {(() => {
                    if (row?.outputs[0].address === row?.inputs[0].address) {
                      if (allWalletAddressesLtc.some(ltcAll => ltcAll.address === row?.outputs[1].address)) {
                        return <div style={{ color: '#05a2e4' }}>{row?.outputs[1].address}</div>;
                      } else {
                        return row?.outputs[1].address;
                      }
                    } else {
                      if (allWalletAddressesLtc.some(ltcAll => ltcAll.address === row?.outputs[0].address)) {
                        return <div style={{ color: '#05a2e4' }}>{row?.outputs[0].address}</div>;
                      } else {
                        return row?.outputs[0].address;
                      }
                    }
                  })()}
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
                  {row?.outputs[0].address === walletInfoLtc?.address ?
                    <div style={{ color: '#66bb6a' }}>+{(Number(row?.totalAmount) / 1e8).toFixed(8)}</div> : <div style={{ color: '#f44336' }}>{(Number(row?.totalAmount) / 1e8).toFixed(8)}</div>
                  }
                </StyledTableCell>
                <StyledTableCell style={{ width: 'auto' }} align="left">
                  {epochToAgo(row?.timestamp)}
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

  return (
    <Box sx={{ width: '100%', marginTop: "20px" }}>
      {LtcSendDialogPage()}
      {LtcQrDialogPage()}
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
          <Tooltip placement="top" title={copyLtcAddress ? copyLtcAddress : "Copy Address"}>
            <IconButton aria-label="copy" size="small" onClick={() => { navigator.clipboard.writeText(walletInfoLtc?.address), changeCopyLtcStatus() }}>
              <CopyAllTwoTone fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
        <div style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-evenly'
        }}>
          <WalletButtons
            loading={isLoadingWalletBalanceLtc}
            loadingPosition="start"
            variant="contained"
            startIcon={<FaRegPaperPlane />}
            aria-label="transfer"
            onClick={handleOpenLtcSend}
          >
            Tranfer LTC
          </WalletButtons>
          <WalletButtons
            variant="contained"
            startIcon={<FaQrcode />}
            aria-label="QRcode"
            onClick={handleOpenLtcQR}
          >
            Show QR Code
          </WalletButtons>
          <WalletButtons
            variant="contained"
            startIcon={<FaBook />}
            aria-label="book"
          >
            Address Book
          </WalletButtons>
        </div>
        <Typography variant="h6" paddingTop={2} paddingBottom={2}>
          Transactions:
        </Typography>
        {isLoadingLtcTransactions ? tableLoader() : transactionsTable()}
      </WalleteCard>
    </Box>
  );
}