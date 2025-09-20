import { GlobalProvider } from 'qapp-core';
import { publicSalt } from './qapp-config';
import AppLayout from './AppLayout';
import { TIME_MINUTES_3_IN_MILLISECONDS } from './common/constants';

export const AppWrapper = () => {
  return (
    <GlobalProvider
      config={{
        appName: 'Q-Wallets',
        auth: {
          balanceSetting: {
            interval: TIME_MINUTES_3_IN_MILLISECONDS,
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
