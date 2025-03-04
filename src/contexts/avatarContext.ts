import { createContext } from 'react';

export interface AvatarContextProps {
  avatar: string;
  setAvatar: (avatar: string) => void;
};

export const AvatarContext = createContext<AvatarContextProps>({
  avatar: '',
  setAvatar: () => {},
});