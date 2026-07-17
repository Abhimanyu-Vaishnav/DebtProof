/**
 * DebtProof — useWallet Hook
 * Manages MetaMask wallet connection, network switching, and smart contract calls.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
import { MONAD_TESTNET_PARAMS, DEBT_PROOF_REGISTRY_ADDRESS, DEBT_PROOF_REGISTRY_ABI } from "@/utils/contract";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletState {
  walletAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isWrongNetwork: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    walletAddress: null,
    isConnected: false,
    isConnecting: false,
    isWrongNetwork: false,
    error: null,
  });

  const checkNetwork = useCallback(async (provider: BrowserProvider): Promise<boolean> => {
    try {
      const network = await provider.getNetwork();
      const chainIdHex = '0x' + network.chainId.toString(16);
      const isWrong = chainIdHex.toLowerCase() !== MONAD_TESTNET_PARAMS.chainId.toLowerCase();
      setState(prev => ({ ...prev, isWrongNetwork: isWrong }));
      return !isWrong;
    } catch {
      return false;
    }
  }, []);

  const switchToMonadTestnet = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !window.ethereum) {
      setState(prev => ({ ...prev, error: "MetaMask is not installed." }));
      return false;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MONAD_TESTNET_PARAMS.chainId }],
      });
      setState(prev => ({ ...prev, isWrongNetwork: false, error: null }));
      return true;
    } catch (switchError: any) {
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [MONAD_TESTNET_PARAMS],
          });
          setState(prev => ({ ...prev, isWrongNetwork: false, error: null }));
          return true;
        } catch (addError: any) {
          setState(prev => ({ ...prev, error: "Failed to add Monad Testnet to wallet." }));
          return false;
        }
      }
      setState(prev => ({ ...prev, error: "Failed to switch to Monad Testnet." }));
      return false;
    }
  }, []);

  const connectWallet = useCallback(async (): Promise<string | null> => {
    if (typeof window === "undefined" || !window.ethereum) {
      setState(prev => ({ ...prev, error: "MetaMask is not installed." }));
      return null;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found.");
      }

      const address = accounts[0];
      const provider = new BrowserProvider(window.ethereum);
      
      const isCorrectNetwork = await checkNetwork(provider);
      
      setState(prev => ({
        ...prev,
        walletAddress: address,
        isConnected: true,
        isConnecting: false,
        isWrongNetwork: !isCorrectNetwork,
        error: null,
      }));

      return address;
    } catch (err: any) {
      let msg = "Wallet connection rejected or failed.";
      if (err.code === 4001) {
        msg = "Wallet connection request rejected by user.";
      }
      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: false,
        walletAddress: null,
        error: msg,
      }));
      return null;
    }
  }, [checkNetwork]);

  const disconnectWallet = useCallback(() => {
    setState({
      walletAddress: null,
      isConnected: false,
      isConnecting: false,
      isWrongNetwork: false,
      error: null,
    });
  }, []);

  const storeProofOnChain = useCallback(async (
    proofId: string, 
    receiptHashHex: string
  ): Promise<{ txHash: string; blockNumber: number } | null> => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const isCorrectNetwork = await checkNetwork(provider);
      
      if (!isCorrectNetwork) {
        const switched = await switchToMonadTestnet();
        if (!switched) {
          throw new Error("Please switch to Monad Testnet before proceeding.");
        }
      }

      if (!DEBT_PROOF_REGISTRY_ADDRESS) {
        throw new Error("Contract Not Yet Deployed.");
      }

      const signer = await provider.getSigner();
      const contract = new Contract(DEBT_PROOF_REGISTRY_ADDRESS, DEBT_PROOF_REGISTRY_ABI, signer);

      // Ensure receipt hash is properly formatted as bytes32
      let hashBytes32 = receiptHashHex;
      if (!hashBytes32.startsWith("0x")) {
        hashBytes32 = "0x" + hashBytes32;
      }
      
      // If it's less than 66 characters (0x + 64 hex characters), pad it
      if (hashBytes32.length < 66) {
        hashBytes32 = ethers.zeroPadValue(hashBytes32, 32);
      }

      const tx = await contract.storeProof(proofId, hashBytes32);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (err: any) {
      let msg = "Transaction failed.";
      if (err.code === 4001 || (err.message && err.message.includes("rejected"))) {
        msg = "Transaction rejected by user.";
      } else if (err.message && err.message.includes("ProofAlreadyExists")) {
        msg = "This proof hash is already registered on the blockchain.";
      } else if (err.message) {
        msg = err.message;
      }
      setState(prev => ({ ...prev, error: msg }));
      throw new Error(msg);
    }
  }, [checkNetwork, switchToMonadTestnet]);

  // Set up MetaMask event listeners
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setState(prev => ({
          ...prev,
          walletAddress: accounts[0],
          isConnected: true,
          error: null,
        }));
      }
    };

    const handleChainChanged = () => {
      // Reload is standard Ethers practice to avoid state bugs
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // Initial check if already connected
    const checkInitialConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          const provider = new BrowserProvider(window.ethereum);
          const isCorrect = await checkNetwork(provider);
          setState(prev => ({
            ...prev,
            walletAddress: accounts[0],
            isConnected: true,
            isWrongNetwork: !isCorrect,
          }));
        }
      } catch {
        // Ignore silent error on check
      }
    };

    checkInitialConnection();

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [checkNetwork, disconnectWallet]);

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    switchToMonadTestnet,
    storeProofOnChain,
  };
}
