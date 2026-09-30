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
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import MascotAguara from '../components/MascotAguara';

const PRICE_PER_HEART = 6;

export default function ShopScreen() {
  const { theme, isDark } = useTheme();
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
  const packs = mbaePacks || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.sandBackground }]}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ═══════════ HERO HEADER ═══════════ */}
        <LinearGradient
          colors={isDark ? ['#4A2A1A', '#2A1508'] : ['#FFE8D6', '#FFD3A5']}
          style={styles.heroHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="cart" size={28} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.heroTitle, { color: isDark ? '#FFD166' : theme.terracotaDark }]}>
                Tienda del Chaco
              </Text>
              <Text style={[styles.heroSubtitle, { color: isDark ? '#FFB86B' : theme.terracotaPrimary }]}>
                Compra con monedas Mbae
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ═══════════ MASCOTA + WALLET ═══════════ */}
        <View style={[styles.mascotShowcase, {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderColor: isDark ? '#333' : theme.sandBorder,
        }]}>
          <MascotAguara
            size={120}
            speechText={
              isFull
                ? '¡Tus corazones están llenos! ¡Sigue aprendiendo!'
                : '¡Recarga tus corazones para seguir aprendiendo!'
            }
          />
          <View style={styles.walletRow}>
            <View style={[styles.walletBadge, {
              backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground,
              borderColor: theme.terracotaPrimary,
            }]}>
              <Ionicons name="color-filter" size={18} color={theme.terracotaPrimary} />
              <Text style={[styles.walletText, { color: isDark ? '#FFB86B' : theme.terracotaDark }]}>
                {user?.coinsMbae || 0} Mbae
              </Text>
            </View>
            <View style={[styles.heartsBadge, {
              backgroundColor: isDark ? '#3A1B1B' : '#FFE5E5',
              borderColor: theme.errorRed,
            }]}>
              <Ionicons name="heart" size={18} color={theme.errorRed} />
              <Text style={[styles.heartsText, { color: theme.errorRed }]}>
                {heartsFilled}/{heartsMax}
              </Text>
            </View>
          </View>
        </View>

        {/* ═══════════ NOTIFICACIÓN ═══════════ */}
        {purchaseNotice && (
          <LinearGradient
            colors={isDark ? ['#2D6A4F', '#1B4332'] : ['#56C596', '#2D6A4F']}
            style={styles.noticeBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            <Text style={styles.noticeText}>{purchaseNotice}</Text>
          </LinearGradient>
        )}

        {/* ═══════════ POTENCIADORES ═══════════ */}
        <View style={styles.sectionHeaderRow}>
          <View style={[styles.sectionIconCircle, { backgroundColor: theme.terracotaPrimary + '20' }]}>
            <Ionicons name="flash" size={18} color={theme.terracotaPrimary} />
          </View>
          <Text style={[styles.sectionHeader, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
            Potenciadores del Chaco
          </Text>
        </View>
        <Text style={[styles.sectionSubtext, { color: isDark ? '#B0B0B0' : theme.textMuted }]}>
          Recupera tus corazones para seguir jugando
        </Text>

        {/* Tarjeta de corazones */}
        <TouchableOpacity
          style={[
            styles.heartsCard,
            {
              backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
              borderColor: isFull ? theme.successGreen : theme.errorRed,
            },
            isFull && { opacity: 0.9 },
          ]}
          onPress={openHeartsModal}
          activeOpacity={isFull ? 1 : 0.85}
          disabled={isFull}
        >
          <View style={[
            styles.heartsIconCircle,
            { backgroundColor: isFull ? (isDark ? '#1B3A1E' : '#D4EDDA') : (isDark ? '#3A1B1B' : '#FFE5E5') }
          ]}>
            <Ionicons
              name={isFull ? 'checkmark-circle' : 'heart'}
              size={32}
              color={isFull ? theme.successGreen : theme.errorRed}
            />
          </View>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={[styles.heartsBadgeTag, {
              backgroundColor: isFull ? (isDark ? '#1B3A1E' : '#D4EDDA') : (isDark ? '#3A1B1B' : '#FFE5E5'),
            }]}>
              <Text style={[styles.heartsBadgeTagText, {
                color: isFull ? theme.successGreen : theme.errorRed
              }]}>
                {isFull ? 'COMPLETO' : 'RECARGA'}
              </Text>
            </View>

            <Text style={[styles.itemName, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
              {isFull ? 'Corazones Llenos' : 'Recargar Corazones'}
            </Text>

            <Text style={[styles.itemDesc, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
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
                  color={i < heartsFilled ? theme.errorRed : (isDark ? '#555' : theme.textMuted)}
                />
              ))}
              <Text style={[styles.heartsRowText, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                {heartsFilled}/{heartsMax}
              </Text>
            </View>
          </View>

          {!isFull && (
            <View style={[styles.heartsPriceTag, {
              backgroundColor: isDark ? '#3A1B1B' : '#FFE5E5',
              borderColor: theme.errorRed,
            }]}>
              <Text style={[styles.heartsPriceText, { color: theme.errorRed }]}>
                {PRICE_PER_HEART} Mbae
              </Text>
              <Text style={[styles.heartsPriceSub, { color: theme.errorRed }]}>c/u</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: isDark ? '#333' : theme.sandBorder }]} />

        {/* ═══════════ COMPRAR MBAE ═══════════ */}
        <View style={styles.sectionHeaderRow}>
          <View style={[styles.sectionIconCircle, { backgroundColor: theme.solGold + '20' }]}>
            <Ionicons name="cash-outline" size={18} color={theme.solGold} />
          </View>
          <Text style={[styles.sectionHeader, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
            Comprar Mbae
          </Text>
        </View>
        <Text style={[styles.sectionSubtext, { color: isDark ? '#B0B0B0' : theme.textMuted }]}>
          Recarga tus monedas con dinero real (Bs bolivianos)
        </Text>

        <View style={styles.mbaeGrid}>
          {packs.map(pack => (
            <View
              key={pack.id}
              style={[
                styles.mbaeCard,
                {
                  backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                  borderColor: pack.popular ? theme.solGold : (isDark ? '#333' : theme.sandBorder),
                },
                pack.popular && { borderWidth: 3 },
              ]}
            >
              {pack.popular && (
                <View style={[styles.popularBadge, { backgroundColor: theme.solGold }]}>
                  <Text style={styles.popularBadgeText}>POPULAR</Text>
                </View>
              )}

              <View style={[styles.mbaeIconCircle, { backgroundColor: isDark ? '#4A3A1F' : theme.solLight }]}>
                <Ionicons
                  name={pack.icon || 'leaf-outline'}
                  size={30}
                  color={theme.solGold}
                />
              </View>

              <Text style={[styles.mbaeAmount, { color: isDark ? '#FFD166' : theme.terracotaDark }]}>
                {pack.mbae}
              </Text>
              <Text style={[styles.mbaeLabel, { color: theme.terracotaPrimary }]}>Mbae</Text>
              <Text style={[styles.mbaeName, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                {pack.name}
              </Text>

              <TouchableOpacity
                style={[styles.mbaeBuyBtn, { backgroundColor: theme.montePrimary }]}
                onPress={() => openPackConfirm(pack)}
                activeOpacity={0.85}
              >
                <Text style={styles.mbaeBuyBtnText}>{pack.price_bs} Bs</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ═══════════ MODAL DE CONFIRMACIÓN ═══════════ */}
      <Modal
        visible={!!confirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.confirmCard, {
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderColor: isDark ? '#333' : theme.sandBorder,
          }]}>

            {/* Pack de Mbae */}
            {confirmModal?.type === 'pack' && (
              <>
                <View style={[styles.confirmIconCircle, { backgroundColor: isDark ? '#4A3A1F' : theme.solLight }]}>
                  <Ionicons
                    name={confirmModal.data.icon || 'leaf-outline'}
                    size={40}
                    color={theme.solGold}
                  />
                </View>
                <Text style={[styles.confirmTitle, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
                  ¿Comprar este pack?
                </Text>
                <Text style={[styles.confirmPackName, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                  {confirmModal.data.name}
                </Text>

                <View style={[styles.confirmDetails, { backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground }]}>
                  <View style={styles.confirmRow}>
                    <Text style={[styles.confirmLabel, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                      Mbae:
                    </Text>
                    <Text style={[styles.confirmValue, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
                      {confirmModal.data.mbae}
                    </Text>
                  </View>
                  <View style={[styles.confirmRow, styles.confirmTotalRow, { borderTopColor: isDark ? '#444' : theme.sandBorder }]}>
                    <Text style={[styles.confirmTotalLabel, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
                      Precio:
                    </Text>
                    <Text style={[styles.confirmTotalValue, { color: theme.terracotaDark }]}>
                      {confirmModal.data.price_bs} Bs
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* Corazones */}
            {confirmModal?.type === 'hearts' && (
              <>
                <View style={[styles.confirmIconCircle, { backgroundColor: isDark ? '#3A1B1B' : '#FFE5E5' }]}>
                  <Ionicons name="heart" size={40} color={theme.errorRed} />
                </View>
                <Text style={[styles.confirmTitle, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
                  ¿Cuántos corazones?
                </Text>
                <Text style={[styles.confirmPackName, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                  Tienes {heartsFilled}/{heartsMax} · Te faltan {heartsMissing}
                </Text>

                <View style={styles.qtySelector}>
                  <TouchableOpacity
                    style={[styles.qtyBtn, {
                      backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground,
                      borderColor: isDark ? '#444' : theme.sandBorder,
                    }, confirmModal.quantity <= 1 && { opacity: 0.4 }]}
                    onPress={decreaseQty}
                    disabled={confirmModal.quantity <= 1}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="remove"
                      size={26}
                      color={confirmModal.quantity <= 1 ? theme.textMuted : theme.terracotaDark}
                    />
                  </TouchableOpacity>

                  <View style={styles.qtyDisplay}>
                    <Text style={[styles.qtyNumber, { color: theme.terracotaDark }]}>
                      {confirmModal.quantity}
                    </Text>
                    <Text style={[styles.qtyLabel, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                      corazón{confirmModal.quantity > 1 ? 'es' : ''}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.qtyBtn, {
                      backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground,
                      borderColor: isDark ? '#444' : theme.sandBorder,
                    }, confirmModal.quantity >= heartsMissing && { opacity: 0.4 }]}
                    onPress={increaseQty}
                    disabled={confirmModal.quantity >= heartsMissing}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="add"
                      size={26}
                      color={confirmModal.quantity >= heartsMissing ? theme.textMuted : theme.terracotaDark}
                    />
                  </TouchableOpacity>
                </View>

                <View style={[styles.confirmDetails, { backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground }]}>
                  <View style={styles.confirmRow}>
                    <Text style={[styles.confirmLabel, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                      Precio por corazón:
                    </Text>
                    <Text style={[styles.confirmValue, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
                      {PRICE_PER_HEART} Mbae
                    </Text>
                  </View>
                  <View style={styles.confirmRow}>
                    <Text style={[styles.confirmLabel, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                      Cantidad:
                    </Text>
                    <Text style={[styles.confirmValue, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
                      × {confirmModal.quantity}
                    </Text>
                  </View>
                  <View style={[styles.confirmRow, styles.confirmTotalRow, { borderTopColor: isDark ? '#444' : theme.sandBorder }]}>
                    <Text style={[styles.confirmTotalLabel, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
                      Total:
                    </Text>
                    <Text style={[styles.confirmTotalValue, { color: theme.terracotaDark }]}>
                      {getTotalPrice()} Mbae
                    </Text>
                  </View>
                  <View style={styles.confirmRow}>
                    <Text style={[styles.confirmLabel, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                      Saldo actual:
                    </Text>
                    <Text style={[styles.confirmValue, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
                      {user?.coinsMbae || 0} Mbae
                    </Text>
                  </View>
                  <View style={styles.confirmRow}>
                    <Text style={[styles.confirmLabel, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                      Saldo después:
                    </Text>
                    <Text style={[
                      styles.confirmValue,
                      { color: isDark ? '#F5F5F5' : theme.textPrimary },
                      !canAfford() && { color: theme.errorRed }
                    ]}>
                      {(user?.coinsMbae || 0) - getTotalPrice()} Mbae
                    </Text>
                  </View>
                </View>

                {!canAfford() && (
                  <View style={[styles.warningBox, { backgroundColor: isDark ? '#3A1B1B' : '#FFE5E5' }]}>
                    <Ionicons name="warning" size={16} color={theme.errorRed} />
                    <Text style={[styles.warningText, { color: theme.errorRed }]}>
                      Mbae insuficientes
                    </Text>
                  </View>
                )}
              </>
            )}

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.confirmBtnCancel, {
                  backgroundColor: isDark ? '#2A2A2A' : theme.sandBackground,
                  borderColor: isDark ? '#444' : theme.sandBorder,
                }]}
                onPress={() => setConfirmModal(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.confirmBtnCancelText, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  styles.confirmBtnBuy,
                  { backgroundColor: theme.montePrimary },
                  !canAfford() && styles.confirmBtnDisabled
                ]}
                onPress={confirmPurchase}
                disabled={!canAfford()}
                activeOpacity={0.85}
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
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // ═══════════ HERO HEADER ═══════════
  heroHeader: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  heroContent: { flexDirection: 'row', alignItems: 'center' },
  heroIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  heroTitle: { fontSize: 22, fontWeight: '900', letterSpacing: 0.3 },
  heroSubtitle: { fontSize: 13, fontWeight: '600', marginTop: 2 },

  // ═══════════ MASCOTA ═══════════
  mascotShowcase: {
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 16,
  },
  walletRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  walletBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 16, borderWidth: 1.5, gap: 6,
  },
  walletText: { fontSize: 14, fontWeight: '800' },
  heartsBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 16, borderWidth: 1.5, gap: 6,
  },
  heartsText: { fontSize: 14, fontWeight: '800' },

  // ═══════════ NOTIFICACIÓN ═══════════
  noticeBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 14, marginBottom: 14, gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  noticeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },

  // ═══════════ SECCIÓN HEADER ═══════════
  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4,
  },
  sectionIconCircle: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
  },
  sectionHeader: { fontSize: 18, fontWeight: '900' },
  sectionSubtext: {
    fontSize: 12, marginBottom: 14, fontStyle: 'italic', marginLeft: 44,
  },

  // ═══════════ TARJETA CORAZONES ═══════════
  heartsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  heartsIconCircle: {
    width: 54, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center',
  },
  heartsBadgeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6, marginBottom: 4,
  },
  heartsBadgeTagText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  itemName: { fontSize: 15, fontWeight: '800' },
  itemDesc: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  heartsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6,
  },
  heartsRowText: { fontSize: 11, fontWeight: '800', marginLeft: 6 },
  heartsPriceTag: {
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 12, alignItems: 'center', borderWidth: 1.5,
  },
  heartsPriceText: { fontSize: 14, fontWeight: '900' },
  heartsPriceSub: { fontSize: 9, fontWeight: '700', marginTop: 1 },

  // ═══════════ DIVIDER ═══════════
  divider: {
    height: 1, marginVertical: 20, opacity: 0.6,
  },

  // ═══════════ GRID MBAE ═══════════
  mbaeGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', gap: 12, marginBottom: 8,
  },
  mbaeCard: {
    width: '48%',
    borderRadius: 20, padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative', marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  popularBadge: {
    position: 'absolute', top: -10, right: 8,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 2, borderColor: '#FFFFFF',
  },
  popularBadgeText: {
    fontSize: 9, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5,
  },
  mbaeIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  mbaeAmount: { fontSize: 26, fontWeight: '900', marginTop: 4 },
  mbaeLabel: {
    fontSize: 11, fontWeight: '800',
    letterSpacing: 1.5, marginBottom: 6,
  },
  mbaeName: {
    fontSize: 11, textAlign: 'center', marginBottom: 10,
    fontWeight: '600', minHeight: 28,
  },
  mbaeBuyBtn: {
    paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 14,
    borderBottomWidth: 3, borderBottomColor: 'rgba(0,0,0,0.2)',
    minWidth: 90, alignItems: 'center',
  },
  mbaeBuyBtnText: {
    color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 0.3,
  },

  // ═══════════ MODAL ═══════════
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  confirmCard: {
    width: '100%', maxWidth: 380,
    borderRadius: 26, paddingVertical: 26, paddingHorizontal: 22,
    alignItems: 'center', borderWidth: 2,
  },
  confirmIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 20, fontWeight: '900',
    textAlign: 'center', marginBottom: 4,
  },
  confirmPackName: {
    fontSize: 13, fontWeight: '700',
    textAlign: 'center', marginBottom: 18,
  },
  qtySelector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 18, gap: 20,
  },
  qtyBtn: {
    width: 50, height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2,
  },
  qtyDisplay: { alignItems: 'center', minWidth: 80 },
  qtyNumber: { fontSize: 34, fontWeight: '900' },
  qtyLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  confirmDetails: {
    width: '100%', borderRadius: 16,
    padding: 14, marginBottom: 20, gap: 10,
  },
  confirmRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  confirmLabel: { fontSize: 13, fontWeight: '600' },
  confirmValue: { fontSize: 14, fontWeight: '800' },
  confirmTotalRow: {
    borderTopWidth: 1, paddingTop: 10, marginTop: 4,
  },
  confirmTotalLabel: { fontSize: 14, fontWeight: '800' },
  confirmTotalValue: { fontSize: 16, fontWeight: '900' },
  warningBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 10, marginBottom: 12,
  },
  warningText: { fontSize: 12, fontWeight: '800' },
  confirmButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  confirmBtnCancel: { borderWidth: 2 },
  confirmBtnCancelText: { fontSize: 14, fontWeight: '800' },
  confirmBtnBuy: {
    borderBottomWidth: 3, borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnBuyText: {
    fontSize: 14, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5,
  },
});