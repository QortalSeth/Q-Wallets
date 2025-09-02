import * as React from 'react';
import WalletContext from '../../contexts/walletContext';
import {cropString, epochToAgo, timeoutDelay} from '../../common/functions'
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
import coinLogoARRR from '../../assets/arrr.png';

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

const ArrrQrDialog = styled(Dialog)(({ theme }) => ({
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

const ArrrLightwalletDialog = styled(Dialog)(({ theme }) => ({
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

const ArrrSubmittDialog = styled(Dialog)(({ theme }) => ({
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

export default function PirateWallet() {
  const { isAuthenticated, isUsingGateway } = React.useContext(WalletContext);

  if (!isAuthenticated) {
    return (
      <Alert variant="filled" severity="error">
        You must sign in, to use the Pirate Chain wallet.
      </Alert>
    );
  }

  if (isUsingGateway) {
    return (
      <Alert variant="filled" severity="error">
        You cannot use Pirate Chain wallet through public node. Please use your local node.
      </Alert>
    );
  }

  const [isSynced, setIsSynced] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState('');
  const [walletInfoArrr, setWalletInfoArrr] = React.useState<any>({});
  const [walletBalanceArrr, setWalletBalanceArrr] = React.useState<any>(null);
  const [isLoadingWalletBalanceArrr, setIsLoadingWalletBalanceArrr] = React.useState<boolean>(true);
  const [allLightwalletServersArrr, setAllLightwalletServersArrr] = React.useState<any>([]);
  const [currentLightwalletServerArrr, setCurrentLightwalletServerArrr] = React.useState<any>([]);
  const [changeServer, setChangeServer] = React.useState(false);
  const [arrrMemo, setArrrMemo] = React.useState('');
  const [transactionsArrr, setTransactionsArrr] = React.useState<any>([]);
  const [isLoadingArrrTransactions, setIsLoadingArrrTransactions] = React.useState<boolean>(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [copyArrrAddress, setCopyArrrAddress] = React.useState('');
  const [copyArrrTxHash, setCopyArrrTxHash] = React.useState('');
  const [openArrrQR, setOpenArrrQR] = React.useState(false);
  const [openArrrLightwallet, setOpenArrrLightwallet] = React.useState(false);
  const [openArrrServerChange, setOpenArrrServerChange] = React.useState(false);
  const [openArrrSend, setOpenArrrSend] = React.useState(false);
  const [arrrAmount, setArrrAmount] = React.useState<number>(0);
  const [arrrRecipient, setArrrRecipient] = React.useState('');
  const [loadingRefreshArrr, setLoadingRefreshArrr] = React.useState(false);
  const [openTxArrrSubmit, setOpenTxArrrSubmit] = React.useState(false);
  const [openSendArrrSuccess, setOpenSendArrrSuccess] = React.useState(false);
  const [openSendArrrError, setOpenSendArrrError] = React.useState(false);
  const [openArrrAddressBook, setOpenArrrAddressBook] = React.useState(false);
  const [retry, setRetry] = React.useState(false);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - transactionsArrr.length) : 0;

  const handleOpenArrrQR = () => {
    setOpenArrrQR(true);
  }

  const handleCloseArrrQR = () => {
    setOpenArrrQR(false);
  }

  const handleCloseArrrLightwallet = () => {
    setOpenArrrLightwallet(false);
  }

  const handleCloseArrrServerChange = () => {
    setOpenArrrServerChange(false);
  }

  const handleOpenAddressBook = async () => {
    setOpenArrrAddressBook(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setOpenArrrAddressBook(false);
  }

  const handleOpenArrrSend = () => {
    setArrrAmount(0);
    setArrrRecipient('');
    setArrrMemo('');
    setOpenArrrSend(true);
  }

  const validateCanSendArrr = () => {
    if (arrrAmount <= 0 || null || !arrrAmount) {
      return true;
    }
    if (arrrRecipient.length < 34 || '') {
      return true;
    }
    return false;
  }

  const handleCloseArrrSend = () => {
    setArrrAmount(0);
    setArrrRecipient('');
    setArrrMemo('');
    setOpenArrrSend(false);
  }

  const changeCopyArrrStatus = async () => {
    setCopyArrrAddress('Copied');
    await timeoutDelay(2000);
    setCopyArrrAddress('');
  }

  const changeCopyArrrTxHash = async () => {
    setCopyArrrTxHash('Copied');
    await timeoutDelay(2000);
    setCopyArrrTxHash('');
  }

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number,) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSendMaxArrr = () => {
    let maxArrrAmount = 0;
    let WalletBalanceArrr = parseFloat(walletBalanceArrr)
    maxArrrAmount = WalletBalanceArrr - 0.00010000;
    if (maxArrrAmount <= 0) {
      setArrrAmount(0);
    } else {
      setArrrAmount(maxArrrAmount);
    }
  }

  const handleCloseSendArrrSuccess = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendArrrSuccess(false);
  };

  const handleCloseSendArrrError = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendArrrError(false);
  };

  const sendArrrRequest = async () => {
    setOpenTxArrrSubmit(true);
    try {
      const sendRequest = await qortalRequest({
        action: "SEND_COIN",
        coin: "ARRR",
        recipient: arrrRecipient,
        amount: arrrAmount,
        memo: arrrMemo
      });
      if (!sendRequest?.error) {
        setArrrAmount(0);
        setArrrRecipient('');
        setArrrMemo('');
        setOpenTxArrrSubmit(false);
        setOpenSendArrrSuccess(true);
        setIsLoadingWalletBalanceArrr(true);
        await timeoutDelay(3000);
        getWalletBalanceArrr();
      }
    } catch (error) {
      setArrrAmount(0);
      setArrrRecipient('');
      setArrrMemo('');
      setOpenTxArrrSubmit(false);
      setOpenSendArrrError(true);
      setIsLoadingWalletBalanceArrr(true);
      await timeoutDelay(3000);
      getWalletBalanceArrr();
      console.error("ERROR SENDING ARRR", error);
    }
  }

  const getWalletInfoArrr = async () => {
    try {
      const response = await qortalRequest({
        action: "GET_USER_WALLET",
        coin: "ARRR"
      });
      if (!response?.error) {
        setWalletInfoArrr(response);
      }
    } catch (error) {
      setWalletInfoArrr({});
      console.error("ERROR GET ARRR WALLET INFO", error);
    }
  }

  const getWalletBalanceArrr = async () => {
    try {
      const response = await qortalRequestWithTimeout({
        action: "GET_WALLET_BALANCE",
        coin: 'ARRR'
      }, 120000);
      if (!response?.error) {
        setWalletBalanceArrr(response);
        setIsLoadingWalletBalanceArrr(false);
      }
    } catch (error) {
      setWalletBalanceArrr(null);
      setIsLoadingWalletBalanceArrr(false);
      console.error("ERROR GET ARRR BALANCE", error);
    }
  }

  const getUpdatedWalletBalance = () => {
    if (!isAuthenticated) return;
    const intervalGetWalletBalanceArrr = setInterval(() => {
      getWalletBalanceArrr();
    }, 180000);
    getWalletBalanceArrr();
    return () => {
      clearInterval(intervalGetWalletBalanceArrr);
    }
  }

  const getLightwalletServersArrr = async () => {
    try {
      const response = await qortalRequest({
        action: "GET_CROSSCHAIN_SERVER_INFO",
        coin: "ARRR"
      });
      if (!response?.error) {
        setAllLightwalletServersArrr(response);
        let currentArrrServer = response.filter(function (item: { isCurrent: boolean; }) {
          return item.isCurrent == true;
        });
        setCurrentLightwalletServerArrr(currentArrrServer);
      }
    } catch (error) {
      setAllLightwalletServersArrr({});
      console.error("ERROR GET ARRR SERVERS INFO", error);
    }
  }

  const getTransactionsArrr = async () => {
    try {
      setIsLoadingArrrTransactions(true);
      const response = await qortalRequestWithTimeout({
        action: "GET_USER_WALLET_TRANSACTIONS",
        coin: 'ARRR'
      }, 300000);
      if (!response?.error) {
        const compareFn = (a: { timestamp: number; }, b: { timestamp: number; }) => {
          return b.timestamp - a.timestamp
        }
        const sortedArrrTransactions = response.sort(compareFn)
        setTransactionsArrr(sortedArrrTransactions);
        setIsLoadingArrrTransactions(false);
      }
    } catch (error) {
      setIsLoadingArrrTransactions(false);
      setTransactionsArrr([]);
      console.error("ERROR GET ARRR TRANSACTIONS", error);
    }
  }

  const getArrrSyncStatus = async () => {
    try {
      let counter = 0;
      let counter2 = 0;
      while (!isSynced && counter < 36 && counter2 < 60) {
        const response = await qortalRequest({
          action: "GET_ARRR_SYNC_STATUS"
        });
        if (!response?.error) {
          if (response.indexOf('<') > -1 || response !== "Synchronized" || response === "Not initialized yet") {
            if (response.indexOf('<') > -1) {
              setSyncStatus('No Connection To Pirate Chain Lightwallet Server.');
              setChangeServer(false);
              setIsSynced(false);
              counter = 37;
            } else if (response === "Not initialized yet") {
              setChangeServer(false);
              setSyncStatus(response);
              setIsSynced(false);
              counter += 1;
              await new Promise((resolve) => setTimeout(resolve, 5000));
            } else if (response === "Initializing wallet...") {
              setChangeServer(false);
              setSyncStatus(response);
              setIsSynced(false);
              counter2 += 1;
              await new Promise((resolve) => setTimeout(resolve, 5000));
            } else {
              setChangeServer(false);
              setSyncStatus(response)
              setIsSynced(false);
              await new Promise((resolve) => setTimeout(resolve, 5000));
            }
          } else {
            setIsSynced(true);
            setSyncStatus('')
            setChangeServer(false);
            getWalletInfoArrr();
            await new Promise((resolve) => setTimeout(resolve, 3000));
            getUpdatedWalletBalance();
            await new Promise((resolve) => setTimeout(resolve, 3000));
            getLightwalletServersArrr();
            await new Promise((resolve) => setTimeout(resolve, 3000));
            getTransactionsArrr();
            return;
          }
        }
      }
      setIsSynced(false);
      setSyncStatus('No Connection To Pirate Chain Lightwallet Server.');
      setChangeServer(true);
      return;
    } catch (error) {
      setSyncStatus(error);
      setIsSynced(false);
      setRetry(true);
      console.error("ERROR GET ARRR SYNC STATUS", error);
    }
  }

  const handleOpenArrrLightwallet = async () => {
    await getLightwalletServersArrr();
    setOpenArrrLightwallet(true);
  }

  const handleOpenArrrServerChange = async () => {
    await getLightwalletServersArrr();
    setOpenArrrServerChange(true);
  }

  const handleRetry = async () => {
    setRetry(false);
    await getArrrSyncStatus();
  }

  const handleLoadingRefreshArrr = async () => {
    setLoadingRefreshArrr(true);
    await getTransactionsArrr();
    setLoadingRefreshArrr(false);
  }

  React.useEffect(() => {
    if (!isAuthenticated) return;
    getArrrSyncStatus();
  }, [isAuthenticated]);

  const ArrrWalletBalance = () => {
    return (
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
          {walletBalanceArrr ? walletBalanceArrr + " ARRR" : <Box sx={{ width: '175px' }}><LinearProgress /></Box>}
        </Typography>
      </div>
    );
  }

  const ArrrWalletAddress = () => {
    return (
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
          {walletInfoArrr?.address ? walletInfoArrr?.address : <Box sx={{ width: '175px' }}><LinearProgress /></Box>}
        </Typography>
        <Tooltip placement="right" title={copyArrrAddress ? copyArrrAddress : "Copy Address"}>
          <IconButton aria-label="copy" size="small" onClick={() => { navigator.clipboard.writeText(walletInfoArrr?.address), changeCopyArrrStatus() }}>
            <CopyAllTwoTone fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  const setNewCurrentArrrServer = async (typeServer: string, hostServer: string, portServer: number) => {
    try {
      const setServer = await qortalRequest({
        action: "SET_CURRENT_FOREIGN_SERVER",
        coin: "ARRR",
        type: typeServer,
        host: hostServer,
        port: portServer
      });
      if (!setServer?.error) {
        await getLightwalletServersArrr();
        setOpenArrrLightwallet(false);
        await getWalletBalanceArrr();
        await getTransactionsArrr();
      }
    } catch (error) {
      await getLightwalletServersArrr();
      setOpenArrrLightwallet(false);
      console.error("ERROR GET ARRR SERVERS INFO", error);
    }
  }

  const setNewArrrServer = async (typeServer: string, hostServer: string, portServer: number) => {
    try {
      const setServer = await qortalRequest({
        action: "SET_CURRENT_FOREIGN_SERVER",
        coin: "ARRR",
        type: typeServer,
        host: hostServer,
        port: portServer
      });
      if (!setServer?.error) {
        setOpenArrrServerChange(false);
        await getLightwalletServersArrr();
        await getArrrSyncStatus();
      }
    } catch (error) {
      setOpenArrrServerChange(false);
      await getLightwalletServersArrr();
      await getArrrSyncStatus();
      console.error("ERROR GET ARRR SERVERS INFO", error);
    }
  }

  const ArrrLightwalletDialogPage = () => {
    return (
      <ArrrLightwalletDialog
        onClose={handleCloseArrrLightwallet}
        aria-labelledby="arrr-electrum-servers"
        open={openArrrLightwallet}
        keepMounted={false}
      >
        <DialogTitle sx={{ m: 0, p: 2, fontSize: '14px' }} id="arrr-electrum-servers">
          Available Prirate Chain Lightwallet Servers.
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
                allLightwalletServersArrr
              ).map((server: {
                connectionType: string;
                hostName: string;
                port: number;
              }, i: React.Key) => (
                <ListItemButton key={i} onClick={() => { setNewCurrentArrrServer(server?.connectionType, server?.hostName, server?.port) }}>
                  <ListItemText primary={server?.connectionType + "://" + server?.hostName + ':' + server?.port} key={i} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseArrrLightwallet}>
            CLOSE
          </Button>
        </DialogActions>
      </ArrrLightwalletDialog>
    );
  }

  const ArrrServerChangeDialogPage = () => {
    return (
      <ArrrLightwalletDialog
        onClose={handleCloseArrrServerChange}
        aria-labelledby="arrr-electrum-servers"
        open={openArrrServerChange}
        keepMounted={false}
      >
        <DialogTitle sx={{ m: 0, p: 2, fontSize: '14px' }} id="arrr-electrum-servers">
          Available Prirate Chain Lightwallet Servers.
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
                allLightwalletServersArrr
              ).map((server: {
                connectionType: string;
                hostName: string;
                port: number;
              }, i: React.Key) => (
                <ListItemButton key={i} onClick={() => { setNewArrrServer(server?.connectionType, server?.hostName, server?.port) }}>
                  <ListItemText primary={server?.connectionType + "://" + server?.hostName + ':' + server?.port} key={i} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseArrrServerChange}>
            CLOSE
          </Button>
        </DialogActions>
      </ArrrLightwalletDialog>
    );
  }

  const ArrrLightwalletServer = () => {
    return (
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
          Lightwallet Server:&nbsp;&nbsp;
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          sx={{ color: 'text.primary', fontWeight: 700 }}
        >
          {currentLightwalletServerArrr[0]?.hostName ? currentLightwalletServerArrr[0]?.hostName + ":" + currentLightwalletServerArrr[0]?.port : <Box sx={{ width: '175px' }}><LinearProgress /></Box>}
        </Typography>
        <Tooltip placement="right" title="Change Server">
          <IconButton aria-label="open-electrum" size="small" onClick={handleOpenArrrLightwallet}>
            <PublishedWithChangesTwoTone fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  const ArrrWalletButtons = () => {
    return (
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
          loading={isLoadingWalletBalanceArrr}
          loadingPosition="start"
          variant="contained"
          startIcon={<Send style={{ marginBottom: '2px' }} />}
          aria-label="transfer"
          onClick={handleOpenArrrSend}
        >
          Transfer ARRR
        </WalletButtons>
        <WalletButtons
          variant="contained"
          startIcon={<QrCode2 style={{ marginBottom: '2px' }} />}
          aria-label="QRcode"
          onClick={handleOpenArrrQR}
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
    );
  }

  const ArrrQrDialogPage = () => {
    return (
      <ArrrQrDialog
        onClose={handleCloseArrrQR}
        aria-labelledby="arrr-qr-code"
        open={openArrrQR}
        keepMounted={false}
      >
        <DialogTitle sx={{ m: 0, p: 2, fontSize: '12px' }} id="arrr-qr-code">
          Address : {walletInfoArrr?.address}
        </DialogTitle>
        <DialogContent dividers>
          <div style={{ height: "auto", margin: "0 auto", maxWidth: 256, width: "100%" }}>
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={walletInfoArrr?.address}
              viewBox={`0 0 256 256`}
              fgColor={'#393939'}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseArrrQR}>
            CLOSE
          </Button>
        </DialogActions>
      </ArrrQrDialog>
    );
  }


  const ArrTransactionsHeader = () => {
    return (
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
          onClick={handleLoadingRefreshArrr}
          loading={loadingRefreshArrr}
          loadingPosition="start"
          startIcon={<Refresh />}
          variant="outlined"
          style={{ borderRadius: 50 }}
        >
          Refresh
        </Button>
      </div>
    );
  }

  const ArrrTableLoader = () => {
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

  const ArrrTransactionsTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table stickyHeader sx={{ width: '100%' }} aria-label="transactions table" >
          <TableHead>
            <TableRow>
             <StyledTableCell align="left">Sender</StyledTableCell>
             <StyledTableCell align="left">Receiver</StyledTableCell>
             <StyledTableCell align="left">TX Hash</StyledTableCell>
              <StyledTableCell align="left">Memo</StyledTableCell>
              <StyledTableCell align="left">Total Amount</StyledTableCell>
              <StyledTableCell align="left">Fee</StyledTableCell>
              <StyledTableCell align="left">Time</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? transactionsArrr.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : transactionsArrr
            ).map((row: {
              inputs: { address: any; addressInWallet: boolean; amount: number;}[];
              outputs: { address: any; addressInWallet: boolean; amount: number;}[];
              txHash: string;
              totalAmount: any;
              feeAmount: any;
              memo: string;
              timestamp: number;
            }, k: React.Key) => (
              <StyledTableRow key={k}>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row.inputs.map((input, index) => (
                          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', color: input.addressInWallet ? undefined : 'grey'  }}>
                              <span style={{ flex: 1, textAlign: 'left' }}>{cropString(input.address)}</span>
                              <span style={{ flex: 1, textAlign: 'right' }}>{(Number(input.amount) / 1e8).toFixed(8)}</span>
                          </div>
                      ))}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row.outputs.map((output, index) => (
                          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', color: output.addressInWallet ? undefined : 'grey'  }}>
                              <span style={{ flex: 1, textAlign: 'left' }}>{cropString(output.address)}</span>
                              <span style={{ flex: 1, textAlign: 'right' }}>{(Number(output.amount) / 1e8).toFixed(8)}</span>
                          </div>
                      ))}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                      {cropString(row?.txHash)}
                      <CustomWidthTooltip placement="top" title={copyArrrTxHash ? copyArrrTxHash : "Copy Hash: " + row?.txHash}>
                          <IconButton aria-label="copy" size="small" onClick={() => { navigator.clipboard.writeText(row?.txHash), changeCopyArrrTxHash() }}>
                              <CopyAllTwoTone fontSize="small" />
                          </IconButton>
                      </CustomWidthTooltip>
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                  {row?.memo ? row?.memo : ''}
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
                      <div></div>
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
                count={transactionsArrr.length}
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

  const ArrrSendDialogPage = () => {
    return (
      <Dialog
        fullScreen
        open={openArrrSend}
        onClose={handleCloseArrrSend}
        slots={{ transition: Transition }}
      >
        <ArrrSubmittDialog
          fullWidth={true}
          maxWidth='xs'
          open={openTxArrrSubmit}
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
        </ArrrSubmittDialog>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={openSendArrrSuccess}
          autoHideDuration={4000}
          slots={{ transition: SlideTransition }}
          onClose={handleCloseSendArrrSuccess}>
          <Alert
            onClose={handleCloseSendArrrSuccess}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            Sent ARRR transaction was successful.
          </Alert>
        </Snackbar>
        <Snackbar open={openSendArrrError} autoHideDuration={4000} onClose={handleCloseSendArrrError}>
          <Alert
            onClose={handleCloseSendArrrError}
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
              onClick={handleCloseArrrSend}
              aria-label="close"
            >
              <Close />
            </IconButton>
            <Avatar sx={{ width: 28, height: 28 }} alt="ARRR Logo" src={coinLogoARRR} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1, display: { xs: 'none', sm: 'block', paddingLeft: '10px', paddingTop: '3px' }
              }}
            >
              Transfer ARRR
            </Typography>
            <Button
              disabled={validateCanSendArrr()}
              variant="contained"
              startIcon={<Send />}
              aria-label="send-arrr"
              onClick={sendArrrRequest}
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
            {isLoadingWalletBalanceArrr ? <Box sx={{ width: '175px' }}><LinearProgress /></Box> : walletBalanceArrr + " ARRR"}
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
            {(walletBalanceArrr - 0.00010000).toFixed(8) + " ARRR"}
          </Typography>
          <div style={{ marginInlineStart: '15px' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSendMaxArrr}
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
            value={arrrAmount}
            allowNegative={false}
            customInput={TextField}
            valueIsNumericString
            variant="outlined"
            label="Amount (ARRR)"
            isAllowed={(values) => {
              const maxArrrCoin = (walletBalanceArrr - 0.00010000);
              const { formattedValue, floatValue } = values;
              return formattedValue === "" || floatValue <= maxArrrCoin;
            }}
            onValueChange={(values) => {
              setArrrAmount(values.floatValue);
            }}
            required
          />
          <TextField
            required
            label="Receiver Address"
            id="arrr-address"
            margin="normal"
            value={arrrRecipient}
            helperText="ARRR address should be 78 characters long (starts with zs)"
            slotProps={{ htmlInput: { maxLength: 78, minLength: 78 } }}
            onChange={(e) => setArrrRecipient(e.target.value)}
          />
          <TextField
            label="Memo"
            id="arrr-memo"
            margin="normal"
            value={arrrMemo}
            helperText="ARRR memo maximal 40 characters long."
            slotProps={{ htmlInput: { maxLength: 40, minLength: 40 } }}
            onChange={(e) => setArrrMemo(e.target.value)}
          />
        </Box>
        <div style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Typography
            align="center"
            sx={{ fontWeight: 600, fontSize: '14px', marginTop: '15px' }}
          >
            Current sending fee is 0.0001 ARRR.
          </Typography>
        </div>
      </Dialog>
    );
  }

  const changeServerButton = () => {
    return (
      <div style={{
        width: "100%",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Button
          size="small"
          onClick={handleOpenArrrServerChange}
          variant="outlined"
          style={{ borderRadius: 50 }}
        >
          Change Server
        </Button>
      </div>
    );
  }

  const retryButton = () => {
    return (
      <div style={{
        width: "100%",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Button
          size="small"
          onClick={handleRetry}
          variant="outlined"
          style={{ borderRadius: 50 }}
        >
          Retry
        </Button>
      </div>
    );
  }

  const showSyncStatus = () => {
    return (
      <Box>
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
            {syncStatus}
          </Typography>
        </div>
        {changeServer ? changeServerButton() : ''}
        {retry ? retryButton() : ''}
      </Box>
    );
  }

  const ArrrAddressBookDialogPage = () => {
    return (
      <DialogGeneral
        aria-labelledby="btc-electrum-servers"
        open={openArrrAddressBook}
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
      {ArrrServerChangeDialogPage()}
      {ArrrLightwalletDialogPage()}
      {ArrrSendDialogPage()}
      {ArrrQrDialogPage()}
      {ArrrAddressBookDialogPage()}
      <Typography gutterBottom variant="h5" sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 700 }}>
        Pirate Chain Wallet
      </Typography>
      <WalleteCard>
        <CoinAvatar
          src={coinLogoARRR}
          alt="Coinlogo"
        />
        {syncStatus ? showSyncStatus() : ArrrWalletBalance()}
        {syncStatus ? '' : ArrrWalletAddress()}
        {syncStatus ? '' : ArrrLightwalletServer()}
        {syncStatus ? '' : ArrrWalletButtons()}
        {syncStatus ? '' : ArrTransactionsHeader()}
        {(() => {
          if (syncStatus) {
            return '';
          } else if (isLoadingArrrTransactions) {
            return ArrrTableLoader();
          } else {
            return ArrrTransactionsTable();
          }
        })()}
      </WalleteCard>
    </Box>
  );
}
