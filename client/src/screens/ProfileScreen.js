import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { AGE_GROUPS } from '../data/initialData';
import { saveSettings } from '../api/apiClient';
import Header from '../components/Header';

// 🎯 6 RANGOS temáticos guaraníes con progresión creciente
const RANKS = [
  { name: 'Semilla', nameGuarani: "Ra'ỹi", minXp: 0, icon: 'leaf', color: '#7CB342' },
  { name: 'Brote', nameGuarani: 'Togue', minXp: 100, icon: 'flower', color: '#558B2F' },
  { name: 'Explorador', nameGuarani: 'Oheka', minXp: 250, icon: 'compass', color: '#00BCD4' },
  { name: 'Sabio', nameGuarani: 'Arandu', minXp: 500, icon: 'book', color: colors.terracotaPrimary },
  { name: 'Guardián', nameGuarani: 'Ñangarekohára', minXp: 800, icon: 'flame', color: '#FF6F00' },
  { name: 'Mburuvicha', nameGuarani: 'Mburuvicha', minXp: 1200, icon: 'trophy', color: colors.solGold },
];

// 🎯 Devuelve el rango ACTUAL del usuario
const getRankInfo = (xp) => {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minXp) current = rank;
  }
  return current;
};

// 🎯 Devuelve el SIGUIENTE rango (null si ya es Mburuvicha)
const getNextRank = (xp) => {
  for (const rank of RANKS) {
    if (xp < rank.minXp) return rank;
  }
  return null;
};

// 🎯 Índice del rango actual (para mostrar progreso global)
const getRankIndex = (xp) => {
  let index = 0;
  RANKS.forEach((rank, i) => {
    if (xp >= rank.minXp) index = i;
  });
  return index;
};

export default function ProfileScreen() {
  const {
    user,
    achievements,
    setCurrentScreen,
    loadAchievements,
    setUser,
    token,
    logout
  } = useApp();

  const wordsLearned = user?.wordsLearned ?? 0;
  const [selectedAge, setSelectedAge] = useState(user?.ageGroup || 'adulto');
  const [saving, setSaving] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAllRanks, setShowAllRanks] = useState(false);

  useEffect(() => {
    loadAchievements?.();
  }, []);

  useEffect(() => {
    if (user?.ageGroup) setSelectedAge(user.ageGroup);
  }, [user?.ageGroup]);

  const handleSaveAge = async () => {
    if (selectedAge === user?.ageGroup) {
      Alert.alert('Sin cambios', 'Ya tienes esa edad seleccionada.');
      return;
    }

    setSaving(true);
    try {
      await saveSettings(token, { age_group: selectedAge });
      setUser(prev => ({ ...prev, ageGroup: selectedAge }));
      Alert.alert(
        '✅ Edad actualizada',
        `Ahora practicarás con contenido de: ${AGE_GROUPS.find(g => g.id === selectedAge)?.label}`,
        [{ text: '¡Genial!' }]
      );
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo guardar la edad');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  // 🎯 Cálculo del rango y progreso
  const userXp = user?.xpTotal || 0;
  const currentRank = getRankInfo(userXp);
  const nextRank = getNextRank(userXp);
  const rankIndex = getRankIndex(userXp);

  // 📊 Progreso: cuánto has avanzado DENTRO del rango actual
  const rankProgress = nextRank
    ? Math.min(100, Math.round(
        ((userXp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100
      ))
    : 100;

  // 📊 XP que falta para el siguiente rango
  const xpToNext = nextRank ? nextRank.minXp - userXp : 0;

  return (
    <SafeAreaView style={styles.container}>
      <Header onHeartsPress={() => {}} />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ═══════════ HEADER PERFIL ═══════════ */}
        <View style={styles.profileHeaderCard}>
          <View style={[styles.avatarWrapper, { backgroundColor: currentRank.color }]}>
            <Ionicons name="person" size={44} color="#FFFFFF" />
          </View>
          <Text style={styles.userName}>{user.username}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View style={[styles.rankBadge, { backgroundColor: `${currentRank.color}20` }]}>
            <Ionicons name={currentRank.icon} size={16} color={currentRank.color} />
            <Text style={[styles.rankBadgeText, { color: currentRank.color }]}>
              {currentRank.name} · {currentRank.nameGuarani}
            </Text>
          </View>

          {/* 🎯 Barra de progreso al siguiente rango */}
          {nextRank ? (
            <View style={styles.rankProgressContainer}>
              <View style={styles.rankProgressLabels}>
                <Text style={styles.rankProgressLabel}>
                  {currentRank.name} ({currentRank.minXp} XP)
                </Text>
                <Text style={styles.rankProgressLabel}>
                  {nextRank.name} ({nextRank.minXp} XP)
                </Text>
              </View>
              <View style={styles.rankProgressBg}>
                <View
                  style={[
                    styles.rankProgressFill,
                    { width: `${rankProgress}%`, backgroundColor: nextRank.color }
                  ]}
                />
              </View>
              <Text style={styles.rankProgressText}>
                {userXp} XP · Te faltan {xpToNext} XP para {nextRank.name} ({rankProgress}%)
              </Text>
            </View>
          ) : (
            <View style={styles.rankProgressContainer}>
              <View style={styles.maxRankBanner}>
                <Ionicons name="trophy" size={18} color={colors.solGold} />
                <Text style={styles.maxRankText}>¡Rango máximo alcanzado! 🏆</Text>
              </View>
            </View>
          )}

          {/* 🎯 Botón para ver todos los rangos */}
          <TouchableOpacity
            style={styles.viewRanksBtn}
            onPress={() => setShowAllRanks(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="list" size={16} color={colors.montePrimary} />
            <Text style={styles.viewRanksBtnText}>Ver todos los rangos ({rankIndex + 1}/{RANKS.length})</Text>
          </TouchableOpacity>

          <Text style={styles.joinedText}>Estudiando Guaraní Oriental desde Septiembre 2026</Text>
        </View>

        {/* ═══════════ SELECTOR DE EDAD ═══════════ */}
        <Text style={styles.sectionTitle}>🎂 Tu Grupo de Edad</Text>
        <View style={styles.ageSelectorCard}>
          <Text style={styles.ageHint}>
            Cambia tu edad para practicar con contenido adaptado a ti.
          </Text>

          {AGE_GROUPS.map(group => {
            const isSelected = selectedAge === group.id;
            return (
              <TouchableOpacity
                key={group.id}
                style={[styles.ageOption, isSelected && styles.ageOptionSelected]}
                onPress={() => setSelectedAge(group.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.ageRadio, isSelected && styles.ageRadioSelected]}>
                  {isSelected && <View style={styles.ageRadioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ageLabel, isSelected && styles.ageLabelSelected]}>
                    {group.label}
                  </Text>
                  <Text style={styles.ageSubtext}>{group.subtext}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.montePrimary} />
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[styles.saveAgeButton, saving && { opacity: 0.6 }]}
            onPress={handleSaveAge}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <Text style={styles.saveAgeButtonText}>Guardando...</Text>
            ) : (
              <>
                <Ionicons name="save" size={18} color="#FFFFFF" />
                <Text style={styles.saveAgeButtonText}>Guardar cambios</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ═══════════ ESTADÍSTICAS ═══════════ */}
        <Text style={styles.sectionTitle}>📊 Estadísticas de Aprendizaje</Text>
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
            <Ionicons name="color-filter" size={28} color={colors.terracotaPrimary} />
            <Text style={styles.statValue}>{user.coinsMbae || 0}</Text>
            <Text style={styles.statLabel}>Monedas Mbae</Text>
          </View>
        </View>

        {/* ═══════════ LOGROS ═══════════ */}
        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>
          🏆 Estantería de Logros
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

        {/* ═══════════ CONFIGURACIÓN ═══════════ */}
        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>
          ⚙️ Configuración
        </Text>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowSettingsModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="options" size={20} color={colors.montePrimary} />
          <Text style={styles.settingsButtonText}>Cambiar Variante Dialectal</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutConfirm(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.errorRed} />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ═══════════ MODAL: VER TODOS LOS RANGOS ═══════════ */}
      <Modal
        visible={showAllRanks}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAllRanks(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="trophy" size={26} color={colors.solGold} />
              <Text style={styles.modalTitle}>Todos los Rangos</Text>
            </View>
            <Text style={styles.modalDescription}>
              Tu progreso: <Text style={{ fontWeight: '900', color: currentRank.color }}>
                {rankIndex + 1}/{RANKS.length}
              </Text>
            </Text>

            <View style={styles.ranksList}>
              {RANKS.map((rank, index) => {
                const isCurrent = index === rankIndex;
                const isUnlocked = index <= rankIndex;
                return (
                  <View
                    key={index}
                    style={[
                      styles.rankItem,
                      isCurrent && { borderColor: rank.color, backgroundColor: `${rank.color}10` },
                      !isUnlocked && { opacity: 0.5 }
                    ]}
                  >
                    <View style={[
                      styles.rankIconCircle,
                      { backgroundColor: isUnlocked ? rank.color : '#E0E0E0' }
                    ]}>
                      <Ionicons
                        name={isUnlocked ? rank.icon : 'lock-closed'}
                        size={22}
                        color="#FFFFFF"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rankName}>
                        {rank.name}
                        <Text style={styles.rankGuarani}> · {rank.nameGuarani}</Text>
                      </Text>
                      <Text style={styles.rankXp}>
                        {rank.minXp === 0 ? 'Desde el inicio' : `${rank.minXp} XP`}
                      </Text>
                    </View>
                    {isCurrent && (
                      <View style={[styles.rankCurrentBadge, { backgroundColor: rank.color }]}>
                        <Text style={styles.rankCurrentText}>ACTUAL</Text>
                      </View>
                    )}
                    {isUnlocked && !isCurrent && (
                      <Ionicons name="checkmark-circle" size={22} color={colors.successGreen} />
                    )}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAllRanks(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═══════════ MODAL: CAMBIAR VARIANTE DIALECTAL ═══════════ */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="options" size={26} color={colors.montePrimary} />
              <Text style={styles.modalTitle}>Cambiar Variante Dialectal</Text>
            </View>
            <Text style={styles.modalDescription}>
              Elige la variante de guaraní que quieres aprender. Esto afecta a las palabras y frases que verás.
            </Text>

            <View style={styles.variantList}>
              {[
                { id: 'ava', name: 'Ava Guaraní', region: 'Cordillera, Tarija y Chuquisaca' },
                { id: 'izoceño', name: 'Izoceño-Guaraní', region: 'Bañados del Izozog' },
                { id: 'simba', name: 'Simba Guaraní', region: 'Serranías de Chuquisaca' },
              ].map(variant => {
                const isSelected = (user?.dialectVariant || 'ava') === variant.id;
                return (
                  <TouchableOpacity
                    key={variant.id}
                    style={[styles.variantOption, isSelected && styles.variantOptionSelected]}
                    onPress={async () => {
                      try {
                        await saveSettings(token, { dialect_variant: variant.id });
                        setUser(prev => ({ ...prev, dialectVariant: variant.id }));
                        setShowSettingsModal(false);
                        Alert.alert('✅ Variante actualizada', `Ahora aprendes: ${variant.name}`);
                      } catch (e) {
                        Alert.alert('Error', e.message || 'No se pudo guardar');
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={isSelected ? colors.montePrimary : colors.textMuted}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.variantName}>{variant.name}</Text>
                      <Text style={styles.variantRegion}>{variant.region}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.variantBadge}>
                        <Text style={styles.variantBadgeText}>ACTUAL</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSettingsModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═══════════ MODAL: CONFIRMAR CERRAR SESIÓN ═══════════ */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconCircle}>
              <Ionicons name="log-out-outline" size={36} color={colors.errorRed} />
            </View>
            <Text style={styles.confirmTitle}>¿Cerrar Sesión?</Text>
            <Text style={styles.confirmMessage}>
              Tendrás que iniciar sesión de nuevo para continuar tu aprendizaje.
            </Text>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.confirmBtnCancel]}
                onPress={() => setShowLogoutConfirm(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, styles.confirmBtnConfirm]}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmBtnConfirmText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sandBackground },
  scrollContent: { padding: 20, paddingBottom: 40 },

  profileHeaderCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20,
    alignItems: 'center', borderWidth: 2, borderColor: colors.sandBorder, marginBottom: 20,
  },
  avatarWrapper: {
    width: 76, height: 76, borderRadius: 38,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10, borderWidth: 3, borderColor: '#FFFFFF',
  },
  userName: { fontSize: 22, fontWeight: '900', color: colors.textPrimary },
  userEmail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  rankBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, marginTop: 10, gap: 6,
  },
  rankBadgeText: { fontSize: 13, fontWeight: '800' },

  rankProgressContainer: { width: '100%', marginTop: 16 },
  rankProgressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rankProgressLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  rankProgressBg: {
    width: '100%', height: 10, backgroundColor: colors.sandBorder,
    borderRadius: 5, overflow: 'hidden',
  },
  rankProgressFill: { height: '100%', borderRadius: 5 },
  rankProgressText: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    textAlign: 'center', marginTop: 6,
  },
  maxRankBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.solLight, paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 14, gap: 8,
  },
  maxRankText: { fontSize: 14, fontWeight: '900', color: colors.terracotaDark },

  viewRanksBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 14, paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: colors.montePastel, borderRadius: 12,
  },
  viewRanksBtnText: {
    fontSize: 12, fontWeight: '800', color: colors.monteDark,
  },
  joinedText: { fontSize: 11, color: colors.textMuted, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.textPrimary, marginBottom: 12 },

  ageSelectorCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    borderWidth: 2, borderColor: colors.sandBorder, marginBottom: 20,
  },
  ageHint: { fontSize: 12, color: colors.textMuted, marginBottom: 14, fontStyle: 'italic' },
  ageOption: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14,
    borderWidth: 2, borderColor: colors.sandBorder,
    backgroundColor: colors.sandBackground, marginBottom: 10, gap: 12,
  },
  ageOptionSelected: { borderColor: colors.montePrimary, backgroundColor: colors.montePastel },
  ageRadio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: colors.textMuted, justifyContent: 'center', alignItems: 'center',
  },
  ageRadioSelected: { borderColor: colors.montePrimary },
  ageRadioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.montePrimary },
  ageLabel: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  ageLabelSelected: { color: colors.monteDark },
  ageSubtext: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  saveAgeButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.montePrimary, paddingVertical: 14, borderRadius: 14,
    gap: 8, borderBottomWidth: 4, borderBottomColor: colors.monteDark, marginTop: 6,
  },
  saveAgeButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  statBox: {
    width: '48%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16,
    alignItems: 'center', borderWidth: 2, borderColor: colors.sandBorder,
  },
  statValue: { fontSize: 24, fontWeight: '900', color: colors.textPrimary, marginVertical: 4 },
  statLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  achievementCard: {
    width: '48%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14,
    alignItems: 'center', borderWidth: 2, borderColor: colors.sandBorder,
  },
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

  settingsButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', paddingVertical: 16, paddingHorizontal: 18,
    borderRadius: 18, borderWidth: 2, borderColor: colors.montePrimary,
    marginBottom: 12, gap: 10,
  },
  settingsButtonText: { color: colors.monteDark, fontSize: 14, fontWeight: '800' },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', paddingVertical: 16, paddingHorizontal: 18,
    borderRadius: 18, borderWidth: 2, borderColor: colors.errorRed, gap: 10,
  },
  logoutButtonText: { color: colors.errorRed, fontSize: 14, fontWeight: '800' },

  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modalCard: {
    width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF',
    borderRadius: 24, padding: 22, borderWidth: 2, borderColor: colors.sandBorder,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: colors.textPrimary },
  modalDescription: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 16 },

  // 🎯 RANKS LIST
  ranksList: { gap: 8, marginBottom: 16 },
  rankItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 14,
    borderWidth: 2, borderColor: colors.sandBorder,
    backgroundColor: colors.sandBackground,
  },
  rankIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  rankName: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  rankGuarani: { fontSize: 12, fontStyle: 'italic', fontWeight: '600', color: colors.textMuted },
  rankXp: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  rankCurrentBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  rankCurrentText: { fontSize: 9, fontWeight: '900', color: '#FFFFFF' },

  variantList: { gap: 10, marginBottom: 16 },
  variantOption: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14,
    borderWidth: 2, borderColor: colors.sandBorder, backgroundColor: colors.sandBackground, gap: 12,
  },
  variantOptionSelected: { borderColor: colors.montePrimary, backgroundColor: colors.montePastel },
  variantName: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  variantRegion: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  variantBadge: { backgroundColor: colors.montePrimary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  variantBadgeText: { fontSize: 9, fontWeight: '900', color: '#FFFFFF' },
  modalCloseButton: {
    backgroundColor: colors.sandBackground, paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', borderWidth: 2, borderColor: colors.sandBorder,
  },
  modalCloseButtonText: { fontSize: 14, fontWeight: '800', color: colors.textSecondary },

  confirmCard: {
    width: '100%', maxWidth: 340, backgroundColor: '#FFFFFF',
    borderRadius: 24, padding: 24, alignItems: 'center',
    borderWidth: 2, borderColor: colors.sandBorder,
  },
  confirmIconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFE5E5',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 20, fontWeight: '900', color: colors.textPrimary,
    textAlign: 'center', marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 13, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 18, marginBottom: 20,
  },
  confirmButtons: { flexDirection: 'row', gap: 10, width: '100%' },
  confirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  confirmBtnCancel: {
    backgroundColor: colors.sandBackground, borderWidth: 2, borderColor: colors.sandBorder,
  },
  confirmBtnCancelText: { fontSize: 13, fontWeight: '800', color: colors.textSecondary },
  confirmBtnConfirm: {
    backgroundColor: colors.errorRed, borderBottomWidth: 3, borderBottomColor: '#B71C1C',
  },
  confirmBtnConfirmText: { fontSize: 13, fontWeight: '900', color: '#FFFFFF' },
});