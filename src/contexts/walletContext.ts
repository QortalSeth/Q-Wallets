import * as React from 'react';

export interface IContextProps {
  userInfo: any;
  setUserInfo: (val: any) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: any) => void;
  isUsingGateway: boolean;
  setIsUsingGateway: (val: any) => void;
  avatar: string;
  setAvatar: (avatar: string) => void;
  userSess: any;
  setUserSess: (val: any) => void;
}

const defaultState: IContextProps = {
  userInfo: null,
  setUserInfo: () => { },
  isAuthenticated: false,
  setIsAuthenticated: () => { },
  isUsingGateway: true,
  setIsUsingGateway: () => { },
  avatar: "",
  setAvatar: () => { },
  userSess: null,
  setUserSess: () => { }
};

export default React.createContext(defaultState);
