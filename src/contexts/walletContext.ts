import { createContext } from "react";

export interface IContextProps {
  address: string | null;
  avatar: string | null;
  name: string | null;
  isAuthenticated: boolean;
  isUsingGateway: boolean;
  nodeInfo: any;
  setWalletState?: React.Dispatch<React.SetStateAction<IContextProps>>;
}

export const defaultState: IContextProps = {
  address: '',
  avatar: '',
  name: '',
  isAuthenticated: false,
  isUsingGateway: true,
  nodeInfo: null
};

export default createContext(defaultState);
