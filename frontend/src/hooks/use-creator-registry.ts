'use client';

import { useState } from 'react';
import { useWallet } from '@/providers/wallet-provider';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
  uintCV,
  principalCV,
} from '@stacks/transactions';
import { NETWORK, CONTRACTS, FEES } from '@/lib/contracts';

export function useCreatorRegistry() {
  const { userSession } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const registerCreator = async (
    username: string,
    bio: string,
    avatarUrl: string,
    category: string
  ) => {
    setIsLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACTS.CREATOR_REGISTRY.split('.')[0],
        contractName: CONTRACTS.CREATOR_REGISTRY.split('.')[1],
        functionName: 'register-creator',
        functionArgs: [
          stringUtf8CV(username),
          stringUtf8CV(bio),
          stringUtf8CV(avatarUrl),
          stringUtf8CV(category),
        ],
        senderKey: userSession.loadUserData().appPrivateKey,
        validateWithAbi: true,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny,
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction(transaction, NETWORK);
      return result;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (bio: string, avatarUrl: string, category: string) => {
    setIsLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACTS.CREATOR_REGISTRY.split('.')[0],
        contractName: CONTRACTS.CREATOR_REGISTRY.split('.')[1],
        functionName: 'update-profile',
        functionArgs: [
          stringUtf8CV(bio),
          stringUtf8CV(avatarUrl),
          stringUtf8CV(category),
        ],
        senderKey: userSession.loadUserData().appPrivateKey,
        validateWithAbi: true,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny,
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction(transaction, NETWORK);
      return result;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const submitForVerification = async () => {
    setIsLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACTS.CREATOR_REGISTRY.split('.')[0],
        contractName: CONTRACTS.CREATOR_REGISTRY.split('.')[1],
        functionName: 'submit-for-verification',
        functionArgs: [],
        senderKey: userSession.loadUserData().appPrivateKey,
        validateWithAbi: true,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny,
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction(transaction, NETWORK);
      return result;
    } catch (error) {
      console.error('Verification submission failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registerCreator,
    updateProfile,
    submitForVerification,
    isLoading,
  };
}
