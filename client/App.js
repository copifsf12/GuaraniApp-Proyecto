import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { colors } from './src/theme/colors';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import PathScreen from './src/screens/PathScreen';
import LessonScreen from './src/screens/LessonScreen';
import LessonTutorialScreen from './src/screens/LessonTutorialScreen';
import LessonCompleteScreen from './src/screens/LessonCompleteScreen';
import NoHeartsScreen from './src/screens/NoHeartsScreen';
import GameScreen from './src/screens/GameScreen';   // 🆕 NUEVA PANTALLA
import StoriesScreen from './src/screens/StoriesScreen';
import TranslatorScreen from './src/screens/TranslatorScreen';
import LeaguesScreen from './src/screens/LeaguesScreen';
import ShopScreen from './src/screens/ShopScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

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

  // Pantalla de bienvenida
  if (currentScreen === 'welcome') {
    return <WelcomeScreen />;
  }

  // 4. Mini-clase / tutorial antes de la lección
  if (currentScreen === 'lesson_tutorial') {
    return <LessonTutorialScreen />;
  }

  // 5. Lesson Interactive Engine
  if (currentScreen === 'lesson') {
    return <LessonScreen />;
  }

  // 🆕 6. Game Engine (para los juegos entre lecciones)
  if (currentScreen === 'game') {
    return <GameScreen />;
  }

  // 🎯 7. Pantalla "Sin Corazones"
  if (currentScreen === 'no_hearts') {
    return <NoHeartsScreen />;
  }

  // 8. Lesson Victory / Results Screen
  if (currentScreen === 'lesson_complete') {
    return <LessonCompleteScreen />;
  }

  // 9. Main Hub (Tab Bar View)
  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      <View style={styles.tabContent}>
        {activeTab === 'learn' && <PathScreen />}
        {activeTab === 'translator' && <TranslatorScreen />}
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
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" backgroundColor={colors.sandBackground} />
        <MainNavigator />
      </AppProvider>
    </SafeAreaProvider>
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