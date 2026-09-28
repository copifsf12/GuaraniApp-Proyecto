import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import MascotAguara from '../components/MascotAguara';
import PressableScale from '../components/PressableScale';

const HEART_REGEN_MINUTES = 5;

export default function NoHeartsScreen() {
  const { user, setCurrentScreen, loadUnits, token } = useApp();
  const [timeLeft, setTimeLeft] = useState('');

  const maxHearts = user?.maxHearts ?? 5;

  // 🎯 Calcular tiempo restante para el próximo corazón
  useEffect(() => {
    if (!user?.heartRegenAt) {
      setTimeLeft(`${HEART_REGEN_MINUTES}:00`);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const regenAt = new Date(user.heartRegenAt).getTime();
      const diff = Math.max(0, regenAt - now);

      if (diff <= 0) {
        setTimeLeft('¡Ya casi!');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user?.heartRegenAt]);

  // 🎯 Ver el resumen de la lección
  const handleSeeSummary = () => {
    setCurrentScreen('lesson_complete');
  };

  // 🎯 Volver al mapa
  const handleBackToMap = async () => {
    try {
      if (token && loadUnits) {
        await loadUnits(token);
      }
    } catch (e) {
      // silencioso
    }
    setCurrentScreen('main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ícono grande de corazón roto */}
        <View style={styles.brokenHeartCircle}>
          <Ionicons name="heart-dislike" size={64} color="#FFFFFF" />
        </View>

        {/* Mascota */}
        <MascotAguara
          size={120}
          mood="happy"
          speechText="¡Ani ñembyasy! Los corazones vuelven pronto."
        />

        {/* Título */}
        <Text style={styles.title}>¡Se te acabaron los corazones!</Text>

        {/* Descripción */}
        <Text style={styles.subtitle}>
          Los corazones se regeneran. ¡Ani ñembyasy!
        </Text>

        {/* Temporizador */}
        <View style={styles.timerBox}>
          <View style={styles.timerIconCircle}>
            <Ionicons name="time-outline" size={26} color={colors.terracotaDark} />
          </View>
          <View style={styles.timerTextBlock}>
            <Text style={styles.timerLabel}>Próximo corazón en:</Text>
            <Text style={styles.timerValue}>{timeLeft}</Text>
          </View>
        </View>

        {/* Botón: Ver mi resumen */}
        <PressableScale
          style={styles.summaryButton}
          onPress={handleSeeSummary}
          pulse
        >
          <Ionicons name="stats-chart" size={20} color="#FFFFFF" />
          <Text style={styles.summaryButtonText}>VER MI RESUMEN</Text>
        </PressableScale>

        {/* Botón: Volver al sendero */}
        <PressableScale
          style={styles.backButton}
          onPress={handleBackToMap}
        >
          <Ionicons name="home-outline" size={20} color={colors.monteDark} />
          <Text style={styles.backButtonText}>Volver al sendero</Text>
        </PressableScale>

        {/* Info extra */}
        <View style={styles.tipBox}>
          <Ionicons name="bulb-outline" size={20} color={colors.solPrimary} />
          <Text style={styles.tipText}>
            💡 Puedes comprar corazones en la Tienda con Mbae (monedas).
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sandBackground,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 60,
    alignItems: 'center',
  },

  // ─── Ícono de corazón roto ───
  brokenHeartCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.errorRed,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.errorRedDark,
    marginBottom: 24,
    shadowColor: colors.errorRedDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 10,
  },

  // ─── Título ───
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.errorRedDark,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
  },

  // ─── Subtítulo ───
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    maxWidth: 320,
  },

  // ─── Temporizador ───
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.terracotaLight,
    marginBottom: 32,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  timerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.terracotaPastel,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  timerTextBlock: {
    flex: 1,
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  timerValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.terracotaDark,
  },

  // ─── Botón principal (resumen) ───
  summaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.montePrimary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 18,
    gap: 10,
    borderBottomWidth: 4,
    borderBottomColor: colors.monteDark,
    shadowColor: colors.monteDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    width: '100%',
    maxWidth: 340,
    marginBottom: 14,
  },
  summaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // ─── Botón secundario (volver) ───
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.sandBorder,
    gap: 8,
    width: '100%',
    maxWidth: 340,
    marginBottom: 24,
  },
  backButtonText: {
    color: colors.monteDark,
    fontSize: 15,
    fontWeight: '800',
  },

  // ─── Tip final ───
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.solLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 10,
    maxWidth: 340,
    width: '100%',
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});