import {
  Add,
  AccountTreeOutlined,
  CheckCircleOutline,
  Close,
  CloudSync,
  CopyAllTwoTone,
  ErrorOutline,
  FileDownloadOutlined,
  InfoOutlined,
  LockOutlined,
  Refresh,
  Search,
  Send,
  VerifiedRounded,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Collapse,
  IconButton,
  InputAdornment,
  LinearProgress,
  TablePagination,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { Coin } from 'qapp-core';
import {
  ChangeEvent,
  MouseEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import QRCode from 'react-qr-code';
import arrrCoinRender from '../../assets/wallet-renders/arrr-coin-render.png';
import btcCoinRender from '../../assets/wallet-renders/btc-coin-render.png';
import dgbCoinRender from '../../assets/wallet-renders/dgb-coin-render.png';
import dogeCoinRender from '../../assets/wallet-renders/doge-coin-render.png';
import ltcCoinRender from '../../assets/wallet-renders/ltc-coin-render.png';
import qortCoinRender from '../../assets/wallet-renders/qort-coin-render.png';
import rvnCoinRender from '../../assets/wallet-renders/rvn-coin-render.png';
import {
  copyToClipboard,
  cropString,
  epochToAgo,
} from '../../common/functions';
import {
  CustomWidthTooltip,
  WalletButtons,
  WalletCard,
} from '../../styles/page-styles';
import { AddressBookEntry } from '../../utils/Types';
import { getAddressBook } from '../../utils/addressBookStorage';
import {
  getAddressBookAvatarColor,
  getAddressBookAvatarSx,
} from '../AddressBook/avatarPalette';

export type WalletCoinSymbol =
  | 'QORT'
  | 'BTC'
  | 'LTC'
  | 'DOGE'
  | 'DGB'
  | 'RVN'
  | 'ARRR';

type WalletVisual = {
  accent: string;
  coinImage: string;
  coinType: Coin;
  decimals: number;
  glow: string;
  glowSoft: string;
  name: string;
  symbol: WalletCoinSymbol;
};

export const WALLET_VISUALS: Record<WalletCoinSymbol, WalletVisual> = {
  QORT: {
    accent: '#18bdf2',
    coinImage: qortCoinRender,
    coinType: Coin.QORT,
    decimals: 2,
    glow: 'rgba(24, 189, 242, 0.42)',
    glowSoft: 'rgba(24, 189, 242, 0.13)',
    name: 'Qortal',
    symbol: 'QORT',
  },
  BTC: {
    accent: '#f6a70b',
    coinImage: btcCoinRender,
    coinType: Coin.BTC,
    decimals: 8,
    glow: 'rgba(246, 167, 11, 0.38)',
    glowSoft: 'rgba(246, 167, 11, 0.11)',
    name: 'Bitcoin',
    symbol: 'BTC',
  },
  LTC: {
    accent: '#b9c4d4',
    coinImage: ltcCoinRender,
    coinType: Coin.LTC,
    decimals: 8,
    glow: 'rgba(185, 196, 212, 0.36)',
    glowSoft: 'rgba(185, 196, 212, 0.12)',
    name: 'Litecoin',
    symbol: 'LTC',
  },
  DOGE: {
    accent: '#d7aa36',
    coinImage: dogeCoinRender,
    coinType: Coin.DOGE,
    decimals: 8,
    glow: 'rgba(215, 170, 54, 0.36)',
    glowSoft: 'rgba(215, 170, 54, 0.11)',
    name: 'Dogecoin',
    symbol: 'DOGE',
  },
  DGB: {
    accent: '#2a75d9',
    coinImage: dgbCoinRender,
    coinType: Coin.DGB,
    decimals: 8,
    glow: 'rgba(42, 117, 217, 0.36)',
    glowSoft: 'rgba(42, 117, 217, 0.12)',
    name: 'DigiByte',
    symbol: 'DGB',
  },
  RVN: {
    accent: '#f09a38',
    coinImage: rvnCoinRender,
    coinType: Coin.RVN,
    decimals: 8,
    glow: 'rgba(240, 154, 56, 0.36)',
    glowSoft: 'rgba(56, 102, 214, 0.14)',
    name: 'Ravencoin',
    symbol: 'RVN',
  },
  ARRR: {
    accent: '#e0b64a',
    coinImage: arrrCoinRender,
    coinType: Coin.ARRR,
    decimals: 8,
    glow: 'rgba(224, 182, 74, 0.36)',
    glowSoft: 'rgba(224, 182, 74, 0.11)',
    name: 'Pirate Chain',
    symbol: 'ARRR',
  },
};

const getWalletVars = (visual: WalletVisual) =>
  ({
    '--wallet-accent': visual.accent,
    '--wallet-coin-image': `url(${visual.coinImage})`,
    '--wallet-glow': visual.glow,
    '--wallet-glow-soft': visual.glowSoft,
  }) as Record<string, string>;

const walletOuterSurfaceSx = {
  backgroundColor: (t: Theme) =>
    t.palette.mode === 'dark' ? '#0E2431' : t.palette.background.paper,
  backgroundImage: 'none',
} as const;

const walletInnerSurfaceSx = {
  bgcolor: (t: Theme) =>
    t.palette.mode === 'dark' ? '#112C38' : 'background.paper',
} as const;

export const formatWalletAmount = (
  value: unknown,
  symbol: WalletCoinSymbol,
  decimals = WALLET_VISUALS[symbol].decimals
) => {
  if (value === null || value === undefined || value === '')
    return `0 ${symbol}`;

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return `${String(value)} ${symbol}`;

  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(numeric)} ${symbol}`;
};

const WALLET_BALANCE_DISPLAY_LIMIT = '999,999.99'.length;

const formatWalletDisplayAmount = (
  value: unknown,
  symbol: WalletCoinSymbol,
  decimals = WALLET_VISUALS[symbol].decimals
) => {
  if (value === null || value === undefined || value === '')
    return `0 ${symbol}`;

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return `${String(value)} ${symbol}`;

  const formatter = (maximumFractionDigits: number) =>
    new Intl.NumberFormat('en-US', {
      maximumFractionDigits,
      minimumFractionDigits: 0,
    }).format(numeric);

  let maximumFractionDigits = decimals;
  let formatted = formatter(maximumFractionDigits);

  while (
    formatted.length > WALLET_BALANCE_DISPLAY_LIMIT &&
    maximumFractionDigits > 0
  ) {
    maximumFractionDigits -= 1;
    formatted = formatter(maximumFractionDigits);
  }

  return `${formatted} ${symbol}`;
};

const toFiniteWalletNumber = (value: unknown) => {
  const parsed =
    typeof value === 'number' ? value : Number.parseFloat(String(value ?? 0));
  return Number.isFinite(parsed) ? parsed : null;
};

const useChargingBalance = (
  value: unknown,
  isLoading?: boolean,
  balanceError?: string | null
) => {
  const [animatedValue, setAnimatedValue] = useState<number | null>(null);
  const previousTargetRef = useRef<number | null>(null);

  useEffect(() => {
    const target = toFiniteWalletNumber(value);

    if (isLoading || balanceError || target === null) {
      previousTargetRef.current = null;
      setAnimatedValue(null);
      return;
    }

    const previousTarget = previousTargetRef.current;
    previousTargetRef.current = target;

    if (previousTarget === target) {
      setAnimatedValue(target);
      return;
    }

    const absTarget = Math.abs(target);
    const chargeOffset =
      absTarget > 0
        ? Math.max(absTarget * 0.035, Math.min(absTarget, 0.01))
        : 0;
    const startValue =
      target >= 0 ? Math.max(0, target - chargeOffset) : target;
    const duration = 720;
    const startedAt = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(startValue + (target - startValue) * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    setAnimatedValue(startValue);
    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [balanceError, isLoading, value]);

  return animatedValue;
};

type WalletSummaryCardProps = {
  address?: string | null;
  balance?: unknown;
  balanceDecimals?: number;
  balanceError?: string | null;
  coin: WalletCoinSymbol;
  copyAddressLabel?: string;
  hideReceiveLabel?: string;
  isBalanceLoading?: boolean;
  noAddressLabel?: string;
  onSend: () => void;
  onToggleReceive: () => void;
  receiveLabel?: string;
  receiveOpen: boolean;
  sendLabel?: string;
};

export function WalletSummaryCard({
  address,
  balance,
  balanceDecimals,
  balanceError,
  coin,
  copyAddressLabel = 'Copy address',
  hideReceiveLabel = 'Hide QR',
  isBalanceLoading,
  noAddressLabel = 'No address available',
  onSend,
  onToggleReceive,
  receiveLabel = 'Receive',
  receiveOpen,
  sendLabel = 'Send',
}: WalletSummaryCardProps) {
  const visual = WALLET_VISUALS[coin];
  const addressLabel = address || noAddressLabel;
  const animatedBalance = useChargingBalance(
    balance,
    isBalanceLoading,
    balanceError
  );
  const stableFormattedBalance = formatWalletDisplayAmount(
    balance,
    visual.symbol,
    balanceDecimals
  );
  const displayFormattedBalance = formatWalletDisplayAmount(
    animatedBalance ?? balance,
    visual.symbol,
    balanceDecimals
  );
  const balanceAmount = displayFormattedBalance.endsWith(` ${visual.symbol}`)
    ? displayFormattedBalance.slice(0, -(visual.symbol.length + 1))
    : displayFormattedBalance;
  const balanceFitUnits = Math.max(5.6, stableFormattedBalance.length * 0.62);
  const balanceFontSize = {
    xs: `min(clamp(2rem, 12vw, 3rem), calc(100cqw / ${balanceFitUnits}))`,
    md: `min(clamp(2.45rem, 4vw, 3.35rem), calc(100cqw / ${balanceFitUnits}))`,
  };

  return (
    <WalletCard
      sx={{
        ...getWalletVars(visual),
        backgroundColor: 'rgba(6, 21, 33, 0.98)',
        backgroundImage: `
          linear-gradient(90deg, rgba(7, 30, 44, 0.98) 0%, rgba(6, 23, 36, 0.99) 44%, rgba(4, 16, 27, 0.995) 100%)
        `,
        borderColor:
          'color-mix(in srgb, var(--wallet-accent) 38%, rgba(116,158,180,0.18))',
        boxShadow:
          '0 22px 58px rgba(0, 0, 0, 0.28), inset 1px 0 0 color-mix(in srgb, var(--wallet-accent) 20%, transparent), inset 0 1px 0 rgba(255,255,255,0.035)',
        minHeight: { md: 224 },
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        '&::before': {
          background: {
            xs: `
              radial-gradient(circle at 50% 32%, color-mix(in srgb, var(--wallet-accent) 34%, transparent) 0%, color-mix(in srgb, var(--wallet-accent) 13%, transparent) 13%, rgba(6, 21, 33, 0) 28%),
              linear-gradient(180deg, color-mix(in srgb, var(--wallet-accent) 7%, transparent) 0%, rgba(6, 21, 33, 0) 62%)
            `,
            md: `
              radial-gradient(circle at 13.5% 50%, color-mix(in srgb, var(--wallet-accent) 48%, transparent) 0%, color-mix(in srgb, var(--wallet-accent) 18%, transparent) 8%, rgba(6, 21, 33, 0) 18%),
              linear-gradient(90deg, color-mix(in srgb, var(--wallet-accent) 12%, transparent) 0%, color-mix(in srgb, var(--wallet-accent) 6%, transparent) 24%, rgba(6, 21, 33, 0) 52%)
            `,
          },
          content: '""',
          inset: 0,
          maskImage: {
            xs: 'radial-gradient(ellipse at 50% 34%, #000 0%, #000 24%, transparent 54%)',
            md: 'radial-gradient(ellipse at 17% 50%, #000 0%, #000 30%, transparent 66%)',
          },
          opacity: 0.88,
          pointerEvents: 'none',
          position: 'absolute',
        },
        '&::after': {
          background: {
            xs: 'none',
            md: 'linear-gradient(90deg, color-mix(in srgb, var(--wallet-accent) 16%, transparent) 0%, color-mix(in srgb, var(--wallet-accent) 7%, transparent) 32%, rgba(6, 21, 33, 0) 100%)',
          },
          bottom: '18%',
          content: '""',
          filter: 'blur(18px)',
          left: '13%',
          opacity: 0.36,
          pointerEvents: 'none',
          position: 'absolute',
          top: '18%',
          transform: 'skewX(-7deg)',
          width: '42%',
        },
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          display: 'grid',
          gap: { xs: 2.25, md: 2.5 },
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(150px, 0.55fr) minmax(210px, 0.78fr) minmax(300px, 1fr)',
          },
          minHeight: { md: 224 },
          pb: { xs: 2.25, md: 2.7 },
          pl: { xs: 2.25, md: 2.7 },
          pr: { xs: 2.25, md: 3.45 },
          pt: { xs: 2.25, md: 2.7 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: { xs: 'center', md: 'flex-start' },
            minHeight: { xs: 178, md: 170 },
            minWidth: 0,
            overflow: 'visible',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              alignItems: 'center',
              aspectRatio: '1 / 1',
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
              width: 'clamp(154px, 17vw, 212px)',
              '&::before': {
                background: `
                  radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--wallet-accent) 58%, transparent) 0%, color-mix(in srgb, var(--wallet-accent) 28%, transparent) 30%, rgba(4, 15, 26, 0) 54%)
                `,
                borderRadius: '50%',
                content: '""',
                filter: 'blur(16px)',
                inset: '-2%',
                opacity: 0.9,
                position: 'absolute',
                transform: 'scale(1.02)',
              },
              '&::after': {
                background:
                  'linear-gradient(90deg, color-mix(in srgb, var(--wallet-accent) 26%, transparent) 0%, color-mix(in srgb, var(--wallet-accent) 12%, transparent) 42%, transparent 100%)',
                content: '""',
                filter: 'blur(16px)',
                inset: '18% -48% 20% 48%',
                mixBlendMode: 'screen',
                opacity: 0.42,
                pointerEvents: 'none',
                position: 'absolute',
                transform: 'skewX(-8deg)',
                zIndex: 2,
              },
            }}
          >
            <Box
              component="img"
              alt=""
              src={visual.coinImage}
              sx={{
                filter:
                  'drop-shadow(0 24px 22px rgba(0,0,0,0.48)) drop-shadow(0 0 9px color-mix(in srgb, var(--wallet-accent) 62%, transparent)) drop-shadow(18px 0 22px color-mix(in srgb, var(--wallet-accent) 22%, transparent))',
                maxHeight: 'clamp(150px, 18vw, 224px)',
                maxWidth: 'clamp(150px, 18vw, 224px)',
                objectFit: 'contain',
                opacity: 0.96,
                position: 'relative',
                transform: 'rotate(-4deg)',
                width: '112%',
                zIndex: 1,
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            alignContent: 'center',
            display: 'grid',
            gap: { xs: 1.85, md: 1.7 },
            minHeight: { md: 170 },
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gap: 0.65,
              minHeight: 58,
              minWidth: 0,
            }}
          >
            <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.75 }}>
              <Typography
                sx={{
                  color: 'text.primary',
                  fontSize: { xs: 22, md: 24 },
                  fontWeight: 700,
                  lineHeight: 1.05,
                }}
              >
                {visual.name} Wallet
              </Typography>
              <VerifiedRounded
                sx={{
                  color: 'var(--wallet-accent)',
                  filter: 'drop-shadow(0 0 8px var(--wallet-glow))',
                  fontSize: 19,
                }}
              />
            </Box>
            <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {visual.symbol}
            </Typography>
          </Box>

          <Box
            sx={{
              containerType: 'inline-size',
              minWidth: 0,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontWeight: 500 }}
            >
              Available balance
            </Typography>
            <Typography
              component="div"
              sx={{
                alignItems: 'baseline',
                display: 'flex',
                fontSize: balanceFontSize,
                fontWeight: 700,
                gap: '0.32em',
                lineHeight: 1,
                maxWidth: '100%',
                minHeight: {
                  xs: 'clamp(2.15rem, 12vw, 3.1rem)',
                  md: 'clamp(2.6rem, 4vw, 3.45rem)',
                },
                mt: 0.55,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {isBalanceLoading && !balanceError ? (
                <Box sx={{ alignSelf: 'center', maxWidth: 260, width: '100%' }}>
                  <LinearProgress />
                </Box>
              ) : balanceError ? (
                <Typography color="error.main" sx={{ fontWeight: 700 }}>
                  {balanceError}
                </Typography>
              ) : (
                <>
                  <Typography
                    component="span"
                    sx={{
                      font: 'inherit',
                      fontWeight: 'inherit',
                      lineHeight: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'clip',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {balanceAmount}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      flexShrink: 0,
                      fontSize: '0.34em',
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {visual.symbol}
                  </Typography>
                </>
              )}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            alignContent: 'center',
            display: 'grid',
            gap: 1.35,
            minHeight: { md: 170 },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: 13,
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            Your Address
          </Typography>
          <Box
            sx={{
              alignItems: 'center',
              background:
                'linear-gradient(90deg, color-mix(in srgb, var(--wallet-accent) 7%, rgba(0, 8, 16, 0.4)) 0%, rgba(0, 8, 16, 0.36) 38%, rgba(0, 8, 16, 0.44) 100%)',
              border:
                '1px solid color-mix(in srgb, var(--wallet-accent) 18%, rgba(116,158,180,0.24))',
              borderRadius: 1,
              boxShadow:
                'inset 1px 0 0 color-mix(in srgb, var(--wallet-accent) 18%, transparent), inset 0 1px 0 rgba(255,255,255,0.035)',
              display: 'flex',
              gap: 1,
              minHeight: 50,
              minWidth: 0,
              px: 1.35,
              py: 0.9,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: address ? 'text.primary' : 'text.secondary',
                fontSize: 14,
                fontWeight: 600,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {addressLabel}
            </Typography>
            <CustomWidthTooltip placement="top" title={copyAddressLabel}>
              <IconButton
                size="small"
                onClick={() => copyToClipboard(address ?? '')}
                sx={{
                  color: 'text.secondary',
                  ml: 'auto',
                  '&:hover': { color: 'var(--wallet-accent)' },
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
              aria-label={`Send ${visual.symbol}`}
              onClick={onSend}
              sx={{
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--wallet-accent) 36%, rgba(20,39,53,0.96)) 0%, color-mix(in srgb, var(--wallet-accent) 24%, rgba(7,18,30,0.98)) 100%)',
                border:
                  '1px solid color-mix(in srgb, var(--wallet-accent) 52%, transparent)',
                boxShadow:
                  '0 12px 28px color-mix(in srgb, var(--wallet-accent) 14%, transparent), inset 1px 0 0 color-mix(in srgb, var(--wallet-accent) 26%, transparent), inset 0 1px 0 rgba(255,255,255,0.1)',
                color: 'text.primary',
                fontSize: 15,
                fontWeight: 700,
                minHeight: 46,
                '&:hover': {
                  background:
                    'linear-gradient(180deg, color-mix(in srgb, var(--wallet-accent) 46%, rgba(24,45,60,0.98)) 0%, color-mix(in srgb, var(--wallet-accent) 30%, rgba(7,18,30,0.98)) 100%)',
                  borderColor: 'var(--wallet-accent)',
                  boxShadow:
                    '0 14px 32px color-mix(in srgb, var(--wallet-accent) 24%, transparent), inset 0 1px 0 rgba(255,255,255,0.12)',
                },
              }}
            >
              {sendLabel}
            </WalletButtons>
            <Button
              onClick={onToggleReceive}
              startIcon={receiveOpen ? <Close /> : <FileDownloadOutlined />}
              variant="outlined"
              sx={{
                bgcolor: 'rgba(0, 8, 16, 0.28)',
                borderColor:
                  'color-mix(in srgb, var(--wallet-accent) 16%, rgba(116,158,180,0.24))',
                boxShadow:
                  'inset 1px 0 0 color-mix(in srgb, var(--wallet-accent) 12%, transparent)',
                color: 'var(--wallet-accent)',
                fontSize: 15,
                fontWeight: 700,
                minHeight: 46,
                '&:hover': {
                  bgcolor:
                    'color-mix(in srgb, var(--wallet-accent) 8%, transparent)',
                  borderColor: 'var(--wallet-accent)',
                },
              }}
            >
              {receiveOpen ? hideReceiveLabel : receiveLabel}
            </Button>
          </Box>
        </Box>
      </Box>
    </WalletCard>
  );
}

type ReceiveQrPanelProps = {
  address?: string | null;
  coin: WalletCoinSymbol;
  copyLabel?: string;
  downloadLabel?: string;
  onQrClick?: () => void;
};

export function ReceiveQrPanel({
  address,
  coin,
  copyLabel = 'Copy',
  downloadLabel = 'Download',
  onQrClick,
}: ReceiveQrPanelProps) {
  const visual = WALLET_VISUALS[coin];
  const qrRef = useRef<HTMLDivElement | null>(null);
  const value = address ?? '';

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const clonedSvg = svg.cloneNode(true) as SVGElement;
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${visual.symbol.toLowerCase()}-receive-qr.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <WalletCard
      sx={{
        ...getWalletVars(visual),
        ...walletOuterSurfaceSx,
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
          Receive {visual.symbol}
        </Typography>
        <Box
          component="button"
          type="button"
          aria-label={`Show ${visual.symbol} receive QR code`}
          onClick={onQrClick}
          sx={{
            appearance: 'none',
            background: 'transparent',
            border: 0,
            borderRadius: 1.5,
            cursor: onQrClick ? 'pointer' : 'default',
            display: 'inline-grid',
            font: 'inherit',
            p: 0.75,
            position: 'relative',
            '&:hover .qr-target-frame': {
              borderColor: 'var(--wallet-accent)',
            },
          }}
        >
          <Box
            className="qr-target-frame"
            sx={{
              ...walletInnerSurfaceSx,
              border:
                '1px solid rgba(116,158,180,0.16)',
              borderRadius: 1.5,
              p: 1.25,
              position: 'relative',
              transition: 'border-color 160ms ease',
            }}
          >
            <Box
              ref={qrRef}
              sx={{
                aspectRatio: '1 / 1',
                bgcolor: '#fff',
                borderRadius: 1,
                p: 1,
                width: 150,
              }}
            >
              <QRCode
                value={value}
                size={142}
                fgColor="#000000"
                bgColor="#ffffff"
                level="H"
                style={{ height: '100%', width: '100%' }}
              />
            </Box>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.25 }}>
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
            onClick={() => copyToClipboard(value)}
            size="small"
            startIcon={<CopyAllTwoTone />}
            variant="outlined"
          >
            {copyLabel}
          </Button>
          <Button
            onClick={handleDownload}
            size="small"
            startIcon={<FileDownloadOutlined />}
            variant="outlined"
          >
            {downloadLabel}
          </Button>
        </Box>
      </Box>
    </WalletCard>
  );
}

type WalletAddressBookPanelProps = {
  coin: WalletCoinSymbol;
  onAddContact: () => void;
  onSelectAddress: (address: string, name: string) => void;
  refreshKey?: unknown;
};

export function WalletAddressBookPanel({
  coin,
  onAddContact,
  onSelectAddress,
  refreshKey,
}: WalletAddressBookPanelProps) {
  const visual = WALLET_VISUALS[coin];
  const [entries, setEntries] = useState<AddressBookEntry[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setEntries(getAddressBook(visual.coinType));
  }, [refreshKey, visual.coinType]);

  const visibleEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter(
      (entry) =>
        entry.name.toLowerCase().includes(query) ||
        entry.address.toLowerCase().includes(query) ||
        entry.note.toLowerCase().includes(query)
    );
  }, [entries, search]);

  return (
    <WalletCard
      sx={{
        ...getWalletVars(visual),
        ...walletOuterSurfaceSx,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Box sx={{ p: { xs: 2, md: 2.25 }, pb: 1.5 }}>
        <Typography sx={{ fontWeight: 600, mb: 2 }}>
          Address book ({visual.symbol})
        </Typography>
        <TextField
          fullWidth
          placeholder="Search by name, address or note"
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: 13 },
            '& .MuiOutlinedInput-root': {
              ...walletInnerSurfaceSx,
              '& fieldset': {
                borderColor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(116,158,180,0.18)'
                    : 'rgba(17,24,39,0.08)',
              },
              '&:hover fieldset': { borderColor: 'primary.main' },
            },
          }}
        />
        <Button
          fullWidth
          startIcon={<Add />}
          variant="outlined"
          onClick={onAddContact}
          sx={{
            ...walletInnerSurfaceSx,
            borderColor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(116,158,180,0.2)'
                : 'rgba(17,24,39,0.1)',
            color: 'text.secondary',
            fontWeight: 600,
            mb: 1.25,
            '&:hover': {
              bgcolor: (t) =>
                t.palette.mode === 'dark' ? '#143342' : 'rgba(17,24,39,0.04)',
              borderColor:
                'color-mix(in srgb, var(--wallet-accent, #18bdf2) 28%, transparent)',
              color: 'text.primary',
            },
          }}
        >
          Add contact
        </Button>

        <Box
          sx={{
            ...walletInnerSurfaceSx,
            border: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 1,
            display: 'grid',
            overflow: 'hidden',
          }}
        >
          {visibleEntries.length > 0 ? (
            visibleEntries.map((entry, index) => {
              const initials =
                entry.name
                  .split(' ')
                  .filter(Boolean)
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || visual.symbol[0];
              const avatarColor = getAddressBookAvatarColor(
                `${entry.name}-${entry.address}`,
                index
              );

              return (
                <Box
                  key={entry.id}
                  sx={{
                    alignItems: 'center',
                    borderBottom:
                      index === visibleEntries.length - 1
                        ? 'none'
                        : (t) => `1px solid ${t.palette.divider}`,
                    display: 'grid',
                    gap: 1,
                    gridTemplateColumns: '44px minmax(0, 1fr) auto auto',
                    px: 1.25,
                    py: 1.5,
                  }}
                >
                  <Avatar
                    sx={{
                      ...getAddressBookAvatarSx(avatarColor),
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
                  <CustomWidthTooltip placement="top" title="Copy address">
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
                  <CustomWidthTooltip
                    placement="top"
                    title={`Send ${visual.symbol}`}
                  >
                    <IconButton
                      size="small"
                      onClick={() => onSelectAddress(entry.address, entry.name)}
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
                bgcolor: 'transparent',
                borderRadius: 1,
                color: 'text.secondary',
                px: 2,
                py: 2.25,
                textAlign: 'center',
              }}
            >
              <AccountTreeOutlined
                sx={{
                  color: 'text.secondary',
                  fontSize: 30,
                  mb: 0.5,
                  opacity: 0.3,
                }}
              />
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 13,
                  fontWeight: 500,
                  opacity: 0.82,
                }}
              >
                {search.trim()
                  ? 'No matching contacts found'
                  : `No ${visual.symbol} contacts found`}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: 12,
                  mt: 0.35,
                  opacity: 0.7,
                }}
              >
                {search.trim()
                  ? 'Try a different name, address or note.'
                  : 'Add a contact to make sends faster.'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </WalletCard>
  );
}

type WalletTransactionsCardProps = {
  actions?: ReactNode;
  children: ReactNode;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  title?: string;
};

type WalletTransactionsLoaderProps = {
  label?: string;
};

export function WalletTransactionsLoader({
  label = 'Loading transactions',
}: WalletTransactionsLoaderProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        '@keyframes walletLoaderPulse': {
          '0%, 100%': { opacity: 0.34, transform: 'scaleX(0.96)' },
          '50%': { opacity: 0.9, transform: 'scaleX(1)' },
        },
        '@keyframes walletLoaderSweep': {
          '0%': { transform: 'translateX(-110%)' },
          '100%': { transform: 'translateX(110%)' },
        },
        display: 'grid',
        gap: 1.5,
        justifyItems: 'center',
        px: { xs: 1, sm: 2 },
        py: { xs: 3, md: 3.5 },
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gap: 0.75,
          maxWidth: 560,
          width: 'min(100%, 560px)',
        }}
      >
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{
              animation: `walletLoaderPulse 1450ms ease-in-out ${index * 110}ms infinite`,
              bgcolor: 'rgba(116,158,180,0.12)',
              border: '1px solid rgba(116,158,180,0.08)',
              borderRadius: 1,
              height: 12,
              overflow: 'hidden',
              position: 'relative',
              transformOrigin: 'center',
              width: index === 1 ? '84%' : index === 2 ? '68%' : '100%',
              '&::after': {
                animation: 'walletLoaderSweep 1550ms ease-in-out infinite',
                background:
                  'linear-gradient(90deg, transparent, rgba(24,189,242,0.22), transparent)',
                content: '""',
                inset: 0,
                position: 'absolute',
              },
            }}
          />
        ))}
      </Box>
      <Typography
        sx={{
          color: 'text.secondary',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 0,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

type WalletExternalTransactionEntry = {
  address?: string;
  addressInWallet?: boolean;
  amount?: number;
};

export type WalletExternalTransactionRow = {
  feeAmount?: unknown;
  inputs?: WalletExternalTransactionEntry[];
  memo?: string;
  outputs?: WalletExternalTransactionEntry[];
  timestamp?: number;
  totalAmount?: unknown;
  txHash?: string;
};

type WalletExternalTransactionsListLabels = {
  allRows?: string;
  copyHash: (hash: string) => string;
  fee: string;
  memo?: string;
  noTransactions: string;
  receiver: string;
  rowsPerPage: string;
  sender: string;
  time: string;
  totalAmount: string;
  transactionHash: string;
  waitingConfirmation: string;
};

type WalletExternalTransactionsListProps = {
  ActionsComponent: any;
  coin: WalletCoinSymbol;
  copyHashLabel?: string;
  labels: WalletExternalTransactionsListLabels;
  onCopyHash: (hash: string) => void;
  onPageChange: (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => void;
  onRowsPerPageChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  page: number;
  rows: WalletExternalTransactionRow[];
  rowsPerPage: number;
  showMemo?: boolean;
};

const externalTransactionHeaderSx = {
  color: 'text.secondary',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

const formatExternalTransactionAmount = (value: unknown) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '-';
  return (numeric / 1e8).toFixed(8);
};

export function WalletExternalTransactionsList({
  ActionsComponent,
  coin,
  copyHashLabel,
  labels,
  onCopyHash,
  onPageChange,
  onRowsPerPageChange,
  page,
  rows,
  rowsPerPage,
  showMemo,
}: WalletExternalTransactionsListProps) {
  const gridColumns = showMemo
    ? 'minmax(120px, 1fr) minmax(120px, 1fr) minmax(120px, 0.9fr) minmax(88px, 0.7fr) minmax(118px, 0.8fr) minmax(78px, 0.55fr) minmax(92px, 0.65fr)'
    : 'minmax(130px, 1fr) minmax(130px, 1fr) minmax(128px, 0.9fr) minmax(118px, 0.78fr) minmax(78px, 0.55fr) minmax(92px, 0.65fr)';
  const minWidth = showMemo ? 880 : 760;
  const pagedRows =
    rowsPerPage > 0
      ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : rows;

  const renderEndpoint = (entries?: WalletExternalTransactionEntry[]) => {
    const firstEntry = entries?.[0];
    if (!firstEntry?.address) {
      return (
        <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
          -
        </Typography>
      );
    }

    const remainingCount = Math.max((entries?.length ?? 0) - 1, 0);

    return (
      <Box
        sx={{ alignItems: 'center', display: 'flex', gap: 0.65, minWidth: 0 }}
      >
        <Typography
          component="span"
          title={firstEntry.address}
          sx={{
            color: firstEntry.addressInWallet ? 'text.primary' : 'info.main',
            display: 'block',
            fontSize: 13,
            fontWeight: firstEntry.addressInWallet ? 500 : 600,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {firstEntry.address}
        </Typography>
        {remainingCount > 0 && (
          <Typography
            component="span"
            sx={{
              bgcolor: 'rgba(116,158,180,0.08)',
              border: '1px solid rgba(116,158,180,0.14)',
              borderRadius: 999,
              color: 'text.secondary',
              flexShrink: 0,
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1,
              px: 0.65,
              py: 0.35,
            }}
          >
            +{remainingCount}
          </Typography>
        )}
      </Box>
    );
  };

  const renderAmount = (row: WalletExternalTransactionRow) => {
    const numeric = Number(row.totalAmount);
    if (!Number.isFinite(numeric)) return '-';
    const isIncoming = numeric > 0;

    return (
      <Typography
        sx={{
          color: isIncoming ? 'success.main' : 'error.main',
          fontSize: 13,
          fontWeight: 700,
          textAlign: 'right',
          whiteSpace: 'nowrap',
        }}
      >
        {isIncoming ? '+' : ''}
        {formatExternalTransactionAmount(row.totalAmount)} {coin}
      </Typography>
    );
  };

  const renderFee = (row: WalletExternalTransactionRow) => {
    const numericFee = Number(row.feeAmount);
    if (!Number.isFinite(numericFee) || numericFee === 0) return '-';

    return (
      <Typography
        sx={{
          color: Number(row.totalAmount) <= 0 ? 'error.main' : 'text.secondary',
          fontSize: 13,
          fontWeight: 500,
          textAlign: 'right',
          whiteSpace: 'nowrap',
        }}
      >
        -{formatExternalTransactionAmount(row.feeAmount)}
      </Typography>
    );
  };

  if (!rows.length) {
    return (
      <Box
        sx={{
          bgcolor: 'transparent',
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          borderTop: (t) => `1px solid ${t.palette.divider}`,
          color: 'text.secondary',
          px: 2,
          py: 4,
          textAlign: 'center',
        }}
      >
        <Typography sx={{ fontWeight: 600 }}>
          {labels.noTransactions}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ minWidth }}>
          <Box
            aria-hidden
            sx={{
              alignItems: 'center',
              borderBottom: (t) => `1px solid ${t.palette.divider}`,
              display: 'grid',
              gap: 1,
              gridTemplateColumns: gridColumns,
              px: 1.25,
              py: 1,
            }}
          >
            <Typography sx={externalTransactionHeaderSx}>
              {labels.sender}
            </Typography>
            <Typography sx={externalTransactionHeaderSx}>
              {labels.receiver}
            </Typography>
            <Typography sx={externalTransactionHeaderSx}>
              {labels.transactionHash}
            </Typography>
            {showMemo && (
              <Typography sx={externalTransactionHeaderSx}>
                {labels.memo}
              </Typography>
            )}
            <Typography
              sx={{ ...externalTransactionHeaderSx, textAlign: 'right' }}
            >
              {labels.totalAmount}
            </Typography>
            <Typography
              sx={{ ...externalTransactionHeaderSx, textAlign: 'right' }}
            >
              {labels.fee}
            </Typography>
            <Typography sx={externalTransactionHeaderSx}>
              {labels.time}
            </Typography>
          </Box>

          <Box sx={{ display: 'grid' }}>
            {pagedRows.map((row, index) => {
              const hash = row.txHash ?? '';

              return (
                <Box
                  key={hash || index}
                  sx={{
                    alignItems: 'center',
                    bgcolor: 'transparent',
                    borderBottom: (t) =>
                      `1px solid ${
                        t.palette.mode === 'dark'
                          ? 'rgba(116,158,180,0.085)'
                          : 'rgba(17,24,39,0.06)'
                      }`,
                    display: 'grid',
                    gap: 1,
                    gridTemplateColumns: gridColumns,
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
                  {renderEndpoint(row.inputs)}
                  {renderEndpoint(row.outputs)}
                  <Box
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      gap: 0.35,
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      component="span"
                      title={hash}
                      sx={{
                        color: 'text.primary',
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 600,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {hash ? cropString(hash) : '-'}
                    </Typography>
                    {hash && (
                      <CustomWidthTooltip
                        placement="top"
                        title={copyHashLabel || labels.copyHash(hash)}
                      >
                        <IconButton
                          aria-label="copy"
                          size="small"
                          onClick={() => onCopyHash(hash)}
                          sx={{ color: 'text.secondary', p: 0.25 }}
                        >
                          <CopyAllTwoTone sx={{ fontSize: 16 }} />
                        </IconButton>
                      </CustomWidthTooltip>
                    )}
                  </Box>
                  {showMemo && (
                    <Typography
                      title={row.memo}
                      sx={{
                        color: row.memo ? 'text.primary' : 'text.secondary',
                        fontSize: 13,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.memo || '-'}
                    </Typography>
                  )}
                  {renderAmount(row)}
                  {renderFee(row)}
                  <CustomWidthTooltip
                    placement="top"
                    title={
                      row.timestamp
                        ? new Date(row.timestamp).toLocaleString()
                        : labels.waitingConfirmation
                    }
                  >
                    <Typography
                      sx={{
                        color: 'text.secondary',
                        fontSize: 13,
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.timestamp ? epochToAgo(row.timestamp) : '-'}
                    </Typography>
                  </CustomWidthTooltip>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
      <TablePagination
        component="div"
        labelRowsPerPage={labels.rowsPerPage}
        rowsPerPageOptions={[
          5,
          10,
          25,
          { label: labels.allRows || 'All', value: -1 },
        ]}
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        slotProps={{
          select: {
            inputProps: {
              'aria-label': labels.rowsPerPage,
            },
            native: true,
          },
        }}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        ActionsComponent={ActionsComponent}
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
}

export function WalletTransactionsCard({
  actions,
  children,
  isRefreshing,
  onRefresh,
  title = 'Transactions',
}: WalletTransactionsCardProps) {
  return (
    <WalletCard
      sx={{
        ...walletOuterSurfaceSx,
        overflow: 'hidden',
        width: '100%',
        '& .MuiTableContainer-root': {
          bgcolor: 'transparent',
          border: 0,
          borderRadius: 0,
          boxShadow: 'none',
          overflowX: 'hidden',
        },
        '& .MuiTable-root': {
          tableLayout: 'fixed',
          width: '100%',
        },
        '& .MuiTableCell-root': {
          minWidth: 0,
        },
        '& .MuiTableCell-root:nth-of-type(1), & .MuiTableCell-root:nth-of-type(2)':
          {
            width: '18%',
          },
        '& .MuiTableCell-root:nth-of-type(3)': {
          width: '16%',
        },
        '& .MuiTableCell-root:nth-of-type(4)': {
          width: '12%',
        },
        '& .MuiTableCell-root:nth-of-type(5)': {
          width: '10%',
        },
        '& .MuiTableCell-root:nth-of-type(6)': {
          width: '10%',
        },
        '& .MuiTableCell-root:nth-of-type(7)': {
          width: '10%',
        },
        '& .MuiTableCell-head': {
          bgcolor: 'transparent',
          color: 'text.secondary',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0,
          overflow: 'hidden',
          px: 1.5,
          py: 1.2,
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        '& .MuiTableCell-body': {
          bgcolor: 'transparent',
          fontSize: 13,
          height: 46,
          lineHeight: 1.25,
          overflow: 'hidden',
          px: 1.5,
          py: 0.85,
          textOverflow: 'ellipsis',
          verticalAlign: 'middle',
          whiteSpace: 'nowrap',
        },
        '& .MuiTableBody-root .MuiTableRow-root': {
          transition: 'background-color 150ms ease',
        },
        '& .MuiTableBody-root .MuiTableRow-root:hover': {
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(24,189,242,0.055)'
              : 'rgba(5,127,168,0.05)',
        },
        '& .MuiTableBody-root .MuiTableCell-root:nth-of-type(1) > .MuiBox-root, & .MuiTableBody-root .MuiTableCell-root:nth-of-type(2) > .MuiBox-root':
          {
            display: 'grid !important',
            gridTemplateColumns: 'minmax(0, 1fr)',
            minWidth: 0,
          },
        '& .MuiTableBody-root .MuiTableCell-root:nth-of-type(1) > .MuiBox-root:not(:first-of-type), & .MuiTableBody-root .MuiTableCell-root:nth-of-type(2) > .MuiBox-root:not(:first-of-type)':
          {
            display: 'none !important',
          },
        '& .MuiTableBody-root .MuiTableCell-root:nth-of-type(1) span, & .MuiTableBody-root .MuiTableCell-root:nth-of-type(2) span':
          {
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        '& .MuiTableBody-root .MuiTableCell-root:nth-of-type(1) span + span, & .MuiTableBody-root .MuiTableCell-root:nth-of-type(2) span + span':
          {
            display: 'none',
          },
        '& .MuiTableBody-root .MuiTableCell-root:nth-of-type(3) .MuiIconButton-root':
          {
            ml: 0.25,
            p: 0.25,
          },
        '& .MuiTableFooter-root .MuiTableCell-root': {
          borderBottom: 0,
          px: 0,
        },
        '& .MuiTablePagination-root': {
          color: 'text.secondary',
        },
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
    >
      <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 1.1 }}>
        <Box
          sx={{
            alignItems: { xs: 'flex-start', sm: 'center' },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 0.75,
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, lineHeight: 1.1 }}
          >
            {title}
          </Typography>
          {(actions || onRefresh) && (
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                gap: 0.75,
                justifyContent: { xs: 'space-between', sm: 'flex-end' },
                minWidth: 0,
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {actions}
              {onRefresh && (
                <Button
                  onClick={onRefresh}
                  loading={isRefreshing}
                  loadingPosition="start"
                  size="small"
                  startIcon={<Refresh sx={{ fontSize: 18 }} />}
                  variant="text"
                  sx={{
                    borderRadius: 1,
                    fontSize: 13,
                    fontWeight: 700,
                    minHeight: 34,
                    px: 1,
                    whiteSpace: 'nowrap',
                    '& .MuiButton-startIcon': {
                      mr: 0.65,
                    },
                  }}
                >
                Refresh
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          ...walletInnerSurfaceSx,
          borderTop: (t) => `1px solid ${t.palette.divider}`,
          boxShadow: (t) =>
            t.palette.mode === 'dark'
              ? 'inset 0 1px 0 rgba(255,255,255,0.018)'
              : '0 1px 2px rgba(16,24,40,0.04)',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </WalletCard>
  );
}

type WalletSyncCardProps = {
  isSyncing?: boolean;
  onSync: () => void;
  statusLabel: string;
  statusTone?: 'success' | 'error';
  statusTooltip?: string;
};

export function WalletSyncCard({
  isSyncing,
  onSync,
  statusLabel,
  statusTone = 'success',
  statusTooltip,
}: WalletSyncCardProps) {
  const isError = statusTone === 'error';
  const syncDescription =
    'Encrypted QDN backup for this wallet address book. It keeps your local contacts recoverable and in sync through your Qortal account.';

  return (
    <WalletCard sx={{ overflow: 'hidden', width: '100%' }}>
      <Box sx={{ display: 'grid', gap: 1.35, px: { xs: 2, md: 2.25 }, py: 2 }}>
        <Box
          sx={{
            alignItems: 'flex-start',
            display: 'flex',
            gap: 1,
            justifyContent: 'space-between',
          }}
        >
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              gap: 0.9,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                bgcolor: isError
                  ? 'rgba(246, 167, 11, 0.08)'
                  : 'rgba(116,158,180,0.06)',
                border: '1px solid rgba(116,158,180,0.16)',
                borderRadius: 1,
                color: isError
                  ? 'rgba(246, 196, 78, 0.92)'
                  : 'rgba(34,227,138,0.72)',
                display: 'inline-flex',
                flexShrink: 0,
                height: 32,
                justifyContent: 'center',
                width: 32,
              }}
            >
              <LockOutlined fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.4 }}>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    lineHeight: 1.15,
                  }}
                >
                  Encrypted sync
                </Typography>
                <CustomWidthTooltip placement="top" title={syncDescription}>
                  <InfoOutlined
                    sx={{
                      color: 'text.secondary',
                      cursor: 'help',
                      fontSize: 15,
                      opacity: 0.62,
                    }}
                  />
                </CustomWidthTooltip>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  mt: 0.45,
                  opacity: 0.78,
                }}
              >
                Local address book
              </Typography>
            </Box>
          </Box>
          <Box
            title={statusTooltip}
            sx={{
              alignItems: 'center',
              bgcolor: isError
                ? 'rgba(246, 167, 11, 0.08)'
                : 'rgba(34,227,138,0.055)',
              border: isError
                ? '1px solid rgba(246, 196, 78, 0.18)'
                : '1px solid rgba(34,227,138,0.14)',
              borderRadius: 999,
              color: isError
                ? 'rgba(246, 196, 78, 0.94)'
                : 'rgba(144, 214, 176, 0.88)',
              display: 'inline-flex',
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
              gap: 0.5,
              px: 1,
              py: 0.45,
            }}
          >
            {isError ? (
              <ErrorOutline sx={{ fontSize: 15 }} />
            ) : (
              <CheckCircleOutline sx={{ fontSize: 15 }} />
            )}
            {statusLabel}
          </Box>
        </Box>

        <Button
          fullWidth
          loading={isSyncing}
          loadingPosition="start"
          onClick={onSync}
          startIcon={<CloudSync />}
          variant="outlined"
          sx={{
            bgcolor: 'transparent',
            borderColor: 'rgba(116,158,180,0.18)',
            color: 'text.secondary',
            minHeight: 42,
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.025)',
              borderColor: 'rgba(116,158,180,0.34)',
              color: 'text.primary',
            },
          }}
        >
          Sync now
        </Button>
      </Box>
    </WalletCard>
  );
}

type WalletWorkspaceProps = {
  address?: string | null;
  addressBookRefreshKey?: unknown;
  balance?: unknown;
  balanceDecimals?: number;
  balanceError?: string | null;
  children?: ReactNode;
  coin: WalletCoinSymbol;
  isBalanceLoading?: boolean;
  noAddressLabel?: string;
  onAddContact: () => void;
  onQrClick?: () => void;
  onSelectAddress: (address: string, name: string) => void;
  onSend: () => void;
  onToggleReceive: () => void;
  receiveOpen: boolean;
  rightColumnAfter?: ReactNode;
  transactions: ReactNode;
};

export function WalletWorkspace({
  address,
  addressBookRefreshKey,
  balance,
  balanceDecimals,
  balanceError,
  children,
  coin,
  isBalanceLoading,
  noAddressLabel,
  onAddContact,
  onQrClick,
  onSelectAddress,
  onSend,
  onToggleReceive,
  receiveOpen,
  rightColumnAfter,
  transactions,
}: WalletWorkspaceProps) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
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
        <WalletSummaryCard
          address={address}
          balance={balance}
          balanceDecimals={balanceDecimals}
          balanceError={balanceError}
          coin={coin}
          isBalanceLoading={isBalanceLoading}
          noAddressLabel={noAddressLabel}
          onSend={onSend}
          onToggleReceive={onToggleReceive}
          receiveOpen={receiveOpen}
        />
        {children}
        {transactions}
      </Box>

      <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
        <Collapse
          in={receiveOpen}
          timeout={reduceMotion ? 0 : 440}
          unmountOnExit
          sx={{
            '& .MuiCollapse-wrapperInner': {
              opacity: receiveOpen ? 1 : 0,
              transform: receiveOpen ? 'translateY(0)' : 'translateY(-14px)',
              transformOrigin: 'top center',
              transition: reduceMotion
                ? 'none'
                : 'opacity 340ms ease-out, transform 440ms cubic-bezier(0.2, 0, 0, 1)',
              willChange: 'opacity, transform',
            },
          }}
        >
          <ReceiveQrPanel address={address} coin={coin} onQrClick={onQrClick} />
        </Collapse>

        <WalletAddressBookPanel
          coin={coin}
          onAddContact={onAddContact}
          onSelectAddress={onSelectAddress}
          refreshKey={addressBookRefreshKey}
        />
        {rightColumnAfter}
      </Box>
    </Box>
  );
}
