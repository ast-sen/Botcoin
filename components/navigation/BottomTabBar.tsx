import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/styles.constants';

interface TabBarItem {
  key: string;
  title: string;
  icon: string;
}

interface BottomTabBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const TAB_ITEMS: TabBarItem[] = [
  { key: 'home', title: 'Home', icon: '🏠' },
  { key: 'redeem', title: 'Redeem', icon: '🎁' },
  { key: 'profile', title: 'Profile', icon: '👤' },
];

const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabPress }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {TAB_ITEMS.map((item) => {
          const isActive = activeTab === item.key;
          
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.tabItem}
              onPress={() => onTabPress(item.key)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                isActive && styles.activeIconContainer
              ]}>
                <Text style={[
                  styles.icon,
                  { opacity: isActive ? 1 : 0.6 }
                ]}>
                  {item.icon}
                </Text>
              </View>
              <Text style={[
                styles.label,
                { color: isActive ? COLORS.tabBarActive : COLORS.tabBarInactive }
              ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.tabBarBackground,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.tabBarBackground,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginBottom: SPACING.xs,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default BottomTabBar;