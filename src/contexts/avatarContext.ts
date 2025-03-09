import * as React from 'react';

export interface AvatarContextProps {
  avatar: string;
  setAvatar: (avatar: string) => void;
};

export const AvatarContext = React.createContext<AvatarContextProps>({
  avatar: '',
  setAvatar: () => {}
});