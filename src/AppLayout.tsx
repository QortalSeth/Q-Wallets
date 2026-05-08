import {
  AppBar,
  Box,
  ButtonBase,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListSubheader,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import { useEffect, useMemo, useContext, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import walletContext, { IContextProps } from './contexts/walletContext';
import { useAuth } from 'qapp-core';
import qort from './assets/qort.png';
import btc from './assets/btc.png';
import ltc from './assets/ltc.png';
import doge from './assets/doge.png';
import dgb from './assets/dgb.png';
import rvn from './assets/rvn.png';
import arrr from './assets/arrr.png';
import qWalletsLogo from './assets/q-wallets-logo.webp';
import { useIframe } from './hooks/useIframeListener';
import { useTranslation } from 'react-i18next';
import packageJson from '../package.json';
import { EMPTY_STRING, TIME_MINUTES_1 } from './common/constants';
import MenuIcon from '@mui/icons-material/Menu';
import { syncAllAddressBooksOnStartup } from './utils/addressBookQDN';
import changelogContent from '../CHANGELOG.md?raw';
import Markdown from 'react-markdown';

export default function AppLayout() {
  useIframe();

  const { t } = useTranslation(['core']);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { setWalletState } = useContext(walletContext);
  const { address, avatarUrl, name } = useAuth();
  const [isUsingGateway, setIsUsingGateway] = useState(true);
  const [nodeInfo, setNodeInfo] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);

  // derive selected from the URL
  const selectedSegment = useMemo(() => {
    const seg = location.pathname.replace(/^\//, EMPTY_STRING);
    return seg || '/';
  }, [location.pathname]);

  async function getNodeInfo() {
    try {
      const nodeInfo = await qortalRequest({
        action: 'GET_NODE_INFO',
      });
      const nodeStatus = await qortalRequest({
        action: 'GET_NODE_STATUS',
      });
      return { ...nodeInfo, ...nodeStatus };
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    let isMounted = true;

    const fetchGatewayStatus = async () => {
      try {
        const res = await qortalRequest({
          action: 'IS_USING_PUBLIC_NODE',
        });
        if (isMounted) {
          setIsUsingGateway(res);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchGatewayStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let nodeInfoTimeoutId: number | NodeJS.Timeout;
    (async () => {
      nodeInfoTimeoutId = setInterval(async () => {
        const infos = await getNodeInfo();
        setNodeInfo(infos);
      }, TIME_MINUTES_1);
      const infos = await getNodeInfo();
      setNodeInfo(infos);
    })();
    return () => {
      clearInterval(nodeInfoTimeoutId);
    };
  }, []);

  useEffect(() => {
    const session: IContextProps = {
      address: address ?? EMPTY_STRING,
      avatar: avatarUrl ?? EMPTY_STRING,
      name: name ?? EMPTY_STRING,
      isAuthenticated: !!address,
      isUsingGateway: isUsingGateway,
      nodeInfo: nodeInfo,
    };
    if (setWalletState) {
      setWalletState(session);
    } else {
      console.error('setWalletState is not available in wallet context');
    }
  }, [address, avatarUrl, isUsingGateway, name, nodeInfo, setWalletState]);

  // Sync address books from QDN on app startup
  useEffect(() => {
    // Only sync if user is authenticated
    if (address && name) {
      syncAllAddressBooksOnStartup(name).catch((err) => {
        console.error('Failed to sync address books on startup:', err);
        // App continues to work with localStorage only
      });
    }
  }, [address, name]);

  type NavHeader = { kind: 'header'; title: string };
  type NavSegment = { segment: string; title: string; icon: React.ReactNode };
  type Navigation = Array<NavHeader | NavSegment>;

  const coinStyle = { width: 24, height: 'auto' } as const;

  const NAVIGATION: Navigation = [
    {
      kind: 'header',
      title: t('core:wallets', { postProcess: 'capitalizeAll' }),
    },
    {
      segment: 'qortal',
      title: t('core:coins.qortal', { postProcess: 'capitalizeFirstChar' }),
      icon: <img src={qort} style={coinStyle} />,
    },
    {
      segment: 'bitcoin',
      title: t('core:coins.bitcoin', { postProcess: 'capitalizeFirstChar' }),
      icon: <img src={btc} style={coinStyle} />,
    },
    {
      segment: 'litecoin',
      title: t('core:coins.litecoin', { postProcess: 'capitalizeFirstChar' }),
      icon: <img src={ltc} style={coinStyle} />,
    },
    {
      segment: 'dogecoin',
      title: t('core:coins.dogecoin', { postProcess: 'capitalizeFirstChar' }),
      icon: <img src={doge} style={coinStyle} />,
    },
    {
      segment: 'digibyte',
      title: t('core:coins.digibyte', { postProcess: 'capitalizeFirstChar' }),
      icon: <img src={dgb} style={coinStyle} />,
    },
    {
      segment: 'ravencoin',
      title: t('core:coins.ravencoin', { postProcess: 'capitalizeFirstChar' }),
      icon: <img src={rvn} style={coinStyle} />,
    },
    {
      segment: 'piratechain',
      title: t('core:coins.piratechain', {
        postProcess: 'capitalizeFirstChar',
      }),
      icon: <img src={arrr} style={coinStyle} />,
    },
  ];

  const navItems = NAVIGATION.filter(
    (i): i is NavSegment => (i as any).segment
  );
  const coinLabels: Record<string, string> = {
    qortal: 'QORT',
    litecoin: 'LTC',
    bitcoin: 'BTC',
    dogecoin: 'DOGE',
    digibyte: 'DGB',
    ravencoin: 'RVN',
    piratechain: 'ARRR',
  };
  const activeNavItem =
    navItems.find(
      (item) =>
        selectedSegment === item.segment ||
        (selectedSegment === '/' && item.segment === '/')
    ) ?? navItems[0];

  const drawerWidth = 280;

  const drawerSx = {
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      p: 1.5,
      width: drawerWidth,
    },
  } as const;

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleNavigate = (segment: string) => {
    navigate(segment === '/' ? '/' : `/${segment}`);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
      }}
    >
      <List
        disablePadding
        subheader={
          <ListSubheader
            component="div"
            sx={{
              bgcolor: 'transparent',
              color: 'text.secondary',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              lineHeight: 1.2,
              px: 1,
              py: 1.5,
              textTransform: 'uppercase',
            }}
          >
            {t('core:wallets', { postProcess: 'capitalizeAll' })}
          </ListSubheader>
        }
        sx={{ flexGrow: 1 }}
      >
        {navItems.map((item) => {
          const isSelected =
            selectedSegment === item.segment ||
            (selectedSegment === '/' && item.segment === '/');
          return (
            <ListItem key={item.segment} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.segment)}
                selected={isSelected}
                sx={{
                  borderRadius: 1.5,
                  minHeight: 48,
                  px: 1,
                  py: 1,
                  '&.Mui-selected': (theme: Theme) => ({
                    bgcolor: theme.palette.action.selected,
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                  }),
                }}
              >
                <ListItemIcon
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    minWidth: 0,
                    width: '100%',
                  }}
                >
                  <Box sx={{ width: 24, height: 24, display: 'inline-flex' }}>
                    {item.icon}
                  </Box>
                  <Box
                    sx={{
                      fontSize: 13,
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.title}
                  </Box>
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ mt: 'auto', mb: 1, textAlign: 'center' }}>
        <Typography
          variant="caption"
          sx={{ fontSize: 10, color: 'text.secondary' }}
        >
          v{packageJson.version}
        </Typography>
        <br />
        <Link
          component="button"
          variant="caption"
          onClick={() => setChangelogOpen(true)}
          sx={{ fontSize: 9, cursor: 'pointer' }}
        >
          CHANGELOG
        </Link>
      </Box>
    </Box>
  );

  const desktopNavigation = (
    <Box
      sx={{
        alignItems: 'center',
        background: (t) =>
          t.palette.mode === 'dark'
            ? 'radial-gradient(circle at 22% 0%, rgba(24, 189, 242, 0.08), transparent 34%), linear-gradient(180deg, rgba(10, 21, 30, 0.9) 0%, rgba(7, 16, 23, 0.96) 100%)'
            : 'rgba(255,255,255,0.96)',
        border: (t) =>
          `1px solid ${
            t.palette.mode === 'dark'
              ? 'rgba(116, 158, 180, 0.16)'
              : 'rgba(17,24,39,0.08)'
          }`,
        borderRadius: 1,
        display: { xs: 'none', md: 'block' },
        mb: 2.5,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          gap: 2,
          justifyContent: 'space-between',
          minHeight: 72,
          px: 2,
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            gap: 1,
            minWidth: 210,
          }}
        >
          <Box
            component="img"
            alt="Q-Wallets"
            src={qWalletsLogo}
            sx={{
              filter: 'drop-shadow(0 0 12px rgba(24,189,242,0.26))',
              height: 34,
              width: 34,
            }}
          />
          <Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
            Q-Wallets
          </Typography>
          <Link
            component="button"
            variant="caption"
            onClick={() => setChangelogOpen(true)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.055)',
              border: (t) =>
                `1px solid ${
                  t.palette.mode === 'dark'
                    ? 'rgba(116,158,180,0.16)'
                    : 'rgba(17,24,39,0.08)'
                }`,
              borderRadius: 999,
              color: 'text.secondary',
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1,
              px: 1,
              py: 0.5,
              textDecoration: 'none',
            }}
          >
            v{packageJson.version}
          </Link>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'center',
            maxWidth: 700,
          }}
        >
          {navItems.map((item) => {
            const isSelected =
              selectedSegment === item.segment ||
              (selectedSegment === '/' && item.segment === '/');
            return (
              <ButtonBase
                key={item.segment}
                onClick={() => handleNavigate(item.segment)}
                sx={{
                  alignItems: 'center',
                  border: (t) =>
                    `1px solid ${
                      isSelected ? t.palette.primary.main : 'transparent'
                    }`,
                  borderRadius: 1,
                  color: isSelected ? 'primary.contrastText' : 'text.secondary',
                  display: 'inline-flex',
                  gap: 0.75,
                  minHeight: 42,
                  minWidth: 86,
                  px: 1.5,
                  py: 0.75,
                  bgcolor: isSelected
                    ? 'rgba(24, 189, 242, 0.14)'
                    : 'transparent',
                  boxShadow: isSelected
                    ? 'inset 0 0 0 1px rgba(24, 189, 242, 0.24)'
                    : 'none',
                  '&:hover': {
                    bgcolor: isSelected
                      ? 'rgba(24, 189, 242, 0.2)'
                      : 'action.hover',
                    color: 'text.primary',
                  },
                }}
              >
                <Box sx={{ display: 'inline-flex', height: 22, width: 22 }}>
                  {item.icon}
                </Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: isSelected ? 600 : 500, lineHeight: 1 }}
                >
                  {coinLabels[item.segment] ?? item.title}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            gap: 1.25,
            justifyContent: 'flex-end',
            minWidth: 190,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<HistoryOutlinedIcon />}
            onClick={() => setChangelogOpen(true)}
            sx={{ minHeight: 42 }}
          >
            Changelog
          </Button>
          <Box
            sx={{
              borderLeft: (t) => `1px solid ${t.palette.divider}`,
              height: 34,
              mx: 0.25,
            }}
          />
          <IconButton
            aria-label="close"
            onClick={() =>
              window.parent?.postMessage({ action: 'CLOSE_QAPP' }, '*')
            }
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        backgroundImage: (t) =>
          t.palette.mode === 'dark'
            ? 'radial-gradient(circle at 8% 5%, rgba(24, 189, 242, 0.11), transparent 28%), radial-gradient(circle at 92% 18%, rgba(24, 189, 242, 0.08), transparent 28%), linear-gradient(180deg, #071016 0%, #050b10 100%)'
            : 'none',
        minHeight: '100dvh',
        width: '100%',
      }}
    >
      {isMobile && (
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
            color: 'text.primary',
            zIndex: (t: Theme) => t.zIndex.drawer + 1,
          }}
        >
          <Toolbar sx={{ minHeight: 56, px: 1.5 }}>
            <IconButton
              color="primary"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: 'inline-flex', height: 26, mr: 1, width: 26 }}>
              {activeNavItem?.icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                component="div"
                noWrap
                sx={{ fontWeight: 700 }}
              >
                {activeNavItem?.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontWeight: 600 }}
              >
                {t('core:wallets', { postProcess: 'capitalizeAll' })}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={drawerSx}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          overflowX: 'auto',
          px: { xs: 1.5, sm: 2, md: 3 },
          py: { xs: 2, md: 3 },
          width: '100%',
        }}
      >
        <Container
          maxWidth={false}
          disableGutters
          sx={{ maxWidth: 1280, mx: 'auto' }}
        >
          {desktopNavigation}
          <Outlet />
        </Container>
      </Box>

      <Dialog
        open={changelogOpen}
        onClose={() => setChangelogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { maxHeight: '80vh' } } }}
      >
        <DialogTitle sx={{ textAlign: 'center', position: 'relative' }}>
          CHANGELOG
          <IconButton
            aria-label="Close changelog"
            onClick={() => setChangelogOpen(false)}
            size="small"
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            sx={{
              '& h1': { fontSize: '1.5rem', fontWeight: 600, mb: 2, mt: 0 },
              '& h2': {
                fontSize: '1.2rem',
                fontWeight: 600,
                mb: 1,
                mt: 3,
                color: 'primary.main',
              },
              '& h3': { fontSize: '1rem', fontWeight: 600, mb: 1, mt: 2 },
              '& ul': { pl: 2, mb: 1 },
              '& li': { mb: 0.5, fontSize: 14 },
              '& p': { mb: 1, fontSize: 14 },
              '& code': {
                backgroundColor: 'action.hover',
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
                fontSize: 13,
              },
            }}
          >
            <Markdown>{changelogContent}</Markdown>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
