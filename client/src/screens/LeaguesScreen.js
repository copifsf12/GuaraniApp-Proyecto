import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  RefreshControl, Animated, Easing, Dimensions, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';

const { width } = Dimensions.get('window');
const AUTO_REFRESH_MS = 30000;

// 🎬 Podio animado: los avatares suben uno por uno
function AnimatedPodium({ top3, theme, isDark }) {
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;
  const shine1 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación escalonada: 3ro → 2do → 1ro
    Animated.sequence([
      Animated.timing(anim3, { toValue: 1, duration: 400, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      Animated.timing(anim2, { toValue: 1, duration: 400, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      Animated.timing(anim1, { toValue: 1, duration: 500, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
    ]).start();

    // Shine continuo en el 1er lugar
    Animated.loop(
      Animated.sequence([
        Animated.timing(shine1, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(shine1, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const shineScale = shine1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const shineOpacity = shine1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.4],
  });

  return (
    <View style={styles.podiumSection}>
      <Text style={[styles.podiumTitle, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
        🌟 Podio de Honor
      </Text>
      <View style={styles.podiumRow}>
        {/* 2do lugar */}
        {top3[1] && (
          <Animated.View
            style={[
              styles.podiumItem,
              {
                opacity: anim2,
                transform: [{
                  translateY: anim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [80, 0],
                  })
                }]
              }
            ]}
          >
            <View style={[styles.podiumAvatar, { backgroundColor: '#C0C0C0' }]}>
              <Ionicons name={top3[1].avatar || 'person'} size={26} color="#FFFFFF" />
            </View>
            <Text style={styles.podiumEmoji}>🥈</Text>
            <Text style={[styles.podiumName, { color: isDark ? '#F5F5F5' : theme.textPrimary }]} numberOfLines={1}>
              {top3[1].name}
            </Text>
            <View style={[styles.podiumScore, { backgroundColor: '#C0C0C0' }]}>
              <Text style={styles.podiumScoreText}>{top3[1].xp} XP</Text>
            </View>
            <View style={[styles.podiumBase, { height: 60, backgroundColor: '#E0E0E0' }]} />
          </Animated.View>
        )}

        {/* 1er lugar */}
        {top3[0] && (
          <Animated.View
            style={[
              styles.podiumItem,
              styles.podiumItemFirst,
              {
                opacity: anim1,
                transform: [{
                  translateY: anim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  })
                }]
              }
            ]}
          >
            {/* Halo brillante animado detrás del 1er lugar */}
            <Animated.View
              style={[
                styles.crownHalo,
                {
                  opacity: shineOpacity,
                  transform: [{ scale: shineScale }],
                }
              ]}
            />
            <View style={[styles.podiumAvatar, styles.podiumAvatarFirst, { backgroundColor: '#FFD700' }]}>
              <Ionicons name={top3[0].avatar || 'person'} size={32} color="#FFFFFF" />
            </View>
            <Text style={[styles.podiumEmoji, { fontSize: 32 }]}>🥇</Text>
            <Text
              style={[
                styles.podiumName,
                { color: isDark ? '#FFD166' : theme.terracotaDark, fontSize: 15 }
              ]}
              numberOfLines={1}
            >
              {top3[0].name}
            </Text>
            <View style={[styles.podiumScore, { backgroundColor: '#FFD700' }]}>
              <Text style={[styles.podiumScoreText, { color: '#B8860B' }]}>{top3[0].xp} XP</Text>
            </View>
            <View style={[styles.podiumBase, { height: 90, backgroundColor: '#FFD700' }]} />
          </Animated.View>
        )}

        {/* 3er lugar */}
        {top3[2] && (
          <Animated.View
            style={[
              styles.podiumItem,
              {
                opacity: anim3,
                transform: [{
                  translateY: anim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0],
                  })
                }]
              }
            ]}
          >
            <View style={[styles.podiumAvatar, { backgroundColor: '#CD7F32' }]}>
              <Ionicons name={top3[2].avatar || 'person'} size={26} color="#FFFFFF" />
            </View>
            <Text style={styles.podiumEmoji}>🥉</Text>
            <Text style={[styles.podiumName, { color: isDark ? '#F5F5F5' : theme.textPrimary }]} numberOfLines={1}>
              {top3[2].name}
            </Text>
            <View style={[styles.podiumScore, { backgroundColor: '#CD7F32' }]}>
              <Text style={styles.podiumScoreText}>{top3[2].xp} XP</Text>
            </View>
            <View style={[styles.podiumBase, { height: 50, backgroundColor: '#F0C090' }]} />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

export default function LeaguesScreen() {
  const { theme, isDark } = useTheme();
  const { user, leaderboard, userRank, loadLeaderboard } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadLeaderboard();
    }, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const getDaysUntilClose = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    return daysUntilMonday;
  };

  const daysLeft = getDaysUntilClose();

  const getUserPositionMessage = () => {
    if (!userRank || leaderboard.length === 0) return null;
    const myEntry = leaderboard.find(u => u.isUser);
    if (!myEntry) return null;

    if (userRank === 1) {
      const second = leaderboard[1];
      if (second) {
        const diff = myEntry.xp - second.xp;
        return `¡Vas primero! ${second.name} está a ${diff} XP de alcanzarte.`;
      }
      return '¡Vas primero! ¡Sigue así!';
    }

    const above = leaderboard[userRank - 2];
    if (above) {
      const diff = above.xp - myEntry.xp;
      return `Vas #${userRank}. Te faltan ${diff} XP para alcanzar a ${above.name}.`;
    }
    return `Vas en posición #${userRank}.`;
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const top3 = leaderboard.slice(0, 3);
  const myEntry = leaderboard.find(u => u.isUser);
  const aboveEntry = userRank && userRank > 1 ? leaderboard[userRank - 2] : null;
  const xpToNextRank = aboveEntry && myEntry ? aboveEntry.xp - myEntry.xp : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.sandBackground }]}>
      <Header onHeartsPress={() => {}} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.montePrimary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER PRINCIPAL */}
        <LinearGradient
          colors={isDark ? ['#4A2A1A', '#2A1508'] : ['#FFE8D6', '#FFD3A5']}
          style={styles.mainHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.mainHeaderEyebrow}>LIGA DEL CHACO</Text>
          <Text style={[styles.mainHeaderTitle, { color: isDark ? '#FFD166' : theme.terracotaDark }]}>
            Tabla de Líderes
          </Text>
          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={14} color={isDark ? '#FFD166' : theme.terracotaDark} />
            <Text style={[styles.timerText, { color: isDark ? '#FFD166' : theme.terracotaDark }]}>
              Faltan {daysLeft} {daysLeft === 1 ? 'día' : 'días'} para el cierre
            </Text>
          </View>
        </LinearGradient>

        {/* TU POSICIÓN */}
        {userRank && leaderboard.length > 0 && (
          <LinearGradient
            colors={isDark ? ['#2D6A4F', '#1B4332'] : ['#FFE8A3', '#FFD54F']}
            style={styles.positionBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.positionEmoji}>
              {userRank === 1 ? '🏆' : userRank <= 3 ? '🎯' : '🚀'}
            </Text>
            <Text style={[styles.positionText, { color: isDark ? '#FFD166' : theme.terracotaDark }]}>
              {getUserPositionMessage()}
            </Text>
          </LinearGradient>
        )}

        {/* PODIO ANIMADO */}
        {top3.length >= 1 && (
          <AnimatedPodium top3={top3} theme={theme} isDark={isDark} />
        )}

        {/* LEYENDA CON TOOLTIP */}
        <TouchableOpacity
          style={styles.legendRow}
          activeOpacity={0.8}
          onPress={() => setShowTooltip(!showTooltip)}
        >
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.successGreen }]} />
            <Text style={[styles.legendText, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
              Zona de Ascenso (Top 5)
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.errorRed }]} />
            <Text style={[styles.legendText, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
              Zona de Descenso (Últimos 3)
            </Text>
          </View>
        </TouchableOpacity>

        {/* Tooltip expandible */}
        {showTooltip && (
          <View style={[
            styles.tooltipBox,
            {
              backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
              borderColor: isDark ? '#444' : theme.sandBorder,
            }
          ]}>
            <Ionicons name="information-circle" size={18} color={theme.montePrimary} />
            <Text style={[styles.tooltipText, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
              Los 5 primeros suben de liga al final de la semana. Los últimos 3 bajan.
              ¡Mantente activo para no descender!
            </Text>
          </View>
        )}

        {/* LISTA DE COMPETIDORES */}
        <View style={[styles.leaderboardBox, {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderColor: isDark ? '#333' : theme.sandBorder,
        }]}>
          <View style={[styles.leaderboardHeader, { borderBottomColor: isDark ? '#333' : theme.sandBorder }]}>
            <Text style={[styles.leaderboardHeaderText, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
              🏆 Top {leaderboard.length} competidores
            </Text>
          </View>

          {leaderboard.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyText, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                Cargando competidores...
              </Text>
              <Text style={[styles.emptySubtext, { color: isDark ? '#757575' : theme.textMuted }]}>
                ¡Sé el primero en aparecer!
              </Text>
            </View>
          ) : (
            leaderboard.map((item, index) => {
              // Si es el usuario Y ya se muestra fijo abajo, saltarlo aquí
              if (item.isUser && userRank > 10) return null;

              const isPromotion = index < 5;
              const isDemotion = index >= leaderboard.length - 3 && leaderboard.length > 10;
              const rankEmoji = getRankEmoji(item.rank);

              return (
                <View
                  key={item.id || index}
                  style={[
                    styles.userRow,
                    { backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground },
                    item.isUser && {
                      backgroundColor: isDark ? '#1B4332' : theme.solLight,
                      borderWidth: 2,
                      borderColor: theme.solGold,
                    },
                    isPromotion && !item.isUser && { borderLeftWidth: 4, borderLeftColor: theme.successGreen },
                    isDemotion && !item.isUser && { borderLeftWidth: 4, borderLeftColor: theme.errorRed },
                  ]}
                >
                  <View style={styles.rankBadge}>
                    {rankEmoji ? (
                      <Text style={{ fontSize: 22 }}>{rankEmoji}</Text>
                    ) : (
                      <Text style={[
                        styles.rankText,
                        { color: isDark ? '#B0B0B0' : theme.textSecondary },
                        item.isUser && { color: theme.solGold, fontWeight: '900' },
                      ]}>
                        {item.rank}
                      </Text>
                    )}
                  </View>

                  <View style={[
                    styles.avatarCircle,
                    {
                      backgroundColor: item.isUser
                        ? theme.montePrimary
                        : isDark ? '#333' : theme.sandBackground,
                    },
                    isPromotion && !item.isUser && { backgroundColor: theme.successGreen + '30' },
                    isDemotion && !item.isUser && { backgroundColor: theme.errorRed + '30' },
                  ]}>
                    <Ionicons
                      name={item.avatar || 'person'}
                      size={20}
                      color={
                        item.isUser ? '#FFFFFF'
                        : isPromotion ? theme.successGreen
                        : isDemotion ? theme.errorRed
                        : isDark ? '#B0B0B0' : theme.textPrimary
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.userName,
                      { color: isDark ? '#F5F5F5' : theme.textPrimary },
                      item.isUser && { color: theme.solGold, fontWeight: '900' },
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}{item.isUser ? ' (Tú)' : ''}
                  </Text>

                  {isPromotion && !item.isUser && (
                    <Ionicons name="chevron-up" size={18} color={theme.successGreen} style={{ marginRight: 6 }} />
                  )}
                  {isDemotion && !item.isUser && (
                    <Ionicons name="chevron-down" size={18} color={theme.errorRed} style={{ marginRight: 6 }} />
                  )}

                  <View style={[styles.scorePill, {
                    backgroundColor: item.isUser ? theme.solGold : (isDark ? '#1E1E1E' : '#FFFFFF'),
                  }]}>
                    <Text style={[styles.scoreText, {
                      color: item.isUser ? '#FFFFFF' : (isDark ? '#F5F5F5' : theme.monteDark),
                    }]}>
                      {item.xp} XP
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: isDark ? '#757575' : theme.textMuted }]}>
            🦊 Actualización automática cada 30 segundos
          </Text>
        </View>
      </ScrollView>

      {/* 🆕 TU POSICIÓN FIJA EN LA PARTE INFERIOR */}
      {myEntry && userRank > 10 && (
        <LinearGradient
          colors={isDark ? ['#1B4332', '#1B4332'] : ['#FFE8A3', '#FFD54F']}
          style={styles.stickyUserBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={[styles.rankBadge, { marginLeft: 8 }]}>
            <Text style={[styles.rankText, { color: isDark ? '#FFD166' : theme.terracotaDark, fontWeight: '900' }]}>
              {myEntry.rank}
            </Text>
          </View>
          <View style={[
            styles.avatarCircle,
            { backgroundColor: theme.montePrimary, marginLeft: 4 }
          ]}>
            <Ionicons name={myEntry.avatar || 'person'} size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[
              styles.userName,
              { color: isDark ? '#FFD166' : theme.terracotaDark, fontWeight: '900' }
            ]} numberOfLines={1}>
              {myEntry.name} (Tú)
            </Text>
            {xpToNextRank > 0 && (
              <Text style={[
                styles.stickySubtext,
                { color: isDark ? '#B0B0B0' : theme.textSecondary }
              ]}>
                Faltan {xpToNextRank} XP para subir
              </Text>
            )}
          </View>
          <View style={[styles.scorePill, { backgroundColor: theme.solGold, marginRight: 8 }]}>
            <Text style={[styles.scoreText, { color: '#FFFFFF' }]}>
              {myEntry.xp} XP
            </Text>
          </View>
        </LinearGradient>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },

  // HEADER PRINCIPAL
  mainHeader: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  mainHeaderEyebrow: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mainHeaderTitle: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  timerText: { fontSize: 12, fontWeight: '800' },

  // POSITION BANNER
  positionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  positionEmoji: { fontSize: 28 },
  positionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },

  // PODIO
  podiumSection: { marginBottom: 20 },
  podiumTitle: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
  },
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 110,
  },
  podiumItemFirst: { marginBottom: 20 },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  podiumAvatarFirst: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
  },
  crownHalo: {
    position: 'absolute',
    top: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFD700',
  },
  podiumEmoji: {
    fontSize: 22,
    marginTop: -8,
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  podiumScore: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
  },
  podiumScoreText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  podiumBase: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    opacity: 0.7,
  },

  // LEGEND
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, fontWeight: '700' },

  // TOOLTIP
  tooltipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  tooltipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  // LEADERBOARD
  leaderboardBox: {
    borderRadius: 22,
    padding: 10,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  leaderboardHeader: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  leaderboardHeaderText: {
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
  },
  rankBadge: { width: 32, alignItems: 'center' },
  rankText: { fontSize: 16, fontWeight: '900' },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    marginRight: 10,
  },
  userName: { flex: 1, fontSize: 14, fontWeight: '700' },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  scoreText: { fontSize: 12, fontWeight: '900' },

  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, fontWeight: '700' },
  emptySubtext: { fontSize: 12, marginTop: 4 },

  footerContainer: { marginTop: 20, alignItems: 'center' },
  footerText: { fontSize: 11, fontStyle: 'italic' },

  // STICKY USER BAR (tu posición fija abajo)
  stickyUserBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 12,
  },
  stickySubtext: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
});