import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/styles.constants';

interface CheckboxProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  error?: string;
}

// Changed to default export to match import in SignupScreen
const Checkbox: React.FC<CheckboxProps> = ({
  label,
  value,
  onValueChange,
  error,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => onValueChange(!value)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, value && styles.checkboxChecked]}>
          {value && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 4,
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: SPACING.xs,
    marginLeft: 28, // Align with label text
  },
});

export default Checkbox;