import { useState, useEffect } from 'react';
import { pointsService } from '../services/points.service';
import { UserProfile, Transaction as DBTransaction } from '../types/database.types';
import { ComponentTransaction, CreditPoints } from '../types/homepage.types';

export const usePoints = (userId: string | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<ComponentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transform database transaction to HomeScreen format
  const transformTransactionForHomeScreen = (dbTransaction: DBTransaction): ComponentTransaction => {
    const isRedeemed = dbTransaction.type === 'redeemed';
    
    return {
      id: dbTransaction.id,
      type: isRedeemed ? 'redeemed' : 'accumulated',
      amount: Math.abs(dbTransaction.amount), // Always positive for display
      date: dbTransaction.created_at,
      status: dbTransaction.status || 'completed', // Include status
      description: dbTransaction.description || '',
    };
  };

  // Transform profile to HomeScreen format
  const getCreditPointsFromProfile = (profile: UserProfile | null): CreditPoints => {
    if (!profile) {
      return {
        totalPoints: 0,
        availablePoints: 0,
        redeemedPoints: 0,
      };
    }

    return {
      totalPoints: profile.total_points,
      availablePoints: profile.available_points,
      redeemedPoints: profile.redeemed_points,
      tier: profile.tier,
    };
  };

  const fetchUserPoints = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching data for user:', userId);
      
      const [userProfile, userTransactions] = await Promise.all([
        pointsService.getUserPoints(userId),
        pointsService.getTransactionHistory(userId, 20),
      ]);
      
      console.log('Raw profile from DB:', userProfile);
      console.log('Raw transactions from DB:', userTransactions);
      
      setProfile(userProfile);
      
      // Transform transactions for HomeScreen
      if (Array.isArray(userTransactions)) {
        const transformedTransactions = userTransactions
          .filter(t => t.type === 'earned' || t.type === 'redeemed')
          .map(transformTransactionForHomeScreen)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        console.log('Transformed transactions:', transformedTransactions);
        setTransactions(transformedTransactions);
      } else {
        setTransactions([]);
      }
      
    } catch (error) {
      console.error('Error fetching points data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
      setProfile(null);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPoints();
  }, [userId]);

  const refreshData = async () => {
    await fetchUserPoints();
  };

  return {
    profile,
    transactions,
    creditPoints: getCreditPointsFromProfile(profile),
    loading,
    error,
    refreshData,
  };
};