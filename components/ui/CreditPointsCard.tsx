import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/styles.constants';
import { CreditPoints } from '../../types/homepage.types';
import { pointsService } from '../../services/points.service';

interface CreditPointsCardProps {
  creditPoints: CreditPoints;
  isLoading?: boolean;
}

const CreditPointsCard: React.FC<CreditPointsCardProps> = ({
  creditPoints,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingText} />
          <View style={styles.loadingPoints} />
          <View style={styles.loadingSubText} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Points</Text>
      <Text style={styles.mainPoints}>
        {pointsService.formatPoints(creditPoints.availablePoints)}
      </Text>
      <Text style={styles.subtitle}>pts</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {pointsService.formatPoints(creditPoints.totalPoints)}
          </Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {pointsService.formatPoints(creditPoints.redeemedPoints)}
          </Text>
          <Text style={styles.statLabel}>Redeemed</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.redeemButton}>
        <Text style={styles.redeemButtonText}>Redeem Points</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  title: {
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
  subtitle: {
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
});

export default CreditPointsCard;