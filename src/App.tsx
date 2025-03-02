import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import { Session, Navigation } from '@toolpad/core/AppProvider';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { Outlet, useNavigate } from 'react-router';
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
  palette: {
    primary: {
      light: '#757ce8',
      main: '#03a9f4',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#03a9f4',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
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

export default function App() {
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
    <ReactRouterAppProvider
      session={session}
      authentication={authentication}
      navigation={NAVIGATION}
      branding={{
        logo: <img src={logo} alt="MWA Logo" />,
        title: 'Multi Wallet App',
      }}
      theme={walletTheme}
    >
      <WalletContext.Provider value={walletContextValue}>
        <Outlet />
      </WalletContext.Provider>
    </ReactRouterAppProvider>
  );
}
