import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

export default function Header({ onVariantPress = null, onHeartsPress = null }) {
  const { user } = useApp();
  const { theme, isDark, toggleTheme } = useTheme();
  const [timeLeft, setTimeLeft] = useState(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const heartRegenAt = user?.heartRegenAt || user?.heart_regen_at;
  const hearts = user?.hearts ?? 5;
  const maxHearts = user?.maxHearts ?? 5;

  // Animación de rotación del ícono al cambiar tema
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isDark ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [isDark]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

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
    <View style={[
      styles.headerContainer,
      {
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        borderBottomColor: isDark ? '#333333' : theme.sandBorder,
      }
    ]}>
      <TouchableOpacity
        style={[
          styles.variantPill,
          {
            backgroundColor: isDark ? '#1B4332' : theme.montePastel,
            borderColor: isDark ? '#52B788' : theme.monteMedium,
          }
        ]}
        onPress={onVariantPress}
        activeOpacity={0.7}
      >
        <Ionicons name="location" size={12} color={isDark ? '#95D5B2' : theme.montePrimary} />
        <Text
          style={[styles.variantText, { color: isDark ? '#95D5B2' : theme.monteDark }]}
          numberOfLines={1}
        >
          {variantLabel}
        </Text>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        {/* 🔥 Racha */}
        <View style={[
          styles.statPill,
          {
            backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground,
            borderColor: isDark ? '#444444' : theme.sandBorder,
          }
        ]}>
          <Ionicons name="flame" size={14} color={theme.tataFire} />
          <Text style={[styles.statValue, { color: theme.tataFire }]}>
            {user.streakDays}
          </Text>
        </View>

        {/* 🪙 Monedas */}
        <View style={[
          styles.statPill,
          {
            backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground,
            borderColor: isDark ? '#444444' : theme.sandBorder,
          }
        ]}>
          <Ionicons name="color-filter" size={13} color={theme.terracotaMedium} />
          <Text style={[styles.statValue, { color: theme.terracotaMedium }]}>
            {user.coinsMbae}
          </Text>
        </View>

        {/* ❤️ Corazones */}
        <TouchableOpacity
          style={[
            styles.heartsPill,
            {
              backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground,
              borderColor: isDark ? '#444444' : theme.sandBorder,
            }
          ]}
          onPress={onHeartsPress}
          activeOpacity={0.7}
        >
          <View style={styles.heartsRow}>
            {Array.from({ length: maxHearts }).map((_, i) => (
              <Ionicons
                key={i}
                name={i < hearts ? 'heart' : 'heart-outline'}
                size={14}
                color={i < hearts ? theme.errorRed : (isDark ? '#555555' : '#C0C0C0')}
                style={styles.heartIcon}
              />
            ))}
          </View>
          {timeLeft && (
            <Text style={[styles.timerText, { color: theme.textMuted }]}>{timeLeft}</Text>
          )}
        </TouchableOpacity>

        {/* 🌙 BOTÓN DE MODO DÍA/NOCHE */}
        <TouchableOpacity
          style={[
            styles.themeToggle,
            {
              backgroundColor: isDark ? '#4A3A1F' : '#FFF4E6',
              borderColor: isDark ? '#FFD166' : '#F4A261',
            }
          ]}
          onPress={toggleTheme}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={18}
              color={isDark ? '#FFD166' : '#C85A32'}
            />
          </Animated.View>
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
    borderBottomWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  variantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1.2,
    maxWidth: 100,
  },
  variantText: {
    fontSize: 11,
    fontWeight: '700',
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
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 11,
    borderWidth: 1,
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
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 11,
    borderWidth: 1,
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
    marginTop: 1,
  },
  themeToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});