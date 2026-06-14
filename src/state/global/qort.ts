import { atomWithStorage } from 'jotai/utils';

export const qortTransactionFiltersAtom = atomWithStorage<string[]>(
  'q-wallets:qort:transaction-filters',
  ['payments']
);
