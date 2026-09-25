import React, { useRef, useEffect } from 'react';
import { Animated, Pressable } from 'react-native';

/**
 * Envoltorio para cualquier botón: al presionar, rebota marcado.
 * Si pulse=true, además "respira" (pulsa suavemente) todo el tiempo para
 * llamar la atención, como un botón de llamada a la acción.
 * Uso: <PressableScale onPress={...} style={misEstilos} pulse>{children}</PressableScale>
 */
export default function PressableScale({ children, onPress, style, disabled, pulse, ...rest }) {
  const scale = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, { toValue: 1.035, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseValue, { toValue: 1, duration: 700, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const animateTo = (value) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 30,
      bounciness: 18
    }).start();
  };

  return (
    <Pressable
      onPressIn={() => !disabled && animateTo(0.88)}
      onPressOut={() => !disabled && animateTo(1)}
      onPress={onPress}
      disabled={disabled}
      {...rest}
    >
      <Animated.View
        style={[
          style,
          { transform: [{ scale: Animated.multiply(scale, pulse ? pulseValue : 1) }] }
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}