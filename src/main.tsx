import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './App';
import Layout from './layout/wallets';
import WelcomePage from "./pages/welcome/welcome";
import QortalWallet from "./pages/qort/index";
import LitecoinWallet from "./pages/ltc/index";
import BitcoinWallet from "./pages/btc/index";
import DogecoinWallet from "./pages/doge/index";
import DigibyteWallet from "./pages/dgb/index";
import RavencoinWallet from "./pages/rvn/index";
import PirateWallet from "./pages/arrr/index";

// Use a custom type if you need it
interface CustomWindow extends Window {
  _qdnBase: string;
}
const customWindow = window as unknown as CustomWindow;
const baseUrl = customWindow?._qdnBase || "";

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          {
            path: '/',
            Component: WelcomePage,
          },
          {
            path: '/qortal',
            Component: QortalWallet,
          },
          {
            path: '/litecoin',
            Component: LitecoinWallet,
          },
          {
            path: '/bitcoin',
            Component: BitcoinWallet,
          },
          {
            path: '/dogecoin',
            Component: DogecoinWallet,
          },
          {
            path: '/digibyte',
            Component: DigibyteWallet,
          },
          {
            path: '/ravencoin',
            Component: RavencoinWallet,
          },
          {
            path: '/piratechain',
            Component: PirateWallet,
          },
        ],
      },
    ],
  },
],
  {
    basename: baseUrl,
  },
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
