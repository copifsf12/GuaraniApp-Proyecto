import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import MascotAguara from '../components/MascotAguara';

const PRICE_PER_HEART = 6;

export default function ShopScreen() {
  const {
    user,
    mbaePacks,
    addMbae,
    buyShopItem
  } = useApp();

  const [purchaseNotice, setPurchaseNotice] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const showNotice = (msg) => {
    setPurchaseNotice(msg);
    setTimeout(() => setPurchaseNotice(null), 3000);
  };

  const openPackConfirm = (pack) => {
    setConfirmModal({ type: 'pack', data: pack });
  };

  const openHeartsModal = () => {
    const missing = (user?.maxHearts || 5) - (user?.hearts || 0);
    if (missing <= 0) {
      showNotice('❤️ Tus corazones ya están llenos');
      return;
    }
    setConfirmModal({
      type: 'hearts',
      data: { key: 'refill_hearts', name: 'Recargar Corazones' },
      quantity: missing
    });
  };

  const increaseQty = () => {
    if (!confirmModal || confirmModal.type !== 'hearts') return;
    const maxQty = (user?.maxHearts || 5) - (user?.hearts || 0);
    const newQty = Math.min(confirmModal.quantity + 1, maxQty);
    setConfirmModal({ ...confirmModal, quantity: newQty });
  };

  const decreaseQty = () => {
    if (!confirmModal || confirmModal.type !== 'hearts') return;
    const newQty = Math.max(confirmModal.quantity - 1, 1);
    setConfirmModal({ ...confirmModal, quantity: newQty });
  };

  const confirmPurchase = async () => {
    if (!confirmModal) return;
    const { type, data, quantity } = confirmModal;

    if (type === 'pack') {
      if (addMbae) {
        addMbae(data.mbae);
        showNotice(`¡Añadidos ${data.mbae} Mbae! (Simulado)`);
      }
    } else if (type === 'hearts') {
      const result = await buyShopItem('refill_hearts', quantity);
      if (result.success) {
        showNotice(`❤️ ¡Recuperaste ${quantity} corazón${quantity > 1 ? 'es' : ''}!`);
      } else {
        showNotice(`Aviso: ${result.message}`);
      }
    }

    setConfirmModal(null);
  };

  const getTotalPrice = () => {
    if (!confirmModal) return 0;
    if (confirmModal.type === 'hearts') {
      return PRICE_PER_HEART * confirmModal.quantity;
    }
    if (confirmModal.type === 'pack') {
      return confirmModal.data.price_bs;
    }
    return 0;
  };

  const canAfford = () => {
    if (!confirmModal) return true;
    if (confirmModal.type === 'pack') return true;
    return (user?.coinsMbae || 0) >= getTotalPrice();
  };

  const heartsFilled = user?.hearts || 0;
  const heartsMax = user?.maxHearts || 5;
  const heartsMissing = heartsMax - heartsFilled;
  const isFull = heartsMissing <= 0;

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Mascot + Wallet */}
        <View style={styles.mascotShowcase}>
          <MascotAguara
            size={130}
            speechText={
              isFull
                ? '¡Tus corazones están llenos! ¡Sigue aprendiendo!'
                : '¡Recarga tus corazones para seguir aprendiendo!'
            }
          />
          <View style={styles.walletRow}>
            <View style={styles.walletBadge}>
              <Ionicons name="color-filter" size={18} color={colors.terracotaPrimary} />
              <Text style={styles.walletText}>{user?.coinsMbae || 0} Mbae</Text>
            </View>
            <View style={styles.heartsBadge}>
              <Ionicons name="heart" size={18} color={colors.errorRed} />
              <Text style={styles.heartsText}>{heartsFilled}/{heartsMax}</Text>
            </View>
          </View>
        </View>

        {/* Notificación */}
        {purchaseNotice && (
          <View style={styles.noticeBanner}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            <Text style={styles.noticeText}>{purchaseNotice}</Text>
          </View>
        )}

        {/* POTENCIADORES */}
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="flash" size={22} color={colors.terracotaPrimary} />
          <Text style={styles.sectionHeader}>Potenciadores del Chaco</Text>
        </View>
        <Text style={styles.sectionSubtext}>
          Recupera tus corazones para seguir jugando
        </Text>

        {/* TARJETA DE CORAZONES */}
        <TouchableOpacity
          style={[styles.heartsCard, isFull && styles.heartsCardFull]}
          onPress={openHeartsModal}
          activeOpacity={isFull ? 1 : 0.85}
          disabled={isFull}
        >
          <View style={[styles.heartsIconCircle, isFull && { backgroundColor: '#D4EDDA' }]}>
            <Ionicons
              name={isFull ? 'checkmark-circle' : 'heart'}
              size={32}
              color={isFull ? colors.successGreen : colors.errorRed}
            />
          </View>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={[styles.heartsBadgeTag, isFull && { backgroundColor: '#D4EDDA' }]}>
              <Text style={[styles.heartsBadgeTagText, isFull && { color: colors.successGreen }]}>
                {isFull ? 'COMPLETO' : 'Recarga'}
              </Text>
            </View>

            <Text style={styles.itemName}>
              {isFull ? 'Corazones Llenos' : 'Recargar Corazones'}
            </Text>

            <Text style={styles.itemDesc}>
              {isFull
                ? 'Estás al máximo. Vuelve cuando pierdas uno.'
                : `Te faltan ${heartsMissing} corazón${heartsMissing > 1 ? 'es' : ''}. Elige cuántos comprar.`
              }
            </Text>

            <View style={styles.heartsRow}>
              {[...Array(heartsMax)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < heartsFilled ? 'heart' : 'heart-outline'}
                  size={16}
                  color={i < heartsFilled ? colors.errorRed : colors.textMuted}
                />
              ))}
              <Text style={styles.heartsRowText}>
                {heartsFilled}/{heartsMax}
              </Text>
            </View>
          </View>

          {!isFull && (
            <View style={styles.heartsPriceTag}>
              <Text style={styles.heartsPriceText}>{PRICE_PER_HEART} Mbae</Text>
              <Text style={styles.heartsPriceSub}>c/u</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* COMPRAR MBAE */}
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="cash-outline" size={22} color={colors.solGold} />
          <Text style={styles.sectionHeader}>Comprar Mbae</Text>
        </View>
        <Text style={styles.sectionSubtext}>
          Recarga tus monedas con dinero real (Bs bolivianos)
        </Text>

        <View style={styles.mbaeGrid}>
          {/* 🎯 FIX: protección con || [] por si mbaePacks está undefined */}
          {(mbaePacks || []).map(pack => (
            <View
              key={pack.id}
              style={[
                styles.mbaeCard,
                pack.popular && styles.mbaeCardPopular
              ]}
            >
              {pack.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>POPULAR</Text>
                </View>
              )}

              <View style={styles.mbaeIconCircle}>
                <Ionicons
                  name={pack.icon || 'leaf-outline'}
                  size={30}
                  color={colors.solGold}
                />
              </View>

              <Text style={styles.mbaeAmount}>{pack.mbae}</Text>
              <Text style={styles.mbaeLabel}>Mbae</Text>
              <Text style={styles.mbaeName}>{pack.name}</Text>

              <TouchableOpacity
                style={styles.mbaeBuyBtn}
                onPress={() => openPackConfirm(pack)}
                activeOpacity={0.8}
              >
                <Text style={styles.mbaeBuyBtnText}>{pack.price_bs} Bs</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* MODAL */}
      <Modal
        visible={!!confirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmCard}>

            {/* Pack de Mbae */}
            {confirmModal?.type === 'pack' && (
              <>
                <View style={[styles.confirmIconCircle, { backgroundColor: colors.solLight }]}>
                  <Ionicons
                    name={confirmModal.data.icon || 'leaf-outline'}
                    size={40}
                    color={colors.solGold}
                  />
                </View>
                <Text style={styles.confirmTitle}>¿Comprar este pack?</Text>
                <Text style={styles.confirmPackName}>{confirmModal.data.name}</Text>

                <View style={styles.confirmDetails}>
                  <View style={styles.confirmRow}>
                    <Text style={styles.confirmLabel}>Mbae:</Text>
                    <Text style={styles.confirmValue}>{confirmModal.data.mbae}</Text>
                  </View>
                  <View style={[styles.confirmRow, styles.confirmTotalRow]}>
                    <Text style={styles.confirmTotalLabel}>Precio:</Text>
                    <Text style={styles.confirmTotalValue}>{confirmModal.data.price_bs} Bs</Text>
                  </View>
                </View>
              </>
            )}

            {/* Corazones */}
            {confirmModal?.type === 'hearts' && (
              <>
                <View style={[styles.confirmIconCircle, { backgroundColor: '#FFE5E5' }]}>
                  <Ionicons name="heart" size={40} color={colors.errorRed} />
                </View>
                <Text style={styles.confirmTitle}>¿Cuántos corazones?</Text>
                <Text style={styles.confirmPackName}>
                  Tienes {heartsFilled}/{heartsMax} · Te faltan {heartsMissing}
                </Text>

                <View style={styles.qtySelector}>
                  <TouchableOpacity
                    style={[styles.qtyBtn, confirmModal.quantity <= 1 && styles.qtyBtnDisabled]}
                    onPress={decreaseQty}
                    disabled={confirmModal.quantity <= 1}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="remove"
                      size={26}
                      color={confirmModal.quantity <= 1 ? colors.textMuted : colors.terracotaDark}
                    />
                  </TouchableOpacity>

                  <View style={styles.qtyDisplay}>
                    <Text style={styles.qtyNumber}>{confirmModal.quantity}</Text>
                    <Text style={styles.qtyLabel}>
                      corazón{confirmModal.quantity > 1 ? 'es' : ''}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.qtyBtn, confirmModal.quantity >= heartsMissing && styles.qtyBtnDisabled]}
                    onPress={increaseQty}
                    disabled={confirmModal.quantity >= heartsMissing}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="add"
                      size={26}
                      color={confirmModal.quantity >= heartsMissing ? colors.textMuted : colors.terracotaDark}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.confirmDetails}>
                  <View style={styles.confirmRow}>
                    <Text style={styles.confirmLabel}>Precio por corazón:</Text>
                    <Text style={styles.confirmValue}>{PRICE_PER_HEART} Mbae</Text>
                  </View>
                  <View style={styles.confirmRow}>
                    <Text style={styles.confirmLabel}>Cantidad:</Text>
                    <Text style={styles.confirmValue}>× {confirmModal.quantity}</Text>
                  </View>
                  <View style={[styles.confirmRow, styles.confirmTotalRow]}>
                    <Text style={styles.confirmTotalLabel}>Total:</Text>
                    <Text style={styles.confirmTotalValue}>{getTotalPrice()} Mbae</Text>
                  </View>
                  <View style={styles.confirmRow}>
                    <Text style={styles.confirmLabel}>Saldo actual:</Text>
                    <Text style={styles.confirmValue}>{user?.coinsMbae || 0} Mbae</Text>
                  </View>
                  <View style={styles.confirmRow}>
                    <Text style={styles.confirmLabel}>Saldo después:</Text>
                    <Text style={[
                      styles.confirmValue,
                      !canAfford() && { color: colors.errorRed }
                    ]}>
                      {(user?.coinsMbae || 0) - getTotalPrice()} Mbae
                    </Text>
                  </View>
                </View>

                {!canAfford() && (
                  <View style={styles.warningBox}>
                    <Ionicons name="warning" size={16} color={colors.errorRed} />
                    <Text style={styles.warningText}>Mbae insuficientes</Text>
                  </View>
                )}
              </>
            )}

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.confirmBtnCancel]}
                onPress={() => setConfirmModal(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  styles.confirmBtnBuy,
                  !canAfford() && styles.confirmBtnDisabled
                ]}
                onPress={confirmPurchase}
                disabled={!canAfford()}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmBtnBuyText}>Comprar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sandBackground },
  scrollContent: { padding: 20, paddingBottom: 40 },

  mascotShowcase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.sandBorder,
    marginBottom: 16,
  },
  walletRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  walletBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.sandBackground,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5, borderColor: colors.terracotaPrimary,
    gap: 6,
  },
  walletText: { fontSize: 14, fontWeight: '800', color: colors.terracotaDark },
  heartsBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5, borderColor: colors.errorRed,
    gap: 6,
  },
  heartsText: { fontSize: 14, fontWeight: '800', color: colors.errorRed },

  noticeBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.montePrimary,
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 14, marginBottom: 14, gap: 8,
  },
  noticeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4,
  },
  sectionHeader: {
    fontSize: 18, fontWeight: '900', color: colors.textPrimary, marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: 12, color: colors.textMuted, marginBottom: 14, fontStyle: 'italic',
  },

  heartsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.errorRed,
  },
  heartsCardFull: {
    borderColor: colors.successGreen,
    opacity: 0.9,
  },
  heartsIconCircle: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center', alignItems: 'center',
  },
  heartsBadgeTag: {
    backgroundColor: '#FFE5E5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6, marginBottom: 4,
  },
  heartsBadgeTagText: {
    fontSize: 10, fontWeight: '800', color: colors.errorRed,
  },
  itemName: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  itemDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  heartsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6,
  },
  heartsRowText: {
    fontSize: 11, fontWeight: '800', color: colors.textSecondary, marginLeft: 6,
  },
  heartsPriceTag: {
    backgroundColor: '#FFE5E5',
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.errorRed,
  },
  heartsPriceText: { fontSize: 14, fontWeight: '900', color: colors.errorRed },
  heartsPriceSub: { fontSize: 9, fontWeight: '700', color: colors.errorRed, marginTop: 1 },

  divider: {
    height: 1, backgroundColor: colors.sandBorder,
    marginVertical: 20, opacity: 0.6,
  },

  mbaeGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', gap: 12, marginBottom: 8,
  },
  mbaeCard: {
    width: '48%', backgroundColor: '#FFFFFF',
    borderRadius: 20, padding: 16,
    alignItems: 'center',
    borderWidth: 2, borderColor: colors.sandBorder,
    position: 'relative', marginBottom: 12,
  },
  mbaeCardPopular: {
    borderColor: colors.solGold, borderWidth: 3,
  },
  popularBadge: {
    position: 'absolute', top: -10, right: 8,
    backgroundColor: colors.solGold,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 2, borderColor: '#FFFFFF',
  },
  popularBadgeText: {
    fontSize: 9, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5,
  },
  mbaeIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.solLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  mbaeAmount: {
    fontSize: 26, fontWeight: '900', color: colors.terracotaDark, marginTop: 4,
  },
  mbaeLabel: {
    fontSize: 11, fontWeight: '800', color: colors.terracotaPrimary,
    letterSpacing: 1.5, marginBottom: 6,
  },
  mbaeName: {
    fontSize: 11, color: colors.textSecondary,
    textAlign: 'center', marginBottom: 10,
    fontWeight: '600', minHeight: 28,
  },
  mbaeBuyBtn: {
    backgroundColor: colors.montePrimary,
    paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 14,
    borderBottomWidth: 3, borderBottomColor: colors.monteDark,
    minWidth: 90, alignItems: 'center',
  },
  mbaeBuyBtnText: {
    color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 0.3,
  },

  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  confirmCard: {
    width: '100%', maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 26, paddingVertical: 26, paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 2, borderColor: colors.sandBorder,
  },
  confirmIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 20, fontWeight: '900', color: colors.textPrimary,
    textAlign: 'center', marginBottom: 4,
  },
  confirmPackName: {
    fontSize: 13, fontWeight: '700', color: colors.textSecondary,
    textAlign: 'center', marginBottom: 18,
  },
  qtySelector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 18, gap: 20,
  },
  qtyBtn: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.sandBackground,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.sandBorder,
  },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyDisplay: { alignItems: 'center', minWidth: 80 },
  qtyNumber: { fontSize: 34, fontWeight: '900', color: colors.terracotaDark },
  qtyLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.5 },
  confirmDetails: {
    width: '100%', backgroundColor: colors.sandBackground,
    borderRadius: 16, padding: 14, marginBottom: 20, gap: 10,
  },
  confirmRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  confirmLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  confirmValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '800' },
  confirmTotalRow: {
    borderTopWidth: 1, borderTopColor: colors.sandBorder,
    paddingTop: 10, marginTop: 4,
  },
  confirmTotalLabel: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  confirmTotalValue: { fontSize: 16, fontWeight: '900', color: colors.terracotaDark },
  warningBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFE5E5',
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 10, marginBottom: 12,
  },
  warningText: { fontSize: 12, fontWeight: '800', color: colors.errorRed },
  confirmButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  confirmBtnCancel: {
    backgroundColor: colors.sandBackground,
    borderWidth: 2, borderColor: colors.sandBorder,
  },
  confirmBtnCancelText: { fontSize: 14, fontWeight: '800', color: colors.textSecondary },
  confirmBtnBuy: {
    backgroundColor: colors.montePrimary,
    borderBottomWidth: 3, borderBottomColor: colors.monteDark,
  },
  confirmBtnDisabled: {
    backgroundColor: colors.textMuted,
    borderBottomColor: colors.textSecondary,
    opacity: 0.6,
  },
  confirmBtnBuyText: {
    fontSize: 14, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5,
  },
});