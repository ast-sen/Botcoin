import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/styles.constants';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const getStrength = () => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'Weak';
    if (password.length < 10) return 'Medium';
    return 'Strong';
  };

  const strength = getStrength();

  const color =
    strength === 'Weak' ? COLORS.danger :
    strength === 'Medium' ? COLORS.warning :
    COLORS.success;

  return (
    <View style={styles.container}>
      {password.length > 0 && <Text style={[styles.text, { color }]}>{strength}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.sm,
  },
  text: {
    fontWeight: 'bold',
  },
});