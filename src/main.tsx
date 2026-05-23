import { StrictMode, useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import ThemeProviderWrapper from './styles/theme/theme-provider.tsx';
import './index.css';
import { Routes } from './routes/Routes.tsx';
import WalletContext, { defaultState } from './contexts/walletContext.ts';

type WalletProviderProps = { children: ReactNode };

function WalletProvider({ children }: WalletProviderProps) {
  const [walletState, setWalletState] = useState(defaultState);

  return (
    <WalletContext.Provider value={{ ...walletState, setWalletState }}>
      {children}
    </WalletContext.Provider>
  );
}

function AppInteractionGuards({ children }: WalletProviderProps) {
  useEffect(() => {
    const preventImageContextMenu = (event: MouseEvent) => {
      const target = event.target;

      if (target instanceof HTMLElement && target.closest('img')) {
        event.preventDefault();
      }
    };

    const preventImageDrag = (event: DragEvent) => {
      const target = event.target;

      if (target instanceof HTMLElement && target.closest('img')) {
        event.preventDefault();
      }
    };

    document.addEventListener('contextmenu', preventImageContextMenu);
    document.addEventListener('dragstart', preventImageDrag);

    return () => {
      document.removeEventListener('contextmenu', preventImageContextMenu);
      document.removeEventListener('dragstart', preventImageDrag);
    };
  }, []);

  return children;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProviderWrapper>
      <AppInteractionGuards>
        <WalletProvider>
          <Routes />
        </WalletProvider>
      </AppInteractionGuards>
    </ThemeProviderWrapper>
  </StrictMode>
);
