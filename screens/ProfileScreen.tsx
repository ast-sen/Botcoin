import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/styles.constants';
import { authService } from '../services/auth.service';
import { pointsService } from '../services/points.service';
import { usePoints } from '../hooks/UsePoints';
import { User } from '../types/auth.types';
import { UserProfile, Transaction } from '../types/database.types';

interface ProfileScreenProps {
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  action: () => void;
  showChevron?: boolean;
}

interface ProfileStats {
  totalPoints: number;
  availablePoints: number;
  redeemedPoints: number;
  memberSince: string;
  tier: string;
  transactionCount: number;
  cashValue: number;
}

// Enhanced credentials interface that uses UserProfile as the primary source
interface AppUserCredentials {
  // Primary identification (from UserProfile)
  id: string;
  userId: string; // Reference to auth user
  fullName: string;
  email: string;
  phoneNumber?: string;
  gcashNumber?: string;
  memberNumber: string;
  memberSince: string;
  
  // Points and tier info
  totalPoints: number;
  availablePoints: number;
  redeemedPoints: number;
  tier: string;
  
  // Status flags
  isAuthenticated: boolean;
  hasProfile: boolean;
  profileComplete: boolean;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null); // Keep for auth checking
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  // Use your existing usePoints hook for consistency
  const { 
    profile, 
    transactions, 
    creditPoints, 
    loading: pointsLoading, 
    error: pointsError,
    refreshData: refreshPoints 
  } = usePoints(user?.id || null);

  // Main credentials object - now primarily uses UserProfile data
  const appCredentials = useMemo<AppUserCredentials | null>(() => {
    // Must have authenticated user to proceed
    if (!user) return null;

    // If no profile yet, return minimal credentials
    if (!profile) {
      return {
        id: '', // No profile ID yet
        userId: user.id,
        fullName: user.name,
        email: user.email,
        memberNumber: '',
        memberSince: user.created_at,
        totalPoints: 0,
        availablePoints: 0,
        redeemedPoints: 0,
        tier: 'Bronze',
        isAuthenticated: true,
        hasProfile: false,
        profileComplete: false,
      };
    }

    // Full credentials from UserProfile
    return {
      id: profile.id, // Primary ID is now profile ID
      userId: user.id, // Keep reference to auth user
      fullName: profile.full_name,
      email: profile.email,
      phoneNumber: profile.phone_number,
      gcashNumber: profile.gcash_number,
      memberNumber: profile.member_number,
      memberSince: profile.member_since,
      totalPoints: profile.total_points,
      availablePoints: profile.available_points,
      redeemedPoints: profile.redeemed_points,
      tier: profile.tier,
      isAuthenticated: true,
      hasProfile: true,
      profileComplete: !!(profile.full_name && profile.email && profile.phone_number),
    };
  }, [user, profile]);

  // Display values derived from credentials
  const displayValues = useMemo(() => {
    if (!appCredentials) {
      return {
        avatarInitials: '?',
        displayName: 'Unknown User',
        displayId: 'No ID',
        phoneDisplay: null,
        emailDisplay: null,
      };
    }

    return {
      avatarInitials: appCredentials.fullName
        ? appCredentials.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
        : '?',
      displayName: appCredentials.fullName || 'Unknown User',
      displayId: appCredentials.memberNumber || appCredentials.userId.slice(0, 8),
      phoneDisplay: appCredentials.phoneNumber,
      emailDisplay: appCredentials.email,
    };
  }, [appCredentials]);

  useEffect(() => {
    loadUserData();
  }, []);

  // Update profile stats when profile data changes
  useEffect(() => {
    if (appCredentials?.hasProfile && !pointsLoading) {
      updateProfileStats();
    }
  }, [appCredentials, pointsLoading, transactions]);

  const loadUserData = useCallback(async () => {
    try {
      setError(null);
      // Still check authentication via User
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        // Profile will be loaded via usePoints hook
      } else {
        setError('No authenticated user found');
      }
    } catch (err: any) {
      console.error('Error loading user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfileStats = useCallback(async () => {
    if (!appCredentials?.hasProfile) return;

    try {
      // Use profile-based credentials for API calls
      const userStats = await pointsService.getUserStats(appCredentials.userId);
      
      const stats: ProfileStats = {
        totalPoints: appCredentials.totalPoints,
        availablePoints: appCredentials.availablePoints,
        redeemedPoints: appCredentials.redeemedPoints,
        memberSince: formatMemberSince(appCredentials.memberSince),
        tier: appCredentials.tier || calculateTier(appCredentials.totalPoints),
        transactionCount: userStats.totalTransactions,
        cashValue: pointsService.calculateCashValue(appCredentials.availablePoints),
      };
      
      setProfileStats(stats);
      
      // Get recent transactions using user_id (for database queries)
      const recentTxns = await pointsService.getTransactionHistory(appCredentials.userId, 5);
      setRecentTransactions(recentTxns);
      
    } catch (err: any) {
      console.error('Error updating profile stats:', err);
      // Set fallback stats using profile data
      setProfileStats({
        totalPoints: appCredentials.totalPoints,
        availablePoints: appCredentials.availablePoints,
        redeemedPoints: appCredentials.redeemedPoints,
        memberSince: formatMemberSince(appCredentials.memberSince),
        tier: appCredentials.tier || calculateTier(appCredentials.totalPoints),
        transactionCount: 0,
        cashValue: pointsService.calculateCashValue(appCredentials.availablePoints),
      });
    }
  }, [appCredentials]);

  // Function to update profile-based credentials
  const updateAppCredentials = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      if (!appCredentials?.userId) throw new Error('No authenticated user');
      
      // Update the user profile (primary credential source)
      const updatedProfile = await authService.updateUserProfile(appCredentials.userId, updates);
      
      // Refresh points data to get updated profile
      await refreshPoints();
      
      return updatedProfile;
    } catch (error) {
      console.error('Failed to update app credentials:', error);
      throw error;
    }
  }, [appCredentials?.userId, refreshPoints]);

  // Function to get credentials for API calls
  const getAPICredentials = useCallback(() => {
    if (!appCredentials) return null;
    
    return {
      // For database operations, use user_id
      user_id: appCredentials.userId,
      // For profile operations, use profile id
      profile_id: appCredentials.id,
      // For display and business logic, use profile data
      full_name: appCredentials.fullName,
      email: appCredentials.email,
      phone_number: appCredentials.phoneNumber,
      member_number: appCredentials.memberNumber,
      // Include points for calculations
      available_points: appCredentials.availablePoints,
      total_points: appCredentials.totalPoints,
    };
  }, [appCredentials]);

  const formatMemberSince = (dateString?: string): string => {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + 
                      (now.getMonth() - date.getMonth());
    
    if (monthsDiff < 1) return 'This month';
    if (monthsDiff === 1) return '1 month ago';
    if (monthsDiff < 12) return `${monthsDiff} months ago`;
    
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const calculateTier = (points: number): string => {
    if (points >= 50000) return 'Platinum';
    if (points >= 20000) return 'Gold';
    if (points >= 5000) return 'Silver';
    return 'Bronze';
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'Platinum': return '#e5e7eb';
      case 'Gold': return '#da9310ff';
      case 'Silver': return '#9ca3af';
      default: return '#cd7f32'; // Bronze
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadUserData(),
      refreshPoints()
    ]);
    setRefreshing(false);
  }, [loadUserData, refreshPoints]);

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Sign Out',
      `Sign out ${displayValues.displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setLoading(true);
              const result = await authService.signOut();
              if (result.error) {
                Alert.alert('Error', result.error);
              } else {
                console.log('Successfully signed out');
                // Reset local state
                setUser(null);
                setProfileStats(null);
                setRecentTransactions([]);
                // Call the parent logout function to navigate back to login
                onLogout();
              }
            } catch (err: any) {
              Alert.alert('Error', 'Failed to sign out');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  }, [displayValues.displayName, onLogout]);

  const handleTransactionHistory = useCallback(() => {
    const credentials = getAPICredentials();
    if (credentials) {
      // Navigate with profile-based credentials
      Alert.alert(
        'Transaction History', 
        `Navigate for: ${credentials.full_name}\nUser ID: ${credentials.user_id}`
      );
    }
  }, [getAPICredentials]);

  const handleAccountSettings = useCallback(() => {
    const credentials = getAPICredentials();
    if (credentials) {
      // Navigate with profile-based credentials
      Alert.alert(
        'Account Settings', 
        `Edit profile: ${credentials.full_name}\nEmail: ${credentials.email}\nPhone: ${credentials.phone_number || 'Not set'}`
      );
    }
  }, [getAPICredentials]);

  const handleRewardsAndBenefits = useCallback(() => {
    if (appCredentials) {
      Alert.alert(
        'Rewards & Benefits', 
        `${appCredentials.tier} Member\nAvailable Points: ${appCredentials.availablePoints}`
      );
    }
  }, [appCredentials]);

  const handleHelpAndSupport = useCallback(() => {
    Alert.alert('Help & Support', 'Navigate to help and support screen');
  }, []);

  const handlePrivacyPolicy = useCallback(() => {
    Alert.alert('Privacy Policy', 'Open privacy policy document');
  }, []);

  const handleTermsOfService = useCallback(() => {
    Alert.alert('Terms of Service', 'Open terms of service document');
  }, []);

  const menuItems: MenuItem[] = useMemo(() => [
    {
      id: '1',
      title: 'Account Settings',
      icon: '⚙️',
      action: handleAccountSettings,
      showChevron: true,
    },
    {
      id: '2',
      title: 'Transaction History',
      icon: '📊',
      action: handleTransactionHistory,
      showChevron: true,
    },
    {
      id: '3',
      title: 'Rewards & Benefits',
      icon: '🏆',
      action: handleRewardsAndBenefits,
      showChevron: true,
    },
    {
      id: '4',
      title: 'Help & Support',
      icon: '❓',
      action: handleHelpAndSupport,
      showChevron: true,
    },
    {
      id: '5',
      title: 'Privacy Policy',
      icon: '🔒',
      action: handlePrivacyPolicy,
      showChevron: true,
    },
    {
      id: '6',
      title: 'Terms of Service',
      icon: '📋',
      action: handleTermsOfService,
      showChevron: true,
    },
    {
      id: '7',
      title: 'Sign Out',
      icon: '🚪',
      action: handleSignOut,
      showChevron: false,
    },
  ], [handleAccountSettings, handleTransactionHistory, handleRewardsAndBenefits, 
      handleHelpAndSupport, handlePrivacyPolicy, handleTermsOfService, handleSignOut]);

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem,
        item.id === menuItems[menuItems.length - 1].id && styles.lastMenuItem
      ]}
      onPress={item.action}
      activeOpacity={0.7}
      disabled={loading}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuIcon}>{item.icon}</Text>
        <Text style={[
          styles.menuTitle,
          item.id === '7' && styles.signOutText
        ]}>
          {item.title}
        </Text>
      </View>
      {item.showChevron && (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading profile...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton} 
        onPress={loadUserData}
        activeOpacity={0.7}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Show loading while checking auth or loading profile
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        {renderLoadingState()}
      </View>
    );
  }

  // Show error if no authenticated user
  if (error && !user && !pointsLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        {renderErrorState()}
      </View>
    );
  }

  // Show loading if we have user but profile is still loading
  if (user && pointsLoading && !appCredentials?.hasProfile) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        {renderLoadingState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Profile Header - Using profile-based credentials */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {displayValues.avatarInitials}
            </Text>
          </View>
          <Text style={styles.userName}>
            {displayValues.displayName}
          </Text>
          <Text style={styles.userId}>
            Account No: {displayValues.displayId}
          </Text>
          {displayValues.phoneDisplay && (
            <Text style={styles.userPhone}>{displayValues.phoneDisplay}</Text>
          )}
          {displayValues.emailDisplay && (
            <Text style={styles.userEmail}>{displayValues.emailDisplay}</Text>
          )}
          {appCredentials && (
            <View style={[styles.tierBadge, { backgroundColor: getTierColor(appCredentials.tier) }]}>
              <Text style={styles.tierText}>{appCredentials.tier} Member</Text>
            </View>
          )}
        </View>
      

        {/* Stats Section - Using profile-based data */}
        {appCredentials?.hasProfile && (
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {pointsService.formatPoints(appCredentials.totalPoints)}
              </Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {pointsService.formatPoints(appCredentials.availablePoints)}
              </Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {profileStats?.transactionCount.toLocaleString() || '0'}
              </Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
          </View>
        )}

        {/* Additional Stats Row */}
        {appCredentials?.hasProfile && profileStats && (
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {pointsService.formatPoints(appCredentials.redeemedPoints)}
              </Text>
              <Text style={styles.statLabel}>Redeemed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{profileStats.memberSince}</Text>
              <Text style={styles.statLabel}>Member Since</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {pointsService.formatCashValue(appCredentials.availablePoints)}
              </Text>
              <Text style={styles.statLabel}>Cash Value</Text>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Recent Transactions Preview */}
        {recentTransactions.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.transactionList}>
              {recentTransactions.slice(0, 3).map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionType}>
                      {transaction.type === 'earned' ? '+ ' : '- '}
                      {pointsService.formatPoints(transaction.amount)} pts
                    </Text>
                    <Text style={styles.transactionDesc} numberOfLines={1}>
                      {transaction.description}
                    </Text>
                  </View>
                  <Text style={styles.transactionDate}>
                    {pointsService.formatDate(transaction.created_at).split(',')[0]}
                  </Text>
                </View>
              ))}
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={handleTransactionHistory}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All Transactions ›</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>App Version 1.0.0</Text>
          {appCredentials && (
            <>
              <Text style={styles.userIdText}>
                Profile ID: {appCredentials.id.slice(0, 8)}...
              </Text>
              <Text style={styles.userIdText}>
                Auth ID: {appCredentials.userId.slice(0, 8)}...
              </Text>
            </>
          )}
          {/* Debug info - remove in production */}
          {__DEV__ && appCredentials && (
            <Text style={styles.debugText}>
              Auth: {appCredentials.isAuthenticated ? 'Yes' : 'No'} | 
              Profile: {appCredentials.hasProfile ? 'Yes' : 'No'} |
              Complete: {appCredentials.profileComplete ? 'Yes' : 'No'}
            </Text>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

// Styles remain the same as in your original file
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '500',
  },
  profileHeader: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userId: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  userPhone: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  tierBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
  },
  tierText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  completeButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  statsSection: {
    backgroundColor: COLORS.surface,
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: COLORS.surface,
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
    width: 24,
    textAlign: 'center',
  },
  menuTitle: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  signOutText: {
    color: COLORS.danger,
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  versionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  userIdText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  recentSection: {
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.lg,
  },
  transactionList: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transactionLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  transactionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  viewAllButton: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  debugText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
});

export default ProfileScreen;