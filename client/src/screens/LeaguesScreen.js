import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';

const AUTO_REFRESH_MS = 30000;

export default function LeaguesScreen() {
  const { user, leaderboard, userRank, communityProgress, loadLeaderboard } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  // 🎯 Carga inicial
  useEffect(() => {
    loadLeaderboard();
  }, []);

  // 🎯 Auto-refresh cada 30s (ideal para feria)
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

  // 🎯 Calcular días restantes para cierre (lunes)
  const getDaysUntilClose = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=dom, 1=lun
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    return daysUntilMonday;
  };

  const daysLeft = getDaysUntilClose();

  // 🎯 Desafío colectivo real
  const communityGoal = {
    title: 'Meta Colectiva del Mes',
    desc: 'Completar 10,000 lecciones entre todos los estudiantes para digitalizar el cuento de los abuelos izoceños.',
    target: communityProgress?.target || 10000,
    current: communityProgress?.lessons || 0,
    users: communityProgress?.users || 0,
    percent: Math.min(100, ((communityProgress?.lessons || 0) / (communityProgress?.target || 10000)) * 100),
  };

  // 🎯 Calcular mensaje de tu posición
  const getUserPositionMessage = () => {
    if (!userRank || leaderboard.length === 0) return null;
    const myEntry = leaderboard.find(u => u.isUser);
    if (!myEntry) return null;

    if (userRank === 1) {
      const second = leaderboard[1];
      if (second) {
        const diff = myEntry.xp - second.xp;
        return `🥇 ¡Vas primero! ${second.name} está a ${diff} XP de alcanzarte.`;
      }
      return '🥇 ¡Vas primero! ¡Sigue así!';
    }

    const above = leaderboard[userRank - 2];
    if (above) {
      const diff = above.xp - myEntry.xp;
      return `🎯 Vas #${userRank}. Te faltan ${diff} XP para alcanzar a ${above.name}.`;
    }
    return `Vas en posición #${userRank}.`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onHeartsPress={() => {}} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.montePrimary} />
        }
      >
        {/* 🏆 Título principal */}
        <View style={styles.mainHeader}>
          <Text style={styles.mainHeaderEyebrow}>🏆 LIGA DEL CHACO</Text>
          <Text style={styles.mainHeaderTitle}>Tabla de Líderes</Text>
          <Text style={styles.mainHeaderSubtitle}>
            ⏰ Faltan {daysLeft} {daysLeft === 1 ? 'día' : 'días'} para el cierre semanal
          </Text>
        </View>

        {/* 🎯 Banner de tu posición */}
        {userRank && leaderboard.length > 0 && (
          <View style={styles.positionBanner}>
            <Ionicons name="trophy" size={20} color={colors.solGold} />
            <Text style={styles.positionText}>{getUserPositionMessage()}</Text>
          </View>
        )}

        {/* Community Challenge */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Ionicons name="people" size={22} color={colors.aretePurple} />
            <Text style={styles.challengeTag}>DESAFÍO COLECTIVO DEL CHACO</Text>
          </View>
          <Text style={styles.challengeTitle}>{communityGoal.title}</Text>
          <Text style={styles.challengeDesc}>{communityGoal.desc}</Text>
          <Text style={styles.challengeUsers}>
            👥 {communityGoal.users} estudiantes participando
          </Text>

          <View style={styles.challengeProgressBg}>
            <View style={[styles.challengeProgressFill, { width: `${communityGoal.percent}%` }]} />
          </View>
          <View style={styles.challengeNumbers}>
            <Text style={styles.challengeCount}>{communityGoal.current.toLocaleString()} lecciones</Text>
            <Text style={styles.challengeGoal}>Meta: {communityGoal.target.toLocaleString()}</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.successGreen }]} />
            <Text style={styles.legendText}>Zona de Ascenso (Top 5)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.errorRed }]} />
            <Text style={styles.legendText}>Zona de Descenso (Últimos 3)</Text>
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboardBox}>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.leaderboardHeaderText}>
              🏆 Top {leaderboard.length > 0 ? leaderboard.length : ''} competidores
            </Text>
          </View>

          {leaderboard.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Cargando competidores...</Text>
              <Text style={styles.emptySubtext}>¡Sé el primero en aparecer!</Text>
            </View>
          ) : (
            leaderboard.map((item, index) => {
              const isPromotion = index < 5;
              const isDemotion = index >= leaderboard.length - 3 && leaderboard.length > 10;

              return (
                <View
                  key={item.id || index}
                  style={[
                    styles.userRow,
                    item.isUser && styles.currentUserRow,
                    isPromotion && styles.promotionBorder,
                    isDemotion && styles.demotionBorder,
                  ]}
                >
                  <View style={styles.rankBadge}>
                    <Text
                      style={[
                        styles.rankText,
                        index === 0 && { color: colors.solGold },
                        index === 1 && { color: '#9E9E9E' },
                        index === 2 && { color: colors.terracotaPrimary },
                      ]}
                    >
                      {item.rank}
                    </Text>
                  </View>

                  <View style={[styles.avatarCircle, item.isUser && { backgroundColor: colors.montePrimary }]}>
                    <Ionicons
                      name={item.avatar || 'person'}
                      size={20}
                      color={item.isUser ? '#FFFFFF' : colors.textPrimary}
                    />
                  </View>

                  <Text style={[styles.userName, item.isUser && styles.userNameActive]} numberOfLines={1}>
                    {item.name}{item.isUser ? ' (Tú)' : ''}
                  </Text>

                  {isPromotion && (
                    <Ionicons name="chevron-up" size={18} color={colors.successGreen} style={{ marginRight: 6 }} />
                  )}
                  {isDemotion && (
                    <Ionicons name="chevron-down" size={18} color={colors.errorRed} style={{ marginRight: 6 }} />
                  )}

                  <View style={styles.scorePill}>
                    <Text style={styles.scoreText}>{item.xp} XP</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          🦊 Actualización automática cada 30 segundos
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sandBackground },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // 🏆 Nuevo encabezado principal
  mainHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.sandBorder,
    marginBottom: 16,
    alignItems: 'center',
  },
  mainHeaderEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.terracotaPrimary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  mainHeaderTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.terracotaDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  mainHeaderSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },

  positionBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.solLight, borderRadius: 16, padding: 14,
    borderWidth: 2, borderColor: colors.solGold, marginBottom: 16,
  },
  positionText: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.terracotaDark },

  challengeCard: {
    backgroundColor: colors.aretePastel, borderRadius: 20, padding: 16,
    borderWidth: 1.5, borderColor: colors.aretePurple, marginBottom: 16,
  },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  challengeTag: { fontSize: 11, fontWeight: '800', color: colors.aretePurple, letterSpacing: 1 },
  challengeTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  challengeDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  challengeUsers: { fontSize: 11, fontWeight: '700', color: colors.aretePurple, marginTop: 6 },
  challengeProgressBg: {
    height: 10, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 5,
    overflow: 'hidden', marginTop: 10,
  },
  challengeProgressFill: { height: '100%', backgroundColor: colors.aretePurple, borderRadius: 5 },
  challengeNumbers: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  challengeCount: { fontSize: 12, fontWeight: '800', color: colors.aretePurple },
  challengeGoal: { fontSize: 12, color: colors.textMuted },

  legendRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 12, paddingHorizontal: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },

  leaderboardBox: {
    backgroundColor: '#FFFFFF', borderRadius: 22, padding: 10,
    borderWidth: 2, borderColor: colors.sandBorder,
  },
  leaderboardHeader: {
    paddingVertical: 8, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: colors.sandBorder,
    marginBottom: 8,
  },
  leaderboardHeaderText: {
    fontSize: 13, fontWeight: '800', color: colors.textSecondary, textAlign: 'center',
  },
  userRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    paddingHorizontal: 12, borderRadius: 14, marginBottom: 6, backgroundColor: '#FFFFFF',
  },
  currentUserRow: { backgroundColor: colors.solLight, borderWidth: 2, borderColor: colors.solGold },
  promotionBorder: { borderLeftWidth: 4, borderLeftColor: colors.successGreen },
  demotionBorder: { borderLeftWidth: 4, borderLeftColor: colors.errorRed },
  rankBadge: { width: 28, alignItems: 'center' },
  rankText: { fontSize: 16, fontWeight: '900', color: colors.textSecondary },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.sandBackground,
    justifyContent: 'center', alignItems: 'center', marginLeft: 8, marginRight: 10,
  },
  userName: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  userNameActive: { color: colors.terracotaDark, fontWeight: '900' },
  scorePill: { backgroundColor: colors.sandBackground, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  scoreText: { fontSize: 13, fontWeight: '800', color: colors.monteDark },

  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  emptySubtext: { fontSize: 12, color: colors.textMuted, marginTop: 4 },

  footerText: {
    textAlign: 'center', fontSize: 11, color: colors.textMuted,
    marginTop: 16, fontStyle: 'italic',
  },
});