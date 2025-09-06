import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ThemeProviderWrapper from './styles/theme/theme-provider.tsx';
import './index.css';
import './i18n/i18n.ts';
import { Routes } from './routes/Routes.tsx';
import WalletContext, { defaultState } from './contexts/walletContext.ts';

function WalletProvider({ children }) {
  const [walletState, setWalletState] = useState(defaultState);

  return (
    <WalletContext.Provider value={{ ...walletState, setWalletState }}>
      {children}
    </WalletContext.Provider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProviderWrapper>
       <WalletProvider>
        <Routes />
      </WalletProvider>
    </ThemeProviderWrapper>
  </StrictMode>
);