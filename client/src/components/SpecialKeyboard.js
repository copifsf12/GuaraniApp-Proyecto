import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

export default function SpecialKeyboard({ onCharacterPress, disabled = false }) {
  const characters = ['ã', 'ẽ', 'ĩ', 'õ', 'ũ', 'ỹ', 'ñ', "'"];

  return (
    <View style={styles.keyboardContainer}>
      <Text style={styles.titleText}>Caracteres especiales del Guaraní:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.keysRow}
      >
        {characters.map((char, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.keyButton, disabled && styles.keyButtonDisabled]}
            onPress={() => onCharacterPress && onCharacterPress(char)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text style={styles.keyText}>{char}</Text>
            {char === "'" && <Text style={styles.subText}>pusó</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    backgroundColor: colors.sandBackground,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.sandBorder,
    marginVertical: 10,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  keysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyButton: {
    backgroundColor: '#FFFFFF',
    minWidth: 42,
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.monteMedium,
    borderBottomWidth: 3,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  keyButtonDisabled: {
    opacity: 0.5,
  },
  keyText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.monteDark,
  },
  subText: {
    fontSize: 8,
    color: colors.textMuted,
    marginTop: -2,
  },
});
