import {
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListSubheader,
  Tooltip,
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
import { Wallet } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const drawerWidth = 88;

export default function AppLayout() {
  useIframe();

  const { t } = useTranslation(['core']);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { setWalletState } = useContext(walletContext);
  const { address, avatarUrl, name } = useAuth();
  const [isUsingGateway, setIsUsingGateway] = useState(true);
  const [nodeInfo, setNodeInfo] = useState<any>(null);

  // derive selected from the URL
  const selectedSegment = useMemo(() => {
    const seg = location.pathname.replace(/^\//, '');
    return seg || '/';
  }, [location.pathname]);

  const getIsUsingGateway = async () => {
    try {
      const res = await qortalRequest({
        action: "IS_USING_PUBLIC_NODE"
      });
      setIsUsingGateway(res);
    } catch (error) {
      console.error(error);
    }
  }

  async function getNodeInfo() {
    try {
      const nodeInfo = await qortalRequest({
        action: "GET_NODE_INFO",
      });
      const nodeStatus = await qortalRequest({
        action: "GET_NODE_STATUS",
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
    let nodeInfoTimeoutId: number;
    (async () => {
      nodeInfoTimeoutId = setInterval(async () => {
        const infos = await getNodeInfo();
        setNodeInfo(infos);
      }, 60000);
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
  }, [address, avatarUrl, name, nodeInfo, setWalletState]);

  type NavHeader = { kind: 'header'; title: string };
  type NavSegment = { segment: string; title: string; icon: React.ReactNode };
  type Navigation = Array<NavHeader | NavSegment>;

  const NAVIGATION: Navigation = [
    {
      kind: 'header',
      title: t('core:wallets', { postProcess: 'capitalizeAll' }),
    },
    {
      segment: '/',
      title: t('core:home', { postProcess: 'capitalizeFirst' }),
      icon: <Wallet />,
    },
    {
      segment: 'qortal',
      title: t('core:coins.qortal', { postProcess: 'capitalizeFirst' }),
      icon: <img src={qort} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'litecoin',
      title: t('core:coins.litecoin', { postProcess: 'capitalizeFirst' }),
      icon: <img src={ltc} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'bitcoin',
      title: t('core:coins.bitcoin', { postProcess: 'capitalizeFirst' }),
      icon: <img src={btc} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'dogecoin',
      title: t('core:coins.dogecoin', { postProcess: 'capitalizeFirst' }),
      icon: <img src={doge} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'digibyte',
      title: t('core:coins.digibyte', { postProcess: 'capitalizeFirst' }),
      icon: <img src={dgb} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'ravencoin',
      title: t('core:coins.ravencoin', { postProcess: 'capitalizeFirst' }),
      icon: <img src={rvn} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'piratechain',
      title: t('core:coins.piratechain', { postProcess: 'capitalizeFirst' }),
      icon: <img src={arrr} style={{ width: 24, height: 'auto' }} />,
    },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Left vertical navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            alignItems: 'center',
            pt: 1,
            overflowX: 'hidden',
          },
        }}
      >
        <List
          disablePadding
          subheader={
            <ListSubheader
              component="div"
              sx={{
                textAlign: 'center',
                lineHeight: 1.2,
                py: 1.5,
                fontSize: 11,
                letterSpacing: 1.2,
              }}
            >
              {t('core:wallets', { postProcess: 'capitalizeAll' })}
            </ListSubheader>
          }
        >
          {NAVIGATION.filter((i): i is NavSegment => (i as any).segment).map(
            (item) => {
              const isSelected =
                selectedSegment === item.segment ||
                (selectedSegment === '/' && item.segment === '/');
              return (
                <ListItem
                  key={item.segment}
                  disablePadding
                  sx={{ justifyContent: 'center' }}
                >
                  <Tooltip title={item.title} placement="right">
                    <ListItemButton
                      onClick={() =>
                        navigate(
                          item.segment === '/' ? '/' : `/${item.segment}`
                        )
                      }
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
                      <ListItemIcon sx={{ minWidth: 0 }}>
                        <Box
                          sx={{ width: 24, height: 24, display: 'inline-flex' }}
                        >
                          {item.icon}
                        </Box>
                      </ListItemIcon>
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              );
            }
          )}
        </List>
      </Drawer>

      {/* Right side content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, ml: `${drawerWidth}px` }}
      >
        <Container maxWidth="xl" sx={{ my: 8 }}>
          {/* The active route renders here */}
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
