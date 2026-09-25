import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';

export default function ProfileScreen() {
  const { user, achievements, setCurrentScreen, loadAchievements } = useApp();
  const wordsLearned = user?.wordsLearned ?? 0;

  // 🔄 Refrescar logros y palabras cada vez que se entra al Perfil
  useEffect(() => {
    loadAchievements?.();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header onHeartsPress={() => {}} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarWrapper}>
            <Ionicons name="person" size={44} color="#FFFFFF" />
          </View>
          <Text style={styles.userName}>{user.username}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View style={styles.rankBadge}>
            <Ionicons name="ribbon" size={16} color={colors.solGold} />
            <Text style={styles.rankBadgeText}>Rango: {user.currentRank} Chaqueño</Text>
          </View>
          <Text style={styles.joinedText}>Estudiando Guaraní Oriental desde Septiembre 2026</Text>
        </View>

        <Text style={styles.sectionTitle}>Estadísticas de Aprendizaje</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons name="flame" size={28} color={colors.tataFire} />
            <Text style={styles.statValue}>{user.streakDays}</Text>
            <Text style={styles.statLabel}>Días de Racha Tatá</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="flash" size={28} color={colors.solGold} />
            <Text style={styles.statValue}>{user.xpTotal}</Text>
            <Text style={styles.statLabel}>Total Puntos XP</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="book" size={28} color={colors.montePrimary} />
            <Text style={styles.statValue}>{wordsLearned}</Text>
            <Text style={styles.statLabel}>Palabras Aprendidas</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="shield-checkmark" size={28} color={colors.terracotaPrimary} />
            <Text style={styles.statValue}>Semilla</Text>
            <Text style={styles.statLabel}>División Actual</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>
          Estantería de Logros e Insignias
        </Text>
        <View style={styles.achievementsGrid}>
          {(achievements || []).map(ach => {
            const unlocked = ach.is_unlocked;
            const progress = ach.progress_percent ?? 0;
            const progressLabel = ach.progress_label ?? '';
            return (
              <View
                key={ach.id}
                style={[styles.achievementCard, !unlocked && styles.achievementCardLocked]}
              >
                <View style={[styles.medalCircle, unlocked ? styles.medalCircleUnlocked : styles.medalCircleLocked]}>
                  <Ionicons name={ach.icon || 'help-circle'} size={28} color={unlocked ? '#FFFFFF' : '#9E9E9E'} />
                </View>
                <Text style={styles.achievementName}>{ach.name}</Text>
                <Text style={styles.achievementGuarani}>{ach.name_guarani}</Text>
                <Text style={styles.achievementDesc}>{ach.description}</Text>
                <View style={styles.achievementProgressBg}>
                  <View style={[styles.achievementProgressFill, { width: `${progress}%`, backgroundColor: unlocked ? colors.solGold : colors.montePrimary }]} />
                </View>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>{unlocked ? '¡Desbloqueado!' : progressLabel}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setCurrentScreen('onboarding')}
          activeOpacity={0.8}
        >
          <Ionicons name="options" size={20} color={colors.montePrimary} />
          <Text style={styles.settingsButtonText}>Cambiar Variante Dialectal o Metas</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sandBackground },
  scrollContent: { padding: 20, paddingBottom: 40 },
  profileHeaderCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: colors.sandBorder, marginBottom: 20 },
  avatarWrapper: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.montePrimary, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 3, borderColor: colors.monteLight },
  userName: { fontSize: 22, fontWeight: '900', color: colors.textPrimary },
  userEmail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  rankBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.solLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, marginTop: 10, gap: 6 },
  rankBadgeText: { fontSize: 13, fontWeight: '800', color: colors.terracotaDark },
  joinedText: { fontSize: 11, color: colors.textMuted, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.textPrimary, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  statBox: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: colors.sandBorder },
  statValue: { fontSize: 24, fontWeight: '900', color: colors.textPrimary, marginVertical: 4 },
  statLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', textAlign: 'center' },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  achievementCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: colors.sandBorder },
  achievementCardLocked: { opacity: 0.7 },
  medalCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  medalCircleUnlocked: { backgroundColor: colors.solGold, borderWidth: 3, borderColor: '#D4AF37' },
  medalCircleLocked: { backgroundColor: '#E0E0E0', borderWidth: 2, borderColor: '#BDBDBD' },
  achievementName: { fontSize: 13, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  achievementGuarani: { fontSize: 11, fontStyle: 'italic', color: colors.monteDark, textAlign: 'center' },
  achievementDesc: { fontSize: 10, color: colors.textMuted, textAlign: 'center', marginVertical: 4 },
  achievementProgressBg: { width: '100%', height: 6, backgroundColor: colors.sandBorder, borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  achievementProgressFill: { height: '100%', borderRadius: 3 },
  progressBadge: { backgroundColor: colors.sandBackground, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 6 },
  progressBadgeText: { fontSize: 10, fontWeight: '800', color: colors.textSecondary },
  settingsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 18, borderWidth: 2, borderColor: colors.montePrimary, marginTop: 20, gap: 8 },
  settingsButtonText: { color: colors.monteDark, fontSize: 14, fontWeight: '800' },
});