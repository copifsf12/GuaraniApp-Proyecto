import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import MascotAguara from './MascotAguara';

export default function FeedbackModal({
  visible,
  type = 'success',
  title = '',
  message = '',
  primaryLabel = 'ACEPTAR',
  onPrimaryPress,
  onClose,
  children
}) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true
        })
      ]).start();
    } else {
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.85);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.backdrop}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Mascota Aguará con burbuja de diálogo */}
          <MascotAguara
            size={110}
            mood={type === 'error' ? 'thinking' : 'celebrating'}
            speechText={title || (type === 'error' ? '¡Ups!' : '¡Listo!')}
            showEquipped={false}
          />

          {/* Mensaje debajo */}
          {message ? (
            <Text style={styles.message}>{message}</Text>
          ) : null}

          {/* Contenido extra (ej: palabra traducida) */}
          {children}

          {/* Botón principal */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: type === 'error' ? colors.errorRed : colors.montePrimary }
            ]}
            onPress={onPrimaryPress || onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>{primaryLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.sandBackground,
    borderRadius: 26,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.sandBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 14,
    marginBottom: 6,
    paddingHorizontal: 6,
    fontStyle: 'italic'
  },
  button: {
    marginTop: 16,
    paddingVertical: 13,
    paddingHorizontal: 36,
    borderRadius: 26,
    minWidth: 150,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.2)'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  }
});