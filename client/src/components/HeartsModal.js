import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import PressableScale from './PressableScale';

export default function HeartsModal({
  visible,
  user,
  onClose,
  onBuyRefill,
  buyLoading = false
}) {
  const [timeLeft, setTimeLeft] = useState('--:--');

  const hearts = user?.hearts ?? 5;
  const maxHearts = user?.maxHearts ?? 5;
  // Acepta ambos formatos: camelCase y snake_case
  const heartRegenAt = user?.heartRegenAt || user?.heart_regen_at;
  const isFull = hearts >= maxHearts;

  useEffect(() => {
    if (!visible || isFull || !heartRegenAt) {
      setTimeLeft('--:--');
      return;
    }

    const updateTimer = () => {
      const regenAt = new Date(heartRegenAt).getTime();
      const diff = regenAt - Date.now();

      if (diff <= 0) {
        setTimeLeft('00:00');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [visible, heartRegenAt, isFull]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.backdrop} onPress={onClose}>
        <View style={styles.card}>
          <View style={[styles.heartCircle, isFull && styles.heartCircleFull]}>
            <Ionicons name="heart" size={54} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>
            {isFull ? '¡Corazones al máximo!' : `Corazones: ${hearts}/${maxHearts}`}
          </Text>

          {isFull ? (
            <Text style={styles.subtitle}>
              Tienes todas tus semillas de vida. ¡A seguir aprendiendo!
            </Text>
          ) : (
            <>
              <Text style={styles.label}>Tu próximo corazón llegará en:</Text>
              <Text style={styles.timer}>{timeLeft}</Text>
              <Text style={styles.hint}>
                Se regenera 1 corazón cada 5 minutos.
              </Text>
            </>
          )}

          {!isFull && (
            <PressableScale
              style={[styles.buyBtn, buyLoading && { opacity: 0.6 }]}
              onPress={onBuyRefill}
              disabled={buyLoading}
              pulse={!buyLoading}
            >
              <Ionicons name="flash" size={18} color="#FFFFFF" />
              <Text style={styles.buyBtnText}>
                {buyLoading ? 'Comprando...' : 'RECARGAR (20 🪙)'}
              </Text>
            </PressableScale>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>
              {isFull ? 'Aceptar' : 'Cerrar'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.sandBackground,
    borderRadius: 26,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.sandBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16
  },
  heartCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.errorRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: colors.errorRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8
  },
  heartCircleFull: {
    backgroundColor: colors.successGreen
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
    paddingHorizontal: 6,
    fontStyle: 'italic'
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6
  },
  timer: {
    fontSize: 46,
    fontWeight: '900',
    color: colors.errorRed,
    letterSpacing: 2,
    marginBottom: 8
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic'
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.terracotaPrimary,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 22,
    gap: 8,
    borderBottomWidth: 4,
    borderBottomColor: colors.terracotaDark,
    marginBottom: 10,
    width: '100%'
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  closeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 4
  },
  closeBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline'
  }
});