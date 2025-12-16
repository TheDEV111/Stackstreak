'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

interface WalletContextType {
  userSession: UserSession;
  isAuthenticated: boolean;
  userAddress: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setIsAuthenticated(true);
      setUserAddress(userData.profile.stxAddress.mainnet);
    }
  }, []);

  const connect = () => {
    showConnect({
      appDetails: {
        name: 'StackStream',
        icon: '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        const userData = userSession.loadUserData();
        setIsAuthenticated(true);
        setUserAddress(userData.profile.stxAddress.mainnet);
      },
      userSession,
    });
  };

  const disconnect = () => {
    userSession.signUserOut();
    setIsAuthenticated(false);
    setUserAddress(null);
  };

  return (
    <WalletContext.Provider
      value={{
        userSession,
        isAuthenticated,
        userAddress,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
