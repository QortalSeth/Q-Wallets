import { GlobalProvider } from 'qapp-core';
import { publicSalt } from './qapp-config';
import AppLayout from './AppLayout';

export const AppWrapper = () => {
  return (
    <GlobalProvider
      config={{
        appName: 'Q-Wallets',
        auth: {
          balanceSetting: {
            interval: 180000,
            onlyOnMount: false,
          },
          authenticateOnMount: true,
        },
        publicSalt: publicSalt,
      }}
    >
      <main>
        <AppLayout />
      </main>
    </GlobalProvider>
  );
};
