import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const bounce = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.7)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(titleScale, { toValue: 1, useNativeDriver: true, speed: 6, bounciness: 14 }).start();
    Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -14, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 600, easing: Easing.bounce, useNativeDriver: true })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(float1, { toValue: 0, duration: 2200, useNativeDriver: true })
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float2, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(float2, { toValue: 0, duration: 2600, useNativeDriver: true })
      ])
    ).start();

    Animated.timing(loadingProgress, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => {
        setCurrentScreen('onboarding');
      }, 300);
    });

    const interval = setInterval(() => {
      setGreetingIndex(prev => (prev + 1) % greetings.length);
    }, 900);

    return () => clearInterval(interval);
  }, []);

  const progressWidth = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  const float1Y = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const float2Y = float2.interpolate({ inputRange: [0, 1], outputRange: [0, 16] });

  return (
    <LinearGradient
      colors={[colors.monteDark, colors.montePrimary, colors.solPrimary]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.container}
    >
      <Animated.Text style={[styles.floatingEmoji, { top: 90, left: 24, transform: [{ translateY: float1Y }] }]}>
        🌿
      </Animated.Text>
      <Animated.Text style={[styles.floatingEmoji, { top: 140, right: 28, transform: [{ translateY: float2Y }] }]}>
        ☀️
      </Animated.Text>
      <Animated.Text style={[styles.floatingEmoji, { bottom: 160, left: 36, transform: [{ translateY: float2Y }] }]}>
        🦊
      </Animated.Text>
      <Animated.Text style={[styles.floatingEmoji, { bottom: 200, right: 40, transform: [{ translateY: float1Y }] }]}>
        ✨
      </Animated.Text>

      <View style={styles.headerBadge}>
        <Text style={styles.headerTag}>ORIENTE BOLIVIANO • GRAN CHACO</Text>
      </View>

      <View style={styles.mascotArea}>
        <Animated.View style={{ transform: [{ translateY: bounce }] }}>
          <MascotAguara
            size={180}
            mood="happy"
            speechText={greetings[greetingIndex].text}
          />
        </Animated.View>
        <Text style={styles.meaningText}>{greetings[greetingIndex].meaning}</Text>
      </View>

      <Animated.View style={[styles.brandingArea, { opacity: titleOpacity, transform: [{ scale: titleScale }] }]}>
        <Text style={styles.appTitle}>GuaraniApp</Text>
        <Text style={styles.appSubtitle}>
          Aprende Guaraní Oriental: Ava, Izoceño y Simba
        </Text>
      </Animated.View>

      <View style={styles.loaderContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View style={{ width: progressWidth }}>
            <LinearGradient
              colors={[colors.solGold, colors.terracotaPrimary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressBarFill}
            />
          </Animated.View>
        </View>
        <Text style={styles.loadingStatus}>Preparando el sendero chaqueño...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 28,
    opacity: 0.85,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  headerTag: {
    color: '#FFFFFF',
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
    fontWeight: '700',
    color: '#FFFFFF',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  brandingArea: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#FFF8F0',
    fontWeight: '700',
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
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 14,
    borderRadius: 8,
  },
  loadingStatus: {
    marginTop: 10,
    fontSize: 12,
    color: '#FFF8F0',
    fontWeight: '700',
  },
});