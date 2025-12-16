'use client';

import { useState } from 'react';
import { useWallet } from '@/providers/wallet-provider';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
} from '@stacks/transactions';
import { NETWORK, CONTRACTS } from '@/lib/contracts';

export function useSubscription() {
  const { userSession } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const subscribe = async (creatorAddress: string, tier: number, months: number) => {
    setIsLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACTS.SUBSCRIPTION_MANAGER.split('.')[0],
        contractName: CONTRACTS.SUBSCRIPTION_MANAGER.split('.')[1],
        functionName: 'subscribe',
        functionArgs: [
          principalCV(creatorAddress),
          uintCV(tier),
          uintCV(months),
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
      console.error('Subscription failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const renewSubscription = async (creatorAddress: string, months: number) => {
    setIsLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACTS.SUBSCRIPTION_MANAGER.split('.')[0],
        contractName: CONTRACTS.SUBSCRIPTION_MANAGER.split('.')[1],
        functionName: 'renew-subscription',
        functionArgs: [principalCV(creatorAddress), uintCV(months)],
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
      console.error('Renewal failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (creatorAddress: string) => {
    setIsLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACTS.SUBSCRIPTION_MANAGER.split('.')[0],
        contractName: CONTRACTS.SUBSCRIPTION_MANAGER.split('.')[1],
        functionName: 'cancel-subscription',
        functionArgs: [principalCV(creatorAddress)],
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
      console.error('Cancellation failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscribe,
    renewSubscription,
    cancelSubscription,
    isLoading,
  };
}
