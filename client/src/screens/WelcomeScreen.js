import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import MascotAguara from '../components/MascotAguara';
import PressableScale from '../components/PressableScale';

export default function WelcomeScreen() {
  const { user, setCurrentScreen, logout } = useApp();

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true
      })
    ]).start();

    // 🎯 Redirigir al mapa después de 2.5 segundos
    const timer = setTimeout(() => {
      setCurrentScreen('main');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const username = user?.username || 'Explorador';

  const handleContinue = () => {
    setCurrentScreen('main');
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <MascotAguara
          size={150}
          speechText={`¡Bienvenido de vuelta, ${username}!`}
        />

        <Text style={styles.title}>
          ¡Hola, {username}!
        </Text>

        <Text style={styles.subtitle}>
          Tu viaje en guaraní continúa…
        </Text>

        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>

        <Text style={styles.hint}>
          Entrando a tu aventura…
        </Text>

        {/* Botón Continuar */}
        <PressableScale
          style={styles.continueButton}
          onPress={handleContinue}
          pulse
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </PressableScale>

        {/* Botón Cerrar Sesión */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.errorRed} />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sandBackground,
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    width: '100%'
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 24,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center'
  },
  loadingDots: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 10
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.montePrimary,
    opacity: 0.4
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.7 },
  dot3: { opacity: 1 },
  hint: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 16,
    letterSpacing: 0.5
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.montePrimary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 18,
    marginTop: 32,
    gap: 8,
    borderBottomWidth: 4,
    borderBottomColor: colors.monteDark,
    shadowColor: colors.monteDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    minWidth: 200
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 6,
  },
  logoutButtonText: {
    color: colors.errorRed,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  }
});