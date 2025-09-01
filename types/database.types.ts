export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  gcash_number?: string;
  total_points: number;
  available_points: number;
  redeemed_points: number;
  tier: string;
  member_since: string;
  created_at: string;
  updated_at: string;
  member_number: string;
}


export interface Transaction {
  id: string;
  user_id: string;
  type: 'earned' | 'redeemed' | 'bonus';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  reference_id?: string;
  created_at: string;
  updated_at: string;
}

export interface RedemptionRequest {
  id: string;
  user_id: string;
  account_id: string;
  full_name: string;
  gcash_number: string;
  points_redeemed: number;
  cash_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

// Database response types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>;
      };
      redemption_requests: {
        Row: RedemptionRequest;
        Insert: Omit<RedemptionRequest, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RedemptionRequest, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};