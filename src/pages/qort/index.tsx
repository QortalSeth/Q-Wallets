import {
  Add,
  CheckCircleOutline,
  CloudSync,
  Close,
  CopyAllTwoTone,
  ExpandMore,
  FileDownloadOutlined,
  FirstPage,
  HistoryToggleOff,
  ImportContacts,
  InfoOutlined,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPage,
  LockOutlined,
  Refresh,
  Search,
  Send,
  VerifiedRounded,
} from '@mui/icons-material';
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
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
  Typography,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
type SnackbarCloseReason = 'timeout' | 'clickaway' | 'escapeKeyDown';
import { useTheme } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import { Coin, RequestQueueWithPromise, useGlobal } from 'qapp-core';
import {
  ChangeEvent,
  Key,
  MouseEvent,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { NumericFormat as _NumericFormat } from 'react-number-format';
const NumericFormat = _NumericFormat as React.FC<
  React.ComponentProps<typeof _NumericFormat> & Record<string, unknown>
>;
import QRCode from 'react-qr-code';
import coinLogoQORT from '../../assets/qort.png';
import {
  DECIMAL_ROUND_UP,
  EMPTY_STRING,
  QORT_1_UNIT,
  TIME_MINUTES_1,
  TIME_SECONDS_3,
  TIME_SECONDS_4,
} from '../../common/constants';
import {
  copyToClipboard,
  cropString,
  epochToAgo,
  humanFileSize,
  timeoutDelay,
} from '../../common/functions';
import WalletContext from '../../contexts/walletContext';
import {
  CustomWidthTooltip,
  SlideTransition,
  StyledTableCell,
  StyledTableRow,
  SubmitDialog,
  Transition,
  WalletButtons,
  WalletCard,
} from '../../styles/page-styles';
import { AddressBookDialog } from '../../components/AddressBook/AddressBookDialog';
import {
  AddressBookEntry,
  SearchTransactionsResponse,
} from '../../utils/Types';
import {
  getAddressBook,
  searchAddresses,
} from '../../utils/addressBookStorage';
import { publishToQDN } from '../../utils/addressBookQDN';

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

const addressToPrimaryName: any = {};
const requestQueueGetPrimaryName = new RequestQueueWithPromise(10);

export const getPrimaryAccountName = async (address: string) => {
  if (addressToPrimaryName[address]) return addressToPrimaryName[address];
  try {
    const primaryName = await requestQueueGetPrimaryName.enqueue(() =>
      qortalRequest({ action: 'GET_PRIMARY_NAME', address })
    );
    if (primaryName) addressToPrimaryName[address] = primaryName;
    return primaryName ?? EMPTY_STRING;
  } catch (e) {
    console.log(e);
  }
  return EMPTY_STRING;
};

export const replaceAddressesWithNames = async (
  data: SearchTransactionsResponse[]
) => {
  if (!data || data.length === 0) return;
  const addressToNames: { address: string; name?: string }[] = [];
  const namePromises: Promise<string>[] = [];

  const addAddressIfNotInArray = (address: string) => {
    const isAddressInArray = addressToNames.find(
      (arrayAddress) => arrayAddress.address === address
    );

    if (!isAddressInArray && address) {
      addressToNames.push({ address });
      namePromises.push(getPrimaryAccountName(address));
    }
  };

  data.map((d) => {
    addAddressIfNotInArray(d.creatorAddress);
    addAddressIfNotInArray(d.recipient);
  });

  const accountNames = await Promise.all(namePromises);
  addressToNames.map((value, index) => (value.name = accountNames[index]));

  const findName = (address: string) => {
    const data = addressToNames.find((d) => d.address === address);
    return data?.name || data?.address;
  };

  return data.map((d) => {
    const creatorAddress = findName(d.creatorAddress);
    const recipient = findName(d.recipient);
    return {
      ...d,
      creatorAddress,
      creatorAddressOriginal: d.creatorAddress,
      recipient,
      recipientOriginal: d.recipient,
    } as SearchTransactionsResponse;
  });
};

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

export default function QortalWallet() {
  const ADDRESS_MIN_LENGTH = 3;
  const ADDRESS_LOOKUP_DEBOUNCE_MS = 1000;

  const { t } = useTranslation(['core']);
  const theme = useTheme();
  const receiveQrRef = useRef<HTMLDivElement | null>(null);

  const { address, nodeInfo } = useContext(WalletContext);
  const [walletBalanceQort, setWalletBalanceQort] = useState<any>(0);
  const [isLoadingWalletBalanceQort, setIsLoadingWalletBalanceQort] =
    useState<boolean>(true);
  const [paymentInfo, setPaymentInfo] = useState<any>([]);
  const [qortTxFee, setQortTxFee] = useState<number>(0);
  const [arbitraryInfo, setArbitraryInfo] = useState<any>([]);
  const [atInfo, setAtInfo] = useState<any>([]);
  const [groupInfo, setGroupInfo] = useState<any>([]);
  const [nameInfo, setNameInfo] = useState<any>([]);
  const [assetInfo, setAssetInfo] = useState<any>([]);
  const [pollInfo, setPollInfo] = useState<any>([]);
  const [rewardshareInfo, setRewardshareInfo] = useState<any>([]);
  const [allInfo, setAllInfo] = useState<any>([]);
  const [value, setValue] = useState('all');
  const [advancedFilterAnchor, setAdvancedFilterAnchor] =
    useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [openQortAddressBook, setOpenQortAddressBook] = useState(false);
  const [openQortReceive, setOpenQortReceive] = useState(false);
  const [receivePanelOpen, setReceivePanelOpen] = useState(false);
  const [qortAddressBookEntries, setQortAddressBookEntries] = useState<
    AddressBookEntry[]
  >([]);
  const [qortAddressBookSearch, setQortAddressBookSearch] =
    useState(EMPTY_STRING);
  const [qortAddressBookSyncing, setQortAddressBookSyncing] = useState(false);
  const [qortAddressBookSyncStatus, setQortAddressBookSyncStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [qortAddressBookLastSync, setQortAddressBookLastSync] = useState<
    number | null
  >(null);
  const [addressBookPrefill, setAddressBookPrefill] = useState<{
    name: string;
    address: string;
  } | null>(null);
  const [loadingRefreshQort, setLoadingRefreshQort] = useState(false);
  const [openQortSend, setOpenQortSend] = useState(false);
  const [openTxQortSubmit, setOpenTxQortSubmit] = useState(false);
  const [openSendQortSuccess, setOpenSendQortSuccess] = useState(false);
  const [openSendQortError, setOpenSendQortError] = useState(false);
  const [qortAmount, setQortAmount] = useState<number | undefined>(undefined);
  const [qortRecipient, setQortRecipient] = useState<string>(EMPTY_STRING);
  const [sendDisabled, setSendDisabled] = useState<boolean>(true);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [addressValidating, setAddressValidating] = useState(false);
  const [amountTouched, setAmountTouched] = useState(false);
  const [recipientTouched, setRecipientTouched] = useState(false);
  const userName = useGlobal().auth.name;

  const maxSendableQortCoin = () => {
    // manage the correct round up
    const value = (
      toFiniteNumber(walletBalanceQort) - toFiniteNumber(qortTxFee)
    ).toString();
    const [integer, decimal = EMPTY_STRING] = value.split('.');
    const truncated = decimal
      .substring(0, DECIMAL_ROUND_UP)
      .padEnd(DECIMAL_ROUND_UP, '0');
    let truncatedMaxSendableQortCoin: number = parseFloat(
      `${integer}.${truncated}`
    );
    return truncatedMaxSendableQortCoin;
  };

  const toFiniteNumber = (value: unknown) => {
    const parsed =
      typeof value === 'number' ? value : Number.parseFloat(String(value ?? 0));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatDecimal = (
    value: unknown,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  ) => {
    return toFiniteNumber(value).toLocaleString(undefined, {
      minimumFractionDigits,
      maximumFractionDigits,
    });
  };

  const formatQortAmount = (value: unknown) => formatDecimal(value, 2, 2);
  const formatQortFee = (value: unknown) => formatDecimal(value, 2, 4);

  const emptyRowsPayment =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - paymentInfo?.length || 0)
      : 0;
  const emptyRowsArbitrary =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - arbitraryInfo?.length || 0)
      : 0;
  const emptyRowsAt =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - atInfo?.length || 0) : 0;
  const emptyRowsGroup =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - groupInfo?.length || 0)
      : 0;
  const emptyRowsName =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - nameInfo?.length || 0)
      : 0;
  const emptyRowsAsset =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - assetInfo?.length || 0)
      : 0;
  const emptyRowsPoll =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - pollInfo?.length || 0)
      : 0;
  const emptyRowsRewardshare =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - rewardshareInfo?.length || 0)
      : 0;
  const emptyRowsAll =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - allInfo?.length || 0) : 0;

  const handleOpenAddressBook = () => {
    setOpenQortAddressBook(true);
  };

  const loadQortAddressBookEntries = useCallback(() => {
    const entries = qortAddressBookSearch.trim()
      ? searchAddresses(Coin.QORT, qortAddressBookSearch)
      : getAddressBook(Coin.QORT);
    setQortAddressBookEntries(entries);
  }, [qortAddressBookSearch]);

  const handleOpenQortReceive = () => {
    setOpenQortReceive(true);
  };

  const handleToggleReceivePanel = () => {
    setReceivePanelOpen((prev) => !prev);
  };

  const handleCloseQortReceive = () => {
    setOpenQortReceive(false);
  };

  const handleDownloadReceiveQr = () => {
    const svg = receiveQrRef.current?.querySelector('svg');
    if (!svg) return;

    const clonedSvg = svg.cloneNode(true) as SVGElement;
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qort-receive-qr.svg';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleOpenAddressBookWithData = (
    name: string,
    addressValue: string
  ) => {
    setAddressBookPrefill({ name, address: addressValue });
    setOpenQortAddressBook(true);
  };

  const handleCloseAddressBook = () => {
    setOpenQortAddressBook(false);
    setAddressBookPrefill(null);
    loadQortAddressBookEntries();
  };

  const handleSyncQortAddressBook = async () => {
    setQortAddressBookSyncing(true);
    setQortAddressBookSyncStatus('idle');
    try {
      const entries = getAddressBook(Coin.QORT);
      const publishedAt = await publishToQDN(
        Coin.QORT,
        entries,
        userName || undefined
      );
      if (publishedAt) {
        setQortAddressBookLastSync(publishedAt);
        setQortAddressBookSyncStatus('success');
      } else {
        setQortAddressBookSyncStatus('error');
      }
    } catch (error) {
      console.error('Failed to sync QORT address book:', error);
      setQortAddressBookSyncStatus('error');
    } finally {
      setQortAddressBookSyncing(false);
      loadQortAddressBookEntries();
    }
  };

  useEffect(() => {
    loadQortAddressBookEntries();
  }, [loadQortAddressBookEntries, openQortAddressBook]);

  useEffect(() => {
    const handleAddressBookRequest = () => {
      const panel = document.getElementById('qort-address-book-panel');
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    window.addEventListener(
      'q-wallets-open-address-book',
      handleAddressBookRequest
    );

    return () => {
      window.removeEventListener(
        'q-wallets-open-address-book',
        handleAddressBookRequest
      );
    };
  }, []);

  const handleSelectAddress = (address: string, _name: string) => {
    setQortRecipient(address);
    setQortAmount(0);
    setOpenQortAddressBook(false);
    setOpenQortSend(true);
    setAmountError(null);
    setAmountTouched(false);
    setRecipientError(null);
    setRecipientTouched(true); // Trigger validation for QORT addresses
  };

  const openUserLookup = (addressOrName: string) => {
    const value = addressOrName?.trim();
    if (!value || value === '-') return;

    window.parent?.postMessage(
      {
        action: 'OPEN_USER_LOOKUP',
        addressOrName: value,
      },
      '*'
    );
  };

  const handleTransactionFilterChange = (newValue: string) => {
    setValue(newValue);
    setPage(0);
  };

  const handleAdvancedFilterClick = (event: MouseEvent<HTMLElement>) => {
    setAdvancedFilterAnchor(event.currentTarget);
  };

  const handleAdvancedFilterClose = () => {
    setAdvancedFilterAnchor(null);
  };

  const handleAdvancedFilterSelect = (newValue: string) => {
    handleTransactionFilterChange(newValue);
    handleAdvancedFilterClose();
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

  const handleOpenQortSend = () => {
    setQortAmount(0);
    setQortRecipient(EMPTY_STRING);
    setOpenQortSend(true);
    setAmountError(null);
    setAmountTouched(false);
    setRecipientError(null);
    setRecipientTouched(false);
  };

  const handleCloseQortSend = () => {
    setQortAmount(0);
    setQortRecipient(EMPTY_STRING);
    setOpenQortSend(false);
    setAmountError(null);
    setAmountTouched(false);
    setRecipientError(null);
    setRecipientTouched(false);
  };

  const handleCloseSendQortSuccess = (
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendQortSuccess(false);
  };

  const handleCloseSendQortError = (
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendQortError(false);
  };

  const handleSendMaxQort = () => {
    if (maxSendableQortCoin() <= 0) {
      setQortAmount(0);
    } else {
      setQortAmount(maxSendableQortCoin());
    }
  };

  // core validation (synchronous checks)
  const validateAmountLocal = useCallback(
    (amount?: number) => {
      const a =
        typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
      if (a <= 0) {
        setAmountError(
          t('core:message.error.amount_positive', {
            postProcess: 'capitalizeFirstChar',
          })
        );
        return false;
      }
      if (a > maxSendableQortCoin()) {
        setAmountError(
          t('core:message.error.amount_exceeds_balance', {
            maxAmount: maxSendableQortCoin(),
            postProcess: 'capitalizeFirstChar',
          })
        );
        return false;
      }
      setAmountError(null);
      return true;
    },
    [walletBalanceQort, qortTxFee, t]
  );

  // address lookup with debounce + cancel
  useEffect(() => {
    // Early exit: if recipient not touched, no validation needed
    if (!recipientTouched) {
      setRecipientError(null);
      setAddressValidating(false);
      return;
    }

    // Synchronous validations
    if (qortRecipient === EMPTY_STRING) {
      setRecipientError(t('core:message.error.recipient_required'));
      setAddressValidating(false);
      return;
    }

    if (qortRecipient.length < ADDRESS_MIN_LENGTH) {
      setRecipientError(t('core:message.error.recipient_too_short'));
      setAddressValidating(false);
      return;
    }

    // Perform debounced network lookup
    setAddressValidating(true);
    setRecipientError(null);

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const [addrRes, nameRes] = await Promise.all([
          fetch(`/addresses/validate/${encodeURIComponent(qortRecipient)}`, {
            signal: controller.signal,
          }).then(async (r) => {
            const json = await r.json();
            if (!json) {
              console.warn(`Invalid address format: ${qortRecipient}`);
              return { error: 'Invalid address' };
            }
            return json;
          }),
          fetch(`/names/${encodeURIComponent(qortRecipient)}`, {
            signal: controller.signal,
          }).then(async (r) => {
            if (!r.ok) {
              console.warn(`No name found: ${qortRecipient}`);
              return { error: 'Name not found' };
            }
            return r.json();
          }),
        ]);
        if (!addrRes?.error || !nameRes?.error) {
          setRecipientError(null);
        } else {
          setRecipientError(t('core:message.error.recipient_not_found'));
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Recipient lookup failed:', err.message);
        setRecipientError(t('core:message.error.recipient_lookup_failed'));
      } finally {
        setAddressValidating(false);
      }
    }, ADDRESS_LOOKUP_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [qortRecipient, recipientTouched, t]);

  // Consolidated send button enablement - derived from all validation states
  useEffect(() => {
    const amountValid = validateAmountLocal(qortAmount);
    const recipientLocallyValid =
      !!qortRecipient && qortRecipient.length >= ADDRESS_MIN_LENGTH;
    const addressFound =
      !addressValidating &&
      recipientError === null &&
      recipientTouched &&
      recipientLocallyValid;

    const finalEnabled = amountValid && recipientLocallyValid && addressFound;
    setSendDisabled(!finalEnabled);
  }, [
    qortAmount,
    qortRecipient,
    addressValidating,
    recipientError,
    recipientTouched,
    validateAmountLocal,
  ]);

  // input handlers
  const onAmountChange = (values: { floatValue?: number }) => {
    const next = values.floatValue ?? 0;
    setQortAmount(next);
    // quick local validation
    validateAmountLocal(next);
  };

  const onAmountBlur = () => setAmountTouched(true);
  const onRecipientBlur = () => setRecipientTouched(true);

  const getQortalTransactions = useCallback(
    async (signal?: AbortSignal) => {
      setLoadingRefreshQort(true);

      const arbitraryLink = `/transactions/search?txType=ARBITRARY&address=${address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;
      const assetLink = `/transactions/search?txType=CANCEL_ASSET_ORDER&txType=CREATE_ASSET_ORDER&txType=ISSUE_ASSET&txType=TRANSFER_ASSET&txType=UPDATE_ASSET&address=${address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;
      const atLink = `/transactions/search?txType=AT&txType=DEPLOY_AT&txType=MESSAGE&address=${address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;
      const groupLink = `/transactions/search?txType=CREATE_GROUP&txType=UPDATE_GROUP&txType=ADD_GROUP_ADMIN&txType=REMOVE_GROUP_ADMIN&txType=GROUP_BAN&txType=CANCEL_GROUP_BAN&txType=GROUP_KICK&txType=GROUP_INVITE&txType=CANCEL_GROUP_INVITE&txType=JOIN_GROUP&txType=LEAVE_GROUP&txType=GROUP_APPROVAL&txType=SET_GROUP&address=${address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;
      const nameLink = `/transactions/search?txType=REGISTER_NAME&txType=UPDATE_NAME&txType=SELL_NAME&txType=CANCEL_SELL_NAME&txType=BUY_NAME&address=${address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;
      const paymentLink = `/transactions/search?txType=PAYMENT&address=${address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;
      const pendingArbitraryLink = `/transactions/unconfirmed?txType=ARBITRARY&creator=${address}&limit=0&reverse=true`;
      const pendingAssetLink = `/transactions/unconfirmed?txType=CANCEL_ASSET_ORDER&txType=CREATE_ASSET_ORDER&txType=ISSUE_ASSET&txType=TRANSFER_ASSET&txType=UPDATE_ASSET&creator=${address}&limit=0&reverse=true`;
      const pendingAtLink = `/transactions/unconfirmed?txType=AT&txType=DEPLOY_AT&txType=MESSAGE&creator=${address}&limit=0&reverse=true`;
      const pendingGroupLink = `/transactions/unconfirmed?txType=CREATE_GROUP&txType=UPDATE_GROUP&txType=ADD_GROUP_ADMIN&txType=REMOVE_GROUP_ADMIN&txType=GROUP_BAN&txType=CANCEL_GROUP_BAN&txType=GROUP_KICK&txType=GROUP_INVITE&txType=CANCEL_GROUP_INVITE&txType=JOIN_GROUP&txType=LEAVE_GROUP&txType=GROUP_APPROVAL&txType=SET_GROUP&creator=${address}&limit=0&reverse=true`;
      const pendingNameLink = `/transactions/unconfirmed?txType=REGISTER_NAME&txType=UPDATE_NAME&txType=SELL_NAME&txType=CANCEL_SELL_NAME&txType=BUY_NAME&creator=${address}&limit=0&reverse=true`;
      const pendingPaymentLink = `/transactions/unconfirmed?txType=PAYMENT&creator=${address}&limit=0&reverse=true`;
      const pendingPollLink = `/transactions/unconfirmed?txType=CREATE_POLL&txType=VOTE_ON_POLL&creator=${address}&limit=0&reverse=true`;
      const pendingRewardshareLink = `/transactions/unconfirmed?txType=REWARD_SHARE&txType=TRANSFER_PRIVS&txType=PRESENCE&creator=${address}&limit=0&reverse=true`;
      const pollLink = `/transactions/search?txType=CREATE_POLL&txType=VOTE_ON_POLL&address=${address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;
      const rewardshareLink = `/transactions/search?txType=REWARD_SHARE&txType=TRANSFER_PRIVS&txType=PRESENCE&address=${address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;

      const compareFn = (
        a: { timestamp: number },
        b: { timestamp: number }
      ) => {
        return b.timestamp - a.timestamp;
      };

      const toArray = (value: unknown) =>
        Array.isArray(value) ? value : ([] as any[]);

      const fetchPayment = async () => {
        const paymentResponse = await fetch(paymentLink, { signal });
        const pendingPaymentResponse = await fetch(pendingPaymentLink, {
          signal,
        });
        const paymentResult = await paymentResponse.json();
        const pendingPaymentResult = await pendingPaymentResponse.json();
        const allPayment = [
          ...toArray(paymentResult),
          ...toArray(pendingPaymentResult),
        ];
        const allPaymentSorted = (await replaceAddressesWithNames(
          allPayment.sort(compareFn)
        )) as any[];
        setPaymentInfo(allPaymentSorted);
        return allPaymentSorted;
      };

      const fetchArbitrary = async () => {
        const arbitraryResponse = await fetch(arbitraryLink, { signal });
        const pendingArbitraryResponse = await fetch(pendingArbitraryLink, {
          signal,
        });
        const arbitraryResult = await arbitraryResponse.json();
        const pendingArbitraryResult = await pendingArbitraryResponse.json();
        const allArbitrary = [
          ...toArray(arbitraryResult),
          ...toArray(pendingArbitraryResult),
        ];
        const allArbitrarySorted = (await replaceAddressesWithNames(
          allArbitrary.sort(compareFn)
        )) as any[];

        setArbitraryInfo(allArbitrarySorted);
        return allArbitrarySorted;
      };

      const fetchAt = async () => {
        const atResponse = await fetch(atLink, { signal });
        const pendingAtResponse = await fetch(pendingAtLink, { signal });
        const atResult = await atResponse.json();
        const pendingAtResult = await pendingAtResponse.json();
        const allAt = [...toArray(atResult), ...toArray(pendingAtResult)];
        const allAtSorted = (await replaceAddressesWithNames(
          allAt.sort(compareFn)
        )) as any[];

        setAtInfo(allAtSorted);
        return allAtSorted;
      };

      const fetchGroup = async () => {
        const groupResponse = await fetch(groupLink, { signal });
        const pendingGroupResponse = await fetch(pendingGroupLink, { signal });
        const groupResult = await groupResponse.json();
        const pendingGroupResult = await pendingGroupResponse.json();
        const allGroup = [
          ...toArray(groupResult),
          ...toArray(pendingGroupResult),
        ];
        const allGroupSorted = (await replaceAddressesWithNames(
          allGroup.sort(compareFn)
        )) as any[];
        setGroupInfo(allGroupSorted);
        return allGroupSorted;
      };

      const fetchName = async () => {
        const nameResponse = await fetch(nameLink, { signal });
        const pendingNameResponse = await fetch(pendingNameLink, { signal });
        const nameResult = await nameResponse.json();
        const pendingNameResult = await pendingNameResponse.json();
        const allName = [...toArray(nameResult), ...toArray(pendingNameResult)];
        const allNameSorted = (await replaceAddressesWithNames(
          allName.sort(compareFn)
        )) as any[];
        setNameInfo(allNameSorted);
        return allNameSorted;
      };

      const fetchAsset = async () => {
        const assetResponse = await fetch(assetLink, { signal });
        const pendingAssetResponse = await fetch(pendingAssetLink, { signal });
        const assetResult = await assetResponse.json();
        const pendingAssetResult = await pendingAssetResponse.json();
        const allAsset = [
          ...toArray(assetResult),
          ...toArray(pendingAssetResult),
        ];
        const allAssetSorted = (await replaceAddressesWithNames(
          allAsset.sort(compareFn)
        )) as any[];

        setAssetInfo(allAssetSorted);
        return allAssetSorted;
      };

      const fetchPoll = async () => {
        const pollResponse = await fetch(pollLink, { signal });
        const pendingPollResponse = await fetch(pendingPollLink, { signal });
        const pollResult = await pollResponse.json();
        const pendingPollResult = await pendingPollResponse.json();
        const allPoll = [...toArray(pollResult), ...toArray(pendingPollResult)];
        const allPollSorted = (await replaceAddressesWithNames(
          allPoll.sort(compareFn)
        )) as any[];

        setPollInfo(allPollSorted);
        return allPollSorted;
      };

      const fetchRewardshare = async () => {
        const rewardshareResponse = await fetch(rewardshareLink, { signal });
        const pendingRewardshareResponse = await fetch(pendingRewardshareLink, {
          signal,
        });
        const rewardshareResult = await rewardshareResponse.json();
        const pendingRewardshareResult =
          await pendingRewardshareResponse.json();
        const allRewardshare = [
          ...toArray(rewardshareResult),
          ...toArray(pendingRewardshareResult),
        ];
        const allRewardshareSorted = (await replaceAddressesWithNames(
          allRewardshare.sort(compareFn)
        )) as any[];

        setRewardshareInfo(allRewardshareSorted);
        return allRewardshareSorted;
      };

      try {
        const [
          arbitraries,
          assets,
          ats,
          groups,
          names,
          payments,
          polls,
          rewardshares,
        ] = await Promise.all([
          fetchPayment(),
          fetchArbitrary(),
          fetchAt(),
          fetchGroup(),
          fetchName(),
          fetchAsset(),
          fetchPoll(),
          fetchRewardshare(),
        ]);

        const combinedTransactions = [
          arbitraries,
          assets,
          ats,
          groups,
          names,
          payments,
          polls,
          rewardshares,
        ].reduce<any[]>((acc, list) => {
          if (Array.isArray(list)) {
            acc.push(...list);
          }
          return acc;
        }, []);

        setAllInfo(combinedTransactions.sort(compareFn));
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        console.error('Failed to fetch QORT transactions', error);
        setAllInfo([]);
      } finally {
        setLoadingRefreshQort(false);
      }
    },
    [address]
  );

  const handleLoadingRefreshQort = async () => {
    await getQortalTransactions();
  };

  const getWalletBalanceQort = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setIsLoadingWalletBalanceQort(true);
        const balanceLink = `/addresses/balance/${address}`;
        const response = await fetch(balanceLink, { signal });
        const data = await response.json();
        setWalletBalanceQort(data);
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        console.error(error);
      } finally {
        setIsLoadingWalletBalanceQort(false);
      }
    },
    [address]
  );

  useEffect(() => {
    if (!address) return;

    const controller = new AbortController();
    const intervalGetWalletBalance = setInterval(() => {
      getWalletBalanceQort();
    }, TIME_MINUTES_1);
    getWalletBalanceQort(controller.signal);

    return () => {
      clearInterval(intervalGetWalletBalance);
      controller.abort();
    };
  }, [address, getWalletBalanceQort]);

  useEffect(() => {
    let cancelled = false;

    const fetchQortTxFee = async () => {
      try {
        const res = await fetch('/transactions/unitfee?txType=PAYMENT');
        const rawFee = await res.json();

        if (!cancelled && typeof rawFee === 'number' && rawFee > 0) {
          setQortTxFee(rawFee / QORT_1_UNIT);
        }
      } catch (err) {
        console.error('Failed to fetch QORT tx fee', err);
      }
    };

    fetchQortTxFee();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!address) return;

    const controller = new AbortController();
    getQortalTransactions(controller.signal);

    return () => {
      controller.abort();
    };
  }, [address, getQortalTransactions]);

  const sendQortRequest = async () => {
    setOpenTxQortSubmit(true);
    try {
      const sendRequest = await qortalRequest({
        action: 'SEND_COIN',
        coin: Coin.QORT,
        recipient: qortRecipient,
        amount: qortAmount,
      });
      if (!sendRequest?.error) {
        setAmountError(null);
        setAmountTouched(false);
        setRecipientError(null);
        setRecipientTouched(false);

        setQortAmount(0);
        setQortRecipient(EMPTY_STRING);
        setOpenTxQortSubmit(false);
        setOpenSendQortSuccess(true);

        await timeoutDelay(TIME_SECONDS_3);
        getWalletBalanceQort();
        getQortalTransactions();
      }
    } catch (error) {
      setQortAmount(0);
      setQortRecipient(EMPTY_STRING);
      setOpenTxQortSubmit(false);
      setOpenSendQortError(true);
      await timeoutDelay(TIME_SECONDS_3);
      getWalletBalanceQort();
      getQortalTransactions();
      console.error('ERROR SENDING QORT', error);
    }
  };

  const tablePayment = () => {
    if (paymentInfo && paymentInfo.length > 0) {
      return (
        <>
          <TableContainer component={Paper}>
            <Table
              stickyHeader
              sx={{ width: '100%' }}
              aria-label="payments-table"
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">
                    {t('core:status', {
                      postProcess: 'capitalizeFirstChar',
                    })}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {t('core:type', {
                      postProcess: 'capitalizeFirstChar',
                    })}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {t('core:creator', {
                      postProcess: 'capitalizeFirstChar',
                    })}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {t('core:recipient', {
                      postProcess: 'capitalizeFirstChar',
                    })}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {t('core:amount', {
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
                  ? paymentInfo.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                  : paymentInfo
                ).map(
                  (
                    row: {
                      amount: number;
                      approvalStatus: string;
                      blockHeight: number;
                      creatorAddress: string;
                      creatorAddressOriginal?: string;
                      fee: number;
                      recipient: string;
                      recipientOriginal?: string;
                      reference: string;
                      senderPublicKey: string;
                      signature: string;
                      timestamp: number;
                      txGroupId: number;
                      type: string;
                    },
                    a: Key
                  ) => (
                    <StyledTableRow key={a}>
                      <StyledTableCell style={{ width: 'auto' }} align="center">
                        {(() => {
                          let confirmations: number =
                            nodeInfo?.height - row?.blockHeight;
                          if (confirmations < 3) {
                            return (
                              <Tooltip
                                placement="top"
                                title={t(
                                  'core:message.generic.confirmations_third',
                                  {
                                    postProcess: 'capitalizeFirstChar',
                                    count: confirmations,
                                  }
                                )}
                              >
                                <HistoryToggleOff
                                  style={{
                                    fontSize: '15px',
                                    color: theme.palette.error.main,
                                    marginTop: '2px',
                                  }}
                                />
                              </Tooltip>
                            );
                          } else {
                            let confirmations: number =
                              nodeInfo?.height - row?.blockHeight;
                            return (
                              <Tooltip
                                placement="top"
                                title={t('core:message.generic.confirmations', {
                                  postProcess: 'capitalizeFirstChar',
                                  count: confirmations,
                                })}
                              >
                                <CheckCircleOutline
                                  style={{
                                    fontSize: '15px',
                                    color: theme.palette.success.main,
                                    marginTop: '2px',
                                  }}
                                />
                              </Tooltip>
                            );
                          }
                        })()}
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        {row?.type}
                      </StyledTableCell>
                      <StyledTableCell
                        style={{ width: 'auto', cursor: 'pointer' }}
                        align="left"
                        title={t('core:action.double_click_addressbook', {
                          address:
                            row?.creatorAddressOriginal || row?.creatorAddress,
                        })}
                        onDoubleClick={() =>
                          handleOpenAddressBookWithData(
                            row?.creatorAddress || EMPTY_STRING,
                            row?.creatorAddressOriginal ||
                              row?.creatorAddress ||
                              EMPTY_STRING
                          )
                        }
                      >
                        {row?.creatorAddress === address ||
                        row?.creatorAddress === userName ? (
                          <Box style={{ color: theme.palette.info.main }}>
                            {row?.creatorAddress}
                          </Box>
                        ) : (
                          row?.creatorAddress
                        )}
                      </StyledTableCell>
                      <StyledTableCell
                        style={{ width: 'auto', cursor: 'pointer' }}
                        align="left"
                        title={t('core:action.double_click_addressbook', {
                          address: row?.recipientOriginal || row?.recipient,
                        })}
                        onDoubleClick={() =>
                          handleOpenAddressBookWithData(
                            row?.recipient || EMPTY_STRING,
                            row?.recipientOriginal ||
                              row?.recipient ||
                              EMPTY_STRING
                          )
                        }
                      >
                        {row?.recipient === address ||
                        row?.recipient === userName ? (
                          <Box style={{ color: theme.palette.info.main }}>
                            {row?.recipient}
                          </Box>
                        ) : (
                          row?.recipient
                        )}
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        {row?.recipient === address ||
                        row?.recipient === userName ? (
                          <Box style={{ color: theme.palette.success.main }}>
                            + {row?.amount}
                          </Box>
                        ) : (
                          <Box style={{ color: theme.palette.error.main }}>
                            - {row?.amount}
                          </Box>
                        )}
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        {row?.fee}
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        <CustomWidthTooltip
                          placement="top"
                          title={new Date(row?.timestamp).toLocaleString()}
                        >
                          <Box>{epochToAgo(row?.timestamp)}</Box>
                        </CustomWidthTooltip>
                      </StyledTableCell>
                    </StyledTableRow>
                  )
                )}
                {emptyRowsPayment > 0 && (
                  <TableRow style={{ height: 53 * emptyRowsPayment }}>
                    <TableCell colSpan={7} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div" // important when used outside <Table>
            labelRowsPerPage={t('core:rows_per_page', {
              postProcess: 'capitalizeFirstChar',
            })}
            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
            count={paymentInfo.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            ActionsComponent={TablePaginationActions}
          />
        </>
      );
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          {t('core:message.generic.no_transactions', {
            postProcess: 'capitalizeFirstChar',
            transaction_type: 'PAYMENT',
          })}
        </Typography>
      );
    }
  };

  const tableArbitrary = () => {
    if (arbitraryInfo && arbitraryInfo.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table
            stickyHeader
            sx={{ width: '100%' }}
            aria-label="arbitrary-table"
          >
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">
                  {t('core:status', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {t('core:type', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:creator', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:identifier', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:size', {
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
                ? arbitraryInfo.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : arbitraryInfo
              ).map(
                (
                  row: {
                    blockHeight: number;
                    type: string;
                    creatorAddress: string;
                    creatorAddressOriginal?: string;
                    identifier: string;
                    size: number;
                    fee: number;
                    timestamp: number;
                  },
                  b: Key
                ) => (
                  <StyledTableRow key={b}>
                    <StyledTableCell style={{ width: 'auto' }} align="center">
                      {(() => {
                        let confirmations: number =
                          nodeInfo?.height - row?.blockHeight;
                        if (confirmations < 3) {
                          return (
                            <Tooltip
                              placement="top"
                              title={t(
                                'core:message.generic.confirmations_third',
                                {
                                  postProcess: 'capitalizeFirstChar',
                                  count: confirmations,
                                }
                              )}
                            >
                              <HistoryToggleOff
                                style={{
                                  fontSize: '15px',
                                  color: theme.palette.error.main,
                                  marginTop: '2px',
                                }}
                              />
                            </Tooltip>
                          );
                        } else {
                          return (
                            <Tooltip
                              placement="top"
                              title={t('core:message.generic.confirmations', {
                                postProcess: 'capitalizeFirstChar',
                                count: confirmations,
                              })}
                            >
                              <CheckCircleOutline
                                style={{
                                  fontSize: '15px',
                                  color: theme.palette.success.main,
                                  marginTop: '2px',
                                }}
                              />
                            </Tooltip>
                          );
                        }
                      })()}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.type}
                    </StyledTableCell>
                    <StyledTableCell
                      style={{ width: 'auto', cursor: 'pointer' }}
                      align="left"
                      title={t('core:action.double_click_addressbook', {
                        address:
                          row?.creatorAddressOriginal || row?.creatorAddress,
                      })}
                      onDoubleClick={() =>
                        handleOpenAddressBookWithData(
                          row?.creatorAddress || EMPTY_STRING,
                          row?.creatorAddressOriginal ||
                            row?.creatorAddress ||
                            EMPTY_STRING
                        )
                      }
                    >
                      {row?.creatorAddress === address ||
                      row?.creatorAddress === userName ? (
                        <Box style={{ color: theme.palette.info.main }}>
                          {row?.creatorAddress}
                        </Box>
                      ) : (
                        row?.creatorAddress
                      )}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.identifier}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      <Box style={{ color: theme.palette.success.main }}>
                        {humanFileSize(row?.size, true, 2)}
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.fee}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      <CustomWidthTooltip
                        placement="top"
                        title={new Date(row?.timestamp).toLocaleString()}
                      >
                        <Box>{epochToAgo(row?.timestamp)}</Box>
                      </CustomWidthTooltip>
                    </StyledTableCell>
                  </StyledTableRow>
                )
              )}
              {emptyRowsArbitrary > 0 && (
                <TableRow style={{ height: 53 * emptyRowsArbitrary }}>
                  <TableCell colSpan={7} />
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
                  colSpan={7}
                  count={arbitraryInfo.length}
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
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          {t('core:message.generic.no_transactions', {
            postProcess: 'capitalizeFirstChar',
            transaction_type: 'ARBITRARY',
          })}
        </Typography>
      );
    }
  };

  const tableAt = () => {
    if (atInfo && atInfo.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table stickyHeader sx={{ width: '100%' }} aria-label="at-table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">
                  {t('core:status', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {t('core:type', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:creator', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:recipient', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:amount', {
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
                ? atInfo.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : atInfo
              ).map(
                (
                  row: {
                    blockHeight: number;
                    type: string;
                    creatorAddress: string;
                    creatorAddressOriginal?: string;
                    recipient: string;
                    recipientOriginal?: string;
                    description: string | '';
                    amount: number;
                    fee: number;
                    timestamp: number;
                  },
                  c: Key
                ) => (
                  <StyledTableRow key={c}>
                    <StyledTableCell style={{ width: 'auto' }} align="center">
                      {(() => {
                        let confirmations: number =
                          nodeInfo?.height - row?.blockHeight;
                        if (confirmations < 3) {
                          return (
                            <Tooltip
                              placement="top"
                              title={t(
                                'core:message.generic.confirmations_third',
                                {
                                  postProcess: 'capitalizeFirstChar',
                                  count: confirmations,
                                }
                              )}
                            >
                              <HistoryToggleOff
                                style={{
                                  fontSize: '15px',
                                  color: theme.palette.error.main,
                                  marginTop: '2px',
                                }}
                              />
                            </Tooltip>
                          );
                        } else {
                          return (
                            <Tooltip
                              placement="top"
                              title={t('core:message.generic.confirmations', {
                                postProcess: 'capitalizeFirstChar',
                                count: confirmations,
                              })}
                            >
                              <CheckCircleOutline
                                style={{
                                  fontSize: '15px',
                                  color: theme.palette.success.main,
                                  marginTop: '2px',
                                }}
                              />
                            </Tooltip>
                          );
                        }
                      })()}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.type}
                    </StyledTableCell>
                    <StyledTableCell
                      style={{ width: 'auto', cursor: 'pointer' }}
                      align="left"
                      title={t('core:action.double_click_addressbook', {
                        address:
                          row?.creatorAddressOriginal || row?.creatorAddress,
                      })}
                      onDoubleClick={() =>
                        handleOpenAddressBookWithData(
                          row?.creatorAddress || EMPTY_STRING,
                          row?.creatorAddressOriginal ||
                            row?.creatorAddress ||
                            EMPTY_STRING
                        )
                      }
                    >
                      {row?.creatorAddress === address ||
                      row?.creatorAddress === userName ? (
                        <Box style={{ color: theme.palette.info.main }}>
                          {row?.creatorAddress}
                        </Box>
                      ) : (
                        row?.creatorAddress
                      )}
                    </StyledTableCell>
                    <StyledTableCell
                      style={{
                        width: 'auto',
                        cursor:
                          row?.recipientOriginal || row?.recipient
                            ? 'pointer'
                            : 'default',
                      }}
                      align="left"
                      title={
                        row?.recipientOriginal || row?.recipient
                          ? t('core:action.double_click_addressbook', {
                              address: row?.recipientOriginal || row?.recipient,
                            })
                          : undefined
                      }
                      onDoubleClick={() =>
                        (row?.recipientOriginal || row?.recipient) &&
                        handleOpenAddressBookWithData(
                          row?.recipient || EMPTY_STRING,
                          row?.recipientOriginal ||
                            row?.recipient ||
                            EMPTY_STRING
                        )
                      }
                    >
                      {(() => {
                        if (row?.recipient) {
                          if (
                            row?.recipient === address ||
                            row?.recipient === userName
                          ) {
                            return (
                              <Box style={{ color: theme.palette.info.main }}>
                                {row?.recipient}
                              </Box>
                            );
                          } else {
                            return row?.recipient;
                          }
                        } else if (row?.description) {
                          return row?.description;
                        } else {
                          return EMPTY_STRING;
                        }
                      })()}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.recipient === address ||
                      row?.recipient === userName ? (
                        <Box style={{ color: theme.palette.success.main }}>
                          + {row?.amount}
                        </Box>
                      ) : (
                        <Box style={{ color: theme.palette.error.main }}>
                          - {row?.amount}
                        </Box>
                      )}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.fee}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      <CustomWidthTooltip
                        placement="top"
                        title={new Date(row?.timestamp).toLocaleString()}
                      >
                        <Box>{epochToAgo(row?.timestamp)}</Box>
                      </CustomWidthTooltip>
                    </StyledTableCell>
                  </StyledTableRow>
                )
              )}
              {emptyRowsAt > 0 && (
                <TableRow style={{ height: 53 * emptyRowsAt }}>
                  <TableCell colSpan={7} />
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
                  colSpan={7}
                  count={atInfo.length}
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
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          {t('core:message.generic.no_transactions', {
            postProcess: 'capitalizeFirstChar',
            transaction_type: 'AT',
          })}
        </Typography>
      );
    }
  };

  const tableGroup = () => {
    if (groupInfo && groupInfo.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table stickyHeader sx={{ width: '100%' }} aria-label="group-table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">
                  {t('core:status', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:type', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:creator', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:info', {
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
                ? groupInfo.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : groupInfo
              ).map(
                (
                  row: {
                    admin: string;
                    blockHeight: number;
                    creatorAddress: string;
                    creatorAddressOriginal?: string;
                    fee: number;
                    groupId: number;
                    groupName: string;
                    invitee: string;
                    member: string;
                    newDescription: string;
                    offender: string;
                    reference: string;
                    timestamp: number;
                    type: string;
                  },
                  d: Key
                ) => (
                  <StyledTableRow key={d}>
                    <StyledTableCell style={{ width: 'auto' }} align="center">
                      {(() => {
                        let confirmations: number =
                          nodeInfo?.height - row?.blockHeight;
                        if (confirmations < 3) {
                          return (
                            <Tooltip
                              placement="top"
                              title={t(
                                'core:message.generic.confirmations_third',
                                {
                                  postProcess: 'capitalizeFirstChar',
                                  count: confirmations,
                                }
                              )}
                            >
                              <HistoryToggleOff
                                style={{
                                  fontSize: '15px',
                                  color: theme.palette.error.main,
                                  marginTop: '2px',
                                }}
                              />
                            </Tooltip>
                          );
                        } else {
                          return (
                            <Tooltip
                              placement="top"
                              title={t('core:message.generic.confirmations', {
                                postProcess: 'capitalizeFirstChar',
                                count: confirmations,
                              })}
                            >
                              <CheckCircleOutline
                                style={{
                                  fontSize: '15px',
                                  color: theme.palette.success.main,
                                  marginTop: '2px',
                                }}
                              />
                            </Tooltip>
                          );
                        }
                      })()}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.type}
                    </StyledTableCell>
                    <StyledTableCell
                      style={{ width: 'auto', cursor: 'pointer' }}
                      align="left"
                      title={t('core:action.double_click_addressbook', {
                        address:
                          row?.creatorAddressOriginal || row?.creatorAddress,
                      })}
                      onDoubleClick={() =>
                        handleOpenAddressBookWithData(
                          row?.creatorAddress || EMPTY_STRING,
                          row?.creatorAddressOriginal ||
                            row?.creatorAddress ||
                            EMPTY_STRING
                        )
                      }
                    >
                      {row?.creatorAddress === address ||
                      row?.creatorAddress === userName ? (
                        <Box style={{ color: theme.palette.info.main }}>
                          {row?.creatorAddress}
                        </Box>
                      ) : (
                        row?.creatorAddress
                      )}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {(() => {
                        if (row?.type === 'CREATE_GROUP') {
                          return t('core:message.group_actions.create_group', {
                            groupName: row?.groupName,
                            id: row?.groupId,
                            postProcess: 'capitalizeFirstChar',
                          });
                        } else if (row?.type === 'UPDATE_GROUP') {
                          return t('core:message.group_actions.update_group', {
                            newDescription: row?.newDescription,
                            id: row?.groupId,
                            postProcess: 'capitalizeFirstChar',
                          });
                        } else if (row?.type === 'ADD_GROUP_ADMIN') {
                          return t(
                            'core:message.group_actions.add_group_admin',
                            {
                              member: row?.member,
                              id: row?.groupId,
                              postProcess: 'capitalizeFirstChar',
                            }
                          );
                        } else if (row?.type === 'REMOVE_GROUP_ADMIN') {
                          return t(
                            'core:message.group_actions.remove_group_admin',
                            {
                              admn: row?.admin,
                              id: row?.groupId,
                              postProcess: 'capitalizeFirstChar',
                            }
                          );
                        } else if (row?.type === 'GROUP_BAN') {
                          return t('core:message.group_actions.group_ban', {
                            offender: row?.offender,
                            id: row?.groupId,
                            postProcess: 'capitalizeFirstChar',
                          });
                        } else if (row?.type === 'CANCEL_GROUP_BAN') {
                          return t(
                            'core:message.group_actions.cancel_group_ban',
                            {
                              member: row?.member,
                              id: row?.groupId,
                              postProcess: 'capitalizeFirstChar',
                            }
                          );
                        } else if (row?.type === 'GROUP_KICK') {
                          return t('core:message.group_actions.group_kick', {
                            member: row?.member,
                            id: row?.groupId,
                            postProcess: 'capitalizeFirstChar',
                          });
                        } else if (row?.type === 'GROUP_INVITE') {
                          if (row?.invitee === address) {
                            return (
                              <Box>
                                <Trans
                                  i18nKey="message.group_actions.group_invite"
                                  values={{
                                    invitee: row?.invitee,
                                    id: row?.groupId,
                                  }}
                                  components={{
                                    blue: (
                                      <span
                                        style={{
                                          color: theme.palette.info.main,
                                          marginLeft: '5px',
                                          marginRight: '5px',
                                        }}
                                      />
                                    ),
                                  }}
                                />
                              </Box>
                            );
                          } else {
                            return (
                              'Invitee: ' +
                              row?.invitee +
                              ' ID: ' +
                              row?.groupId
                            );
                          }
                        } else if (row?.type === 'CANCEL_GROUP_INVITE') {
                          return t('core:message.group_actions.reference', {
                            reference: row?.reference,
                            postProcess: 'capitalizeFirstChar',
                          });
                        } else if (row?.type === 'JOIN_GROUP') {
                          return t('core:message.group_actions.join_group', {
                            id: row?.groupId,
                            postProcess: 'capitalizeFirstChar',
                          });
                        } else if (row?.type === 'LEAVE_GROUP') {
                          return t('core:message.group_actions.leave_group', {
                            id: row?.groupId,
                            postProcess: 'capitalizeFirstChar',
                          });
                        } else if (row?.type === 'GROUP_APPROVAL') {
                          return t('core:message.group_actions.reference', {
                            reference: row?.reference,
                            postProcess: 'capitalizeFirstChar',
                          });
                        } else if (row?.type === 'SET_GROUP') {
                          return EMPTY_STRING;
                        }
                      })()}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.fee}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      <CustomWidthTooltip
                        placement="top"
                        title={new Date(row?.timestamp).toLocaleString()}
                      >
                        <Box>{epochToAgo(row?.timestamp)}</Box>
                      </CustomWidthTooltip>
                    </StyledTableCell>
                  </StyledTableRow>
                )
              )}
              {emptyRowsGroup > 0 && (
                <TableRow style={{ height: 53 * emptyRowsGroup }}>
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
                  colSpan={6}
                  count={groupInfo.length}
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
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          {t('core:message.generic.no_transactions', {
            postProcess: 'capitalizeFirstChar',
            transaction_type: 'GROUP',
          })}
        </Typography>
      );
    }
  };

  const tableName = () => {
    if (nameInfo && nameInfo.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table stickyHeader sx={{ width: '100%' }} aria-label="group-table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">
                  {t('core:status', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:type', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:creator', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:info', {
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
                ? nameInfo.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : nameInfo
              ).map(
                (
                  row: {
                    blockHeight: number;
                    type: string;
                    creatorAddress: string;
                    name: string;
                    newName: string;
                    seller: string;
                    amount: number;
                    fee: number;
                    timestamp: number;
                  },
                  e: Key
                ) => (
                  <StyledTableRow key={e}>
                    <StyledTableCell style={{ width: 'auto' }} align="center">
                      {(() => {
                        let confirmations: number =
                          nodeInfo?.height - row?.blockHeight;
                        if (confirmations < 3) {
                          return (
                            <Tooltip
                              placement="top"
                              title={t(
                                'core:message.generic.confirmations_third',
                                {
                                  postProcess: 'capitalizeFirstChar',
                                  count: confirmations,
                                }
                              )}
                            >
                              <HistoryToggleOff
                                style={{
                                  fontSize: '15px',
                                  color: theme.palette.error.main,
                                  marginTop: '2px',
                                }}
                              />
                            </Tooltip>
                          );
                        } else {
                          return (
                            <Tooltip
                              placement="top"
                              title={t('core:message.generic.confirmations', {
                                postProcess: 'capitalizeFirstChar',
                                count: confirmations,
                              })}
                            >
                              <CheckCircleOutline
                                style={{
                                  fontSize: '15px',
                                  color: theme.palette.success.main,
                                  marginTop: '2px',
                                }}
                              />
                            </Tooltip>
                          );
                        }
                      })()}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.type}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.creatorAddress === address ||
                      row?.creatorAddress === userName ? (
                        <Box style={{ color: theme.palette.info.main }}>
                          {row?.creatorAddress}
                        </Box>
                      ) : (
                        row?.creatorAddress
                      )}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {(() => {
                        if (row?.type === 'REGISTER_NAME') {
                          return t('core:qortal.registered_name', {
                            name: row?.name,
                            postProcess: 'capitalizeFirstChar',
                          });
                        } else if (row?.type === 'UPDATE_NAME') {
                          return t('core:qortal.old_new_name', {
                            oldName: row?.name,
                            newName: row?.newName,
                            postProcess: 'capitalizeFirstChar',
                          });
                        } else if (row?.type === 'SELL_NAME') {
                          return t('core:qortal.name_to_sell', {
                            name: row?.name,
                            amount: row?.amount,
                            postProcess: 'capitalizeFirstChar',
                          });
                        } else if (row?.type === 'CANCEL_SELL_NAME') {
                          return t('core:qortal.cancelled_name_sale', {
                            name: row?.name,
                            postProcess: 'capitalizeFirstChar',
                          });
                        } else if (row?.type === 'BUY_NAME') {
                          return t('core:qortal.seller', {
                            seller: row?.seller,
                            amount: row?.amount,
                            postProcess: 'capitalizeFirstChar',
                          });
                        }
                      })()}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.fee}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      <CustomWidthTooltip
                        placement="top"
                        title={new Date(row?.timestamp).toLocaleString()}
                      >
                        <Box>{epochToAgo(row?.timestamp)}</Box>
                      </CustomWidthTooltip>
                    </StyledTableCell>
                  </StyledTableRow>
                )
              )}
              {emptyRowsName > 0 && (
                <TableRow style={{ height: 53 * emptyRowsName }}>
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
                  colSpan={6}
                  count={nameInfo.length}
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
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          {t('core:message.generic.no_transactions', {
            postProcess: 'capitalizeFirstChar',
            transaction_type: 'NAME',
          })}
        </Typography>
      );
    }
  };

  const tableAsset = () => {
    if (assetInfo && assetInfo.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table stickyHeader sx={{ width: '100%' }} aria-label="group-table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">
                  {t('core:status', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:type', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:creator', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:recipient', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:amount', {
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
                ? assetInfo.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : assetInfo
              ).map(
                (
                  row: {
                    amount: number;
                    assetName: string;
                    blockHeight: number;
                    creatorAddress: string;
                    description: string;
                    fee: number;
                    quantity: number;
                    recipient: string;
                    timestamp: number;
                    type: string;
                  },
                  f: Key
                ) => (
                  <StyledTableRow key={f}>
                    <StyledTableCell style={{ width: 'auto' }} align="center">
                      {(() => {
                        let confirmations: number =
                          nodeInfo?.height - row?.blockHeight;
                        if (confirmations < 3) {
                          return (
                            <Tooltip
                              placement="top"
                              title={t(
                                'core:message.generic.confirmations_third',
                                {
                                  postProcess: 'capitalizeFirstChar',
                                  count: confirmations,
                                }
                              )}
                            >
                              <HistoryToggleOff
                                style={{
                                  fontSize: '15px',
                                  color: theme.palette.error.main,
                                  marginTop: '2px',
                                }}
                              />
                            </Tooltip>
                          );
                        } else {
                          return (
                            <Tooltip
                              placement="top"
                              title={t('core:message.generic.confirmations', {
                                postProcess: 'capitalizeFirstChar',
                                count: confirmations,
                              })}
                            >
                              <CheckCircleOutline
                                style={{
                                  fontSize: '15px',
                                  color: theme.palette.success.main,
                                  marginTop: '2px',
                                }}
                              />
                            </Tooltip>
                          );
                        }
                      })()}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.type}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.creatorAddress === address ||
                      row?.creatorAddress === userName ? (
                        <Box style={{ color: theme.palette.info.main }}>
                          {row?.creatorAddress}
                        </Box>
                      ) : (
                        row?.creatorAddress
                      )}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {(() => {
                        if (row?.type === 'TRANSFER_ASSET') {
                          return row?.recipient === address ||
                            row?.recipient === userName ? (
                            <Box style={{ color: theme.palette.info.main }}>
                              {row?.recipient}
                            </Box>
                          ) : (
                            row?.recipient
                          );
                        } else if (row?.type === 'ISSUE_ASSET') {
                          return t('core:qortal.asset_name', {
                            name: row?.assetName,
                            postProcess: 'capitalizeFirstChar',
                          });
                        }
                      })()}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.amount ? row?.amount : row?.quantity}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.fee}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      <CustomWidthTooltip
                        placement="top"
                        title={new Date(row?.timestamp).toLocaleString()}
                      >
                        <Box>{epochToAgo(row?.timestamp)}</Box>
                      </CustomWidthTooltip>
                    </StyledTableCell>
                  </StyledTableRow>
                )
              )}
              {emptyRowsAsset > 0 && (
                <TableRow style={{ height: 53 * emptyRowsAsset }}>
                  <TableCell colSpan={7} />
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
                  colSpan={7}
                  count={assetInfo.length}
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
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          {t('core:message.generic.no_transactions', {
            postProcess: 'capitalizeFirstChar',
            transaction_type: 'ASSET',
          })}
        </Typography>
      );
    }
  };

  const tablePoll = () => {
    if (pollInfo && pollInfo.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table stickyHeader sx={{ width: '100%' }} aria-label="group-table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">
                  {t('core:status', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {t('core:type', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:creator', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:poll_name', {
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
                ? pollInfo.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : pollInfo
              ).map(
                (
                  row: {
                    blockHeight: number;
                    creatorAddress: string;
                    fee: number;
                    pollName: string;
                    timestamp: number;
                    type: string;
                  },
                  g: Key
                ) => (
                  <StyledTableRow key={g}>
                    <StyledTableCell style={{ width: 'auto' }} align="center">
                      {(() => {
                        let confirmations: number =
                          nodeInfo?.height - row?.blockHeight;
                        if (confirmations < 3) {
                          return (
                            <Tooltip
                              placement="top"
                              title={t(
                                'core:message.generic.confirmations_third',
                                {
                                  postProcess: 'capitalizeFirstChar',
                                  count: confirmations,
                                }
                              )}
                            >
                              <HistoryToggleOff
                                style={{
                                  fontSize: '15px',
                                  color: theme.palette.error.main,
                                  marginTop: '2px',
                                }}
                              />
                            </Tooltip>
                          );
                        } else {
                          return (
                            <Tooltip
                              placement="top"
                              title={t('core:message.generic.confirmations', {
                                postProcess: 'capitalizeFirstChar',
                                count: confirmations,
                              })}
                            >
                              <CheckCircleOutline
                                style={{
                                  fontSize: '15px',
                                  color: theme.palette.success.main,
                                  marginTop: '2px',
                                }}
                              />
                            </Tooltip>
                          );
                        }
                      })()}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.type}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.creatorAddress === address ||
                      row?.creatorAddress === userName ? (
                        <Box style={{ color: theme.palette.info.main }}>
                          {row?.creatorAddress}
                        </Box>
                      ) : (
                        row?.creatorAddress
                      )}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.pollName}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.fee}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      <CustomWidthTooltip
                        placement="top"
                        title={new Date(row?.timestamp).toLocaleString()}
                      >
                        <Box>{epochToAgo(row?.timestamp)}</Box>
                      </CustomWidthTooltip>
                    </StyledTableCell>
                  </StyledTableRow>
                )
              )}
              {emptyRowsPoll > 0 && (
                <TableRow style={{ height: 53 * emptyRowsPoll }}>
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
                  colSpan={6}
                  count={pollInfo.length}
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
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          {t('core:message.generic.no_transactions', {
            postProcess: 'capitalizeFirstChar',
            transaction_type: 'POLL',
          })}
        </Typography>
      );
    }
  };

  const tableRewardshare = () => {
    if (rewardshareInfo && rewardshareInfo.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table
            stickyHeader
            sx={{ width: '100%' }}
            aria-label="payments-table"
          >
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">
                  {t('core:status', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:type', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:creator', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:recipient', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:info', {
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
                ? rewardshareInfo.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : rewardshareInfo
              ).map(
                (
                  row: {
                    blockHeight: number;
                    creatorAddress: string;
                    fee: number;
                    recipient: string;
                    rewardSharePublicKey: string;
                    sharePercent: string;
                    timestamp: number;
                    type: string;
                  },
                  h: Key
                ) => (
                  <StyledTableRow key={h}>
                    <StyledTableCell style={{ width: 'auto' }} align="center">
                      {(() => {
                        let confirmations: number =
                          nodeInfo?.height - row?.blockHeight;
                        if (confirmations < 3) {
                          return (
                            <Tooltip
                              placement="top"
                              title={t(
                                'core:message.generic.confirmations_third',
                                {
                                  postProcess: 'capitalizeFirstChar',
                                  count: confirmations,
                                }
                              )}
                            >
                              <HistoryToggleOff
                                style={{
                                  fontSize: '15px',
                                  color: theme.palette.error.main,
                                  marginTop: '2px',
                                }}
                              />
                            </Tooltip>
                          );
                        } else {
                          return (
                            <Tooltip
                              placement="top"
                              title={t('core:message.generic.confirmations', {
                                postProcess: 'capitalizeFirstChar',
                                count: confirmations,
                              })}
                            >
                              <CheckCircleOutline
                                style={{
                                  fontSize: '15px',
                                  color: theme.palette.success.main,
                                  marginTop: '2px',
                                }}
                              />
                            </Tooltip>
                          );
                        }
                      })()}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.type}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.creatorAddress === address ||
                      row?.creatorAddress === userName ? (
                        <Box style={{ color: theme.palette.info.main }}>
                          {row?.creatorAddress}
                        </Box>
                      ) : (
                        row?.creatorAddress
                      )}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.recipient === address ||
                      row?.recipient === userName ? (
                        <Box style={{ color: theme.palette.info.main }}>
                          {row?.recipient}
                        </Box>
                      ) : (
                        row?.recipient
                      )}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.sharePercent?.startsWith('-') ? (
                        <Box
                          style={{
                            color: theme.palette.error.main,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {t('core:qortal.removed', {
                            postProcess: 'capitalizeFirstChar',
                          })}
                          <CustomWidthTooltip
                            placement="top"
                            title={
                              row?.recipient === row?.creatorAddress
                                ? 'Minting Key: ' + row?.rewardSharePublicKey
                                : EMPTY_STRING
                            }
                          >
                            <InfoOutlined
                              style={{
                                fontSize: '14px',
                                color: theme.palette.info.main,
                                marginLeft: '8px',
                              }}
                            />
                          </CustomWidthTooltip>
                        </Box>
                      ) : (
                        <Box
                          style={{
                            color: theme.palette.success.main,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {t('core:qortal.created', {
                            postProcess: 'capitalizeFirstChar',
                          })}
                          <CustomWidthTooltip
                            placement="top"
                            title={
                              row?.recipient === row?.creatorAddress ||
                              row?.recipient === userName
                                ? 'Minting Key: ' + row?.rewardSharePublicKey
                                : EMPTY_STRING
                            }
                          >
                            <InfoOutlined
                              style={{
                                fontSize: '14px',
                                color: theme.palette.info.main,
                                marginLeft: '8px',
                              }}
                            />
                          </CustomWidthTooltip>
                        </Box>
                      )}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.fee}
                    </StyledTableCell>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      <CustomWidthTooltip
                        placement="top"
                        title={new Date(row?.timestamp).toLocaleString()}
                      >
                        <Box>{epochToAgo(row?.timestamp)}</Box>
                      </CustomWidthTooltip>
                    </StyledTableCell>
                  </StyledTableRow>
                )
              )}
              {emptyRowsRewardshare > 0 && (
                <TableRow style={{ height: 53 * emptyRowsRewardshare }}>
                  <TableCell colSpan={7} />
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
                  colSpan={7}
                  count={rewardshareInfo.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  slotProps={{
                    select: {
                      inputProps: {
                        'aria-label': 'row per page',
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
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          {t('core:message.generic.no_transactions', {
            postProcess: 'capitalizeFirstChar',
            transaction_type: 'REWARDSHARE',
          })}
        </Typography>
      );
    }
  };

  const tableAll = () => {
    if (allInfo && allInfo.length > 0) {
      return (
        <>
          <TableContainer component={Paper}>
            <Table stickyHeader sx={{ width: '100%' }} aria-label="all-table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">
                    {t('core:status', {
                      postProcess: 'capitalizeFirstChar',
                    })}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {t('core:type', {
                      postProcess: 'capitalizeFirstChar',
                    })}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {t('core:creator', {
                      postProcess: 'capitalizeFirstChar',
                    })}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {t('core:identifier', {
                      postProcess: 'capitalizeFirstChar',
                    })}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {t('core:size', {
                      postProcess: 'capitalizeFirstChar',
                    })}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {t('core:recipient', {
                      postProcess: 'capitalizeFirstChar',
                    })}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {t('core:amount', {
                      postProcess: 'capitalizeFirstChar',
                    })}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {t('core:info', {
                      postProcess: 'capitalizeFirstChar',
                    })}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {t('core:poll_name', {
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
                  ? allInfo.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                  : allInfo
                ).map(
                  (
                    row: {
                      amount: number;
                      blockHeight: number;
                      creatorAddress: string;
                      fee: number;
                      identifier: string;
                      name: string;
                      newName: string;
                      pollName: string;
                      recipient: string;
                      rewardSharePublicKey: string;
                      seller: string;
                      sharePercent: string;
                      size: number;
                      timestamp: number;
                      type: string;
                    },
                    h: Key
                  ) => (
                    <StyledTableRow key={h}>
                      <StyledTableCell style={{ width: 'auto' }} align="center">
                        {(() => {
                          let confirmations: number =
                            nodeInfo?.height - row?.blockHeight;
                          if (confirmations < 3) {
                            return (
                              <Tooltip
                                placement="top"
                                title={t(
                                  'core:message.generic.confirmations_third',
                                  {
                                    postProcess: 'capitalizeFirstChar',
                                    count: confirmations,
                                  }
                                )}
                              >
                                <HistoryToggleOff
                                  style={{
                                    fontSize: '15px',
                                    color: theme.palette.error.main,
                                    marginTop: '2px',
                                  }}
                                />
                              </Tooltip>
                            );
                          } else {
                            return (
                              <Tooltip
                                placement="top"
                                title={t('core:message.generic.confirmations', {
                                  postProcess: 'capitalizeFirstChar',
                                  count: confirmations,
                                })}
                              >
                                <CheckCircleOutline
                                  style={{
                                    fontSize: '15px',
                                    color: theme.palette.success.main,
                                    marginTop: '2px',
                                  }}
                                />
                              </Tooltip>
                            );
                          }
                        })()}
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        {row?.type}
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        <CustomWidthTooltip
                          placement="top"
                          title={row?.creatorAddress}
                        >
                          <Box>
                            {row?.creatorAddress === address ||
                            row?.creatorAddress === userName ? (
                              <Box style={{ color: theme.palette.info.main }}>
                                {cropString(row?.creatorAddress)}
                              </Box>
                            ) : (
                              cropString(row?.creatorAddress)
                            )}
                          </Box>
                        </CustomWidthTooltip>
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        <CustomWidthTooltip
                          placement="top"
                          title={row?.identifier}
                        >
                          <Box>
                            {row?.identifier
                              ? cropString(row?.identifier)
                              : EMPTY_STRING}
                          </Box>
                        </CustomWidthTooltip>
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="right">
                        {row?.size > 0
                          ? humanFileSize(row?.size, true, 2)
                          : EMPTY_STRING}
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        <CustomWidthTooltip
                          placement="top"
                          title={row?.recipient}
                        >
                          <Box>
                            {row?.recipient === address ||
                            row?.recipient === userName ? (
                              <Box style={{ color: theme.palette.info.main }}>
                                {cropString(row?.recipient)}
                              </Box>
                            ) : row?.recipient ? (
                              cropString(row?.recipient)
                            ) : (
                              EMPTY_STRING
                            )}
                          </Box>
                        </CustomWidthTooltip>
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        {row?.amount}
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        {(() => {
                          if (row?.type === 'REGISTER_NAME') {
                            return t('core:qortal.registered_name', {
                              name: row?.name,
                              postProcess: 'capitalizeFirstChar',
                            });
                          } else if (row?.type === 'UPDATE_NAME') {
                            return t('core:qortal.old_new_name', {
                              oldName: row?.name,
                              newName: row?.newName,
                              postProcess: 'capitalizeFirstChar',
                            });
                          } else if (row?.type === 'SELL_NAME') {
                            return t('core:qortal.name_to_sell', {
                              name: row?.name,
                              amount: row?.amount,
                              postProcess: 'capitalizeFirstChar',
                            });
                          } else if (row?.type === 'CANCEL_SELL_NAME') {
                            return t('core:qortal.cancelled_name_sale', {
                              name: row?.name,
                              postProcess: 'capitalizeFirstChar',
                            });
                          } else if (row?.type === 'BUY_NAME') {
                            return t('core:qortal.seller', {
                              seller: row?.seller,
                              amount: row?.amount,
                              postProcess: 'capitalizeFirstChar',
                            });
                          } else if (row?.type === 'REWARD_SHARE') {
                            {
                              row?.sharePercent &&
                              row?.sharePercent?.startsWith('-') ? (
                                <Box
                                  style={{
                                    color: theme.palette.error.main,
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  {t('core:qortal.removed', {
                                    postProcess: 'capitalizeFirstChar',
                                  })}
                                  <CustomWidthTooltip
                                    placement="top"
                                    title={
                                      row?.recipient === row?.creatorAddress
                                        ? 'Minting Key: ' +
                                          row?.rewardSharePublicKey
                                        : EMPTY_STRING
                                    }
                                  >
                                    <InfoOutlined
                                      style={{
                                        fontSize: '14px',
                                        color: theme.palette.info.main,
                                        marginLeft: '8px',
                                      }}
                                    />
                                  </CustomWidthTooltip>
                                </Box>
                              ) : (
                                row?.sharePercent && (
                                  <Box
                                    style={{
                                      color: theme.palette.success.main,
                                      display: 'flex',
                                      alignItems: 'center',
                                    }}
                                  >
                                    {t('core:qortal.created', {
                                      postProcess: 'capitalizeFirstChar',
                                    })}
                                    <CustomWidthTooltip
                                      placement="top"
                                      title={
                                        row?.recipient === row?.creatorAddress
                                          ? 'Minting Key: ' +
                                            row?.rewardSharePublicKey
                                          : EMPTY_STRING
                                      }
                                    >
                                      <InfoOutlined
                                        style={{
                                          fontSize: '14px',
                                          color: theme.palette.info.main,
                                          marginLeft: '8px',
                                        }}
                                      />
                                    </CustomWidthTooltip>
                                  </Box>
                                )
                              );
                            }
                          }
                        })()}
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        {row?.pollName}
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        {row?.fee}
                      </StyledTableCell>
                      <StyledTableCell style={{ width: 'auto' }} align="left">
                        {row?.timestamp > 0 ? (
                          <CustomWidthTooltip
                            placement="top"
                            title={new Date(row?.timestamp).toLocaleString()}
                          >
                            <Box>{epochToAgo(row?.timestamp)}</Box>
                          </CustomWidthTooltip>
                        ) : (
                          EMPTY_STRING
                        )}
                      </StyledTableCell>
                    </StyledTableRow>
                  )
                )}
                {emptyRowsAll > 0 && (
                  <TableRow style={{ height: 53 * emptyRowsAll }}>
                    <TableCell colSpan={11} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            labelRowsPerPage={t('core:rows_per_page', {
              postProcess: 'capitalizeFirstChar',
            })}
            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
            count={allInfo.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            ActionsComponent={TablePaginationActions}
          />
        </>
      );
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          {t('core:message.generic.no_transactions', {
            postProcess: 'capitalizeFirstChar',
            transaction_type: 'ALL',
          })}
        </Typography>
      );
    }
  };

  // Retain the legacy per-type renderers while the unified table handles the visible UX.
  void tablePayment;
  void tableArbitrary;
  void tableAt;
  void tableGroup;
  void tableName;
  void tableAsset;
  void tablePoll;
  void tableRewardshare;
  void tableAll;

  const qortalTables = () => {
    const rewardTypes = ['REWARD_SHARE', 'TRANSFER_PRIVS', 'PRESENCE'];
    const activityInfo = allInfo.filter(
      (row: any) =>
        row?.type && row.type !== 'PAYMENT' && !rewardTypes.includes(row.type)
    );
    const primaryFilters = [
      { label: 'All', rows: allInfo, value: 'all' },
      { label: 'Payments', rows: paymentInfo, value: 'payments' },
      { label: 'Rewards', rows: rewardshareInfo, value: 'rewards' },
      { label: 'Activity', rows: activityInfo, value: 'activity' },
    ];
    const advancedFilters = [
      { label: 'Arbitrary', rows: arbitraryInfo, value: 'arbitrary' },
      { label: 'AT', rows: atInfo, value: 'at' },
      { label: 'Group', rows: groupInfo, value: 'group' },
      { label: 'Name', rows: nameInfo, value: 'name' },
      { label: 'Asset', rows: assetInfo, value: 'asset' },
      { label: 'Poll', rows: pollInfo, value: 'poll' },
      { label: 'Rewardshare', rows: rewardshareInfo, value: 'rewardshare' },
    ];
    const filters = [...primaryFilters, ...advancedFilters];
    const selectedFilter =
      filters.find((filter) => filter.value === value) ?? primaryFilters[0];
    const selectedAdvancedFilter = advancedFilters.find(
      (filter) => filter.value === value
    );
    const advancedFilterOpen = Boolean(advancedFilterAnchor);
    const transactionGridColumns =
      '44px minmax(88px, 0.7fr) minmax(112px, 1fr) minmax(112px, 1fr) minmax(102px, 0.75fr) minmax(84px, 0.62fr) minmax(80px, 0.58fr)';
    const transactionHeaderSx = {
      color: 'text.secondary',
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: 0,
      lineHeight: 1,
    } as const;

    const formatTransactionType = (type?: string) => {
      if (!type) return '-';
      return type
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    };

    const getDisplayAddress = (row: any, field: 'creator' | 'recipient') => {
      if (field === 'creator') {
        return row?.creatorAddress || row?.sender || row?.owner || '-';
      }

      return row?.recipient || row?.recipientAddress || row?.atAddress || '-';
    };

    const getRawAddress = (row: any, field: 'creator' | 'recipient') => {
      if (field === 'creator') {
        return row?.creatorAddressOriginal || row?.creatorAddress || '';
      }

      return (
        row?.recipientOriginal || row?.recipientAddress || row?.recipient || ''
      );
    };

    const renderAddressCell = (row: any, field: 'creator' | 'recipient') => {
      const displayAddress = getDisplayAddress(row, field);
      const rawAddress = getRawAddress(row, field);
      const lookupValue = rawAddress || displayAddress;
      const canLookup = lookupValue && lookupValue !== '-';
      const isCurrentUser =
        displayAddress === address ||
        displayAddress === userName ||
        rawAddress === address;

      return (
        <Typography
          component="span"
          role={canLookup ? 'button' : undefined}
          tabIndex={canLookup ? 0 : undefined}
          title={canLookup ? 'Open in User Search' : undefined}
          onClick={() => openUserLookup(lookupValue)}
          onKeyDown={(event) => {
            if (!canLookup) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openUserLookup(lookupValue);
            }
          }}
          sx={{
            color: isCurrentUser ? 'info.main' : 'text.primary',
            cursor: canLookup ? 'pointer' : 'default',
            display: 'block',
            fontSize: 13,
            fontWeight: isCurrentUser ? 600 : 400,
            maxWidth: 156,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            '&:hover': canLookup
              ? {
                  color: 'primary.main',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }
              : undefined,
          }}
        >
          {displayAddress}
        </Typography>
      );
    };

    const renderStatusIcon = (row: any) => {
      const confirmations =
        typeof row?.blockHeight === 'number' &&
        typeof nodeInfo?.height === 'number'
          ? nodeInfo.height - row.blockHeight
          : null;
      const isPending = confirmations == null || confirmations < 3;

      return (
        <Tooltip
          placement="top"
          title={
            confirmations == null
              ? 'Pending confirmation'
              : isPending
                ? `Pending, ${confirmations} of 3 confirmations`
                : 'Confirmed'
          }
        >
          {isPending ? (
            <HistoryToggleOff sx={{ color: 'error.main', fontSize: 16 }} />
          ) : (
            <CheckCircleOutline sx={{ color: 'success.main', fontSize: 16 }} />
          )}
        </Tooltip>
      );
    };

    const renderAmountCell = (row: any) => {
      const hasAmount = row?.amount !== undefined && row?.amount !== null;
      if (!hasAmount) {
        return (
          <Typography
            sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 400 }}
          >
            -
          </Typography>
        );
      }

      const amount = Math.abs(toFiniteNumber(row.amount));
      const rawRecipient = getRawAddress(row, 'recipient');
      const displayRecipient = getDisplayAddress(row, 'recipient');
      const isIncoming =
        rawRecipient === address ||
        displayRecipient === address ||
        displayRecipient === userName;

      return (
        <Typography
          sx={{
            color: isIncoming ? 'success.main' : 'error.main',
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          {isIncoming ? '+' : '-'}
          {formatQortAmount(amount)} QORT
        </Typography>
      );
    };

    const renderTransactionRows = (rows: any[], emptyLabel: string) => {
      if (!rows || rows.length === 0) {
        const emptyMessage =
          emptyLabel.toLowerCase() === 'all'
            ? 'No transactions yet.'
            : `No ${emptyLabel.toLowerCase()} transactions yet.`;
        return (
          <Box
            sx={{
              bgcolor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.025)'
                  : 'rgba(17,24,39,0.035)',
              borderRadius: 1,
              color: 'text.secondary',
              px: 2,
              py: 4,
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>{emptyMessage}</Typography>
          </Box>
        );
      }

      const pagedRows =
        rowsPerPage > 0
          ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          : rows;

      return (
        <>
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 760 }}>
              <Box
                aria-hidden
                sx={{
                  alignItems: 'center',
                  borderBottom: (t) =>
                    `1px solid ${
                      t.palette.mode === 'dark'
                        ? 'rgba(116,158,180,0.15)'
                        : 'rgba(17,24,39,0.08)'
                  }`,
                  display: 'grid',
                  gap: 1,
                  gridTemplateColumns: transactionGridColumns,
                  px: 1.25,
                  py: 1,
                }}
              >
                <Typography
                  sx={{ ...transactionHeaderSx, textAlign: 'center' }}
                >
                  Status
                </Typography>
                <Typography sx={transactionHeaderSx}>Type</Typography>
                <Typography sx={transactionHeaderSx}>Creator</Typography>
                <Typography sx={transactionHeaderSx}>Recipient</Typography>
                <Typography sx={{ ...transactionHeaderSx, textAlign: 'right' }}>
                  Amount
                </Typography>
                <Typography sx={{ ...transactionHeaderSx, textAlign: 'right' }}>
                  Fee
                </Typography>
                <Typography sx={transactionHeaderSx}>Time</Typography>
              </Box>

              <Box sx={{ display: 'grid' }}>
                {pagedRows.map((row: any, index: Key) => (
                  <Box
                    key={row?.signature || index}
                    sx={{
                      alignItems: 'center',
                      bgcolor: (t) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.012)'
                          : 'rgba(17,24,39,0.018)',
                      borderBottom: (t) =>
                        `1px solid ${
                          t.palette.mode === 'dark'
                            ? 'rgba(116,158,180,0.085)'
                            : 'rgba(17,24,39,0.06)'
                      }`,
                      display: 'grid',
                      gap: 1,
                      gridTemplateColumns: transactionGridColumns,
                      minHeight: 46,
                      px: 1.25,
                      py: 0.85,
                      transition:
                        'background-color 150ms ease, border-color 150ms ease',
                      '&:hover': {
                        bgcolor: (t) =>
                          t.palette.mode === 'dark'
                            ? 'rgba(24,189,242,0.055)'
                            : 'rgba(5,127,168,0.05)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {renderStatusIcon(row)}
                    </Box>
                    <Typography
                      sx={{
                        color: 'text.secondary',
                        fontSize: 13,
                        fontWeight: 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatTransactionType(row?.type)}
                    </Typography>
                    {renderAddressCell(row, 'creator')}
                    {renderAddressCell(row, 'recipient')}
                    <Box sx={{ textAlign: 'right' }}>
                      {renderAmountCell(row)}
                    </Box>
                    <Typography
                      sx={{
                        color: 'text.secondary',
                        fontSize: 13,
                        fontWeight: 400,
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row?.fee !== undefined && row?.fee !== null
                        ? `${formatQortFee(row.fee)} QORT`
                        : '-'}
                    </Typography>
                    <CustomWidthTooltip
                      placement="top"
                      title={new Date(row?.timestamp).toLocaleString()}
                    >
                      <Typography
                        sx={{
                          color: 'text.secondary',
                          fontSize: 13,
                          fontWeight: 400,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row?.timestamp ? epochToAgo(row.timestamp) : '-'}
                      </Typography>
                    </CustomWidthTooltip>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
          <TablePagination
            component="div"
            labelRowsPerPage={t('core:rows_per_page', {
              postProcess: 'capitalizeFirstChar',
            })}
            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            ActionsComponent={TablePaginationActions}
            sx={{
              color: 'text.secondary',
              mt: 0.5,
              '& .MuiTablePagination-toolbar': {
                minHeight: 44,
                px: 0,
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
                {
                  color: 'text.secondary',
                  fontSize: 13,
                },
            }}
          />
        </>
      );
    };

    return (
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            alignItems: { xs: 'stretch', sm: 'center' },
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            justifyContent: 'space-between',
            minWidth: 0,
            pb: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              minWidth: 0,
            }}
          >
            {primaryFilters.map((filter) => {
              const isSelected = value === filter.value;
              return (
                <ButtonBase
                  key={filter.value}
                  onClick={() => handleTransactionFilterChange(filter.value)}
                  sx={{
                    borderBottom: (t) =>
                      `2px solid ${isSelected ? t.palette.primary.main : 'transparent'}`,
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    fontSize: 13,
                    fontWeight: 600,
                    minHeight: 34,
                    px: 1.25,
                    transition: 'color 160ms ease, border-color 160ms ease',
                    '&:hover': {
                      color: 'text.primary',
                    },
                  }}
                >
                  {filter.label}
                </ButtonBase>
              );
            })}
          </Box>

          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              gap: 1,
              justifyContent: { xs: 'space-between', sm: 'flex-end' },
            }}
          >
            <Button
              aria-controls={
                advancedFilterOpen ? 'advanced-filter-menu' : undefined
              }
              aria-haspopup="true"
              aria-expanded={advancedFilterOpen ? 'true' : undefined}
              endIcon={<ExpandMore />}
              onClick={handleAdvancedFilterClick}
              size="small"
              variant={selectedAdvancedFilter ? 'outlined' : 'text'}
              sx={{
                color: selectedAdvancedFilter
                  ? 'primary.main'
                  : 'text.secondary',
                minHeight: 34,
                px: 1,
              }}
            >
              {selectedAdvancedFilter?.label || 'Advanced filters'}
            </Button>
            <Button
              onClick={handleLoadingRefreshQort}
              loading={loadingRefreshQort}
              loadingPosition="start"
              startIcon={<Refresh />}
              variant="text"
              size="small"
              sx={{ minHeight: 34 }}
            >
              {t('core:action.refresh', {
                postProcess: 'capitalizeFirstChar',
              })}
            </Button>
          </Box>
        </Box>

        <Menu
          id="advanced-filter-menu"
          anchorEl={advancedFilterAnchor}
          open={advancedFilterOpen}
          onClose={handleAdvancedFilterClose}
          slotProps={{
            paper: {
              sx: {
                mt: 0.5,
                minWidth: 180,
              },
            },
          }}
        >
          {advancedFilters.map((filter) => (
            <MenuItem
              key={filter.value}
              onClick={() => handleAdvancedFilterSelect(filter.value)}
              selected={value === filter.value}
            >
              {filter.label}
            </MenuItem>
          ))}
        </Menu>

        <Box sx={{ pt: 1.25 }}>
          {renderTransactionRows(selectedFilter.rows, selectedFilter.label)}
        </Box>
      </Box>
    );
  };

  const tableLoader = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <CircularProgress />
        </Box>
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px',
            width: '100%',
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
        </Box>
      </Box>
    );
  };

  const qortAddress = address ?? EMPTY_STRING;
  const qortAddressLabel =
    qortAddress ||
    t('core:message.generic.no_address', {
      postProcess: 'capitalizeFirstChar',
    });
  const visibleAddressBookEntries = qortAddressBookEntries.slice(0, 5);
  const hasQortAddressBookSearch = qortAddressBookSearch.trim().length > 0;
  const addressBookShowingLabel =
    visibleAddressBookEntries.length > 0
      ? `Showing 1 to ${visibleAddressBookEntries.length} of ${qortAddressBookEntries.length}`
      : EMPTY_STRING;
  const addressBookEmptyTitle = hasQortAddressBookSearch
    ? 'No matching contacts'
    : 'No QORT contacts found';
  const addressBookEmptyDescription = hasQortAddressBookSearch
    ? 'Try a different name, address or note.'
    : 'Add a contact to make sends faster.';
  const syncStatusLabel =
    qortAddressBookSyncStatus === 'error'
      ? 'Sync needs attention'
      : qortAddressBookSyncing
        ? 'Syncing...'
        : 'Up to date';
  const syncStatusTooltip =
    qortAddressBookSyncStatus === 'success' && qortAddressBookLastSync
      ? `Last sync: ${new Intl.DateTimeFormat(undefined, {
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(new Date(qortAddressBookLastSync))}`
      : syncStatusLabel;

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <Dialog
        fullScreen
        open={openQortSend}
        onClose={handleCloseQortSend}
        slots={{ transition: Transition }}
      >
        <SubmitDialog fullWidth={true} maxWidth="xs" open={openTxQortSubmit}>
          <DialogContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Box
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <CircularProgress color="success" size={64} />
              </Box>
              <Box
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
              </Box>
            </Box>
          </DialogContent>
        </SubmitDialog>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={openSendQortSuccess}
          autoHideDuration={TIME_SECONDS_4}
          slots={{ transition: SlideTransition }}
          onClose={handleCloseSendQortSuccess}
        >
          <Alert
            onClose={handleCloseSendQortSuccess}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {t('core:message.generic.sent_transaction', {
              coin: Coin.QORT,
              postProcess: 'capitalizeAll',
            })}
          </Alert>
        </Snackbar>
        <Snackbar
          open={openSendQortError}
          autoHideDuration={TIME_SECONDS_4}
          onClose={handleCloseSendQortError}
        >
          <Alert
            onClose={handleCloseSendQortError}
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
              onClick={handleCloseQortSend}
              aria-label="close"
            >
              <Close />
            </IconButton>
            <Avatar
              sx={{ width: 28, height: 28 }}
              alt="QORT Logo"
              src={coinLogoQORT}
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
                coin: Coin.QORT,
                postProcess: 'capitalizeFirstChar',
              })}
            </Typography>
            <Button
              disabled={sendDisabled}
              variant="contained"
              startIcon={<Send />}
              aria-label="send-qort"
              onClick={sendQortRequest}
              sx={{
                backgroundcolor: theme.palette.info.main,
                color: 'white',
                '&:hover': { backgroundcolor: 'action.hover' },
              }}
            >
              {t('core:action.send', {
                postProcess: 'capitalizeAll',
              })}
            </Button>
          </Toolbar>
        </AppBar>
        <Box
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
            {isLoadingWalletBalanceQort ? (
              <Box sx={{ width: '175px' }}>
                <LinearProgress />
              </Box>
            ) : (
              formatQortAmount(walletBalanceQort) + ' QORT'
            )}
          </Typography>
        </Box>
        <Box
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
              postProcess: 'capitalizeFirstChar',
            })}
            &nbsp;&nbsp;
          </Typography>
          <Typography
            variant="h5"
            align="center"
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {formatQortAmount(toFiniteNumber(walletBalanceQort) - qortTxFee) +
              ' QORT'}
          </Typography>
          <Box style={{ marginInlineStart: '15px' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSendMaxQort}
              style={{ borderRadius: 50 }}
            >
              {t('core:action.send_max', {
                postProcess: 'capitalizeAll',
              })}
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: 2,
            mt: 2.5,
            mx: 'auto',
            width: '100%',
            maxWidth: 420,
            px: { xs: 0, sm: 1 },
          }}
        >
          <NumericFormat
            decimalScale={8}
            defaultValue={0}
            value={qortAmount ?? EMPTY_STRING}
            allowNegative={false}
            customInput={TextField as React.ComponentType<any>}
            valueIsNumericString
            label={
              t('core:amount', { postProcess: 'capitalizeAll' }) + '(QORT)'
            }
            fullWidth
            isAllowed={(values) => {
              const max = maxSendableQortCoin();
              const { formattedValue, floatValue } = values;
              return (
                formattedValue === EMPTY_STRING || (floatValue ?? 0) <= max
              );
            }}
            onValueChange={onAmountChange}
            onBlur={onAmountBlur}
            required
            helperText={
              amountTouched ? amountError || EMPTY_STRING : EMPTY_STRING
            } // show only when touched
            error={amountTouched && !!amountError}
          />

          <TextField
            required
            label={t('core:receiver_address_name', {
              postProcess: 'capitalizeFirstChar',
            })}
            id="qort-address"
            margin="normal"
            value={qortRecipient}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setQortRecipient(e.target.value.trim());
              setRecipientTouched(true);
            }}
            onBlur={onRecipientBlur}
            slotProps={{ htmlInput: { maxLength: 34, minLength: 3 } }}
            fullWidth
            helperText={
              recipientTouched
                ? addressValidating
                  ? t('core:message.generic.validating', {
                      postProcess: 'capitalizeFirstChar',
                    })
                  : recipientError || EMPTY_STRING
                : t('core:message.generic.qortal_address', {
                    postProcess: 'capitalizeFirstChar',
                  })
            }
            error={recipientTouched && !!recipientError}
          />
        </Box>
        <Box
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            align="center"
            sx={{ fontWeight: 600, fontSize: '14px', marginTop: '15px' }}
          >
            {t('core:message.generic.sending_fee', {
              quantity: 0.01,
              coin: Coin.QORT,
              postProcess: 'capitalizeFirstChar',
            })}
          </Typography>
        </Box>
      </Dialog>

      <Dialog
        open={openQortReceive}
        onClose={handleCloseQortReceive}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{ alignItems: 'center', display: 'flex', gap: 1.5, pr: 6 }}
        >
          <Box
            component="img"
            alt="QORT Logo"
            src={coinLogoQORT}
            sx={{ height: 32, width: 32 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, lineHeight: 1.15 }}
            >
              {t('core:message.generic.qortal_wallet', {
                postProcess: 'capitalizeFirstChar',
              })}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 600 }}
            >
              {t('core:action.show_qrcode', {
                postProcess: 'capitalizeFirstChar',
              })}
            </Typography>
          </Box>
          <IconButton
            aria-label="Close receive dialog"
            onClick={handleCloseQortReceive}
            size="small"
            sx={{ position: 'absolute', right: 12, top: 12 }}
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              pb: 2,
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                aspectRatio: '1 / 1',
                bgcolor: '#fff',
                border: (t) => `1px solid ${t.palette.divider}`,
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'center',
                maxWidth: 240,
                p: 1,
                width: '100%',
              }}
            >
              <QRCode
                value={address ?? EMPTY_STRING}
                size={220}
                fgColor="#000000"
                bgColor="#ffffff"
                level="H"
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
            <Box
              sx={{
                alignItems: 'center',
                bgcolor: 'action.hover',
                border: (t) => `1px solid ${t.palette.divider}`,
                borderRadius: 1,
                display: 'flex',
                gap: 1,
                maxWidth: '100%',
                px: 1.25,
                py: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {address ||
                  t('core:message.generic.no_address', {
                    postProcess: 'capitalizeFirstChar',
                  })}
              </Typography>
              <CustomWidthTooltip
                placement="top"
                title={t('core:action.copy_address', {
                  postProcess: 'capitalizeFirstChar',
                })}
              >
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(address ?? EMPTY_STRING)}
                >
                  <CopyAllTwoTone fontSize="small" />
                </IconButton>
              </CustomWidthTooltip>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <AddressBookDialog
        open={openQortAddressBook}
        onClose={handleCloseAddressBook}
        coinType={Coin.QORT}
        onSelectAddress={handleSelectAddress}
        prefillData={addressBookPrefill}
      />

      <Box
        sx={{
          alignItems: 'start',
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' },
          width: '100%',
        }}
      >
        <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              alignItems: 'stretch',
              display: 'grid',
              gap: 1.5,
            }}
          >
            <WalletCard
              sx={{
                minHeight: { md: 168 },
                overflow: 'hidden',
                position: 'relative',
                width: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gap: { xs: 2.25, md: 0 },
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'minmax(300px, 0.82fr) minmax(420px, 1.18fr)',
                  },
                  height: '100%',
                  minHeight: { md: 168 },
                  p: { xs: 2.25, md: 0 },
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    alignContent: { md: 'space-between' },
                    display: 'grid',
                    gap: { xs: 2, md: 1 },
                    minHeight: { md: '100%' },
                    minWidth: 0,
                    p: { md: 3 },
                  }}
                >
                  <Box
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      gap: 1.5,
                      minWidth: 0,
                    }}
                  >
                    <Box
                      component="img"
                      alt="QORT Logo"
                      src={coinLogoQORT}
                      sx={{ height: 58, width: 58 }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Box
                        sx={{ alignItems: 'center', display: 'flex', gap: 0.6 }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            fontSize: { md: 24 },
                            fontWeight: 700,
                            lineHeight: 1.08,
                          }}
                        >
                          QORT Wallet
                        </Typography>
                        <VerifiedRounded
                          sx={{
                            color: 'primary.main',
                            filter:
                              'drop-shadow(0 0 8px rgba(24,189,242,0.45))',
                            fontSize: 18,
                          }}
                        />
                      </Box>
                    <Typography
                      variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: 16,
                          fontWeight: 500,
                        }}
                    >
                      QORT
                    </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ alignSelf: 'end' }}>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', fontWeight: 500 }}
                    >
                      Available balance
                    </Typography>
                    <Typography
                      component="div"
                      sx={{
                        fontSize: { xs: '2.45rem', sm: '2.95rem' },
                        fontWeight: 700,
                        lineHeight: 1,
                        mt: 0.5,
                      }}
                    >
                      {isLoadingWalletBalanceQort ? (
                        <Box sx={{ maxWidth: 260, py: 1 }}>
                          <LinearProgress />
                        </Box>
                      ) : (
                        <>
                          {formatQortAmount(walletBalanceQort)}
                          <Typography
                            component="span"
                            sx={{
                              fontSize: { xs: '1.05rem', sm: '1.22rem' },
                              fontWeight: 600,
                              ml: 0.6,
                            }}
                          >
                            QORT
                          </Typography>
                        </>
                      )}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    alignContent: { md: 'center' },
                    background: 'transparent',
                    bgcolor: 'transparent',
                    display: 'grid',
                    gap: 1.25,
                    minWidth: 0,
                    p: { md: 2.5 },
                    pl: { md: 4 },
                    position: 'relative',
                    width: '100%',
                    '&::before': {
                      bgcolor: 'rgba(116,158,180,0.38)',
                      bottom: { md: 24 },
                      content: '""',
                      display: { xs: 'none', md: 'block' },
                      left: 0,
                      position: 'absolute',
                      top: { md: 24 },
                      width: '1px',
                      zIndex: 2,
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: 13,
                      fontWeight: 600,
                      px: 0,
                      lineHeight: 1,
                    }}
                  >
                    Your Address
                  </Typography>
                  <Box
                    sx={{
                      alignItems: 'center',
                      bgcolor: (t) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(0, 7, 12, 0.2)'
                          : 'rgba(17,24,39,0.035)',
                      border: (t) =>
                        `1px solid ${
                          t.palette.mode === 'dark'
                            ? 'rgba(116,158,180,0.18)'
                            : 'rgba(17,24,39,0.08)'
                        }`,
                      borderRadius: 1,
                      display: 'flex',
                      gap: 1,
                      minHeight: 50,
                      minWidth: 0,
                      px: 1.5,
                      py: 0.9,
                    }}
                  >
                    <ImportContacts
                      fontSize="small"
                      sx={{
                        color: 'text.secondary',
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.primary',
                        fontSize: 14,
                        fontWeight: 600,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {qortAddressLabel}
                    </Typography>
                    <CustomWidthTooltip
                      placement="top"
                      title={t('core:action.copy_address', {
                        postProcess: 'capitalizeFirstChar',
                      })}
                    >
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(qortAddress)}
                        sx={{
                          color: 'text.secondary',
                          ml: 'auto',
                          '&:hover': {
                            color: 'primary.main',
                          },
                        }}
                      >
                        <CopyAllTwoTone fontSize="small" />
                      </IconButton>
                    </CustomWidthTooltip>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gap: 1.25,
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    }}
                  >
                    <WalletButtons
                      variant="contained"
                      startIcon={<Send />}
                      aria-label="Send QORT"
                      onClick={handleOpenQortSend}
                      sx={{ fontSize: 15, fontWeight: 700, minHeight: 46 }}
                    >
                      {t('core:action.send', {
                        postProcess: 'capitalizeFirstChar',
                      })}
                    </WalletButtons>
                    <Button
                      onClick={handleToggleReceivePanel}
                      startIcon={
                        receivePanelOpen ? <Close /> : <FileDownloadOutlined />
                      }
                      variant="outlined"
                      sx={{
                        borderColor: (t) =>
                          t.palette.mode === 'dark'
                            ? 'rgba(116,158,180,0.18)'
                            : 'rgba(17,24,39,0.08)',
                        color: 'primary.main',
                        fontSize: 15,
                        fontWeight: 700,
                        minHeight: 46,
                        bgcolor: (t) =>
                          t.palette.mode === 'dark'
                            ? 'rgba(0, 7, 12, 0.18)'
                            : 'transparent',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'rgba(24,189,242,0.08)',
                        },
                      }}
                    >
                      {receivePanelOpen ? 'Hide QR' : 'Receive'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </WalletCard>
          </Box>

          <WalletCard sx={{ overflow: 'hidden', width: '100%' }}>
            <Box sx={{ p: { xs: 1.5, md: 2 } }}>
              <Box
                sx={{
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1,
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, lineHeight: 1.1 }}
                >
                  Transactions
                </Typography>
              </Box>

              {loadingRefreshQort ? (
                <Box sx={{ width: '100%' }}>{tableLoader()}</Box>
              ) : (
                <Box sx={{ width: '100%' }}>{qortalTables()}</Box>
              )}
            </Box>
          </WalletCard>
        </Box>

        <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
          <Collapse
            in={receivePanelOpen}
            timeout={260}
            unmountOnExit
            sx={{
              '& .MuiCollapse-wrapperInner': {
                opacity: receivePanelOpen ? 1 : 0,
                transform: receivePanelOpen
                  ? 'translateY(0)'
                  : 'translateY(-10px)',
                transition:
                  'opacity 260ms ease-out, transform 260ms ease-out',
              },
            }}
          >
            <WalletCard
              sx={{
                alignItems: 'center',
                display: 'grid',
                justifyItems: 'center',
                minHeight: { md: 288 },
                overflow: 'hidden',
                p: 2,
                width: '100%',
              }}
            >
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 1.25 }}>
                  Receive QORT
                </Typography>
                <ButtonBase
                  aria-label="Show receive QR code"
                  onClick={handleOpenQortReceive}
                  sx={{
                    borderRadius: 1.5,
                    display: 'inline-grid',
                    p: 0.75,
                    position: 'relative',
                    '&:hover .qr-target-frame': {
                      borderColor: 'primary.main',
                      boxShadow: '0 0 28px rgba(24,189,242,0.2)',
                    },
                  }}
                >
                  <Box
                    className="qr-target-frame"
                    sx={{
                      border: '1px solid rgba(24,189,242,0.5)',
                      borderRadius: 1.5,
                      p: 1.25,
                      position: 'relative',
                      transition:
                        'border-color 160ms ease, box-shadow 160ms ease',
                      '&::before, &::after': {
                        borderColor: 'primary.main',
                        borderStyle: 'solid',
                        content: '""',
                        height: 24,
                        position: 'absolute',
                        width: 24,
                      },
                      '&::before': {
                        borderBottomWidth: 0,
                        borderLeftWidth: 1,
                        borderRightWidth: 0,
                        borderTopWidth: 1,
                        left: -1,
                        top: -1,
                      },
                      '&::after': {
                        borderBottomWidth: 1,
                        borderLeftWidth: 0,
                        borderRightWidth: 1,
                        borderTopWidth: 0,
                        bottom: -1,
                        right: -1,
                      },
                    }}
                  >
                    <Box
                      ref={receiveQrRef}
                      sx={{
                        aspectRatio: '1 / 1',
                        bgcolor: '#fff',
                        borderRadius: 1,
                        p: 1,
                        width: 150,
                      }}
                    >
                      <QRCode
                        value={qortAddress}
                        size={142}
                        fgColor="#000000"
                        bgColor="#ffffff"
                        level="H"
                        style={{ height: '100%', width: '100%' }}
                      />
                    </Box>
                  </Box>
                </ButtonBase>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mt: 1.25 }}
                >
                  Scan to receive
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 1,
                    gridTemplateColumns: '1fr 1fr',
                    mt: 1.5,
                  }}
                >
                  <Button
                    onClick={() => copyToClipboard(qortAddress)}
                    size="small"
                    startIcon={<CopyAllTwoTone />}
                    variant="outlined"
                  >
                    Copy
                  </Button>
                  <Button
                    onClick={handleDownloadReceiveQr}
                    size="small"
                    startIcon={<FileDownloadOutlined />}
                    variant="outlined"
                  >
                    Download
                  </Button>
                </Box>
              </Box>
            </WalletCard>
          </Collapse>

          <WalletCard
            id="qort-address-book-panel"
            sx={{ overflow: 'hidden', width: '100%' }}
          >
            <Box sx={{ p: { xs: 2, md: 2.25 }, pb: 1.5 }}>
              <Typography sx={{ fontWeight: 600, mb: 2 }}>
                Address book (QORT)
              </Typography>
              <TextField
                fullWidth
                placeholder="Search by name, address or note"
                size="small"
                value={qortAddressBookSearch}
                onChange={(event) =>
                  setQortAddressBookSearch(event.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search
                        fontSize="small"
                        sx={{ color: 'text.secondary' }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 1.5,
                  '& .MuiInputBase-input': {
                    fontSize: 13,
                  },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(2, 10, 16, 0.22)'
                        : 'rgba(17,24,39,0.025)',
                    '& fieldset': {
                      borderColor: (t) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(116,158,180,0.18)'
                          : 'rgba(17,24,39,0.08)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
              <Button
                fullWidth
                startIcon={<Add />}
                variant="outlined"
                onClick={handleOpenAddressBook}
                sx={{
                  borderColor: (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(24,189,242,0.42)'
                      : undefined,
                  mb: 1.25,
                }}
              >
                Add contact
              </Button>

              <Box sx={{ display: 'grid' }}>
                {visibleAddressBookEntries.length > 0 ? (
                  visibleAddressBookEntries.map((entry, index) => {
                    const initials =
                      entry.name
                        .split(' ')
                        .filter(Boolean)
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'Q';
                    const avatarColors = [
                      '#7446b8',
                      '#2669a7',
                      '#aa5a31',
                      '#4c7d48',
                      '#a18b22',
                    ];

                    return (
                      <Box
                        key={entry.id}
                        sx={{
                          alignItems: 'center',
                          borderBottom:
                            index === visibleAddressBookEntries.length - 1
                              ? 'none'
                              : (t) => `1px solid ${t.palette.divider}`,
                          display: 'grid',
                          gap: 1,
                          gridTemplateColumns: '44px minmax(0, 1fr) auto auto',
                          py: 1.5,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: avatarColors[index % avatarColors.length],
                            fontSize: 13,
                            fontWeight: 600,
                            height: 38,
                            width: 38,
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {entry.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {cropString(entry.address, 18)}
                          </Typography>
                          {entry.note && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {entry.note}
                            </Typography>
                          )}
                        </Box>
                        <CustomWidthTooltip
                          placement="top"
                          title={t('core:action.copy_address', {
                            postProcess: 'capitalizeFirstChar',
                          })}
                        >
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(entry.address)}
                            sx={{
                              border: (t) => `1px solid ${t.palette.divider}`,
                              borderRadius: 1,
                            }}
                          >
                            <CopyAllTwoTone fontSize="small" />
                          </IconButton>
                        </CustomWidthTooltip>
                        <CustomWidthTooltip placement="top" title="Send QORT">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleSelectAddress(entry.address, entry.name)
                            }
                            sx={{
                              border: (t) => `1px solid ${t.palette.divider}`,
                              borderRadius: 1,
                            }}
                          >
                            <Send fontSize="small" />
                          </IconButton>
                        </CustomWidthTooltip>
                      </Box>
                    );
                  })
                ) : (
                  <Box
                    sx={{
                      bgcolor: (t) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.018)'
                          : 'rgba(17,24,39,0.035)',
                      borderRadius: 1,
                      color: 'text.secondary',
                      px: 2,
                      py: 2.25,
                      textAlign: 'center',
                    }}
                  >
                    <ImportContacts
                      sx={{
                        color: 'text.secondary',
                        fontSize: 34,
                        mb: 0.75,
                        opacity: 0.5,
                      }}
                    />
                    <Typography sx={{ fontWeight: 600 }}>
                      {addressBookEmptyTitle}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {addressBookEmptyDescription}
                    </Typography>
                  </Box>
                )}
              </Box>

              {addressBookShowingLabel && (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mt: 1.5 }}
                >
                  {addressBookShowingLabel}
                </Typography>
              )}
            </Box>
          </WalletCard>

          <WalletCard sx={{ overflow: 'hidden', width: '100%' }}>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                px: { xs: 2, md: 2.25 },
                py: 2,
              }}
            >
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  gap: 1.25,
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                  <Box
                    sx={{
                      alignItems: 'center',
                      bgcolor: 'rgba(34,227,138,0.12)',
                      border: '1px solid rgba(34,227,138,0.28)',
                      borderRadius: 1.25,
                      boxShadow: 'inset 0 0 18px rgba(34,227,138,0.16)',
                      color: 'success.main',
                      display: 'inline-flex',
                      height: 34,
                      justifyContent: 'center',
                      width: 34,
                    }}
                  >
                    <LockOutlined fontSize="small" />
                  </Box>
                  <Typography sx={{ fontWeight: 600 }}>
                    Encrypted sync
                  </Typography>
                </Box>
                <Box
                  title={syncStatusTooltip}
                  sx={{
                    alignItems: 'center',
                    bgcolor:
                      qortAddressBookSyncStatus === 'error'
                        ? 'rgba(255,95,102,0.12)'
                        : 'rgba(34,227,138,0.12)',
                    borderRadius: 999,
                    color:
                      qortAddressBookSyncStatus === 'error'
                        ? 'error.main'
                        : 'success.main',
                    display: 'inline-flex',
                    fontSize: 12,
                    fontWeight: 700,
                    gap: 0.5,
                    px: 1,
                    py: 0.45,
                  }}
                >
                  <CheckCircleOutline sx={{ fontSize: 15 }} />
                  {syncStatusLabel}
                </Box>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Local address book
                </Typography>
              </Box>
              <Button
                fullWidth
                loading={qortAddressBookSyncing}
                loadingPosition="start"
                onClick={handleSyncQortAddressBook}
                startIcon={<CloudSync />}
                variant="contained"
                sx={{ minHeight: 46 }}
              >
                Sync now
              </Button>
            </Box>
          </WalletCard>
        </Box>
      </Box>
    </Box>
  );
}
