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
import coinLogoDOGE from '../../assets/doge.png';

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

const DogeQrDialog = styled(Dialog)(({ theme }) => ({
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

const dogeMarks = [
  {
    value: 100,
    label: 'MIN',
  },
  {
    value: 1000,
    label: 'DEF',
  },
  {
    value: 10000,
    label: 'MAX',
  },
];

function valueTextDoge(value: number) {
  return `${value} SAT`;
}

export default function DogecoinWallet() {
  const { isAuthenticated } = React.useContext(WalletContext);

  if (!isAuthenticated) {
    console.log("WE ARE NOT LOGGED IN");
    return (
      <Alert variant="filled" severity="error">
        You must sign in, to use the Dogecoin wallet !!!
      </Alert>
    );
  }

  const [walletInfoDoge, setWalletInfoDoge] = React.useState<any>({});
  const [walletBalanceDoge, setWalletBalanceDoge] = React.useState<any>(null);
  const [isLoadingWalletBalanceDoge, setIsLoadingWalletBalanceDoge] = React.useState<boolean>(true);
  const [allWalletAddressesDoge, setAllWalletAddressesDoge] = React.useState<any>([]);
  const [transactionsDoge, setTransactionsDoge] = React.useState<any>([]);
  const [isLoadingDogeTransactions, setIsLoadingDogeTransactions] = React.useState<boolean>(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [copyDogeAddress, setCopyDogeAddress] = React.useState('');
  const [copyDogeTxHash, setCopyDogeTxHash] = React.useState('');
  const [openDogeQR, setOpenDogeQR] = React.useState(false);
  const [openDogeSend, setOpenDogeSend] = React.useState(false);
  const [amountDoge, setAmountDoge] = React.useState<number>(0);
  const [feeDoge, setFeeDoge] = React.useState<number>(0);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - transactionsDoge.length) : 0;

  const handleOpenDogeQR = () => {
    setOpenDogeQR(true);
  }

  const handleCloseDogeQR = () => {
    setOpenDogeQR(false);
  }

  const handleOpenDogeSend = () => {
    setAmountDoge(0);
    setFeeDoge(1000);
    setOpenDogeSend(true);
  }

  const handleCloseDogeSend = () => {
    setAmountDoge(0);
    setFeeDoge(0);
    setOpenDogeSend(false);
  }

  const changeCopyDogeStatus = async () => {
    setCopyDogeAddress('Copied !!!');
    await timeoutDelay(2000);
    setCopyDogeAddress('');
  }

  const changeCopyDogeTxHash = async () => {
    setCopyDogeTxHash('Copied !!!');
    await timeoutDelay(2000);
    setCopyDogeTxHash('');
  }

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number,) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDogeAmount = (_: Event, newValue: number | number[]) => {
    setAmountDoge(newValue as number);
    console.log("AMOUNT DOGE", amountDoge)
  };

  const handleChangeDogeFee = (_: Event, newValue: number | number[]) => {
    setFeeDoge(newValue as number);
  };

  const getWalletInfoDoge = async () => {
    try {
      const response = await qortalRequest({
        action: "GET_USER_WALLET",
        coin: "DOGE"
      });
      if (!response?.error) {
        setWalletInfoDoge(response);
        console.log("GET DOGE WALLET INFO", response);
      }
    } catch (error) {
      setWalletInfoDoge({});
      console.log("ERROR GET DOGE WALLET INFO", error);
    }
  }

  React.useEffect(() => {
    if (!isAuthenticated) return;
    getWalletInfoDoge();
  }, [isAuthenticated]);

  const getWalletBalanceDoge = async () => {
    try {
      const response = await qortalRequestWithTimeout({
        action: "GET_WALLET_BALANCE",
        coin: 'DOGE'
      }, 300000);
      if (!response?.error) {
        setWalletBalanceDoge(response);
        setIsLoadingWalletBalanceDoge(false);
        console.log("GET DOGE BALANCE", response);
      }
    } catch (error) {
      setWalletBalanceDoge(null);
      setIsLoadingWalletBalanceDoge(false);
      console.log("ERROR GET DOGE BALANCE", error);
    }
  }

  React.useEffect(() => {
    if (!isAuthenticated) return;
    const intervalGetWalletBalanceDoge = setInterval(() => {
      getWalletBalanceDoge();
    }, 180000);
    getWalletBalanceDoge();
    return () => {
      clearInterval(intervalGetWalletBalanceDoge);
    }
  }, [isAuthenticated]);

  const getTransactionsDoge = async () => {
    try {
      setIsLoadingDogeTransactions(true);
      const responseDogeAllAddresses = await qortalRequestWithTimeout({
        action: "GET_USER_WALLET_INFO",
        coin: "DOGE",
      }, 120000);
      const responseDogeTransactions = await qortalRequestWithTimeout({
        action: "GET_USER_WALLET_TRANSACTIONS",
        coin: 'DOGE'
      }, 300000);
      try {
        await responseDogeAllAddresses;
        if (!responseDogeAllAddresses?.error) {
          setAllWalletAddressesDoge(responseDogeAllAddresses);
          console.log("GET DOGE ALL ADDRESSES", responseDogeAllAddresses);
        }
      } catch (error) {
        setAllWalletAddressesDoge([]);
        console.log("ERROR GET DOGE ALL ADDRESSES", error);
      }
      await responseDogeTransactions;
      if (!responseDogeTransactions?.error) {
        setTransactionsDoge(responseDogeTransactions);
        setIsLoadingDogeTransactions(false);
        console.log("GET DOGE TRANSACTIONS", responseDogeTransactions);
      }
    } catch (error) {
      setIsLoadingDogeTransactions(false);
      setTransactionsDoge([]);
      console.log("ERROR GET DOGE TRANSACTIONS", error);
    }
  }

  React.useEffect(() => {
    if (!isAuthenticated) return;
    getTransactionsDoge();
  }, [isAuthenticated]);

  const DogeQrDialogPage = () => {
    return (
      <DogeQrDialog
        onClose={handleCloseDogeQR}
        aria-labelledby="doge-qr-code"
        open={openDogeQR}
        keepMounted={false}
      >
        <DialogTitle sx={{ m: 0, p: 2, fontSize: '12px' }} id="doge-qr-code">
          Address : {walletInfoDoge?.address}
        </DialogTitle>
        <DialogContent dividers>
          <div style={{ height: "auto", margin: "0 auto", maxWidth: 256, width: "100%" }}>
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={walletInfoDoge?.address}
              viewBox={`0 0 256 256`}
              fgColor={'#393939'}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseDogeQR}>
            CLOSE
          </Button>
        </DialogActions>
      </DogeQrDialog>
    );
  }

  const DogeSendDialogPage = () => {
    return (
      <Dialog
        fullScreen
        open={openDogeSend}
        onClose={handleCloseDogeSend}
        slots={{ transition: Transition }}
      >
        <AppBar sx={{ position: 'static' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseDogeSend}
              aria-label="close"
            >
              <Close />
            </IconButton>
            <Avatar sx={{ width: 28, height: 28 }} alt="DOGE Logo" src={coinLogoDOGE} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1, display: { xs: 'none', sm: 'block', paddingLeft: '10px', paddingTop: '3px' }
              }}
            >
              Transfer DOGE
            </Typography>
            <Button
              variant="contained"
              startIcon={<Send />}
              aria-label="send"
              onClick={handleOpenDogeSend}
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
            {walletBalanceDoge + " DOGE"}
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
            gutterBottom
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            Max Sendable:&nbsp;&nbsp;
          </Typography>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {(walletBalanceDoge - 0.05000000) + " DOGE"}
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
            value={amountDoge}
            allowNegative={false}
            customInput={TextField}
            valueIsNumericString
            variant="outlined"
            label="Amount (DOGE)"
            onValueChange={(values) => {
              setAmountDoge(values.floatValue);
            }}
            required
          />
          <TextField
            required
            label="Receiver Adress"
            id="dogeaddress"
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
              Current fee per byte : {feeDoge} SAT
            </Typography>
            <Slider
              track={false}
              step={100}
              min={100}
              max={10000}
              valueLabelDisplay="auto"
              aria-labelledby="doge-fee-slider"
              getAriaValueText={valueTextDoge}
              defaultValue={1000}
              marks={dogeMarks}
              onChange={handleChangeDogeFee}
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
              ? transactionsDoge.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : transactionsDoge
            ).map((row: {
              inputs: { address: any; }[];
              outputs: { address: any; }[];
              txHash: string;
              totalAmount: any;
              timestamp: number;
            }) => (
              <StyledTableRow>
                <StyledTableCell style={{ width: 'auto' }} align="left">
                  {(() => {
                    if (allWalletAddressesDoge.some(dogeAll => dogeAll.address === row?.inputs[0].address)) {
                      return <div style={{ color: '#05a2e4' }}>{row?.inputs[0].address}</div>;
                    } else {
                      return row?.inputs[0].address;
                    }
                  })()}
                </StyledTableCell>
                <StyledTableCell style={{ width: 'auto' }} align="left">
                  {(() => {
                    if (row?.outputs[0].address === row?.inputs[0].address) {
                      if (allWalletAddressesDoge.some((dogeAll: { address: any; }) => dogeAll.address === row?.outputs[1].address)) {
                        return <div style={{ color: '#05a2e4' }}>{row?.outputs[1].address}</div>;
                      } else {
                        return row?.outputs[1].address;
                      }
                    } else {
                      if (allWalletAddressesDoge.some((dogeAll: { address: any; }) => dogeAll.address === row?.outputs[0].address)) {
                        return <div style={{ color: '#05a2e4' }}>{row?.outputs[0].address}</div>;
                      } else {
                        return row?.outputs[0].address;
                      }
                    }
                  })()}
                </StyledTableCell>
                <StyledTableCell style={{ width: 'auto' }} align="left">
                  {cropString(row?.txHash)}
                  <CustomWidthTooltip placement="top" title={copyDogeTxHash ? copyDogeTxHash : "Copy Hash: " + row?.txHash}>
                    <IconButton aria-label="copy" size="small" onClick={() => { navigator.clipboard.writeText(row?.txHash), changeCopyDogeTxHash() }}>
                      <CopyAllTwoTone fontSize="small" />
                    </IconButton>
                  </CustomWidthTooltip>
                </StyledTableCell>
                <StyledTableCell style={{ width: 'auto' }} align="left">
                  {row?.outputs[0].address === walletInfoDoge?.address ?
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
                count={transactionsDoge.length}
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
      {DogeSendDialogPage()}
      {DogeQrDialogPage()}
      <Typography gutterBottom variant="h5" sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 700 }}>
        Dogecoin Wallet
      </Typography>
      <WalleteCard>
        <CoinAvatar
          src={coinLogoDOGE}
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
            {walletBalanceDoge ? walletBalanceDoge + " DOGE" : <Box sx={{ width: '175px' }}><LinearProgress /></Box>}
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
            {walletInfoDoge?.address}
          </Typography>
          <Tooltip placement="top" title={copyDogeAddress ? copyDogeAddress : "Copy Address"}>
            <IconButton aria-label="copy" size="small" onClick={() => { navigator.clipboard.writeText(walletInfoDoge?.address), changeCopyDogeStatus() }}>
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
            loading={isLoadingWalletBalanceDoge}
            loadingPosition="start"
            variant="contained"
            startIcon={<FaRegPaperPlane />}
            aria-label="transfer"
            onClick={handleOpenDogeSend}
          >
            Tranfer DOGE
          </WalletButtons>
          <WalletButtons
            variant="contained"
            startIcon={<FaQrcode />}
            aria-label="QRcode"
            onClick={handleOpenDogeQR}
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
        {isLoadingDogeTransactions ? tableLoader() : transactionsTable()}
      </WalleteCard>
    </Box>
  );
}