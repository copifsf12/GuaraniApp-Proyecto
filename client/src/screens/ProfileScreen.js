import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  Animated,
  Easing,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { AGE_GROUPS } from '../data/initialData';
import { saveSettings } from '../api/apiClient';
import Header from '../components/Header';
import useImagePicker from '../hooks/useImagePicker';

// 🎯 6 RANGOS temáticos guaraníes
const RANKS = [
  { name: 'Semilla', nameGuarani: "Ra'ỹi", minXp: 0, icon: 'leaf', color: '#7CB342' },
  { name: 'Brote', nameGuarani: 'Togue', minXp: 100, icon: 'flower', color: '#558B2F' },
  { name: 'Explorador', nameGuarani: 'Oheka', minXp: 250, icon: 'compass', color: '#00BCD4' },
  { name: 'Sabio', nameGuarani: 'Arandu', minXp: 500, icon: 'book', color: '#C85A32' },
  { name: 'Guardián', nameGuarani: 'Ñangarekohára', minXp: 800, icon: 'flame', color: '#FF6F00' },
  { name: 'Mburuvicha', nameGuarani: 'Mburuvicha', minXp: 1200, icon: 'trophy', color: '#E9C46A' },
];

const getRankInfo = (xp) => {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minXp) current = rank;
  }
  return current;
};

const getNextRank = (xp) => {
  for (const rank of RANKS) {
    if (xp < rank.minXp) return rank;
  }
  return null;
};

const getRankIndex = (xp) => {
  let index = 0;
  RANKS.forEach((rank, i) => {
    if (xp >= rank.minXp) index = i;
  });
  return index;
};

// 🎬 Animación de brillo para el avatar
function ShineAvatar({ color, children }) {
  const shine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shine, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(shine, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const scale = shine.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const opacity = shine.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  });

  return (
    <View style={{ position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: color,
          opacity,
          transform: [{ scale }],
        }}
      />
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const {
    user,
    achievements,
    setCurrentScreen,
    loadAchievements,
    setUser,
    token,
    logout,
  } = useApp();

  const wordsLearned = user?.wordsLearned ?? 0;
  const [selectedAge, setSelectedAge] = useState(user?.ageGroup || 'adulto');
  const [saving, setSaving] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAllRanks, setShowAllRanks] = useState(false);

  // 📸 Estado del avatar
  const [avatarUri, setAvatarUri] = useState(null);
  const {
    uploading,
    showPickerOptions,
    saveAvatar,
    loadAvatar,
    removeAvatar,
  } = useImagePicker();

  useEffect(() => {
    loadAchievements?.();
  }, []);

  useEffect(() => {
    if (user?.ageGroup) setSelectedAge(user.ageGroup);
  }, [user?.ageGroup]);

  // 📸 Cargar avatar guardado (con await y revalidación)
  useEffect(() => {
    let isMounted = true;
    const loadSavedAvatar = async () => {
      const savedUri = await AsyncStorage.getItem('@guarani_avatar');
      if (isMounted && savedUri) {
        setAvatarUri(savedUri);
      }
    };
    loadSavedAvatar();
    return () => { isMounted = false; };
  }, []);

  // 📸 Cambiar foto de perfil
  const handleChangeAvatar = async () => {
    const uri = await showPickerOptions();
    if (uri) {
      setAvatarUri(uri);
      await saveAvatar(uri);
    }
  };

  // 📸 Eliminar foto de perfil
  const handleRemoveAvatar = () => {
    Alert.alert(
      'Eliminar foto',
      '¿Quieres quitar tu foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, eliminar',
          style: 'destructive',
          onPress: async () => {
            setAvatarUri(null);
            await removeAvatar();
          },
        },
      ]
    );
  };

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

  const userXp = user?.xpTotal || 0;
  const currentRank = getRankInfo(userXp);
  const nextRank = getNextRank(userXp);
  const rankIndex = getRankIndex(userXp);

  const rankProgress = nextRank
    ? Math.min(100, Math.round(
        ((userXp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100
      ))
    : 100;

  const xpToNext = nextRank ? nextRank.minXp - userXp : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.sandBackground }]}>
      <Header onHeartsPress={() => {}} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ═══════════ HEADER PERFIL CON GRADIENTE DEL RANGO ═══════════ */}
        <LinearGradient
          colors={isDark 
            ? [currentRank.color + '40', currentRank.color + '15'] 
            : [currentRank.color + '30', currentRank.color + '05']}
          style={[styles.profileHeaderCard, {
            borderColor: isDark ? currentRank.color + '60' : currentRank.color + '40',
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* 📸 Avatar clickeable con foto de perfil */}
          <ShineAvatar color={currentRank.color}>
            <TouchableOpacity
              onPress={handleChangeAvatar}
              onLongPress={avatarUri ? handleRemoveAvatar : undefined}
              activeOpacity={0.7}
              disabled={uploading}
              style={styles.avatarTouchable}
            >
              <View style={[styles.avatarWrapper, {
                backgroundColor: currentRank.color,
                borderColor: isDark ? '#1E1E1E' : '#FFFFFF',
              }]}>
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="person" size={44} color="#FFFFFF" />
                )}

                {uploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator color="#FFFFFF" size="large" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </ShineAvatar>

          {/* 📸 BOTÓN DE CAMBIAR FOTO (visible siempre) */}
          <TouchableOpacity
            onPress={handleChangeAvatar}
            disabled={uploading}
            activeOpacity={0.7}
            style={[styles.changePhotoButton, {
              backgroundColor: isDark ? '#2A2A2A' : currentRank.color + '15',
              borderColor: currentRank.color + '50',
            }]}
          >
            <Ionicons name="camera" size={14} color={currentRank.color} />
            <Text style={[styles.changePhotoText, { color: currentRank.color }]}>
              {avatarUri ? 'Cambiar foto' : 'Agregar foto de perfil'}
            </Text>
          </TouchableOpacity>

          {/* 📸 Botón de eliminar (solo si tiene foto) */}
          {avatarUri && (
            <TouchableOpacity
              onPress={handleRemoveAvatar}
              activeOpacity={0.7}
              style={styles.removePhotoButton}
            >
              <Ionicons name="trash-outline" size={12} color={theme.errorRed} />
              <Text style={[styles.removePhotoText, { color: theme.errorRed }]}>
                Eliminar foto
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.userName, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
            {user.username}
          </Text>
          <Text style={[styles.userEmail, { color: isDark ? '#B0B0B0' : theme.textMuted }]}>
            {user.email}
          </Text>

          <View style={[styles.rankBadge, {
            backgroundColor: currentRank.color + '25',
            borderWidth: 1.5,
            borderColor: currentRank.color + '50',
          }]}>
            <Ionicons name={currentRank.icon} size={16} color={currentRank.color} />
            <Text style={[styles.rankBadgeText, { color: currentRank.color }]}>
              {currentRank.name} · {currentRank.nameGuarani}
            </Text>
          </View>

          {/* Barra de progreso */}
          {nextRank ? (
            <View style={styles.rankProgressContainer}>
              <View style={styles.rankProgressLabels}>
                <Text style={[styles.rankProgressLabel, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                  {currentRank.name}
                </Text>
                <Text style={[styles.rankProgressLabel, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                  {nextRank.name}
                </Text>
              </View>
              <View style={[styles.rankProgressBg, { backgroundColor: isDark ? '#333' : theme.sandBorder }]}>
                <LinearGradient
                  colors={[currentRank.color, nextRank.color]}
                  style={[styles.rankProgressFill, { width: `${rankProgress}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={[styles.rankProgressText, { color: isDark ? '#B0B0B0' : theme.textMuted }]}>
                {userXp} XP · Te faltan {xpToNext} XP ({rankProgress}%)
              </Text>
            </View>
          ) : (
            <View style={styles.rankProgressContainer}>
              <LinearGradient
                colors={['#E9C46A', '#D4AF37']}
                style={styles.maxRankBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="trophy" size={18} color="#FFFFFF" />
                <Text style={styles.maxRankText}>¡Rango máximo alcanzado! 🏆</Text>
              </LinearGradient>
            </View>
          )}

          <TouchableOpacity
            style={[styles.viewRanksBtn, {
              backgroundColor: isDark ? '#2A2A2A' : theme.montePastel,
              borderColor: currentRank.color + '40',
            }]}
            onPress={() => setShowAllRanks(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="list" size={16} color={currentRank.color} />
            <Text style={[styles.viewRanksBtnText, { color: currentRank.color }]}>
              Ver todos los rangos ({rankIndex + 1}/{RANKS.length})
            </Text>
          </TouchableOpacity>

          <Text style={[styles.joinedText, { color: isDark ? '#757575' : theme.textMuted }]}>
            🌿 Estudiando Guaraní Oriental desde Septiembre 2026
          </Text>
        </LinearGradient>

        {/* ═══════════ ESTADÍSTICAS ═══════════ */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
          📊 Estadísticas de Aprendizaje
        </Text>
        <View style={styles.statsGrid}>
          <StatBox
            icon="flame"
            iconColor={theme.tataFire}
            value={user.streakDays}
            label="Días de Racha Tatá"
            theme={theme}
            isDark={isDark}
          />
          <StatBox
            icon="flash"
            iconColor={theme.solGold}
            value={user.xpTotal}
            label="Total Puntos XP"
            theme={theme}
            isDark={isDark}
          />
          <StatBox
            icon="book"
            iconColor={theme.montePrimary}
            value={wordsLearned}
            label="Palabras Aprendidas"
            theme={theme}
            isDark={isDark}
          />
          <StatBox
            icon="color-filter"
            iconColor={theme.terracotaPrimary}
            value={user.coinsMbae || 0}
            label="Monedas Mbae"
            theme={theme}
            isDark={isDark}
          />
        </View>

        {/* ═══════════ SELECTOR DE EDAD ═══════════ */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#F5F5F5' : theme.textPrimary, marginTop: 22 }]}>
          🎂 Tu Grupo de Edad
        </Text>
        <View style={[styles.ageSelectorCard, {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderColor: isDark ? '#333' : theme.sandBorder,
        }]}>
          <Text style={[styles.ageHint, { color: isDark ? '#B0B0B0' : theme.textMuted }]}>
            Cambia tu edad para practicar con contenido adaptado a ti.
          </Text>

          {AGE_GROUPS.map(group => {
            const isSelected = selectedAge === group.id;
            return (
              <TouchableOpacity
                key={group.id}
                style={[styles.ageOption, {
                  backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground,
                  borderColor: isSelected 
                    ? theme.montePrimary 
                    : (isDark ? '#444' : theme.sandBorder),
                }, isSelected && { backgroundColor: isDark ? '#1B4332' : theme.montePastel }]}
                onPress={() => setSelectedAge(group.id)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.ageRadio,
                  { borderColor: isSelected ? theme.montePrimary : theme.textMuted }
                ]}>
                  {isSelected && (
                    <View style={[styles.ageRadioDot, { backgroundColor: theme.montePrimary }]} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.ageLabel,
                    { color: isSelected 
                      ? (isDark ? '#95D5B2' : theme.monteDark) 
                      : (isDark ? '#F5F5F5' : theme.textPrimary) 
                    }
                  ]}>
                    {group.label}
                  </Text>
                  <Text style={[styles.ageSubtext, { color: isDark ? '#B0B0B0' : theme.textMuted }]}>
                    {group.subtext}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={theme.montePrimary} />
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[styles.saveAgeButton, { backgroundColor: theme.montePrimary, opacity: saving ? 0.6 : 1 }]}
            onPress={handleSaveAge}
            disabled={saving}
            activeOpacity={0.85}
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

        {/* ═══════════ LOGROS ═══════════ */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#F5F5F5' : theme.textPrimary, marginTop: 22 }]}>
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
                style={[styles.achievementCard, {
                  backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                  borderColor: isDark ? '#333' : theme.sandBorder,
                }, !unlocked && { opacity: 0.75 }]}
              >
                <View style={[
                  styles.medalCircle,
                  unlocked ? {
                    backgroundColor: theme.solGold,
                    borderWidth: 3,
                    borderColor: '#D4AF37',
                  } : {
                    backgroundColor: isDark ? '#2A2A2A' : '#E0E0E0',
                    borderWidth: 2,
                    borderColor: isDark ? '#444' : '#BDBDBD',
                  }
                ]}>
                  <Ionicons 
                    name={ach.icon || 'help-circle'} 
                    size={28} 
                    color={unlocked ? '#FFFFFF' : (isDark ? '#757575' : '#9E9E9E')} 
                  />
                </View>
                <Text style={[styles.achievementName, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
                  {ach.name}
                </Text>
                <Text style={[styles.achievementGuarani, { color: isDark ? '#95D5B2' : theme.monteDark }]}>
                  {ach.name_guarani}
                </Text>
                <Text style={[styles.achievementDesc, { color: isDark ? '#B0B0B0' : theme.textMuted }]}>
                  {ach.description}
                </Text>
                <View style={[styles.achievementProgressBg, { backgroundColor: isDark ? '#333' : theme.sandBorder }]}>
                  <View style={[
                    styles.achievementProgressFill,
                    {
                      width: `${progress}%`,
                      backgroundColor: unlocked ? theme.solGold : theme.montePrimary,
                    }
                  ]} />
                </View>
                <View style={[styles.progressBadge, { backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground }]}>
                  <Text style={[styles.progressBadgeText, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                    {unlocked ? '¡Desbloqueado!' : progressLabel}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ═══════════ CONFIGURACIÓN ═══════════ */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#F5F5F5' : theme.textPrimary, marginTop: 22 }]}>
          ⚙️ Configuración
        </Text>

        <TouchableOpacity
          style={[styles.settingsButton, {
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderColor: theme.montePrimary,
          }]}
          onPress={() => setShowSettingsModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="options" size={20} color={theme.montePrimary} />
          <Text style={[styles.settingsButtonText, { color: isDark ? '#95D5B2' : theme.monteDark }]}>
            Cambiar Variante Dialectal
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutButton, {
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderColor: theme.errorRed,
          }]}
          onPress={() => setShowLogoutConfirm(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.errorRed} />
          <Text style={[styles.logoutButtonText, { color: theme.errorRed }]}>
            Cerrar Sesión
          </Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ═══════════ MODAL: TODOS LOS RANGOS ═══════════ */}
      <Modal visible={showAllRanks} transparent animationType="slide" onRequestClose={() => setShowAllRanks(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, {
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderColor: isDark ? '#333' : theme.sandBorder,
          }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="trophy" size={26} color={theme.solGold} />
              <Text style={[styles.modalTitle, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
                Todos los Rangos
              </Text>
            </View>
            <Text style={[styles.modalDescription, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
              Tu progreso:{' '}
              <Text style={{ fontWeight: '900', color: currentRank.color }}>
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
                    style={[styles.rankItem, {
                      backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground,
                      borderColor: isCurrent ? rank.color : (isDark ? '#444' : theme.sandBorder),
                    }, !isUnlocked && { opacity: 0.5 }]}
                  >
                    <View style={[styles.rankIconCircle, {
                      backgroundColor: isUnlocked ? rank.color : (isDark ? '#333' : '#E0E0E0'),
                    }]}>
                      <Ionicons
                        name={isUnlocked ? rank.icon : 'lock-closed'}
                        size={22}
                        color="#FFFFFF"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rankName, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
                        {rank.name}
                        <Text style={[styles.rankGuarani, { color: isDark ? '#B0B0B0' : theme.textMuted }]}>
                          {' '}· {rank.nameGuarani}
                        </Text>
                      </Text>
                      <Text style={[styles.rankXp, { color: isDark ? '#B0B0B0' : theme.textMuted }]}>
                        {rank.minXp === 0 ? 'Desde el inicio' : `${rank.minXp} XP`}
                      </Text>
                    </View>
                    {isCurrent && (
                      <View style={[styles.rankCurrentBadge, { backgroundColor: rank.color }]}>
                        <Text style={styles.rankCurrentText}>ACTUAL</Text>
                      </View>
                    )}
                    {isUnlocked && !isCurrent && (
                      <Ionicons name="checkmark-circle" size={22} color={theme.successGreen} />
                    )}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.modalCloseButton, {
                backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground,
                borderColor: isDark ? '#444' : theme.sandBorder,
              }]}
              onPress={() => setShowAllRanks(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalCloseButtonText, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═══════════ MODAL: VARIANTE DIALECTAL ═══════════ */}
      <Modal visible={showSettingsModal} transparent animationType="slide" onRequestClose={() => setShowSettingsModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, {
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderColor: isDark ? '#333' : theme.sandBorder,
          }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="options" size={26} color={theme.montePrimary} />
              <Text style={[styles.modalTitle, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
                Cambiar Variante Dialectal
              </Text>
            </View>
            <Text style={[styles.modalDescription, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
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
                    style={[styles.variantOption, {
                      backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground,
                      borderColor: isSelected 
                        ? theme.montePrimary 
                        : (isDark ? '#444' : theme.sandBorder),
                    }, isSelected && { backgroundColor: isDark ? '#1B4332' : theme.montePastel }]}
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
                      color={isSelected ? theme.montePrimary : theme.textMuted}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.variantName, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
                        {variant.name}
                      </Text>
                      <Text style={[styles.variantRegion, { color: isDark ? '#B0B0B0' : theme.textMuted }]}>
                        {variant.region}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.variantBadge, { backgroundColor: theme.montePrimary }]}>
                        <Text style={styles.variantBadgeText}>ACTUAL</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.modalCloseButton, {
                backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground,
                borderColor: isDark ? '#444' : theme.sandBorder,
              }]}
              onPress={() => setShowSettingsModal(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalCloseButtonText, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═══════════ MODAL: LOGOUT ═══════════ */}
      <Modal visible={showLogoutConfirm} transparent animationType="fade" onRequestClose={() => setShowLogoutConfirm(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.confirmCard, {
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderColor: isDark ? '#333' : theme.sandBorder,
          }]}>
            <View style={[styles.confirmIconCircle, {
              backgroundColor: isDark ? '#3A1B1B' : '#FFE5E5',
            }]}>
              <Ionicons name="log-out-outline" size={36} color={theme.errorRed} />
            </View>
            <Text style={[styles.confirmTitle, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
              ¿Cerrar Sesión?
            </Text>
            <Text style={[styles.confirmMessage, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
              Tendrás que iniciar sesión de nuevo para continuar tu aprendizaje.
            </Text>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmBtn, {
                  backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground,
                  borderColor: isDark ? '#444' : theme.sandBorder,
                  borderWidth: 2,
                }]}
                onPress={() => setShowLogoutConfirm(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.confirmBtnCancelText, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, {
                  backgroundColor: theme.errorRed,
                  borderBottomWidth: 3,
                  borderBottomColor: '#B71C1C',
                }]}
                onPress={handleLogout}
                activeOpacity={0.85}
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

// 🎬 Componente reutilizable para estadísticas
function StatBox({ icon, iconColor, value, label, theme, isDark }) {
  return (
    <View style={[styles.statBox, {
      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
      borderColor: isDark ? '#333' : theme.sandBorder,
    }]}>
      <View style={[styles.statIconCircle, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={26} color={iconColor} />
      </View>
      <Text style={[styles.statValue, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // ═══════════ HEADER PERFIL ═══════════
  profileHeaderCard: {
    borderRadius: 26,
    padding: 22,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarTouchable: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  avatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  // 📸 Imagen del avatar
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 44,
  },
  // 📸 Botón "Agregar foto"
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 12,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '800',
  },
  removePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 4,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  removePhotoText: {
    fontSize: 11,
    fontWeight: '700',
  },
  userName: { fontSize: 24, fontWeight: '900', marginTop: 12 },
  userEmail: { fontSize: 13, marginTop: 3 },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    marginTop: 12,
    gap: 6,
  },
  rankBadgeText: { fontSize: 13, fontWeight: '800' },

  rankProgressContainer: { width: '100%', marginTop: 18 },
  rankProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rankProgressLabel: { fontSize: 11, fontWeight: '800' },
  rankProgressBg: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  rankProgressFill: { height: '100%', borderRadius: 6 },
  rankProgressText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  maxRankBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 8,
  },
  maxRankText: { fontSize: 14, fontWeight: '900', color: '#FFFFFF' },

  viewRanksBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  viewRanksBtnText: { fontSize: 12, fontWeight: '900' },
  joinedText: { fontSize: 11, marginTop: 12, fontStyle: 'italic' },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
    marginLeft: 4,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  statIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  ageSelectorCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    marginBottom: 4,
  },
  ageHint: {
    fontSize: 12,
    marginBottom: 14,
    fontStyle: 'italic',
  },
  ageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
    marginBottom: 10,
    gap: 12,
  },
  ageRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ageLabel: { fontSize: 14, fontWeight: '800' },
  ageSubtext: { fontSize: 11, marginTop: 2 },
  saveAgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.2)',
    marginTop: 6,
  },
  saveAgeButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },

  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  achievementCard: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
  },
  medalCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  achievementGuarani: {
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  achievementDesc: {
    fontSize: 10,
    textAlign: 'center',
    marginVertical: 6,
    lineHeight: 13,
  },
  achievementProgressBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  achievementProgressFill: { height: '100%', borderRadius: 3 },
  progressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  progressBadgeText: { fontSize: 10, fontWeight: '900' },

  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 2,
    marginBottom: 12,
    gap: 10,
  },
  settingsButtonText: { fontSize: 14, fontWeight: '900' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 2,
    gap: 10,
  },
  logoutButtonText: { fontSize: 14, fontWeight: '900' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 22,
    borderWidth: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: '900' },
  modalDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },

  ranksList: { gap: 8, marginBottom: 16 },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 2,
  },
  rankIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankName: { fontSize: 14, fontWeight: '800' },
  rankGuarani: { fontSize: 12, fontStyle: 'italic', fontWeight: '600' },
  rankXp: { fontSize: 11, marginTop: 2 },
  rankCurrentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rankCurrentText: { fontSize: 9, fontWeight: '900', color: '#FFFFFF' },

  variantList: { gap: 10, marginBottom: 16 },
  variantOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    gap: 12,
  },
  variantName: { fontSize: 14, fontWeight: '800' },
  variantRegion: { fontSize: 11, marginTop: 2 },
  variantBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  variantBadgeText: { fontSize: 9, fontWeight: '900', color: '#FFFFFF' },
  modalCloseButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
  },
  modalCloseButtonText: { fontSize: 14, fontWeight: '800' },

  confirmCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  confirmIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  confirmButtons: { flexDirection: 'row', gap: 10, width: '100%' },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnCancelText: { fontSize: 13, fontWeight: '800' },
  confirmBtnConfirmText: { fontSize: 13, fontWeight: '900', color: '#FFFFFF' },
});