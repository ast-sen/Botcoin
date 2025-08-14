import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/styles.constants';

export const DemoCredentials: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demo Credentials:</Text>
      <Text style={styles.text}>Email: demo@example.com</Text>
      <Text style={styles.text}>Password: password</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f8ff',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  text: {
    fontSize: 12,
    color: COLORS.secondary,
    fontFamily: FONTS.mono,
  },
});