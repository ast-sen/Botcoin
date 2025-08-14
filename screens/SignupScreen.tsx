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
  StatusBar,
} from 'react-native';

// Types
import { SignupProps, User } from '../types/auth.types';

// Hooks
import { useSignupForm } from '../hooks/UseSignupForm';

// Services
import { AuthService } from '../services/auth.service';

// Components
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { SocialButton } from '../components/ui/SocialButton';
// Changed to default imports to match the component exports
import Checkbox from '../components/ui/Checkbox';
import { PasswordStrengthIndicator } from '../components/ui/PasswordStrengthIndicator';


// Constants
import { COLORS, SPACING, RADIUS } from '../constants/styles.constants';

export const SignupScreen: React.FC<SignupProps> = ({
  onSignupSuccess,
  onNavigateToLogin,
}) => {
  const {
    form,
    errors,
    isLoading,
    setIsLoading,
    updateField,
    validateForm,
    resetForm,
  } = useSignupForm();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const user = await AuthService.signup(form);
      Alert.alert('Success', 'Account created successfully!');
      onSignupSuccess?.(user);
      resetForm();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Signup failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: string) => {
    try {
      await AuthService.socialLogin(provider);
    } catch (error) {
      Alert.alert('Info', `${provider} signup will be implemented`);
    }
  };

  const handleLogin = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      Alert.alert('Info', 'Login navigation will be implemented');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and start your journey</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={form.name}
              onChangeText={(value: string) => updateField('name', value)}
              error={errors.name}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={form.email}
              onChangeText={(value: string) => updateField('email', value)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View>
              <Input
                label="Password"
                placeholder="Create a password"
                value={form.password}
                onChangeText={(value: string) => updateField('password', value)}
                error={errors.password}
                isPassword
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <PasswordStrengthIndicator password={form.password} />
            </View>

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChangeText={(value: string) => updateField('confirmPassword', value)}
              error={errors.confirmPassword}
              isPassword
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Checkbox
              label="I agree to the Terms of Service and Privacy Policy"
              value={form.agreeToTerms}
              onValueChange={(value: boolean) => updateField('agreeToTerms', value)}
              error={errors.agreeToTerms}
            />

            <Button
              title="Create Account"
              onPress={handleSignup}
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
                onPress={() => handleSocialSignup('Google')}
              />
              <SocialButton
                provider="facebook"
                onPress={() => handleSocialSignup('Facebook')}
              />
              <SocialButton
                provider="apple"
                onPress={() => handleSocialSignup('Apple')}
              />
            </View>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SignupScreen;