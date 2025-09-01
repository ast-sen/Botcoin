import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/styles.constants';
import { Transaction } from '../../types/homepage.types';
import { pointsService } from '../../services/points.service';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isEarned = transaction.type === 'earned';
  const points = isEarned ? transaction.pointsEarned : transaction.pointsRedeemed;
  
  // Format date from ISO string
  const formatDate = (dateString: string): string => {
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
      return dateString;
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={[styles.typeIndicator, { 
        backgroundColor: isEarned ? COLORS.success : COLORS.danger 
      }]}>
        <Text style={styles.typeIcon}>
          {isEarned ? '↑' : '↓'}
        </Text>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.typeText}>
          {isEarned ? 'Credits Earned' : 'Credits Redeemed'}
        </Text>
        <Text style={styles.description}>
          {transaction.description}
        </Text>
        <Text style={styles.date}>
          {formatDate(transaction.createdAt)}
        </Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[
          styles.amount, 
          { color: isEarned ? COLORS.success : COLORS.danger }
        ]}>
          {isEarned ? '+' : '-'}{pointsService.formatPoints(points)}
        </Text>
        <Text style={styles.pointsLabel}>pts</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  contentContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  pointsLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default TransactionItem;