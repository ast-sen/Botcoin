import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';

type Screen = 'login' | 'signup';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  const handleLoginSuccess = (user: any) => {
    console.log('Login successful:', user);
    // Navigate to main app or dashboard
  };

  const handleSignupSuccess = (user: any) => {
    console.log('Signup successful:', user);
    // Navigate to main app or dashboard
  };

  const handleNavigateToRegister = () => {
    setCurrentScreen('signup');
    console.log('Current screen in App:', currentScreen);

  };

  const handleNavigateToLogin = () => {
    setCurrentScreen('login');
  };

  const handleForgotPassword = () => {
    console.log('Navigate to forgot password');
    // Navigate to forgot password screen
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'login' ? (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={handleNavigateToRegister}
          onForgotPassword={handleForgotPassword}
        />
      ) : (
        <SignupScreen
          onSignupSuccess={handleSignupSuccess}
          onNavigateToLogin={handleNavigateToLogin}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})