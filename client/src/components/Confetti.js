import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, Platform } from 'react-native';

const { width } = Dimensions.get('window');
const EMOJIS = ['🎉', '✨', '🌟', '🦊', '🎊', '💚'];

// En web no existe el native driver de Animated; usamos JS.
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

function ConfettiPiece({ index }) {
  const translateY = useRef(new Animated.Value(-40)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const startX = Math.random() * width;
  const duration = 1800 + Math.random() * 1200;
  const emoji = EMOJIS[index % EMOJIS.length];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 500,
        duration,
        useNativeDriver: USE_NATIVE_DRIVER
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration,
        delay: duration * 0.5,
        useNativeDriver: USE_NATIVE_DRIVER
      })
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: startX,
        fontSize: 22,
        opacity,
        transform: [{ translateY }]
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

export default function Confetti({ count = 18 }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {Array.from({ length: count }).map((_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </View>
  );
}