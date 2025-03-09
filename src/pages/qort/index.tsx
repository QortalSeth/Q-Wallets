import * as React from 'react';
import WalletContext from '../../contexts/walletContext';
import { epochToAgo } from '../../common/functions'
import { styled, width } from "@mui/system";
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Avatar,
  Alert,
  Typography,
  IconButton,
  Button,
  Tooltip,
  Divider,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  Paper
} from "@mui/material";
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { FaRegPaperPlane, FaBook } from "react-icons/fa6";
import { FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage } from '@mui/icons-material';
import coinLogo from '../../assets/qort.png';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

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

export default function QortalWallet() {
  const { isAuthenticated, userInfo } = React.useContext(WalletContext);

  if (!isAuthenticated) {
    console.log("WE ARE NOT LOGGED IN");
    return (
      <Alert variant="filled" severity="error">
        You must sign in, to use a wallet !!!
      </Alert>
    );
  }

  const [paymentsInfo, setPaymentsInfo] = React.useState<any>([]);
  const [walletBalanceQort, setWalletBalanceQort] = React.useState<any>(null);
  const [value, setValue] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number,) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getPaymentTransactions = React.useCallback(async () => {
    try {
      if (!userInfo?.address) return
      const paymentLink = `/transactions/search?txType=PAYMENT&address=${userInfo?.address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;
      const response = await fetch(paymentLink);
      const data = await response.json();
      setPaymentsInfo(data);
      console.log("DATA", data);
    } catch (error) {
      console.error(error)
    }

  }, [userInfo?.address])

  const getWalletBalanceQort = React.useCallback(async () => {
    try {
      const balanceLink = `/addresses/balance/${userInfo?.address}`;
      const response = await fetch(balanceLink);
      const data = await response.json();
      setWalletBalanceQort(data);
    } catch (error) {
      console.error(error)
    }

  }, [])

  React.useEffect(() => {
    getPaymentTransactions();
  }, [getPaymentTransactions]);

  React.useEffect(() => {
    if (!userInfo?.address) return;
    const intervalGetWalletBalance = setInterval(() => {
      getWalletBalanceQort();
      console.log("GET BALANCE");
    }, 120000);
    getWalletBalanceQort();
    return () => {
      clearInterval(intervalGetWalletBalance);
    }
  }, [userInfo?.address]);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - paymentsInfo.length) : 0;

  return (
    <Box sx={{ width: '100%', marginTop: "20px" }}>
      <Typography gutterBottom variant="h5" sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 700 }}>
        Qortal Wallet
      </Typography>
      <WalleteCard>
        <CoinAvatar
          src={coinLogo}
          alt="Coinlogo"
        />
        <Typography variant="h5" align="center" gutterBottom>
          Balance: {walletBalanceQort} QORT
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="textSecondary"
          gutterBottom
        >
          Address: {userInfo?.address}
        </Typography>

        <div style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-evenly'
        }}>
          <WalletButtons
            variant="contained"
            startIcon={<FaRegPaperPlane />}
            aria-label="transfer"
          >
            Tranfer QORT
          </WalletButtons>
          <WalletButtons
            variant="contained"
            startIcon={<FaBook />}
            aria-label="book"
          >
            Address Book
          </WalletButtons>
        </div>
        <Typography variant="h6" paddingTop={2} paddingLeft={2}>
          Transactions:
        </Typography>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Qortal Transactions"
            >
              <Tab label="PAYMENT" {...a11yProps(0)} />
              <Tab label="ARBITRARY" {...a11yProps(1)} />
              <Tab label="AT" {...a11yProps(2)} />
              <Tab label="GROUP" {...a11yProps(3)} />
              <Tab label="NAME" {...a11yProps(4)} />
              <Tab label="ASSET" {...a11yProps(5)} />
              <Tab label="POLL" {...a11yProps(6)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <TableContainer component={Paper}>
              <Table stickyHeader sx={{ width: '100%' }} aria-label="payments table" >
                <TableHead>
                  <TableRow>
                    <StyledTableCell align="left">Sender</StyledTableCell>
                    <StyledTableCell align="left">Receiver</StyledTableCell>
                    <StyledTableCell align="left">Amount</StyledTableCell>
                    <StyledTableCell align="left">Fee</StyledTableCell>
                    <StyledTableCell align="left">Time</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rowsPerPage > 0
                    ? paymentsInfo.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : paymentsInfo
                  ).map((row: {
                    name: React.Key;
                    creatorAddress: string;
                    recipient: string;
                    amount: number;
                    fee: number;
                    timestamp: number;
                  }) => (
                    <StyledTableRow key={row.name}>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        {row?.creatorAddress === userInfo?.address ?
                          <div style={{ color: '#05a2e4' }}>{row?.creatorAddress}</div> : row?.creatorAddress
                        }
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        {row?.recipient === userInfo?.address ?
                          <div style={{ color: '#05a2e4' }}>{row?.recipient}</div> : row?.recipient
                        }
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        {row?.recipient === userInfo?.address ?
                          <div style={{ color: '#66bb6a' }}>+ {row?.amount}</div> : <div style={{ color: '#f44336' }}>- {row?.amount}</div>
                        }
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        {row?.fee}
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
                      count={paymentsInfo.length}
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
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            Item ARBITRARY
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            Item AT
          </CustomTabPanel>
          <CustomTabPanel value={value} index={3}>
            Item GROUP
          </CustomTabPanel>
          <CustomTabPanel value={value} index={4}>
            Item NAME
          </CustomTabPanel>
          <CustomTabPanel value={value} index={5}>
            Item ASSET
          </CustomTabPanel>
          <CustomTabPanel value={value} index={6}>
            Item POLL
          </CustomTabPanel>
        </Box>
      </WalleteCard>
    </Box>
  );
}