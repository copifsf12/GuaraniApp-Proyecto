import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export default function MascotAguara({
  size = 140,
  mood = 'happy', // 'happy' | 'celebrating' | 'thinking'
  speechText = null,
  onPress = null,
  showEquipped = true
}) {
  // Use celebratory image if mood is celebrating, else use the mascot image
  const imageSource = mood === 'celebrating'
    ? require('../../assets/images/aguara_celebrating.jpg')
    : require('../../assets/images/aguara_mascot.jpg');

  return (
    <View style={styles.container}>
      {/* Burbuja de diálogo */}
      {speechText && (
        <View style={styles.bubbleContainer}>
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>{speechText}</Text>
          </View>
          <View style={styles.bubbleTail} />
        </View>
      )}

      {/* Círculo con la imagen del Aguara */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={!onPress}
        style={[
          styles.imageWrapper,
          { width: size, height: size, borderRadius: size / 2 }
        ]}
      >
        <Image
          source={imageSource}
          style={[
            styles.mascotImage,
            { width: size, height: size }
          ]}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Badge "Aguará" DEBAJO del círculo */}
      {showEquipped && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>🦊 Aguará</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  imageWrapper: {
    borderWidth: 3,
    borderColor: colors.terracotaPrimary,
    backgroundColor: colors.sandBackground,
    overflow: 'hidden',
    shadowColor: colors.terracotaDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },
  bubbleContainer: {
    alignItems: 'center',
    marginBottom: 8,
    maxWidth: 280,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.sandBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  speechText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  bubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.sandBorder,
    marginTop: -1,
  },

  // 🎯 Badge FUERA del círculo, justo debajo
  badgeContainer: {
    marginTop: -10,       // Se superpone ligeramente al círculo para verse bien
    backgroundColor: colors.montePrimary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});