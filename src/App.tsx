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
  Typography,
  useTheme,
} from '@mui/material';
import { AltRoute, GridView, HistoryToggleOff, Home, Hub, Wallet } from '@mui/icons-material';
import Grid from '@mui/material/Grid';
import { secondsToDhms } from './common/functions';
import { useContext, useEffect, useState } from 'react';
import { useAuth } from 'qapp-core';
import walletContext, { IContextProps } from './contexts/walletContext';
import qort from './assets/qort.png';
import btc from './assets/btc.png';
import ltc from './assets/ltc.png';
import doge from './assets/doge.png';
import dgb from './assets/dgb.png';
import rvn from './assets/rvn.png';
import arrr from './assets/arrr.png';
import { useTranslation } from 'react-i18next';
import NodeWidget from './components/NodeWidget';

const drawerWidth = 88;

type Props = {
  currentSegment?: string; 
  onNavigate?: (segment: string) => void;
};

function App({ currentSegment, onNavigate = () => {} }: Props) {
  const { t } = useTranslation(['core']);
  const theme = useTheme();

  const { setWalletState } = useContext(walletContext);
  const [isUsingGateway, setIsUsingGateway] = useState(true);
  const [nodeInfo, setNodeInfo] = useState<any>(null);
  const { address, avatarUrl, name } = useAuth();

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

  const walletContextValue: IContextProps = {
    address: address ?? '',
    avatar: avatarUrl ?? '',
    name: name ?? '',
    isAuthenticated: !!address,
    isUsingGateway: isUsingGateway,
    nodeInfo: nodeInfo,
  };

  useEffect(() => {
    if (setWalletState) {
      setWalletState(walletContextValue);
    }
  }, [address, avatarUrl, name, isUsingGateway, nodeInfo]);

  const features = [
    {
      icon: GridView,
      title: nodeInfo?.height,
      description: 'BLOCK HEIGHT',
    },
    {
      icon: Hub,
      title: nodeInfo?.numberOfConnections,
      description: 'CONNECTED PEERS',
    },
    {
      icon: HistoryToggleOff,
      title: secondsToDhms(nodeInfo?.uptime / 1000),
      description: 'NODE UPTIME',
    },
    {
      icon: AltRoute,
      title: nodeInfo?.buildVersion.replace('qortal-', 'v'),
      description: 'CORE VERSION',
    },
  ];

  let Pirate = {};

  if (!isUsingGateway)
    Pirate = {
      segment: 'piratechain',
      title: 'Pirate Chain',
      icon: <img src={arrr} style={{ width: '24px', height: 'auto' }} />,
    };

  type NavHeader = { kind: 'header'; title: string };
  type NavSegment = { segment: string; title: string; icon: React.ReactNode };
  type Navigation = Array<NavHeader | NavSegment>;

  const NAVIGATION: Navigation = [
    { kind: 'header', title: 'WALLETS' },
    { segment: '/', title: 'Home', icon: <Wallet /> },
    {
      segment: 'qortal',
      title: 'Qortal',
      icon: <img src={qort} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'litecoin',
      title: 'Litecoin',
      icon: <img src={ltc} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'bitcoin',
      title: 'Bitcoin',
      icon: <img src={btc} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'dogecoin',
      title: 'Dogecoin',
      icon: <img src={doge} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'digibyte',
      title: 'Digibyte',
      icon: <img src={dgb} style={{ width: 24, height: 'auto' }} />,
    },
    {
      segment: 'ravencoin',
      title: 'Ravencoin',
      icon: <img src={rvn} style={{ width: 24, height: 'auto' }} />,
    },
    // If "Pirate" is another wallet, add it here as a proper NavSegment object:
    // { segment: "pirate", title: "Pirate", icon: <img src={pirate} style={{ width: 24, height: "auto" }} /> },
  ];

  const [selectedSegment, setSelectedSegment] = useState(currentSegment ?? '/');

  // keep local state in sync if parent controls it
  useEffect(() => {
    if (currentSegment) setSelectedSegment(currentSegment);
  }, [currentSegment]);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Left vertical navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
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
            NAVIGATION.find(
              (i): i is NavHeader => (i as any).kind === 'header'
            ) ? (
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
                {
                  (
                    NAVIGATION.find(
                      (i): i is NavHeader => (i as any).kind === 'header'
                    ) as NavHeader
                  ).title
                }
              </ListSubheader>
            ) : undefined
          }
        >
          {NAVIGATION.filter(
            (item): item is NavSegment =>
              (item as any).segment && (item as any).icon
          ).map((item) => {
            const selected = selectedSegment === item.segment;
            return (
              <ListItem
                key={item.segment}
                disablePadding
                sx={{ justifyContent: 'center' }}
              >
                <Tooltip title={item.title} placement="right">
                  <ListItemButton
                    onClick={() => {
                      setSelectedSegment(item.segment);
                      onNavigate(item.segment);
                    }}
                    selected={selected}
                    sx={{
                      justifyContent: 'center',
                      py: 2,
                      minHeight: 56,
                      '&.Mui-selected': {
                        borderRight: (theme) =>
                          `3px solid ${theme.palette.primary.main}`,
                      },
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
          })}
        </List>
      </Drawer>
      
      {/* Right side content */}
      <Box component="main" sx={{ flexGrow: 1, ml: `${drawerWidth}px` }}>
        <Container maxWidth="lg" sx={{ my: 8 }}>
          {selectedSegment === '/' && (
            <>
              <Typography variant="h3" gutterBottom align="center">
                Welcome To <span style={{ color: '#60d0fd' }}>Qortal</span>{' '}
                <span style={{ color: '#05a2e4' }}>Wallets</span>{' '}
                <span style={{ color: '#02648d' }}>App</span>!
              </Typography>

              <Typography variant="h4" gutterBottom align="center">
                Qortal Node Information
              </Typography>

              <Grid
                container
                spacing={4}
                sx={{ mt: 4 }}
                justifyContent="center"
                alignItems="flex-start"
              >
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <NodeWidget
                      icon={feature.icon}
                      subtitle={feature.title ?? '-'} 
                      title={feature.description}
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {selectedSegment === 'bitcoin' && <div>Bitcoin wallet UI…</div>}
          {selectedSegment === 'litecoin' && <div>Litecoin wallet UI…</div>}
        </Container>
      </Box>
    </Box>
  );
}

export default App;
