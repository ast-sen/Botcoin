import { Platform } from 'react-native';

export const COLORS = {
  primary: '#3498db',
  secondary: '#2c3e50',
  success: '#27ae60',
  danger: '#e74c3c',
  warning: '#f39c12',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  border: '#e1e8ed',
  placeholder: '#999999',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const FONTS = {
  regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
  bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  mono: Platform.OS === 'ios' ? 'Courier' : 'monospace',
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
};
