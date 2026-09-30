import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Animated,
  Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import MascotAguara from '../components/MascotAguara';
import PressableScale from '../components/PressableScale';
import Confetti from '../components/Confetti';

// Mapeo de íconos inválidos → válidos de Ionicons
const ICON_MAP = {
  tree: 'leaf',
  jar: 'cube',
  crown: 'ribbon',
  flame: 'flame',
  sparkles: 'sparkles',
  trophy: 'trophy',
  medal: 'medal',
  star: 'star'
};

const getValidIcon = (icon) => ICON_MAP[icon] || icon || 'ribbon';

export default function LessonCompleteScreen() {
  const {
    lastLessonResult,
    user,
    setCurrentScreen,
    goToNextLesson,
    goBackToMap
  } = useApp();
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);

  // 🎬 Animaciones
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const xpGained = lastLessonResult?.xpGained ?? 15;
  const coinsGained = lastLessonResult?.coinsGained ?? 10;
  const accuracy = lastLessonResult?.accuracy ?? 100;
  const correctCount = lastLessonResult?.correctCount ?? 0;
  const incorrectCount = lastLessonResult?.incorrectCount ?? 0;
  const formattedTime = lastLessonResult?.formattedTime ?? '0:45';
  const culturalCapsule = lastLessonResult?.culturalCapsule;
  const streakDays = user?.streakDays ?? 1;
  const newAchievements = lastLessonResult?.newlyUnlockedAchievements || [];

  const shouldCelebrate = accuracy >= 70;

  // 🎬 Animación de rebote del zorro
  useEffect(() => {
    if (!shouldCelebrate) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -12, duration: 500,
          easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0, duration: 500,
          easing: Easing.bounce, useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shouldCelebrate]);

  // 🎬 Animación flotante para emojis
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1, duration: 2000,
          easing: Easing.inOut(Easing.sin), useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0, duration: 2000,
          easing: Easing.inOut(Easing.sin), useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 🎬 Entrada del badge con bounce
  useEffect(() => {
    Animated.sequence([
      Animated.timing(badgeScale, {
        toValue: 1.15, duration: 400,
        easing: Easing.out(Easing.back(2)), useNativeDriver: true,
      }),
      Animated.spring(badgeScale, {
        toValue: 1, friction: 4, useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(fadeAnim, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start();
  }, []);

  // 🏆 Mostrar popup si se desbloquearon logros
  useEffect(() => {
    if (newAchievements.length > 0) {
      const timer = setTimeout(() => {
        setAchievementModalVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [newAchievements.length]);

  // 🦊 Mensaje dinámico según precisión
  const getFoxMessage = () => {
    if (!shouldCelebrate) return '¡Ani ñembyasy! Cada intento te acerca a la sabiduría.';
    if (accuracy === 100) return '🏆 ¡PERFECTO! Eres un maestro del guaraní.';
    if (accuracy >= 90) return '⭐ ¡Excelente trabajo! Che irũ.';
    if (accuracy >= 80) return '🌟 ¡Muy bien! Estás avanzando con fuerza.';
    return '👍 ¡Buen esfuerzo! Sigue así.';
  };

  const getSubtitle = () => {
    if (accuracy >= 90) return '¡Desempeño sobresaliente! Estás dominando el Chaco.';
    if (accuracy >= 70) return '¡Buen trabajo! Cada error es un paso en el aprendizaje.';
    return '¡Sigue practicando! La sabiduría se forja con constancia.';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* 🎊 Confeti solo si celebra */}
      {shouldCelebrate && <Confetti />}

      {/* 🎊 Emojis flotantes decorativos */}
      {shouldCelebrate && (
        <>
          <Animated.Text style={[styles.floatingEmoji, styles.emoji1, {
            transform: [{ translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -15] }) }]
          }]}>🎊</Animated.Text>
          <Animated.Text style={[styles.floatingEmoji, styles.emoji2, {
            transform: [{ translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 15] }) }]
          }]}>🎉</Animated.Text>
          <Animated.Text style={[styles.floatingEmoji, styles.emoji3, {
            transform: [{ translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }]
          }]}>⭐</Animated.Text>
          <Animated.Text style={[styles.floatingEmoji, styles.emoji4, {
            transform: [{ translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }) }]
          }]}>🏆</Animated.Text>
        </>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 🎊 Badge festivo con animación */}
        <Animated.View style={[
          styles.festiveBadge,
          shouldCelebrate && styles.festiveBadgeCelebrate,
          { transform: [{ scale: badgeScale }] }
        ]}>
          <Text style={[
            styles.festiveBadgeText,
            shouldCelebrate && styles.festiveBadgeTextCelebrate
          ]}>
            {shouldCelebrate ? '🎉 ¡FELICIDADES! 🎉' : '¡CASI LO LOGRAS!'}
          </Text>
        </Animated.View>

        {/* 🦊 Zorro con bounce */}
        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
          <MascotAguara
            size={150}
            mood={shouldCelebrate ? 'celebrating' : 'happy'}
            speechText={getFoxMessage()}
          />
        </Animated.View>

        {/* 💬 Mensaje guaraní extra si es celebración */}
        {shouldCelebrate && (
          <Animated.View style={[styles.guaraniBubble, { opacity: fadeAnim }]}>
            <Text style={styles.guaraniText}>¡Iporãiterei! ¡Felicidades! Che irũ</Text>
          </Animated.View>
        )}

        <Text style={styles.titleText}>Resumen de Rendimiento</Text>
        <Text style={styles.subtitleText}>{getSubtitle()}</Text>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="disc" size={24} color={colors.montePrimary} />
            <Text style={[styles.metricNumber, { color: colors.monteDark }]}>
              {accuracy}%
            </Text>
            <Text style={styles.metricLabel}>Precisión Final</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="flash" size={24} color={colors.solGold} />
            <Text style={[styles.metricNumber, { color: colors.solGold }]}>
              +{xpGained}
            </Text>
            <Text style={styles.metricLabel}>Puntos XP</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.ratioRow}>
              <Text style={styles.correctMini}>✓ {correctCount}</Text>
              <Text style={styles.incorrectMini}>✗ {incorrectCount}</Text>
            </View>
            <Text style={styles.metricNumber}>
              {correctCount}/{correctCount + incorrectCount}
            </Text>
            <Text style={styles.metricLabel}>Respuestas Correctas</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="time" size={24} color={colors.terracotaPrimary} />
            <Text style={[styles.metricNumber, { color: colors.terracotaDark }]}>
              {formattedTime}
            </Text>
            <Text style={styles.metricLabel}>Tiempo Dedicado</Text>
          </View>
        </View>

        <View style={styles.streakBox}>
          <View style={styles.streakFlameIcon}>
            <Ionicons name="flame" size={38} color={colors.tataFire} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.streakTitle}>
              ¡Racha Tatá: {streakDays} Días!
            </Text>
            <Text style={styles.streakDesc}>
              El fuego sagrado del Chaco permanece vivo. ¡Vuelve mañana para continuar!
            </Text>
          </View>
        </View>

        {culturalCapsule && (
          <View style={styles.capsuleCard}>
            <View style={styles.capsuleHeader}>
              <Ionicons name="sparkles" size={18} color={colors.terracotaPrimary} />
              <Text style={styles.capsuleHeaderTitle}>
                Cápsula Cultural de la Lección
              </Text>
            </View>
            <Text style={styles.capsuleTitle}>{culturalCapsule.title}</Text>
            <Text style={styles.capsuleContent}>{culturalCapsule.content}</Text>
          </View>
        )}

        {/* 🦊 SIGUIENTE LECCIÓN → va al mapa y el zorro camina */}
        <PressableScale
          style={styles.continueBtn}
          onPress={goToNextLesson}
          pulse
        >
          <Text style={styles.continueBtnText}>SIGUIENTE LECCIÓN</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </PressableScale>

        {/* 🦊 VOLVER AL SENDERO → va al mapa y el zorro camina */}
        <PressableScale
          style={styles.secondaryBtn}
          onPress={goBackToMap}
        >
          <Text style={styles.secondaryBtnText}>Volver al sendero</Text>
        </PressableScale>
      </ScrollView>

      {/* 🏆 POPUP DE LOGRO DESBLOQUEADO */}
      <Modal
        visible={achievementModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAchievementModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.achievementCard}>
            <View style={styles.medalCircle}>
              <Ionicons
                name={getValidIcon(newAchievements[0]?.icon)}
                size={54}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.achievementTag}>🏆 ¡LOGRO DESBLOQUEADO!</Text>
            <Text style={styles.achievementName}>
              {newAchievements[0]?.name || 'Nuevo logro'}
            </Text>
            <Text style={styles.achievementGuarani}>
              {newAchievements[0]?.name_guarani || ''}
            </Text>
            <Text style={styles.achievementDesc}>
              {newAchievements[0]?.description || ''}
            </Text>

            {newAchievements.length > 1 && (
              <Text style={styles.moreAchievements}>
                +{newAchievements.length - 1} logro{newAchievements.length > 2 ? 's' : ''} más
              </Text>
            )}

            <TouchableOpacity
              style={styles.achievementBtn}
              onPress={() => setAchievementModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.achievementBtnText}>¡GENIAL!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sandBackground },
  scrollContent: { padding: 24, paddingBottom: 40, alignItems: 'center' },

  // 🎊 Badge festivo
  festiveBadge: {
    backgroundColor: colors.montePastel,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.montePrimary,
    marginBottom: 8,
  },
  festiveBadgeCelebrate: {
    backgroundColor: colors.solGold,
    borderColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: colors.solGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  festiveBadgeText: {
    fontSize: 12, fontWeight: '800', color: colors.monteDark, letterSpacing: 1,
  },
  festiveBadgeTextCelebrate: {
    fontSize: 18, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1.5,
  },

  // 💬 Bocadillo guaraní
  guaraniBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.solGold,
    marginTop: 8,
    marginBottom: 4,
    maxWidth: '90%',
  },
  guaraniText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.terracotaDark,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  titleText: {
    fontSize: 26, fontWeight: '900', color: colors.terracotaDark,
    textAlign: 'center', marginTop: 10,
  },
  subtitleText: {
    fontSize: 14, color: colors.textSecondary, textAlign: 'center',
    marginTop: 4, maxWidth: 300, lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    width: '100%', marginVertical: 18, gap: 10,
  },
  metricCard: {
    width: '48%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14,
    alignItems: 'center', borderWidth: 2, borderColor: colors.sandBorder,
  },
  metricNumber: { fontSize: 22, fontWeight: '900', color: colors.textPrimary, marginTop: 4 },
  metricLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted, marginTop: 2, textAlign: 'center',
  },
  ratioRow: { flexDirection: 'row', gap: 6 },
  correctMini: { fontSize: 11, fontWeight: '800', color: colors.successGreen },
  incorrectMini: { fontSize: 11, fontWeight: '800', color: colors.errorRed },
  streakBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 20, padding: 16, borderWidth: 2, borderColor: colors.tataFlameYellow,
    width: '100%', marginBottom: 16,
  },
  streakFlameIcon: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF3E0',
    justifyContent: 'center', alignItems: 'center',
  },
  streakTitle: { fontSize: 16, fontWeight: '800', color: colors.tataFire },
  streakDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  capsuleCard: {
    backgroundColor: colors.terracotaPastel, borderRadius: 18, padding: 16,
    borderWidth: 1.5, borderColor: colors.terracotaLight, width: '100%', marginBottom: 20,
  },
  capsuleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  capsuleHeaderTitle: {
    fontSize: 11, fontWeight: '800', letterSpacing: 1, color: colors.terracotaDark,
  },
  capsuleTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  capsuleContent: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  continueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.montePrimary, paddingVertical: 16, borderRadius: 18,
    width: '100%', borderBottomWidth: 4, borderBottomColor: colors.monteDark, gap: 8,
  },
  continueBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  secondaryBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginTop: 10 },
  secondaryBtnText: {
    color: colors.textSecondary, fontWeight: '700', fontSize: 14, textDecorationLine: 'underline',
  },

  // 🎊 Emojis flotantes
  floatingEmoji: {
    position: 'absolute',
    fontSize: 30,
    zIndex: 1,
  },
  emoji1: { top: '8%', left: '6%' },
  emoji2: { top: '12%', right: '6%' },
  emoji3: { bottom: '35%', left: '8%' },
  emoji4: { bottom: '30%', right: '8%' },

  // 🏆 Modal de logro
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  achievementCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.sandBackground,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.solGold,
    shadowColor: colors.solGold,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  medalCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.solGold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#D4AF37',
    marginBottom: 18,
    shadowColor: colors.solGold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  achievementTag: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.terracotaDark,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  achievementName: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementGuarani: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.monteDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  moreAchievements: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.solGold,
    marginBottom: 12,
  },
  achievementBtn: {
    backgroundColor: colors.solGold,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 26,
    borderBottomWidth: 4,
    borderBottomColor: '#B8860B',
    minWidth: 160,
    alignItems: 'center',
  },
  achievementBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});