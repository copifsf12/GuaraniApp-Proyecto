import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export default function Header({ onVariantPress = null }) {
  const { user } = useApp();

  const variantLabel = user.dialectVariant === 'izoceño'
    ? 'Izoceño'
    : user.dialectVariant === 'simba'
    ? 'Simba'
    : 'Ava Guaraní';

  return (
    <View style={styles.headerContainer}>
      {/* Dialect Indicator Pill */}
      <TouchableOpacity
        style={styles.variantPill}
        onPress={onVariantPress}
        activeOpacity={0.7}
      >
        <Ionicons name="location" size={16} color={colors.montePrimary} />
        <Text style={styles.variantText}>{variantLabel}</Text>
      </TouchableOpacity>

      {/* Gamification Counters */}
      <View style={styles.statsContainer}>
        {/* Streak Flame (Tatá) */}
        <View style={styles.statPill}>
          <Ionicons name="flame" size={20} color={colors.tataFire} />
          <Text style={[styles.statValue, { color: colors.tataFire }]}>
            {user.streakDays}
          </Text>
        </View>

        {/* Pottery Jar Coins (Yapepó / Mba'e) */}
        <View style={styles.statPill}>
          <Ionicons name="color-filter" size={18} color={colors.terracotaMedium} />
          <Text style={[styles.statValue, { color: colors.terracotaMedium }]}>
            {user.coinsMbae}
          </Text>
        </View>

        {/* Hearts (Vidas / Semillas) */}
        <View style={styles.statPill}>
          <Ionicons name="heart" size={19} color={colors.errorRed} />
          <Text style={[styles.statValue, { color: colors.errorRed }]}>
            {user.hearts}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: colors.sandBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  variantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.montePastel,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.monteMedium,
  },
  variantText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.monteDark,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sandBackground,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.sandBorder,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 4,
  },
});
