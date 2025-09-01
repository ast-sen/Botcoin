import { useState, useEffect } from 'react';
import { CreditPoints, Transaction } from '../types/homepage.types';
import { UserProfile, Transaction as DBTransaction } from '../types/database.types';
import { pointsService } from '../services/points.service';
import { authService } from '../services/auth.service';

export const useHomePage = () => {
  const [creditPoints, setCreditPoints] = useState<CreditPoints | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentUserId = async (): Promise<string | null> => {
    try {
      const user = await authService.getCurrentUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  // Transform UserProfile to CreditPoints
  const transformUserProfileToCreditPoints = (profile: UserProfile): CreditPoints => {
    return {
      totalPoints: profile.total_points || 0,
      availablePoints: profile.available_points || 0,
      redeemedPoints: profile.redeemed_points || 0,
      tier: profile.tier || 'Bronze',
    };
  };

  // Transform database Transaction to homepage Transaction (only earned and redeemed)
  const transformTransactions = (dbTransactions: DBTransaction[]): Transaction[] => {
    return dbTransactions
      .filter(tx => tx.type === 'earned' || tx.type === 'redeemed')
      .map(tx => ({
        id: tx.id,
        userId: tx.user_id,
        pointsEarned: tx.type === 'earned' ? tx.amount : 0,
        pointsRedeemed: tx.type === 'redeemed' ? tx.amount : 0,
        type: tx.type as 'earned' | 'redeemed',
        description: tx.description || '',
        referenceId: tx.reference_id,
        createdAt: tx.created_at,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    
    try {
      setError(null);
      
      // Get current user ID
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('No authenticated user found');
      }

      // Load points and transactions in parallel
      const [userProfile, transactionsData] = await Promise.all([
        pointsService.getUserPoints(userId),
        pointsService.getTransactionHistory(userId),
      ]);

      // Transform and set data
      if (userProfile) {
        setCreditPoints(transformUserProfileToCreditPoints(userProfile));
      } else {
        setCreditPoints(null);
      }

      setTransactions(transformTransactions(transactionsData));
    } catch (error: any) {
      console.error('Failed to load homepage data:', error);
      setError(error.message || 'Failed to load data');
      
      // Set empty states on error
      setCreditPoints(null);
      setTransactions([]);
    } finally {
      setIsLoadingPoints(false);
      setIsLoadingTransactions(false);
      if (isRefresh) setIsRefreshing(false);
    }
  };

  const refreshData = () => {
    loadData(true);
  };

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  return {
    creditPoints,
    transactions,
    isLoadingPoints,
    isLoadingTransactions,
    isRefreshing,
    error,
    refreshData,
    reload: () => loadData(),
  };
};