import { supabase } from '../utils/supabase';
import { UserProfile, Transaction, RedemptionRequest } from '../types/database.types';

class PointsService {
  // Get user points and profile
  async getUserPoints(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user points:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user points:', error);
      return null;
    }
  }

  // Alternative method that returns CreditPoints format for homepage compatibility
  async getCreditPoints(userId: string): Promise<{
    totalPoints: number;
    availablePoints: number;
    redeemedPoints: number;
    tier: string;
  } | null> {
    try {
      const profile = await this.getUserPoints(userId);
      if (!profile) return null;

      return {
        totalPoints: profile.total_points || 0,
        availablePoints: profile.available_points || 0,
        redeemedPoints: profile.redeemed_points || 0,
        tier: profile.tier || 'Bronze',
      };
    } catch (error) {
      console.error('Error getting credit points:', error);
      return null;
    }
  }

  // Get transaction history (filtered for earned and redeemed only)
 async getTransactionHistory(userId: string, limit: number = 50): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*') // This includes status field
      .eq('user_id', userId)
      .in('type', ['earned', 'redeemed']) // Only get earned and redeemed transactions
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

  // Add points to user account
  async addPoints(userId: string, amount: number, description: string): Promise<boolean> {
    try {
      // Start transaction
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('total_points, available_points')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return false;
      }

      // Update points
      const newTotalPoints = profile.total_points + amount;
      const newAvailablePoints = profile.available_points + amount;

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          total_points: newTotalPoints,
          available_points: newAvailablePoints,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating points:', updateError);
        return false;
      }

      // Record transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'earned',
          amount: amount,
          description: description,
          status: 'completed',
        });

      if (transactionError) {
        console.error('Error recording transaction:', transactionError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding points:', error);
      return false;
    }
  }

  // Submit redemption request
 async submitRedemption(
  userId: string,
  accountId: string,
  fullName: string,
  gcashNumber: string,
  pointsToRedeem: number
): Promise<{ success: boolean; error?: string; redemptionId?: string }> {
  try {
    // Check if user has enough points
    const profile = await this.getUserPoints(userId);
    if (!profile || profile.available_points < pointsToRedeem) {
      return { success: false, error: 'Insufficient points' };
    }

    const cashAmount = pointsToRedeem / 100; // 100 points = 1 PHP

    // Create redemption request with pending status
    const { data: redemption, error: redemptionError } = await supabase
      .from('redemption_requests')
      .insert({
        user_id: userId,
        account_id: accountId,
        full_name: fullName,
        gcash_number: gcashNumber,
        points_redeemed: pointsToRedeem,
        cash_amount: cashAmount,
        status: 'pending', // Keep as pending
      })
      .select()
      .single();

    if (redemptionError) {
      console.error('Error creating redemption request:', redemptionError);
      return { success: false, error: redemptionError.message };
    }

    // DO NOT UPDATE POINTS YET - only create pending transaction
    // Points will be deducted when admin approves the request

    // Create a PENDING transaction (not completed)
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'redeemed',
        amount: -pointsToRedeem, // Negative amount for redemption
        description: `Redemption request - ${pointsToRedeem} points to GCash (${gcashNumber})`,
        status: 'pending', // Mark as pending, not completed
        reference_id: redemption.id,
      });

    if (transactionError) {
      console.error('Error creating pending transaction:', transactionError);
      // Don't fail the entire operation for this
    }

    return { success: true, redemptionId: redemption.id };
  } catch (error: any) {
    console.error('Error submitting redemption:', error);
    return { success: false, error: error.message };
  }
}
  // Get redemption history
  async getRedemptionHistory(userId: string): Promise<RedemptionRequest[]> {
    try {
      const { data, error } = await supabase
        .from('redemption_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching redemption history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching redemption history:', error);
      return [];
    }
  }

  // Get user statistics for homepage (only earned and redeemed)
  async getUserStats(userId: string): Promise<{
    totalTransactions: number;
    monthlyEarned: number;
    monthlyRedeemed: number;
    weeklyEarned: number;
    weeklyRedeemed: number;
  }> {
    try {
      const transactions = await this.getTransactionHistory(userId, 1000);
      
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const weeklyTransactions = transactions.filter(t => 
        new Date(t.created_at) >= oneWeekAgo
      );

      const monthlyTransactions = transactions.filter(t => 
        new Date(t.created_at) >= oneMonthAgo
      );

      return {
        totalTransactions: transactions.length,
        monthlyEarned: monthlyTransactions
          .filter(t => t.type === 'earned')
          .reduce((sum, t) => sum + t.amount, 0),
        monthlyRedeemed: monthlyTransactions
          .filter(t => t.type === 'redeemed')
          .reduce((sum, t) => sum + t.amount, 0),
        weeklyEarned: weeklyTransactions
          .filter(t => t.type === 'earned')
          .reduce((sum, t) => sum + t.amount, 0),
        weeklyRedeemed: weeklyTransactions
          .filter(t => t.type === 'redeemed')
          .reduce((sum, t) => sum + t.amount, 0),
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalTransactions: 0,
        monthlyEarned: 0,
        monthlyRedeemed: 0,
        weeklyEarned: 0,
        weeklyRedeemed: 0,
      };
    }
  }

  // Update user tier based on total points
  async updateUserTier(userId: string): Promise<void> {
    try {
      const profile = await this.getUserPoints(userId);
      if (!profile) return;

      let newTier = 'Bronze';
      const totalPoints = profile.total_points;

      if (totalPoints >= 10000) {
        newTier = 'Platinum';
      } else if (totalPoints >= 5000) {
        newTier = 'Gold';
      } else if (totalPoints >= 1000) {
        newTier = 'Silver';
      }

      if (newTier !== profile.tier) {
        await supabase
          .from('user_profiles')
          .update({ tier: newTier, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
      }
    } catch (error) {
      console.error('Error updating user tier:', error);
    }
  }

  // Format points number with proper thousand separators
  formatPoints(points: number): string {
    return points.toLocaleString();
  }

  // Format date for display
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  // Calculate cash equivalent of points (100 points = 1 PHP)
  calculateCashValue(points: number): number {
    return points / 100;
  }

  // Format cash value with currency symbol
  formatCashValue(points: number): string {
    const cashValue = this.calculateCashValue(points);
    return `₱${cashValue.toFixed(2)}`;
  }
}

export const pointsService = new PointsService();