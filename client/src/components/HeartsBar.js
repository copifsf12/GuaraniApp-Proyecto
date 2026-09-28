import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function HeartsBar({ hearts = 5, maxHearts = 5, size = 20 }) {
  const total = Math.max(0, maxHearts);
  const current = Math.max(0, Math.min(hearts, total));

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, idx) => {
        const isFilled = idx < current;
        return (
          <Ionicons
            key={idx}
            name={isFilled ? 'heart' : 'heart-outline'}
            size={size}
            color={isFilled ? colors.errorRed : '#BDBDBD'}
            style={{ marginHorizontal: 1 }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});