import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export default function Header({ onVariantPress = null, onHeartsPress = null }) {
  const { user } = useApp();
  const [timeLeft, setTimeLeft] = useState(null);

  const heartRegenAt = user?.heartRegenAt || user?.heart_regen_at;
  const hearts = user?.hearts ?? 5;
  const maxHearts = user?.maxHearts ?? 5;

  useEffect(() => {
    if (!heartRegenAt || hearts >= maxHearts) {
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
  }, [heartRegenAt, hearts, maxHearts]);

  if (!user) return null;

  const variantLabel = user.dialectVariant === 'izoceño'
    ? 'Izoceño'
    : user.dialectVariant === 'simba'
    ? 'Simba'
    : 'Ava Guaraní';

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
        {/* 🔥 Racha */}
        <View style={styles.statPill}>
          <Ionicons name="flame" size={14} color={colors.tataFire} />
          <Text style={[styles.statValue, { color: colors.tataFire }]}>
            {user.streakDays}
          </Text>
        </View>

        {/* 🪙 Monedas */}
        <View style={styles.statPill}>
          <Ionicons name="color-filter" size={13} color={colors.terracotaMedium} />
          <Text style={[styles.statValue, { color: colors.terracotaMedium }]}>
            {user.coinsMbae}
          </Text>
        </View>

        {/* ❤️ Corazones individuales */}
        <TouchableOpacity
          style={styles.heartsPill}
          onPress={onHeartsPress}
          activeOpacity={0.7}
        >
          <View style={styles.heartsRow}>
            {Array.from({ length: maxHearts }).map((_, i) => (
              <Ionicons
                key={i}
                name={i < hearts ? 'heart' : 'heart-outline'}
                size={14}
                color={i < hearts ? colors.errorRed : '#C0C0C0'}
                style={styles.heartIcon}
              />
            ))}
          </View>
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
    maxWidth: 100,
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
    gap: 4,
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
  heartsPill: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sandBackground,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.sandBorder,
  },
  heartsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  heartIcon: {
    marginHorizontal: 0.5,
  },
  timerText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 1,
  },
});