import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../AppLayout';
import { AppWrapper } from '../AppWrapper';
import QortalWallet from '../pages/qort';
import LitecoinWallet from '../pages/ltc';
import BitcoinWallet from '../pages/btc';
import DogecoinWallet from '../pages/doge';
import DigibyteWallet from '../pages/dgb';
import RavencoinWallet from '../pages/rvn';
import PirateWallet from '../pages/arrr';
import Home from '../pages/Home';

interface CustomWindow extends Window {
  _qdnBase: string;
}
const customWindow = window as unknown as CustomWindow;
const baseUrl = customWindow?._qdnBase || '';

export function Routes() {
  const router = createBrowserRouter(
    [
      {
        path: '/',
        element: <AppWrapper />,
        children: [
          { index: true, element: <Home /> },       
          { path: 'qortal', element: <QortalWallet /> },
          { path: 'litecoin', element: <LitecoinWallet /> },
          { path: 'bitcoin', element: <BitcoinWallet /> },
          { path: 'dogecoin', element: <DogecoinWallet /> },
          { path: 'digibyte', element: <DigibyteWallet /> },
          { path: 'ravencoin', element: <RavencoinWallet /> },
          { path: 'piratechain', element: <PirateWallet /> },
        ],
      },
    ],
    {
      basename: baseUrl,
    }
  );

  return <RouterProvider router={router} />;
}
