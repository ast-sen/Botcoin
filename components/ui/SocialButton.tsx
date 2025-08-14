import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/styles.constants';

interface SocialButtonProps {
  provider: 'google' | 'facebook' | 'apple';
  onPress: () => void;
}

const socialConfig = {
  google: {
    icon: '🔍',
    text: 'Continue with Google',
    backgroundColor: COLORS.surface,
    textColor: COLORS.text,
    borderColor: COLORS.border,
  },
  facebook: {
    icon: '📘',
    text: 'Continue with Facebook',
    backgroundColor: '#4267B2',
    textColor: COLORS.surface,
    borderColor: '#4267B2',
  },
  apple: {
    icon: '🍎',
    text: 'Continue with Apple',
    backgroundColor: '#000',
    textColor: COLORS.surface,
    borderColor: '#000',
  },
};

export const SocialButton: React.FC<SocialButtonProps> = ({ provider, onPress }) => {
  const config = socialConfig[provider];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: config.textColor }]}>
        {config.icon} {config.text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});