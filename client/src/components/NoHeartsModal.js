import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function NoHeartsModal({ visible, onClose, onGoToShop }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="heart-dislike" size={48} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>¡Sin Corazones!</Text>
          <Text style={styles.description}>
            Necesitas al menos 1 corazón para jugar.
          </Text>

          <View style={styles.heartsRow}>
            <Ionicons name="heart-outline" size={20} color="#BDBDBD" />
            <Ionicons name="heart-outline" size={20} color="#BDBDBD" />
            <Ionicons name="heart-outline" size={20} color="#BDBDBD" />
            <Ionicons name="heart-outline" size={20} color="#BDBDBD" />
            <Ionicons name="heart-outline" size={20} color="#BDBDBD" />
          </View>

          <Text style={styles.hint}>
            💡 Compra corazones en la tienda para seguir aprendiendo
          </Text>

          <TouchableOpacity style={styles.shopBtn} onPress={onGoToShop} activeOpacity={0.8}>
            <Ionicons name="cart" size={20} color="#FFFFFF" />
            <Text style={styles.shopBtnText}>Ir a la Tienda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.cancelBtnText}>Volver al mapa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.sandBorder,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.errorRed,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFCDD2',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.errorRedDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  heartsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.sandBackground,
    borderRadius: 14,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
    lineHeight: 18,
  },
  shopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.montePrimary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 18,
    borderBottomWidth: 4,
    borderBottomColor: colors.monteDark,
    width: '100%',
    gap: 8,
    marginBottom: 10,
  },
  shopBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cancelBtn: {
    paddingVertical: 12,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});