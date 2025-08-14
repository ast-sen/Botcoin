import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/styles.constants';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword,
  showPassword,
  onTogglePassword,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isPassword && styles.passwordInput,
            error && styles.inputError,
            style,
          ]}
          placeholderTextColor={COLORS.placeholder}
          {...props}
          secureTextEntry={isPassword && !showPassword}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={onTogglePassword}
          >
            <Text style={styles.eyeText}>
              {showPassword ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  passwordInput: {
    paddingRight: 50,
  },
  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: '#fdf2f2',
  },
  eyeButton: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
    padding: SPACING.xs,
  },
  eyeText: {
    fontSize: 18,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});