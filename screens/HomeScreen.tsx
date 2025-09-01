import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Platform,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { usePoints } from '../hooks/UsePoints';
import { 
  COLORS,
  SPACING,
  RADIUS  
} from '../constants/styles.constants';
import {
  CreditPoints,
  ComponentTransaction,
  HomeScreenProps
} from '../types/homepage.types';

// Utility Functions
const formatPoints = (points: number): string => {
  return points.toLocaleString();
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

// Credit Points Card Component
interface CreditPointsCardProps {
  creditPoints: CreditPoints;
  isLoading?: boolean;
  onNavigateToRedeem?: () => void;
}

const CreditPointsCard: React.FC<CreditPointsCardProps> = ({
  creditPoints,
  isLoading = false,
  onNavigateToRedeem,
}) => {
  if (isLoading) {
    return (
      <View style={styles.creditCard}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingText} />
          <View style={styles.loadingPoints} />
          <View style={styles.loadingSubText} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.creditCard}>
      <Text style={styles.creditTitle}>Available Points</Text>
      <Text style={styles.mainPoints}>
        {formatPoints(creditPoints.availablePoints)}
      </Text>
      <Text style={styles.pointsSubtitle}>pts</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatPoints(creditPoints.totalPoints)}
          </Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatPoints(creditPoints.redeemedPoints)}
          </Text>
          <Text style={styles.statLabel}>Redeemed</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.redeemButton}
        onPress={onNavigateToRedeem}
      >
        <Text style={styles.redeemButtonText}>Redeem Points</Text>
      </TouchableOpacity>
    </View>
  );
};

// Transaction Item Component
interface TransactionItemProps {
  transaction: ComponentTransaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isAccumulated = transaction.type === 'accumulated';
  
  return (
    <View style={styles.transactionItem}>
      <View style={[styles.typeIndicator, { 
        backgroundColor: isAccumulated ? COLORS.success : COLORS.danger 
      }]}>
        <Text style={styles.typeIcon}>
          {isAccumulated ? '↑' : '↓'}
        </Text>
      </View>
      
      <View style={styles.transactionContent}>
        <Text style={styles.transactionType}>
          {isAccumulated ? 'Credits Accumulated' : 'Credits Redeemed'}
        </Text>
        <Text style={styles.transactionDate}>
          {formatDate(transaction.date)}
        </Text>
      </View>
      
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.amountText, 
          { color: isAccumulated ? COLORS.success : COLORS.danger }
        ]}>
          {isAccumulated ? '+' : '-'}{formatPoints(transaction.amount)}
        </Text>
        <Text style={styles.amountLabel}>pts</Text>
      </View>
    </View>
  );
};

// Empty State Component
const EmptyTransactions: React.FC = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>📊</Text>
    <Text style={styles.emptyTitle}>No Transactions Yet</Text>
    <Text style={styles.emptyMessage}>
      Your credit history will appear here once you start accumulating or redeeming points!
    </Text>
  </View>
);

// Error State Component
interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <View style={styles.container}>
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Main HomeScreen Component
const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  onRefresh,
  onNavigateToRedeem,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use the hook with properly typed returns
  const { transactions, creditPoints, loading, error, refreshData } = usePoints(user?.id || null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      onRefresh?.();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderTransactionItem = ({ item }: { item: ComponentTransaction }) => (
    <TransactionItem transaction={item} />
  );

  // Error handling
  if (error && !loading) {
    return <ErrorState error={error} onRetry={handleRefresh} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Welcome Header */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
          </Text>
          <Text style={styles.welcomeSubtext}>
            Keep earning and redeem amazing rewards
          </Text>
        </View>

        {/* Credit Points Section */}
        <CreditPointsCard 
          creditPoints={creditPoints} 
          isLoading={loading} 
          onNavigateToRedeem={onNavigateToRedeem}
        />

        {/* Transaction History Section */}
        <View style={styles.transactionSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <Text style={styles.sectionSubtitle}>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingTransactions}>
              <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
          ) : transactions.length === 0 ? (
            <EmptyTransactions />
          ) : (
            <FlatList
              data={transactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  welcomeContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  // Credit Card Styles
  creditCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    margin: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  loadingText: {
    height: 16,
    width: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  loadingPoints: {
    height: 48,
    width: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    marginBottom: SPACING.xs,
  },
  loadingSubText: {
    height: 12,
    width: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
  },
  creditTitle: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: SPACING.sm,
    opacity: 0.9,
  },
  mainPoints: {
    color: COLORS.surface,
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 52,
  },
  pointsSubtitle: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: SPACING.lg,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: SPACING.lg,
  },
  statValue: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  statLabel: {
    color: COLORS.surface,
    fontSize: 12,
    opacity: 0.8,
  },
  redeemButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    minWidth: 140,
  },
  redeemButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Transaction Section Styles
  transactionSection: {
    marginTop: SPACING.md,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  typeIcon: {
    color: COLORS.surface,
    fontSize: 20,
    fontWeight: 'bold',
  },
  transactionContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  transactionDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  amountLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  // Empty State Styles
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingTransactions: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
  // Error handling styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;