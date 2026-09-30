import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

export default function AnimatedAnimal({ emoji, size = 120, type = 'bounce' }) {
  const anim1 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim1.setValue(0);

    const getAnimation = () => {
      switch (type) {
        case 'wiggle':
          return Animated.loop(
            Animated.sequence([
              Animated.timing(anim1, { toValue: 1, duration: 100, useNativeDriver: true, easing: Easing.linear }),
              Animated.timing(anim1, { toValue: -1, duration: 100, useNativeDriver: true, easing: Easing.linear }),
              Animated.timing(anim1, { toValue: 0, duration: 100, useNativeDriver: true, easing: Easing.linear }),
            ])
          );
        case 'bounce':
          return Animated.loop(
            Animated.sequence([
              Animated.timing(anim1, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
              Animated.timing(anim1, { toValue: 0, duration: 500, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
            ])
          );
        case 'pulse':
          return Animated.loop(
            Animated.sequence([
              Animated.timing(anim1, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
              Animated.timing(anim1, { toValue: 0, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            ])
          );
        case 'float':
          return Animated.loop(
            Animated.sequence([
              Animated.timing(anim1, { toValue: 1, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
              Animated.timing(anim1, { toValue: 0, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            ])
          );
        case 'wobble':
          return Animated.loop(
            Animated.sequence([
              Animated.timing(anim1, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
              Animated.timing(anim1, { toValue: -1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
              Animated.timing(anim1, { toValue: 0, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            ])
          );
        case 'blink':
          return Animated.loop(
            Animated.sequence([
              Animated.delay(1500),
              Animated.timing(anim1, { toValue: 1, duration: 100, useNativeDriver: true }),
              Animated.timing(anim1, { toValue: 0, duration: 100, useNativeDriver: true }),
            ])
          );
        case 'flame':
          return Animated.loop(
            Animated.sequence([
              Animated.timing(anim1, { toValue: 1, duration: 80, useNativeDriver: true, easing: Easing.linear }),
              Animated.timing(anim1, { toValue: -1, duration: 80, useNativeDriver: true, easing: Easing.linear }),
              Animated.timing(anim1, { toValue: 0.5, duration: 80, useNativeDriver: true, easing: Easing.linear }),
              Animated.timing(anim1, { toValue: -0.5, duration: 80, useNativeDriver: true, easing: Easing.linear }),
            ])
          );
        case 'swing':
          return Animated.loop(
            Animated.sequence([
              Animated.timing(anim1, { toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
              Animated.timing(anim1, { toValue: -1, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            ])
          );
        default:
          return Animated.loop(
            Animated.sequence([
              Animated.timing(anim1, { toValue: 1, duration: 500, useNativeDriver: true }),
              Animated.timing(anim1, { toValue: 0, duration: 500, useNativeDriver: true }),
            ])
          );
      }
    };

    const animation = getAnimation();
    animation.start();

    return () => animation.stop();
  }, [type]);

  const getTransform = () => {
    switch (type) {
      case 'wiggle':
        return [
          { rotate: anim1.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-15deg', '0deg', '15deg'] }) },
          { translateX: anim1.interpolate({ inputRange: [-1, 0, 1], outputRange: [-8, 0, 8] }) },
        ];
      case 'bounce':
        return [
          { translateY: anim1.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) },
          { scaleY: anim1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.9, 1] }) },
        ];
      case 'pulse':
        return [
          { scale: anim1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
        ];
      case 'float':
        return [
          { translateY: anim1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
        ];
      case 'wobble':
        return [
          { rotate: anim1.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-12deg', '0deg', '12deg'] }) },
        ];
      case 'blink':
        return [
          { scaleY: anim1.interpolate({ inputRange: [0, 1], outputRange: [1, 0.1] }) },
        ];
      case 'flame':
        return [
          { scaleY: anim1.interpolate({ inputRange: [-1, 0, 1], outputRange: [1.1, 1, 1.15] }) },
          { scaleX: anim1.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.95, 1, 1.05] }) },
        ];
      case 'swing':
        return [
          { rotate: anim1.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-20deg', '0deg', '20deg'] }) },
        ];
      default:
        return [];
    }
  };

  return (
    <Animated.Text
      style={[
        styles.emoji,
        {
          fontSize: size,
          transform: getTransform(),
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  emoji: { textAlign: 'center' },
});