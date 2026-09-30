import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// 🕊️ Pájaros volando
function FlyingBirds({ isDark }) {
  const birds = [
    { delay: 0, size: 14, top: 180, duration: 18000 },
    { delay: 3000, size: 12, top: 220, duration: 20000 },
    { delay: 6000, size: 16, top: 150, duration: 22000 },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {birds.map((bird, i) => (
        <FlyingBird key={i} {...bird} isDark={isDark} />
      ))}
    </View>
  );
}

function FlyingBird({ delay, size, top, duration, isDark }) {
  const moveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(moveAnim, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateX = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, width + 50],
  });

  return (
    <Animated.Text
      style={[
        styles.bird,
        {
          top,
          fontSize: size,
          opacity: isDark ? 0.12 : 0.22,
          transform: [{ translateX }],
        }
      ]}
    >
      🕊️
    </Animated.Text>
  );
}

// ✨ Partículas doradas flotantes
function GoldenParticles({ isDark }) {
  const particles = [...Array(12)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: Math.random() * height,
    size: 3 + Math.random() * 5,
    delay: Math.random() * 4000,
    duration: 4000 + Math.random() * 3000,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map(p => (
        <FloatingParticle key={p.id} {...p} isDark={isDark} />
      ))}
    </View>
  );
}

function FloatingParticle({ left, top, size, delay, duration, isDark }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(floatAnim, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  const opacity = floatAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, isDark ? 0.7 : 0.5, 0],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left,
          top,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isDark ? '#FFD166' : '#F4A261',
          opacity,
          transform: [{ translateY }],
        }
      ]}
    />
  );
}

// 🌟 Luciérnagas (solo en modo noche)
function Fireflies() {
  const flies = [...Array(8)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: Math.random() * height,
    delay: Math.random() * 4000,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {flies.map(f => (
        <Firefly key={f.id} {...f} />
      ))}
    </View>
  );
}

function Firefly({ left, top, delay }) {
  const glow = useRef(new Animated.Value(0)).current;
  const move = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(glow, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(move, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(move, { toValue: -1, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateX = move.interpolate({
    inputRange: [-1, 1],
    outputRange: [-30, 30],
  });

  const translateY = move.interpolate({
    inputRange: [-1, 1],
    outputRange: [20, -20],
  });

  return (
    <Animated.View
      style={[
        styles.firefly,
        {
          left,
          top,
          opacity: glow,
          transform: [{ translateX }, { translateY }],
        }
      ]}
    />
  );
}

export default function PathBackground({ isDark }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <GoldenParticles isDark={isDark} />
      <FlyingBirds isDark={isDark} />
      {isDark && <Fireflies />}
    </View>
  );
}

const styles = StyleSheet.create({
  bird: {
    position: 'absolute',
  },
  particle: {
    position: 'absolute',
  },
  firefly: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFEB3B',
    shadowColor: '#FFEB3B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
});