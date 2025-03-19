import * as React from 'react';
import packageJson from '../package.json';
import { Container, Typography } from "@mui/material";
import { createTheme } from '@mui/material/styles';
import { Session, Navigation } from '@toolpad/core/AppProvider';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { Route, Routes } from "react-router-dom";
import { DashboardLayout, type SidebarFooterProps } from '@toolpad/core/DashboardLayout';
import WalletContext, { IContextProps } from './contexts/walletContext';
import qort from "./assets/qort.png";
import btc from "./assets/btc.png";
import ltc from "./assets/ltc.png";
import doge from "./assets/doge.png";
import dgb from "./assets/dgb.png";
import rvn from "./assets/rvn.png";
import arrr from "./assets/arrr.png";
import qwalletsTitle from "./assets/qw-title.png";
import noAvatar from "./assets/noavatar.png";
import WelcomePage from "./pages/welcome/welcome";
import QortalWallet from "./pages/qort/index";
import LitecoinWallet from "./pages/ltc/index";
import BitcoinWallet from "./pages/btc/index";
import DogecoinWallet from "./pages/doge/index";
import DigibyteWallet from "./pages/dgb/index";
import RavencoinWallet from "./pages/rvn/index";
import PirateWallet from "./pages/arrr/index";
import { useSearchParams } from "react-router-dom";

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
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200
    },
  },
});

function App() {
  
  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [isUsingGateway, setIsUsingGateway] = React.useState(true);
  const [avatar, setAvatar] = React.useState<string>('');
  const [userSess, setUserSess] = React.useState<any>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [nodeInfo, setNodeInfo] = React.useState<any>(null);
  const [searchParams] = useSearchParams();

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

  React.useEffect(() => {
    getIsUsingGateway();
  }, []);

  React.useEffect(() => {
    let nodeInfoTimeoutId: string | number | NodeJS.Timeout;
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

  async function getNameInfo(address: string) {
    const response = await qortalRequest({
      action: "GET_ACCOUNT_NAMES",
      address: address,
    });
    const nameData = response;
    if (nameData?.length > 0) {
      return nameData[0].name;
    } else {
      return "No Registered Name";
    }
  };

  const askForAccountInformation = React.useCallback(async () => {
    let sessAvatar = ""
    try {
      const account = await qortalRequest({
        action: "GET_USER_ACCOUNT",
      });
      const name = await getNameInfo(account.address);
      setUserInfo({ ...account, name });
      if (name === "No Registered Name") {
        setAvatar(noAvatar);
      } else {
        sessAvatar = `/arbitrary/THUMBNAIL/${name}/qortal_avatar?async=true`;
        setAvatar(sessAvatar);
      }
      const currentUser = {
        user: {
          name: name,
          email: account?.address,
          image: sessAvatar
        },
      }
      setUserSess(currentUser);
      return currentUser
    } catch (error) {
      console.error(error);
    }
  }, []);

  const authentication = React.useMemo(() => {
    return {
      signIn: async () => {
        const response = await askForAccountInformation();
        setSession(response);
        setIsAuthenticated(true);
      },
      signOut: () => {
        setSession(null);
        setIsAuthenticated(false);
        setUserInfo(null);
        setAvatar("");
      },
    };
  }, [userSess]);

  React.useEffect(() => {
    if (searchParams.get("authOnMount") === "true") {
      (async () => {
        const response = await askForAccountInformation();
        setSession(response);
        setIsAuthenticated(true);
      })();
    }
  }, [searchParams]);

  const walletContextValue: IContextProps = {
    userInfo,
    setUserInfo,
    isAuthenticated,
    setIsAuthenticated,
    isUsingGateway,
    setIsUsingGateway,
    avatar,
    setAvatar,
    userSess,
    setUserSess,
    nodeInfo,
    setNodeInfo
  };

  let Pirate = {};

  if (!isUsingGateway)
    Pirate = {
      segment: 'piratechain',
      title: 'Pirate Chain',
      icon: <img src={arrr} style={{ width: "24px", height: "auto", }} />,
    }

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
    Pirate,
  ];

  function SidebarFooter({ mini }: SidebarFooterProps) {
    return (
      <Typography
        variant="caption"
        sx={{ m: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}
      >
        {mini ? `v${packageJson.version}` : `© ${new Date().getFullYear()} Qortal Wallets App v${packageJson.version}`}
      </Typography>
    );
  }

  return (
    <ReactRouterAppProvider
      session={session}
      authentication={authentication}
      navigation={NAVIGATION}
      branding={{
        logo: <img src={qwalletsTitle} alt="QWA Title" />,
        title: ''
      }}
      theme={walletTheme}
    >
      <WalletContext.Provider value={walletContextValue}>
        <DashboardLayout defaultSidebarCollapsed slots={{ sidebarFooter: SidebarFooter }}>
          <Container sx={{ maxWidth: '100%' }} maxWidth={false}>
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/qortal" element={<QortalWallet />} />
              <Route path="/litecoin" element={<LitecoinWallet />} />
              <Route path="/bitcoin" element={<BitcoinWallet />} />
              <Route path="/dogecoin" element={<DogecoinWallet />} />
              <Route path="/digibyte" element={<DigibyteWallet />} />
              <Route path="/ravencoin" element={<RavencoinWallet />} />
              <Route path="/piratechain" element={<PirateWallet />} />
            </Routes>
          </Container>
        </DashboardLayout>
      </WalletContext.Provider>
    </ReactRouterAppProvider>
  );
}

export default App;