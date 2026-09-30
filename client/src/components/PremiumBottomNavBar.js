import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';

const getLabelSize = () => {
  if (IS_WEB) return 11;
  if (width < 360) return 8.5;
  if (width < 400) return 9.5;
  if (width < 500) return 10;
  return 10.5;
};

const LABEL_SIZE = getLabelSize();
const ICON_SIZE = IS_WEB ? 22 : 20;

const TABS = [
  { key: 'learn', label: 'Aprender', icon: 'map', outlineIcon: 'map-outline', color: '#2D6A4F', colorDark: '#52B788' },
  { key: 'translator', label: 'Traducir', icon: 'language', outlineIcon: 'language-outline', color: '#C85A32', colorDark: '#FFB86B' },
  { key: 'stories', label: 'Historias', icon: 'book', outlineIcon: 'book-outline', color: '#8E24AA', colorDark: '#CE93D8' },
  { key: 'leagues', label: 'Ligas', icon: 'trophy', outlineIcon: 'trophy-outline', color: '#E9C46A', colorDark: '#FFD166' },
  { key: 'shop', label: 'Tienda', icon: 'cart', outlineIcon: 'cart-outline', color: '#0288D1', colorDark: '#4FC3F7', badge: 2 },
  { key: 'profile', label: 'Perfil', icon: 'person', outlineIcon: 'person-outline', color: '#7CB342', colorDark: '#95D5B2' },
];

function BounceIcon({ children, isActive }) {
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const prevActive = useRef(isActive);

  useEffect(() => {
    if (isActive && !prevActive.current) {
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 0.9, duration: 100, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 1.15, friction: 4, tension: 100, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      ]).start();
    }
    prevActive.current = isActive;
  }, [isActive]);

  return (
    <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
      {children}
    </Animated.View>
  );
}

function AnimatedBadge({ count }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.badgeContainer,
        { transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] }
      ]}
    >
      <LinearGradient
        colors={['#FF5252', '#C62828']}
        style={styles.badgeGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.badgeText}>{count}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

function Ripple({ trigger, color }) {
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      rippleAnim.setValue(0);
      Animated.timing(rippleAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
    }
  }, [trigger]);

  const scale = rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.2] });
  const opacity = rippleAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.2, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ripple, { backgroundColor: color, opacity, transform: [{ scale }] }]}
    />
  );
}

export default function PremiumBottomNavBar() {
  const { theme, isDark } = useTheme();
  const { activeTab, setActiveTab } = useApp();

  const activeIndex = TABS.findIndex(t => t.key === activeTab);
  const activeTabData = TABS[activeIndex] || TABS[0];
  const tabWidth = width / TABS.length;

  const pillAnim = useRef(new Animated.Value(activeIndex)).current;
  const [rippleTrigger, setRippleTrigger] = useState(0);

  useEffect(() => {
    Animated.spring(pillAnim, {
      toValue: activeIndex,
      useNativeDriver: true,
      friction: 8,
      tension: 65,
    }).start();
  }, [activeIndex]);

  const pillWidth = Math.min(tabWidth - 6, 54);
  const translateX = pillAnim.interpolate({
    inputRange: TABS.map((_, i) => i),
    outputRange: TABS.map((_, i) => i * tabWidth + (tabWidth - pillWidth) / 2),
  });

  const handleTabPress = (tab) => {
    setRippleTrigger(prev => prev + 1);
    setActiveTab(tab.key);
  };

  return (
    <View style={styles.wrapper}>
      {/* Línea superior de acento según el tab activo */}
      <LinearGradient
        colors={
          isDark
            ? ['transparent', activeTabData.colorDark + '60', 'transparent']
            : ['transparent', activeTabData.color + '60', 'transparent']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topAccent}
        pointerEvents="none"
      />

      <View style={[
        styles.navBar,
        {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        }
      ]}>
        {/* Píldora deslizante */}
        <Animated.View
          style={[
            styles.pillWrapper,
            { width: pillWidth, transform: [{ translateX }] }
          ]}
        >
          <LinearGradient
            colors={
              isDark
                ? [activeTabData.colorDark + '50', activeTabData.colorDark + '18']
                : [activeTabData.color + '35', activeTabData.color + '12']
            }
            style={styles.pill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </Animated.View>

        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const activeColor = isDark ? tab.colorDark : tab.color;
          const inactiveColor = isDark ? '#757575' : theme.textMuted;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.9}
            >
              {isActive && <Ripple trigger={rippleTrigger} color={activeColor} />}

              <BounceIcon isActive={isActive}>
                <View style={styles.iconWrapper}>
                  <Ionicons
                    name={isActive ? tab.icon : tab.outlineIcon}
                    size={ICON_SIZE}
                    color={isActive ? activeColor : inactiveColor}
                  />
                  {tab.badge && <AnimatedBadge count={tab.badge} />}
                </View>
              </BounceIcon>

              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? activeColor : inactiveColor,
                    fontSize: LABEL_SIZE,
                  },
                  isActive && styles.tabLabelActive,
                ]}
                numberOfLines={1}
                allowFontScaling={false}
              >
                {tab.label}
              </Text>

              {/* Punto indicador SOLO debajo del label activo */}
              {isActive && (
                <View
                  style={[
                    styles.activeDot,
                    { backgroundColor: activeColor }
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    width: '100%',
  },
  topAccent: {
    height: 2,
    width: '100%',
  },
  navBar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 16 : 10,
    paddingHorizontal: 0,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 14,
    position: 'relative',
    width: '100%',
  },
  pillWrapper: {
    position: 'absolute',
    top: 6,
    left: 0,
    height: 40,
    zIndex: 0,
  },
  pill: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 1,
    position: 'relative',
    minWidth: 0,
    paddingHorizontal: 2,
    height: 58,
    paddingTop: 6,
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -6,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeGradient: {
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#C62828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    lineHeight: 10,
  },
  tabLabel: {
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'center',
    width: '100%',
    letterSpacing: 0.1,
    lineHeight: 14,
  },
  tabLabelActive: {
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  ripple: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    zIndex: -1,
    top: 6,
  },
});