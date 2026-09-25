import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export default function Header({ onVariantPress = null, onHeartsPress = null }) {
  const { user } = useApp();
  const [timeLeft, setTimeLeft] = useState(null);

  // Acepta ambos formatos: camelCase y snake_case
  const heartRegenAt = user?.heartRegenAt || user?.heart_regen_at;

  useEffect(() => {
    if (!heartRegenAt || (user?.hearts ?? 0) >= (user?.maxHearts ?? 5)) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const regenAt = new Date(heartRegenAt).getTime();
      const now = Date.now();
      const diff = regenAt - now;

      if (diff <= 0) {
        setTimeLeft('00:00');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [heartRegenAt, user?.hearts, user?.maxHearts]);

  if (!user) return null;

  const variantLabel = user.dialectVariant === 'izoceño'
    ? 'Izoceño'
    : user.dialectVariant === 'simba'
    ? 'Simba'
    : 'Ava Guaraní';

  const hearts = user.hearts ?? 5;

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.variantPill}
        onPress={onVariantPress}
        activeOpacity={0.7}
      >
        <Ionicons name="location" size={12} color={colors.montePrimary} />
        <Text style={styles.variantText} numberOfLines={1}>{variantLabel}</Text>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        {/* Streak */}
        <View style={styles.statPill}>
          <Ionicons name="flame" size={14} color={colors.tataFire} />
          <Text style={[styles.statValue, { color: colors.tataFire }]}>
            {user.streakDays}
          </Text>
        </View>

        {/* Coins */}
        <View style={styles.statPill}>
          <Ionicons name="color-filter" size={13} color={colors.terracotaMedium} />
          <Text style={[styles.statValue, { color: colors.terracotaMedium }]}>
            {user.coinsMbae}
          </Text>
        </View>

        {/* Hearts con timer + onPress */}
        <TouchableOpacity
          style={styles.statPill}
          onPress={onHeartsPress}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={14} color={colors.errorRed} />
          <Text style={[styles.statValue, { color: colors.errorRed }]}>
            {hearts}
          </Text>
          {timeLeft && (
            <Text style={styles.timerText}>{timeLeft}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: colors.monteMedium,
    maxWidth: 110,
  },
  variantText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.monteDark,
    marginLeft: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sandBackground,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.sandBorder,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 3,
  },
  timerText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    marginLeft: 2,
  },
});