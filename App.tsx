import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';

// Import the bottom navigation components
import HomeScreen from './screens/HomeScreen'; // Use your existing HomeScreen
import RedeemPointsScreen from './screens/RedeemPointsScreen'; 
import ProfileScreen from './screens/ProfileScreen';
import BottomTabBar from './components/navigation/BottomTabBar';
import { COLORS } from './constants/styles.constants';

type Screen = 'login' | 'signup' | 'home';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('home');

  // When login succeeds, store user & go to home
  const handleLoginSuccess = (userData: any) => {
    console.log('Login successful:', userData);
    setUser(userData);
    setCurrentScreen('home');
    console.log('Current Screen: ', currentScreen);
  };

  // When signup succeeds, store user & go to home
  const handleSignupSuccess = (userData: any) => {
    console.log('Signup successful:', userData);
    setUser(userData);
    setCurrentScreen('home');
    console.log('Current Screen: ', currentScreen);
  };

  const handleNavigateToRegister = () => {
    setCurrentScreen('signup');
  };

  const handleNavigateToLogin = () => {
    setCurrentScreen('login');
  };

  const handleForgotPassword = () => {
    console.log('Navigate to forgot password');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
    setActiveTab('home'); // Reset to home tab when logging out
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  // Navigation function to switch to redeem tab
  const handleNavigateToRedeem = () => {
    setActiveTab('redeem');
  };

  // Render the active tab screen
   const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen 
          user={user} 
          onRefresh={handleRefresh} 
          onNavigateToRedeem={handleNavigateToRedeem}
        />;
      case 'redeem':
        return <RedeemPointsScreen />;
      case 'profile':
        return <ProfileScreen onLogout={handleLogout} />;
      default:
        return <HomeScreen 
          user={user} 
          onRefresh={handleRefresh} 
          onNavigateToRedeem={handleNavigateToRedeem}
        />;
    }
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'login' && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={handleNavigateToRegister}
          onForgotPassword={handleForgotPassword}
        />
      )}

      {currentScreen === 'signup' && (
        <SignupScreen
          onSignupSuccess={handleSignupSuccess}
          onNavigateToLogin={handleNavigateToLogin}
        />
      )}

      {currentScreen === 'home' && (
        <View style={styles.homeContainer}>
          <View style={styles.screenContainer}>
            {renderActiveScreen()}
          </View>
          <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  homeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContainer: {
    flex: 1,
  },
});