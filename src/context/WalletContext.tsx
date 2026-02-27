import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, VersionedTransaction } from '@solana/web3.js';

type WalletType = 'phantom' | 'metamask' | null;

interface WalletContextType {
  address: string | null;
  walletType: WalletType;
  isConnected: boolean;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  signAndSendTransaction: (transaction: Transaction | VersionedTransaction) => Promise<string>;
  provider: typeof window.solana | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check for existing connections on mount
  useEffect(() => {
    const checkConnection = async () => {
      // Check Phantom
      if (window.solana?.isPhantom && window.solana.isConnected) {
        try {
          const resp = await window.solana.connect({ onlyIfTrusted: true });
          setAddress(resp.publicKey.toString());
          setWalletType('phantom');
        } catch (err) {
          // Not connected
        }
      }
      
      // Check MetaMask
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setWalletType('metamask');
          }
        } catch (err) {
          // Not connected
        }
      }
    };

    checkConnection();
  }, []);

  const connect = async (type: WalletType) => {
    try {
      if (type === 'phantom') {
        if (!window.solana?.isPhantom) {
          window.open('https://phantom.app/', '_blank');
          return;
        }
        const resp = await window.solana.connect();
        setAddress(resp.publicKey.toString());
        setWalletType('phantom');
      } else if (type === 'metamask') {
        if (!window.ethereum) {
          window.open('https://metamask.io/', '_blank');
          return;
        }
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAddress(accounts[0]);
        setWalletType('metamask');
      }
      closeModal();
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const disconnect = async () => {
    if (walletType === 'phantom' && window.solana) {
      await window.solana.disconnect();
    }
    setAddress(null);
    setWalletType(null);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const signAndSendTransaction = async (transaction: Transaction | VersionedTransaction): Promise<string> => {
    if (walletType !== 'phantom' || !window.solana?.isPhantom) {
      throw new Error('Phantom wallet is required for Solana transactions');
    }
    const { signature } = await window.solana.signAndSendTransaction(transaction);
    return signature;
  };

  const provider = window.solana || null;

  return (
    <WalletContext.Provider value={{
      address,
      walletType,
      isConnected: !!address,
      connect,
      disconnect,
      isModalOpen,
      openModal,
      closeModal,
      signAndSendTransaction,
      provider
    }}>
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
