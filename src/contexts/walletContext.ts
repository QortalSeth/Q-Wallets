import * as React from 'react';

export interface User {
  id: string;
  qortalAddress: string;
}

export interface UserNameAvatar {
  name: string;
  avatar: string;
}

export interface IContextProps {
  qortalBalance: number | null;
  foreignCoinBalance: number | null;
  userInfo: any;
  setUserInfo: (val: any) => void;
  userNameAvatar: Record<string, UserNameAvatar>;
  setUserNameAvatar: (userNameAvatar: Record<string, UserNameAvatar>) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: any) => void;
  isUsingGateway: boolean;
  selectedCoin: string;
  setSelectedCoin: (val: any) => void;
  getCoinLabel: () => string | null | void;
}

const defaultState: IContextProps = {
  qortalBalance: null,
  foreignCoinBalance: null,
  userInfo: null,
  setUserInfo: () => { },
  userNameAvatar: {},
  setUserNameAvatar: () => { },
  isAuthenticated: false,
  setIsAuthenticated: () => { },
  isUsingGateway: true,
  selectedCoin: 'LITECOIN',
  setSelectedCoin: () => { },
  getCoinLabel: () => { }
};

export default React.createContext(defaultState);
