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
  stringUtf8CV,
  listCV,
} from '@stacks/transactions';
import { NETWORK, CONTRACTS } from '@/lib/contracts';

export function useMicropayment() {
  const { userSession } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const purchaseContent = async (
    creatorAddress: string,
    contentId: string,
    price: number
  ) => {
    setIsLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACTS.MICROPAYMENT_GATEWAY.split('.')[0],
        contractName: CONTRACTS.MICROPAYMENT_GATEWAY.split('.')[1],
        functionName: 'purchase-content',
        functionArgs: [
          principalCV(creatorAddress),
          stringUtf8CV(contentId),
          uintCV(price),
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
      console.error('Purchase failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseBundle = async (
    creatorAddress: string,
    contentIds: string[],
    totalPrice: number
  ) => {
    setIsLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACTS.MICROPAYMENT_GATEWAY.split('.')[0],
        contractName: CONTRACTS.MICROPAYMENT_GATEWAY.split('.')[1],
        functionName: 'purchase-bundle',
        functionArgs: [
          principalCV(creatorAddress),
          listCV(contentIds.map(id => stringUtf8CV(id))),
          uintCV(totalPrice),
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
      console.error('Bundle purchase failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const giftContent = async (
    creatorAddress: string,
    contentId: string,
    recipientAddress: string,
    price: number
  ) => {
    setIsLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACTS.MICROPAYMENT_GATEWAY.split('.')[0],
        contractName: CONTRACTS.MICROPAYMENT_GATEWAY.split('.')[1],
        functionName: 'gift-content',
        functionArgs: [
          principalCV(creatorAddress),
          stringUtf8CV(contentId),
          principalCV(recipientAddress),
          uintCV(price),
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
      console.error('Gift failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    purchaseContent,
    purchaseBundle,
    giftContent,
    isLoading,
  };
}
