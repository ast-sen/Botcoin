import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/styles.constants';
import { pointsService } from '../services/points.service';
import { authService } from '../services/auth.service';
import { User } from '../types/auth.types';
import { UserProfile } from '../types/database.types';

const RedeemPointsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    accountId: '',
    name: '',
    gcashNumber: '',
    pointsToRedeem: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        await loadUserPoints(user.id);
      } else {
        Alert.alert('Authentication Required', 'Please log in to redeem points');
        // You might want to navigate to login screen here
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      Alert.alert('Error', 'Failed to load user information');
    }
  };

  const loadUserPoints = async (userId?: string) => {
    try {
      setIsLoading(true);
      
      let userIdToUse = userId;
      if (!userIdToUse) {
        const user = await authService.getCurrentUser();
        if (!user) {
          Alert.alert('Authentication Required', 'Please log in to view your points');
          return;
        }
        userIdToUse = user.id;
      }

      const profile = await pointsService.getUserPoints(userIdToUse);
      if (profile) {
        setAvailablePoints(profile.available_points || 0);
        setUserProfile(profile);
      } else {
        Alert.alert('Error', 'Failed to load your points balance');
      }
    } catch (error) {
      console.error('Error loading user points:', error);
      Alert.alert('Error', 'Failed to load your points balance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateCashAmount = (points: number): number => {
    // Assuming 1000 points = 10 PHP (you can adjust this rate)
    return (points / 1000) * 10;
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      Alert.alert('Authentication Required', 'Please log in to redeem points');
      return;
    }

    // Validation
    if (!formData.accountId.trim()) {
      Alert.alert('Error', 'Please enter your Account ID');
      return;
    }
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!formData.gcashNumber.trim()) {
      Alert.alert('Error', 'Please enter your GCash number');
      return;
    }
    if (!formData.pointsToRedeem.trim()) {
      Alert.alert('Error', 'Please enter points to redeem');
      return;
    }

    const pointsValue = parseInt(formData.pointsToRedeem);
    if (isNaN(pointsValue) || pointsValue <= 0) {
      Alert.alert('Error', 'Please enter a valid number of points');
      return;
    }

    // Check minimum redemption requirement
    if (pointsValue < 1000) {
      Alert.alert('Error', 'Minimum redemption is 1,000 points');
      return;
    }

    if (pointsValue > availablePoints) {
      Alert.alert('Insufficient Points', `You only have ${availablePoints.toLocaleString()} points available`);
      return;
    }

    // GCash number validation (Philippine mobile format)
    const gcashRegex = /^(09|\+639)\d{9}$/;
    if (!gcashRegex.test(formData.gcashNumber)) {
      Alert.alert('Error', 'Please enter a valid GCash number (e.g., 09123456789)');
      return;
    }

    const cashAmount = calculateCashAmount(pointsValue);

    // Confirmation alert
    Alert.alert(
      'Confirm Redemption',
      `Redeem ${pointsValue.toLocaleString()} points for ₱${cashAmount.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            setIsSubmitting(true);

            try {
              const result = await pointsService.submitRedemption(
                currentUser.id,
                formData.accountId,
                formData.name,
                formData.gcashNumber,
                pointsValue
              );

              if (result.success) {
                // Update local available points immediately
                setAvailablePoints(prev => prev - pointsValue);
                
                Alert.alert(
                  'Redemption Successful!',
                  `${pointsValue.toLocaleString()} points (₱${cashAmount.toFixed(2)}) will be processed and sent to your GCash account within 1-3 business days.`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Clear form after successful submission
                        setFormData({
                          accountId: '',
                          name: '',
                          gcashNumber: '',
                          pointsToRedeem: '',
                        });
                        // Optionally reload points to ensure sync
                        loadUserPoints(currentUser.id);
                      }
                    }
                  ]
                );
              } else {
                Alert.alert('Redemption Failed', result.error || 'An error occurred while processing your redemption');
              }
            } catch (error) {
              console.error('Error submitting redemption:', error);
              Alert.alert('Error', 'Failed to process redemption. Please try again.');
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your points...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Redeem Points</Text>
        <View style={styles.availablePointsContainer}>
          <Text style={styles.availablePointsLabel}>Available:</Text>
          <Text style={styles.availablePoints}>{availablePoints.toLocaleString()} pts</Text>
        </View>
      </View>

      {/* Redemption Form */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Redeem Points to GCash</Text>
          <Text style={styles.formSubtitle}>
            Convert your points to cash and receive it directly in your GCash account
          </Text>

          {/* Account ID Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Account ID</Text>
            <TextInput
              style={styles.textInput}
              value={formData.accountId}
              onChangeText={(value) => handleInputChange('accountId', value)}
              placeholder="Enter your account ID"
              placeholderTextColor={COLORS.textSecondary}
              editable={!isSubmitting}
            />
          </View>

          {/* Name Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.textSecondary}
              editable={!isSubmitting}
            />
          </View>

          {/* GCash Number Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>GCash Number</Text>
            <TextInput
              style={styles.textInput}
              value={formData.gcashNumber}
              onChangeText={(value) => handleInputChange('gcashNumber', value)}
              placeholder="09123456789"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="phone-pad"
              maxLength={11}
              editable={!isSubmitting}
            />
          </View>

          {/* Points to Redeem Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Points to Redeem</Text>
            <TextInput
              style={styles.textInput}
              value={formData.pointsToRedeem}
              onChangeText={(value) => handleInputChange('pointsToRedeem', value)}
              placeholder="Enter points amount (min: 1,000)"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
              editable={!isSubmitting}
            />
            {formData.pointsToRedeem && !isNaN(parseInt(formData.pointsToRedeem)) && (
              <Text style={styles.conversionText}>
                = ₱{(parseInt(formData.pointsToRedeem) / 100).toFixed(2)} PHP
              </Text>
            )}
          </View>

          {/* Conversion Rate Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 Conversion Rate</Text>
            <Text style={styles.infoText}>100 points = ₱1.00 PHP</Text>
            <Text style={styles.infoText}>Minimum redemption: 1,000 points</Text>
            <Text style={styles.infoText}>Processing time: 1-3 business days</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isSubmitting || availablePoints === 0) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || availablePoints === 0}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Processing...' : 
               availablePoints === 0 ? 'No Points Available' : 'Redeem Points'}
            </Text>
          </TouchableOpacity>

          {/* Refresh Points Button */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => currentUser ? loadUserPoints(currentUser.id) : initializeUser()}
            disabled={isSubmitting}
          >
            <Text style={styles.refreshButtonText}>🔄 Refresh Balance</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  availablePointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availablePointsLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  availablePoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: SPACING.lg,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  formSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    minHeight: 48,
  },
  conversionText: {
    fontSize: 14,
    color: COLORS.success,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  refreshButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default RedeemPointsPage;