import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';

export default function WalkingAguara({
  size = 140,
  // 🎯 Movimiento sutil en su lugar
  bobRange = 8,          // cuántos px sube (8 = muy sutil)
  bobDuration = 1400,    // duración de cada bob (ms)
  horizontalOffset = 0,  // mover a izq/der si hace falta
  flip = false,          // voltear el zorro
  paused = false
}) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (paused) return;

    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: bobDuration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: bobDuration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );

    float.start();
    return () => float.stop();
  }, [paused, bobDuration]);

  // Solo un pequeño bob vertical, sin desplazamiento largo
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -bobRange]
  });

  // Escala sutil (como si respirara)
  const scale = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1.02]
  });

  const flipScale = flip ? -1 : 1;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [
            { translateX: horizontalOffset },
            { translateY },
            { scaleX: flipScale },
            { scale }
          ]
        }
      ]}
      pointerEvents="none"
    >
      <LottieView
        source={require('../../assets/animations/Character_Walk.json')}
        autoPlay
        loop
        resizeMode="contain"
        style={{ width: size, height: size }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});