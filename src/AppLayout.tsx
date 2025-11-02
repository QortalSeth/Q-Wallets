import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
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
import { useIframe } from './hooks/useIframeListener';
import { useTranslation } from 'react-i18next';
import packageJson from '../package.json';
import { TIME_MINUTES_1_IN_MILLISECONDS } from './common/constants';
import MenuIcon from '@mui/icons-material/Menu';

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

  // derive selected from the URL
  const selectedSegment = useMemo(() => {
    const seg = location.pathname.replace(/^\//, '');
    return seg || '/';
  }, [location.pathname]);

  const getIsUsingGateway = async () => {
    try {
      const res = await qortalRequest({
        action: 'IS_USING_PUBLIC_NODE',
      });
      setIsUsingGateway(res);
    } catch (error) {
      console.error(error);
    }
  };

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
    getIsUsingGateway();
  }, []);

  useEffect(() => {
    let nodeInfoTimeoutId: number | NodeJS.Timeout;
    (async () => {
      nodeInfoTimeoutId = setInterval(async () => {
        const infos = await getNodeInfo();
        setNodeInfo(infos);
      }, TIME_MINUTES_1_IN_MILLISECONDS);
      const infos = await getNodeInfo();
      setNodeInfo(infos);
    })();
    return () => {
      clearInterval(nodeInfoTimeoutId);
    };
  }, []);

  useEffect(() => {
    const session: IContextProps = {
      address: address ?? '',
      avatar: avatarUrl ?? '',
      name: name ?? '',
      isAuthenticated: !!address,
      isUsingGateway: isUsingGateway,
      nodeInfo: nodeInfo,
    };
    setWalletState?.(session);
  }, [address, avatarUrl, isUsingGateway, name, nodeInfo, setWalletState]);

  type NavHeader = { kind: 'header'; title: string };
  type NavSegment = { segment: string; title: string; icon: React.ReactNode };
  type Navigation = Array<NavHeader | NavSegment>;

  const NAVIGATION: Navigation = [
    {
      kind: 'header',
      title: t('core:wallets', { postProcess: 'capitalizeAll' }),
    },
    {
      segment: 'qortal',
      title: t('core:coins.qortal', { postProcess: 'capitalizeFirstChar' }),
      icon: <img src={qort} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'litecoin',
      title: t('core:coins.litecoin', { postProcess: 'capitalizeFirstChar' }),
      icon: <img src={ltc} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'bitcoin',
      title: t('core:coins.bitcoin', { postProcess: 'capitalizeFirstChar' }),
      icon: <img src={btc} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'dogecoin',
      title: t('core:coins.dogecoin', { postProcess: 'capitalizeFirstChar' }),
      icon: <img src={doge} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'digibyte',
      title: t('core:coins.digibyte', { postProcess: 'capitalizeFirstChar' }),
      icon: <img src={dgb} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'ravencoin',
      title: t('core:coins.ravencoin', { postProcess: 'capitalizeFirstChar' }),
      icon: <img src={rvn} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'piratechain',
      title: t('core:coins.piratechain', {
        postProcess: 'capitalizeFirstChar',
      }),
      icon: <img src={arrr} style={{ width: 24, height: 'auto' }} />,
    },
  ];

  const drawerWidth = 115;

  const drawerSx = {
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      alignItems: 'center',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      pt: 1,
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: drawerWidth }}>
      <List
        disablePadding
        subheader={
          <ListSubheader
            component="div"
            sx={{
              fontSize: 11,
              letterSpacing: 1.2,
              lineHeight: 1.2,
              py: 1.5,
              textAlign: 'center',
            }}
          >
            {t('core:wallets', { postProcess: 'capitalizeAll' })}
          </ListSubheader>
        }
        sx={{ flexGrow: 1 }}
      >
        {NAVIGATION.filter((i): i is NavSegment => (i as any).segment).map((item) => {
          const isSelected =
            selectedSegment === item.segment ||
            (selectedSegment === '/' && item.segment === '/');
          return (
            <ListItem key={item.segment} disablePadding sx={{ justifyContent: 'center' }}>
              <ListItemButton
                onClick={() => handleNavigate(item.segment)}
                selected={isSelected}
                sx={{
                  justifyContent: 'center',
                  py: 2,
                  minHeight: 56,
                  '&.Mui-selected': (theme) => ({
                    borderRight: `3px solid ${theme.palette.primary.main}`,
                  }),
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box sx={{ width: 24, height: 24, display: 'inline-flex' }}>{item.icon}</Box>
                  <Box
                    sx={{
                      fontSize: 11,
                      maxWidth: 70,
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
      <Typography
        variant="caption"
        sx={{ mt: 'auto', mb: 1, fontSize: 10, color: 'text.secondary', textAlign: 'center' }}
      >
        v{packageJson.version}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      {isMobile && (
        <AppBar position="fixed" color="primary" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
          <Toolbar sx={{ minHeight: 56 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" noWrap>
              {t('core:wallets', { postProcess: 'capitalizeAll' })}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={drawerSx}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer variant="permanent" sx={drawerSx}>
          {drawerContent}
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, width: '100%', overflowX: 'auto' }}>
        {isMobile && <Toolbar />}
        <Container maxWidth="xl" sx={{ my: isMobile ? 6 : 8 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
