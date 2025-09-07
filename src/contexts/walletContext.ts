import { SetStateAction } from "jotai";
import { createContext, Dispatch } from "react";

export interface IContextProps {
  address: string | null;
  avatar: string | null;
  name: string | null;
  isAuthenticated: boolean;
  isUsingGateway: boolean;
  nodeInfo: any;
  setWalletState?: Dispatch<SetStateAction<IContextProps>>;
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
