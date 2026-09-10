import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { colors } from './src/theme/colors';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import PathScreen from './src/screens/PathScreen';
import LessonScreen from './src/screens/LessonScreen';
import LessonCompleteScreen from './src/screens/LessonCompleteScreen';
import StoriesScreen from './src/screens/StoriesScreen';
import LeaguesScreen from './src/screens/LeaguesScreen';
import ShopScreen from './src/screens/ShopScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Components
import BottomNavBar from './src/components/BottomNavBar';

function MainNavigator() {
  const { currentScreen, activeTab } = useApp();

  // 1. Splash Screen
  if (currentScreen === 'splash') {
    return <SplashScreen />;
  }

  // 2. Onboarding Flow
  if (currentScreen === 'onboarding') {
    return <OnboardingScreen />;
  }

  // 3. Auth Flow
  if (currentScreen === 'auth') {
    return <AuthScreen />;
  }

  // 4. Lesson Interactive Engine
  if (currentScreen === 'lesson') {
    return <LessonScreen />;
  }

  // 5. Lesson Victory / Results Screen
  if (currentScreen === 'lesson_complete') {
    return <LessonCompleteScreen />;
  }

  // 6. Main Hub (Tab Bar View)
  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.tabContent}>
        {activeTab === 'learn' && <PathScreen />}
        {activeTab === 'stories' && <StoriesScreen />}
        {activeTab === 'leagues' && <LeaguesScreen />}
        {activeTab === 'shop' && <ShopScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>
      <BottomNavBar />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="dark" backgroundColor={colors.sandBackground} />
      <MainNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.sandBackground,
  },
  tabContent: {
    flex: 1,
  },
});
