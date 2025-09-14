// Credit Points interface for user's point balance
export interface CreditPoints {
  totalPoints: number;
  availablePoints: number;
  redeemedPoints: number;
  tier?: string;
}

// Transaction interface for homepage display
export interface Transaction {
  id: string;
  userId: string;
  pointsEarned: number;
  pointsRedeemed: number;
  type: 'earned' | 'redeemed';
  description: string;
  status?: 'pending' | 'completed' | 'failed';
  referenceId?: string;
  createdAt: string;
}

// Component Transaction interface (for HomeScreen component)
export interface ComponentTransaction {
  id: string;
  type: 'accumulated' | 'redeemed';
  amount: number;
  date: string;
  status?: 'pending' | 'completed' | 'failed';
  description?: string;
}

// HomeScreen component props
// HomeScreen component props
export interface HomeScreenProps {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  onRefresh?: () => void;
  onNavigateToRedeem?: () => void; // Add this line
}

// Additional types for homepage functionality
export interface PointsActivity {
  weeklyEarned: number;
  weeklyRedeemed: number;
  monthlyEarned: number;
  monthlyRedeemed: number;
}

export interface UserStats {
  totalTransactions: number;
  averagePointsPerTransaction: number;
  memberSince: string;
  currentStreak: number;
}

export interface PointsHistoryFilter {
  type?: 'earned' | 'redeemed' | 'all';
  dateRange?: {
    from: string;
    to: string;
  };
  limit?: number;
}

// For homepage data loading states
export interface HomePageData {
  creditPoints: CreditPoints | null;
  transactions: ComponentTransaction[];
  activity: PointsActivity | null;
  stats: UserStats | null;
}

export interface HomePageError {
  message: string;
  code?: string;
  retryable: boolean;
}

// Utility types for redemption functionality
export interface RedemptionSummary {
  totalRedeemed: number;
  pendingRedemptions: number;
  completedRedemptions: number;
  totalCashValue: number;
}