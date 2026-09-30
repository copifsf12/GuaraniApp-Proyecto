import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import PathScreen from './src/screens/PathScreen';
import LessonScreen from './src/screens/LessonScreen';
import LessonTutorialScreen from './src/screens/LessonTutorialScreen';
import LessonCompleteScreen from './src/screens/LessonCompleteScreen';
import NoHeartsScreen from './src/screens/NoHeartsScreen';
import GameScreen from './src/screens/GameScreen';
import StoriesScreen from './src/screens/StoriesScreen';
import TranslatorScreen from './src/screens/TranslatorScreen';
import LeaguesScreen from './src/screens/LeaguesScreen';
import ShopScreen from './src/screens/ShopScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

// Components
import PremiumBottomNavBar from './src/components/PremiumBottomNavBar';

function MainNavigator() {
  const { currentScreen, activeTab } = useApp();
  const { theme, isDark } = useTheme();

  if (currentScreen === 'splash') return <SplashScreen />;
  if (currentScreen === 'onboarding') return <OnboardingScreen />;
  if (currentScreen === 'auth') return <AuthScreen />;
  if (currentScreen === 'welcome') return <WelcomeScreen />;
  if (currentScreen === 'lesson_tutorial') return <LessonTutorialScreen />;
  if (currentScreen === 'lesson') return <LessonScreen />;
  if (currentScreen === 'game') return <GameScreen />;
  if (currentScreen === 'no_hearts') return <NoHeartsScreen />;
  if (currentScreen === 'lesson_complete') return <LessonCompleteScreen />;

  return (
    <SafeAreaView
      style={[styles.mainContainer, { backgroundColor: theme.sandBackground }]}
      edges={['top']}
    >
      <View style={styles.tabContent}>
        {activeTab === 'learn' && <PathScreen />}
        {activeTab === 'translator' && <TranslatorScreen />}
        {activeTab === 'stories' && <StoriesScreen />}
        {activeTab === 'leagues' && <LeaguesScreen />}
        {activeTab === 'shop' && <ShopScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>
      <PremiumBottomNavBar />
    </SafeAreaView>
  );
}

function AppContent() {
  const { theme, isDark } = useTheme();

  return (
    <>
      <StatusBar
        style={isDark ? 'light' : 'dark'}
        backgroundColor={theme.sandBackground}
      />
      <MainNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
});