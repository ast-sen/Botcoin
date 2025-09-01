import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

// Types
import { LoginProps } from '../types/auth.types';

// Hooks
import { useLoginForm } from '../hooks/UseLoginForm';

// Services
import { authService as AuthService } from '../services/auth.service';

// Components
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { SocialButton } from '../components/ui/SocialButton';

// Constants
import { COLORS, SPACING, RADIUS } from '../constants/styles.constants';

export const LoginScreen: React.FC<LoginProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onForgotPassword,
}) => {
  const {
    form,
    errors,
    isLoading,
    setIsLoading,
    updateField,
    validateForm,
    resetForm,
  } = useLoginForm();

  const [showPassword, setShowPassword] = useState(false);

const handleLogin = async () => {
  if (!validateForm()) return;

  setIsLoading(true);
  try {
    const authResponse = await AuthService.signIn(form);
    
    if (authResponse.error) {
      Alert.alert('Error', authResponse.error);
      return;
    }
    
    if (authResponse.user) {
      // Just use the user object directly from AuthService - it's already perfect!
      console.log('Login successful:', authResponse.user);
      Alert.alert('Success', 'Login successful!');
      onLoginSuccess?.(authResponse.user);
    }
    
    resetForm();
  } catch (error) {
    Alert.alert(
      'Error',
      error instanceof Error ? error.message : 'Login failed'
    );
  } finally {
    setIsLoading(false);
  }
};

  const handleSocialLogin = async (provider: string) => {
    try {
      // For now, just show info about social login implementation
      Alert.alert('Info', `${provider} login will be implemented soon`);
      
      // When you implement social login, you might do something like:
      // const authResponse = await AuthService.signInWithProvider(provider.toLowerCase());
      // Handle the response similar to handleLogin above
    } catch (error) {
      Alert.alert('Error', `${provider} login failed`);
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      Alert.alert('Info', 'Password reset will be implemented');
    }
  };

const handleRegister = () => {
  console.log('Signup button pressed');
  if (onNavigateToRegister) {
    console.log('Navigating to signup screen');
    onNavigateToRegister();
  } else {
    Alert.alert('Info', 'Registration will be implemented');
  }
};

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={form.email}
              onChangeText={(value) => updateField('email', value)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={form.password}
              onChangeText={(value) => updateField('password', value)}
              error={errors.password}
              isPassword
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialContainer}>
              <SocialButton
                provider="google"
                onPress={() => handleSocialLogin('Google')}
              />
              <SocialButton
                provider="facebook"
                onPress={() => handleSocialLogin('Facebook')}
              />
              <SocialButton
                provider="apple"
                onPress={() => handleSocialLogin('Apple')}
              />
            </View>
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Constants.statusBarHeight,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  socialContainer: {
    gap: SPACING.sm,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  registerText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  registerLink: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;