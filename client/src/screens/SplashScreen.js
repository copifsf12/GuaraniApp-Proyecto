import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import MascotAguara from '../components/MascotAguara';

export default function SplashScreen() {
  const { setCurrentScreen } = useApp();
  const [greetingIndex, setGreetingIndex] = useState(0);
  const greetings = [
    { text: '¡Puama!', meaning: 'Buenos días (Chaco boliviano)' },
    { text: '¡Kaaruma!', meaning: 'Buenas tardes' },
    { text: '¡Maitei!', meaning: 'Saludo cordial de paz' }
  ];

  const [loadingProgress] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate the loading bar
    Animated.timing(loadingProgress, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start(() => {
      // Transition to onboarding or main
      setTimeout(() => {
        setCurrentScreen('onboarding');
      }, 300);
    });

    // Rotate greeting text
    const interval = setInterval(() => {
      setGreetingIndex(prev => (prev + 1) % greetings.length);
    }, 900);

    return () => clearInterval(interval);
  }, []);

  const progressWidth = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      {/* Decorative top pattern badge */}
      <View style={styles.headerBadge}>
        <Text style={styles.headerTag}>ORIENTE BOLIVIANO • GRAN CHACO</Text>
      </View>

      {/* Main Mascot Visual */}
      <View style={styles.mascotArea}>
        <MascotAguara
          size={180}
          mood="happy"
          speechText={greetings[greetingIndex].text}
        />
        <Text style={styles.meaningText}>{greetings[greetingIndex].meaning}</Text>
      </View>

      {/* App Branding */}
      <View style={styles.brandingArea}>
        <Text style={styles.appTitle}>GuaraniApp</Text>
        <Text style={styles.appSubtitle}>
          Aprende Guaraní Oriental: Ava, Izoceño y Simba
        </Text>
      </View>

      {/* Loading Bar with Warm Terracotta Palette */}
      <View style={styles.loaderContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.loadingStatus}>Preparando el sendero chaqueño...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sandBackground,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  headerBadge: {
    backgroundColor: colors.montePastel,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.monteMedium,
  },
  headerTag: {
    color: colors.monteDark,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  mascotArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  meaningText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  brandingArea: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.terracotaDark,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
  },
  loaderContainer: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#EADBC8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.terracotaPrimary,
    borderRadius: 8,
  },
  loadingStatus: {
    marginTop: 10,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
