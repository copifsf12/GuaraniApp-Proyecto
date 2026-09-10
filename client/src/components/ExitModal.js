import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function ExitModal({ visible, onConfirm, onCancel }) {
  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.iconCircle}>
            <Ionicons name="alert-circle" size={40} color={colors.terracotaPrimary} />
          </View>

          <Text style={styles.title}>¿Seguro que deseas salir?</Text>
          <Text style={styles.message}>
            Perderás el avance de esta lección y la oportunidad de sumar puntos de racha Tatá hoy.
          </Text>

          <TouchableOpacity
            style={styles.stayButton}
            onPress={onCancel}
            activeOpacity={0.85}
          >
            <Text style={styles.stayButtonText}>Continuar practicando</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exitButton}
            onPress={onConfirm}
            activeOpacity={0.7}
          >
            <Text style={styles.exitButtonText}>Salir de la lección</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.sandBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.terracotaPastel,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  stayButton: {
    backgroundColor: colors.montePrimary,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: colors.monteDark,
    marginBottom: 10,
  },
  stayButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  exitButton: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  exitButtonText: {
    color: colors.errorRed,
    fontSize: 15,
    fontWeight: '700',
  },
});
