import { useState, useEffect } from 'react';
import { useIsClient } from './useIsClient';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useWallet = () => {
  const isClient = useIsClient();
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isLoading: false,
    error: null,
  });

  // Verificar se MetaMask está instalado
  const isMetaMaskInstalled = () => {
    return isClient && window.ethereum && window.ethereum.isMetaMask;
  };

  // Conectar carteira
  const connectWallet = async () => {
    if (!isClient) return;
    
    if (!isMetaMaskInstalled()) {
      setWalletState(prev => ({
        ...prev,
        error: 'MetaMask não está instalado. Por favor, instale a extensão MetaMask.',
      }));
      return;
    }

    setWalletState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Solicitar conexão com MetaMask
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setWalletState(prev => ({
          ...prev,
          isConnected: true,
          address: accounts[0],
          isLoading: false,
        }));
      }
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Erro ao conectar com MetaMask',
      }));
    }
  };

  // Desconectar carteira
  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      isLoading: false,
      error: null,
    });
  };

  // Verificar se já está conectado ao carregar a página
  const checkConnection = async () => {
    if (!isClient || !isMetaMaskInstalled()) return;

    try {
      const accounts = await window.ethereum!.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        setWalletState(prev => ({
          ...prev,
          isConnected: true,
          address: accounts[0],
        }));
      }
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
    }
  };

  // Formatar endereço (mostrar apenas início e fim)
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Escutar mudanças de conta
  useEffect(() => {
    if (!isClient || !isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setWalletState(prev => ({
          ...prev,
          address: accounts[0],
          isConnected: true,
        }));
      }
    };

    const handleChainChanged = () => {
      // Recarregar página quando mudar de rede
      window.location.reload();
    };

    window.ethereum!.on('accountsChanged', handleAccountsChanged);
    window.ethereum!.on('chainChanged', handleChainChanged);

    // Verificar conexão inicial
    checkConnection();

    // Cleanup
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [isClient]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    formatAddress: walletState.address ? formatAddress(walletState.address) : '',
    isMetaMaskInstalled: isMetaMaskInstalled(),
    isClient,
  };
}; 