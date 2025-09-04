import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  styled,
  useTheme,
} from '@mui/material';
import {
  TbBlocks,
  TbAffiliate,
  TbHistoryToggle,
  TbBrandGit,
} from 'react-icons/tb';
import { secondsToDhms } from './common/functions';
import { useTranslation } from 'react-i18next';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from 'qapp-core';
import walletContext, { IContextProps } from './contexts/walletContext';
import { NavLink } from 'react-router';

const FeatureCard = styled(Card)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

function App() {
  // const { t } = useTranslation(['core']);
  // const theme = useTheme();

  const { setWalletState } = useContext(walletContext)
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
    let nodeInfoTimeoutId: number;;
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

  // let Pirate = {};

  // if (!isUsingGateway)
  //   Pirate = {
  //     segment: 'piratechain',
  //     title: 'Pirate Chain',
  //     icon: <img src={arrr} style={{ width: '24px', height: 'auto' }} />,
  //   };

  const features = [
    {
      icon: <TbBlocks size={32} />,
      title: nodeInfo?.height,
      description: 'BLOCK HEIGHT',
    },
    {
      icon: <TbAffiliate size={32} />,
      title: nodeInfo?.numberOfConnections,
      description: 'CONNECTED PEERS',
    },
    {
      icon: <TbHistoryToggle size={32} />,
      title: secondsToDhms(nodeInfo?.uptime / 1000),
      description: 'NODE UPTIME',
    },
    {
      icon: <TbBrandGit size={32} />,
      title: nodeInfo?.buildVersion.replace('qortal-', 'v'),
      description: 'CORE VERSION',
    },
  ];

  return (
    <Box>
      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Typography variant="h3" gutterBottom align="center">
          Welcome To <span style={{ color: '#60d0fd' }}>Qortal</span>{' '}
          <span style={{ color: '#05a2e4' }}>Wallets</span>{' '}
          <span style={{ color: '#02648d' }}>App</span>!
        </Typography>
        <Typography variant="h4" gutterBottom align="center">
          Qortal Node Information
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <FeatureCard>
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" gutterBottom align="center">
            {!!address ? '' : 'Please sign in to use Qortal Wallets.'}
          </Typography>
        </Box>
      </Container>

      <NavLink
              to="qortal"
             
            >
              Qortal
            </NavLink>
    </Box>
  );
}

export default App;
