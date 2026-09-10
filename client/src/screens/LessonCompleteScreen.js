import React from 'react';
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

export default function LessonCompleteScreen() {
  const { lastLessonResult, user, setCurrentScreen } = useApp();

  const xpGained = lastLessonResult?.xpGained ?? 15;
  const coinsGained = lastLessonResult?.coinsGained ?? 10;
  const accuracy = lastLessonResult?.accuracy ?? 100;
  const correctCount = lastLessonResult?.correctCount ?? 0;
  const incorrectCount = lastLessonResult?.incorrectCount ?? 0;
  const formattedTime = lastLessonResult?.formattedTime ?? '0:45';
  const culturalCapsule = lastLessonResult?.culturalCapsule;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Status Banner */}
        <View style={styles.festiveBadge}>
          <Text style={styles.festiveBadgeText}>¡LECCIÓN COMPLETADA!</Text>
        </View>

        {/* Mascot Celebration Visual */}
        <MascotAguara
          size={150}
          mood="celebrating"
          speechText="¡Iporãiterei! Tu constancia enriquece la lengua guaraní."
        />

        {/* Title */}
        <Text style={styles.titleText}>Resumen de Rendimiento</Text>
        <Text style={styles.subtitleText}>
          {accuracy >= 90
            ? '¡Desempeño sobresaliente! Estás dominando el Chaco.'
            : accuracy >= 70
            ? '¡Buen trabajo! Cada error es un paso en el aprendizaje.'
            : '¡Sigue practicando! La sabiduría se forja con constancia.'}
        </Text>

        {/* 4-Metric Grid in Duolingo Style */}
        <View style={styles.metricsGrid}>
          {/* 1. Precision % */}
          <View style={styles.metricCard}>
            <Ionicons name="disc" size={24} color={colors.montePrimary} />
            <Text style={[styles.metricNumber, { color: colors.monteDark }]}>{accuracy}%</Text>
            <Text style={styles.metricLabel}>Precisión Final</Text>
          </View>

          {/* 2. XP Earned */}
          <View style={styles.metricCard}>
            <Ionicons name="flash" size={24} color={colors.solGold} />
            <Text style={[styles.metricNumber, { color: colors.solGold }]}>+{xpGained}</Text>
            <Text style={styles.metricLabel}>Puntos XP</Text>
          </View>

          {/* 3. Correct vs Incorrect Breakdown */}
          <View style={styles.metricCard}>
            <View style={styles.ratioRow}>
              <Text style={styles.correctMini}>✓ {correctCount}</Text>
              <Text style={styles.incorrectMini}>✗ {incorrectCount}</Text>
            </View>
            <Text style={styles.metricNumber}>{correctCount}/{correctCount + incorrectCount}</Text>
            <Text style={styles.metricLabel}>Respuestas Correctas</Text>
          </View>

          {/* 4. Time Elapsed */}
          <View style={styles.metricCard}>
            <Ionicons name="time" size={24} color={colors.terracotaPrimary} />
            <Text style={[styles.metricNumber, { color: colors.terracotaDark }]}>{formattedTime}</Text>
            <Text style={styles.metricLabel}>Tiempo Dedicado</Text>
          </View>
        </View>

        {/* Streak Flame Box (Tatá) */}
        <View style={styles.streakBox}>
          <View style={styles.streakFlameIcon}>
            <Ionicons name="flame" size={38} color={colors.tataFire} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.streakTitle}>¡Racha Tatá: {user.streakDays} Días!</Text>
            <Text style={styles.streakDesc}>
              El fuego sagrado del Chaco permanece vivo. ¡Vuelve mañana para continuar!
            </Text>
          </View>
        </View>

        {/* Cultural Capsule Highlight */}
        {culturalCapsule && (
          <View style={styles.capsuleCard}>
            <View style={styles.capsuleHeader}>
              <Ionicons name="sparkles" size={18} color={colors.terracotaPrimary} />
              <Text style={styles.capsuleHeaderTitle}>Cápsula Cultural de la Lección</Text>
            </View>
            <Text style={styles.capsuleTitle}>{culturalCapsule.title}</Text>
            <Text style={styles.capsuleContent}>{culturalCapsule.content}</Text>
          </View>
        )}

        {/* Bottom Continue Button */}
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => setCurrentScreen('main')}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>CONTINUAR</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
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
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  festiveBadge: {
    backgroundColor: colors.montePastel,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.montePrimary,
    marginBottom: 8,
  },
  festiveBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.monteDark,
    letterSpacing: 1,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.terracotaDark,
    textAlign: 'center',
    marginTop: 10,
  },
  subtitleText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 300,
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 18,
    gap: 10,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.sandBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  ratioRow: {
    flexDirection: 'row',
    gap: 6,
  },
  correctMini: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.successGreen,
  },
  incorrectMini: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.errorRed,
  },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.tataFlameYellow,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  streakFlameIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.tataFire,
  },
  streakDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  capsuleCard: {
    backgroundColor: colors.terracotaPastel,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.terracotaLight,
    width: '100%',
    marginBottom: 20,
  },
  capsuleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  capsuleHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.terracotaDark,
  },
  capsuleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  capsuleContent: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.montePrimary,
    paddingVertical: 16,
    borderRadius: 18,
    width: '100%',
    borderBottomWidth: 4,
    borderBottomColor: colors.monteDark,
    gap: 8,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
});
