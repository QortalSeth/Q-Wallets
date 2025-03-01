import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import { AppProvider, type Session, type Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import WalletContext, { IContextProps, UserNameAvatar } from './contexts/walletContext';
import qort from "/assets/qort.png";
import btc from "/assets/btc.png";
import ltc from "/assets/ltc.png";
import doge from "/assets/doge.png";
import dgb from "/assets/dgb.png";
import rvn from "/assets/rvn.png";
import arrr from "/assets/arrr.png";
import logo from "/assets/logo.png";

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'WALLETS',
  },
  {
    segment: 'qortal',
    title: 'Qortal',
    icon: <img src={qort} style={{ width: "24px", height: "auto", }} />,
  },
  {
    segment: 'litecoin',
    title: 'Litecoin',
    icon: <img src={ltc} style={{ width: "24px", height: "auto", }} />,
  },
  {
    segment: 'bitcoin',
    title: 'Bitcoin',
    icon: <img src={btc} style={{ width: "24px", height: "auto", }} />,
  },
  {
    segment: 'dogecoin',
    title: 'Dogecoin',
    icon: <img src={doge} style={{ width: "24px", height: "auto", }} />,
  },
  {
    segment: 'digibyte',
    title: 'Digibyte',
    icon: <img src={dgb} style={{ width: "24px", height: "auto", }} />,
  },
  {
    segment: 'ravencoin',
    title: 'Ravencoin',
    icon: <img src={rvn} style={{ width: "24px", height: "auto", }} />,
  },
  {
    segment: 'piratechain',
    title: 'Pirate Chain',
    icon: <img src={arrr} style={{ width: "24px", height: "auto", }} />,
  },
];

const walletTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function WalletPageContent({ pathname }: { pathname: string }) {
  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Typography>Dashboard content for {pathname}</Typography>
    </Box>
  );
}

interface DemoProps {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window?: () => Window;
}

function App(props: DemoProps) {
  const { window } = props;

  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [qortalBalance, setQortalBalance] = React.useState<any>(null);
  const [balances, setBalances] = React.useState<any>({});
  const [selectedCoin, setSelectedCoin] = React.useState("QORTAL");
  const foreignCoinBalance = React.useMemo(() => {
    if (balances[selectedCoin] === 0) return 0
    return balances[selectedCoin] || null
  }, [balances, selectedCoin]);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [isUsingGateway, setIsUsingGateway] = React.useState(true);
  const [userNameAvatar, setUserNameAvatar] = React.useState<
    Record<string, UserNameAvatar>
  >({});
  const [avatar, setAvatar] = React.useState<string>("");

  const getIsUsingGateway = async () => {
    try {
      const res = await qortalRequest({
        action: "IS_USING_PUBLIC_NODE"
      });
      console.log("RES", res);
      setIsUsingGateway(res);
    } catch (error) {
    }
  }

  React.useEffect(() => {
    getIsUsingGateway()
  }, [])

  const [session, setSession] = React.useState<Session | null>({
    user: {
      name: 'Bharat Kashyap',
      email: 'bharatkashyap@outlook.com',
      image: 'https://avatars.githubusercontent.com/u/19550456',
    },
  });

  const authentication = React.useMemo(() => {
    return {
      signIn: () => {
        setSession({
          user: {
            name: 'Bharat Kashyap',
            email: 'bharatkashyap@outlook.com',
            image: 'https://avatars.githubusercontent.com/u/19550456',
          },
        });
      },
      signOut: () => {
        setSession(null);
      },
    };
  }, []);

  const router = useDemoRouter('/dashboard');

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  const getCoinLabel = React.useCallback((coin?: string) => {
    switch (coin || selectedCoin) {
      case "QORTAL": {
        return 'QORT'
      }
      case "LITECOIN": {
        return 'LTC'
      }
      case "DOGECOIN": {
        return 'DOGE'
      }
      case "BITCOIN": {
        return 'BTC'
      }
      case "DIGIBYTE": {
        return 'DGB'
      }
      case "RAVENCOIN": {
        return 'RVN'
      }
      case "PIRATECHAIN": {
        return 'ARRR'
      }
      default:
        return null
    }
  }, [selectedCoin])

  const walletContextValue: IContextProps = {
    userInfo,
    setUserInfo,
    userNameAvatar,
    setUserNameAvatar,
    foreignCoinBalance,
    qortalBalance,
    isAuthenticated,
    setIsAuthenticated,
    isUsingGateway,
    selectedCoin,
    setSelectedCoin,
    getCoinLabel
  };

  return (
    <AppProvider
      session={session}
      authentication={authentication}
      navigation={NAVIGATION}
      branding={{
        logo: <img src={logo} alt="MWA Logo" />,
        title: 'Multi Wallet App',
        homeUrl: '/toolpad/core/introduction',
      }}
      router={router}
      theme={walletTheme}
      window={demoWindow}
    >
      <WalletContext.Provider value={walletContextValue}>
        <DashboardLayout>
          <WalletPageContent pathname={router.pathname} />
        </DashboardLayout>
      </WalletContext.Provider>
    </AppProvider>
    // preview-end
  );
}

export default App;