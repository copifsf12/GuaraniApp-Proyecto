import React, { useState, useMemo } from 'react';
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

export default function LeaguesScreen() {
  const { user, setCurrentScreen } = useApp();
  const [activeLeagueIndex, setActiveLeagueIndex] = useState(0);

  const leagues = [
    { id: 1, shortName: 'Semilla', name: 'Liga Semilla (Ra\'ỹi)', icon: 'leaf', color: colors.montePrimary },
    { id: 2, shortName: 'Vasija', name: 'Liga Vasija (Yapepó)', icon: 'color-filter', color: colors.terracotaPrimary },
    { id: 3, shortName: 'Mburuvicha', name: 'Liga del Mburuvicha', icon: 'trophy', color: colors.solGold }
  ];

  // 🎯 Usuarios base (sin rank fijo)
  const baseUsers = [
    { name: 'Kuarahy (Sol Chaqueño)', xp: 420, isUser: false, avatar: 'paw' },
    { name: 'Yasí (Luna del Oriente)', xp: 390, isUser: false, avatar: 'moon' },
    { name: 'Ñanderu (Caminante)', xp: 260, isUser: false, avatar: 'walk' },
    { name: 'Izoceño Valiente', xp: 240, isUser: false, avatar: 'shield' },
    { name: 'Ara (Tiempo Limpio)', xp: 210, isUser: false, avatar: 'sunny' },
    { name: 'Mainumby (Picaflor)', xp: 195, isUser: false, avatar: 'flower' },
    { name: 'Cordillera Verde', xp: 180, isUser: false, avatar: 'leaf' },
    { name: 'Chaco Tarijeño', xp: 170, isUser: false, avatar: 'bonfire' },
    { name: 'Parapetí Ñe\'ẽ', xp: 155, isUser: false, avatar: 'water' },
    { name: 'Simba Resiliente', xp: 140, isUser: false, avatar: 'fitness' },
    { name: 'Tatú Carreta', xp: 125, isUser: false, avatar: 'planet' },
    { name: 'Guasu Mirĩ', xp: 90, isUser: false, avatar: 'footsteps' },
    { name: 'Pirapó', xp: 60, isUser: false, avatar: 'fish' },
    { name: 'Yvytu (Viento del Sur)', xp: 30, isUser: false, avatar: 'cloudy' }
  ];

  // 🎯 Combina usuarios base + usuario actual, ordena por XP descendente y asigna rank dinámico
  const leaderboardUsers = useMemo(() => {
    const withUser = [
      ...baseUsers,
      {
        name: `${user?.username || 'Tú'} (Tú)`,
        xp: user?.xpTotal || 0,
        isUser: true,
        avatar: 'person'
      }
    ];
    // Ordenar por XP descendente
    withUser.sort((a, b) => b.xp - a.xp);
    // Asignar rank 1..n
    return withUser.map((u, i) => ({ ...u, rank: i + 1 }));
  }, [user?.xpTotal, user?.username]);

  const communityGoal = {
    title: 'Meta Colectiva del Mes',
    desc: 'Completar 10,000 lecciones entre todos los estudiantes para digitalizar el cuento de los abuelos izoceños.',
    target: 10000,
    current: 4320,
    percent: 43.2
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onHeartsPress={() => {}} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* League Selector */}
        <View style={styles.leagueBanner}>
          <View style={styles.leagueSelector}>
            {leagues.map((lg, idx) => {
              const isSelected = activeLeagueIndex === idx;
              return (
                <TouchableOpacity
                  key={lg.id}
                  style={[styles.leaguePill, isSelected && { backgroundColor: lg.color }]}
                  onPress={() => setActiveLeagueIndex(idx)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={lg.icon}
                    size={16}
                    color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Text
                    style={[styles.leaguePillText, isSelected && styles.leaguePillTextActive]}
                    numberOfLines={1}
                  >
                    {lg.shortName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.currentLeagueCard}>
            <View style={styles.leagueIconCircle}>
              <Ionicons
                name={leagues[activeLeagueIndex].icon}
                size={32}
                color="#FFFFFF"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.leagueTitle}>{leagues[activeLeagueIndex].name}</Text>
              <Text style={styles.leagueTime}>Faltan 4 días para el cierre semanal</Text>
            </View>
          </View>
        </View>

        {/* Community Challenge */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Ionicons name="people" size={22} color={colors.aretePurple} />
            <Text style={styles.challengeTag}>DESAFÍO COLECTIVO DEL CHACO</Text>
          </View>
          <Text style={styles.challengeTitle}>{communityGoal.title}</Text>
          <Text style={styles.challengeDesc}>{communityGoal.desc}</Text>

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
          {leaderboardUsers.map((item, index) => {
            const isPromotion = index < 5;
            const isDemotion = index >= leaderboardUsers.length - 3;

            return (
              <View
                key={index}
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

                <View
                  style={[
                    styles.avatarCircle,
                    item.isUser && { backgroundColor: colors.montePrimary },
                  ]}
                >
                  <Ionicons
                    name={item.avatar}
                    size={20}
                    color={item.isUser ? '#FFFFFF' : colors.textPrimary}
                  />
                </View>

                <Text
                  style={[styles.userName, item.isUser && styles.userNameActive]}
                  numberOfLines={1}
                >
                  {item.name}
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
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sandBackground },
  scrollContent: { padding: 20, paddingBottom: 40 },
  leagueBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.sandBorder,
    marginBottom: 16,
  },
  leagueSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 6,
  },
  leaguePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sandBackground,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 14,
    gap: 4,
  },
  leaguePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  leaguePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  currentLeagueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.montePastel,
    padding: 14,
    borderRadius: 16,
  },
  leagueIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.montePrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leagueTitle: { fontSize: 17, fontWeight: '800', color: colors.monteDark },
  leagueTime: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  challengeCard: {
    backgroundColor: colors.aretePastel,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.aretePurple,
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  challengeTag: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.aretePurple,
    letterSpacing: 1,
  },
  challengeTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  challengeDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  challengeProgressBg: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 10,
  },
  challengeProgressFill: { height: '100%', backgroundColor: colors.aretePurple, borderRadius: 5 },
  challengeNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  challengeCount: { fontSize: 12, fontWeight: '800', color: colors.aretePurple },
  challengeGoal: { fontSize: 12, color: colors.textMuted },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  leaderboardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 10,
    borderWidth: 2,
    borderColor: colors.sandBorder,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  currentUserRow: {
    backgroundColor: colors.solLight,
    borderWidth: 2,
    borderColor: colors.solGold,
  },
  promotionBorder: { borderLeftWidth: 4, borderLeftColor: colors.successGreen },
  demotionBorder: { borderLeftWidth: 4, borderLeftColor: colors.errorRed },
  rankBadge: { width: 28, alignItems: 'center' },
  rankText: { fontSize: 16, fontWeight: '900', color: colors.textSecondary },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.sandBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 10,
  },
  userName: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  userNameActive: { color: colors.terracotaDark, fontWeight: '900' },
  scorePill: {
    backgroundColor: colors.sandBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scoreText: { fontSize: 13, fontWeight: '800', color: colors.monteDark },
});