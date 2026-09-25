import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import MascotAguara from '../components/MascotAguara';
import PressableScale from '../components/PressableScale';

// 🎨 Mapeo de íconos: convierte nombres de la BD a íconos válidos de Ionicons
const ICON_MAP = {
  'hat-cowboy': 'shirt',
  'shirt': 'shirt',
  'mask': 'happy-outline',
  'palette': 'color-palette',
  'shield': 'shield-checkmark',
  'heart': 'heart',
  'color-filter': 'color-filter',
  'flame': 'flame',
  'gift': 'gift',
};

function getIcon(name) {
  if (!name) return 'help-circle';
  // Si el nombre existe en el mapa, úsalo; si no, intenta usarlo directo
  return ICON_MAP[name] || name;
}

export default function ShopScreen() {
  const { user, shopItems, buyShopItem, equipItem } = useApp();
  const [purchaseNotice, setPurchaseNotice] = useState(null);

  const handleAction = async (item) => {
    const isOwned = user.inventory.includes(item.key);

    if (isOwned) {
      await equipItem(item.category, item.key);
      setPurchaseNotice(`¡Equipaste: ${item.name}!`);
    } else {
      const result = await buyShopItem(item.key);
      if (result.success) {
        setPurchaseNotice(`¡Compraste y equipaste: ${item.name}!`);
      } else {
        setPurchaseNotice(`Aviso: ${result.message}`);
      }
    }

    setTimeout(() => setPurchaseNotice(null), 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Mascot Showcase */}
        <View style={styles.mascotShowcase}>
          <MascotAguara
            size={130}
            speechText="¡Vísteme con las prendas del Chaco o adquiere vasijas protectoras!"
          />
          <View style={styles.walletBadge}>
            <Ionicons name="color-filter" size={20} color={colors.terracotaPrimary} />
            <Text style={styles.walletText}>{user.coinsMbae} Monedas Mba'e Disponibles</Text>
          </View>
        </View>

        {/* Purchase Notification */}
        {purchaseNotice && (
          <View style={styles.noticeBanner}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            <Text style={styles.noticeText}>{purchaseNotice}</Text>
          </View>
        )}

        {/* Ropa y Accesorios */}
        <Text style={styles.sectionHeader}>Ropa y Accesorios para Aguará</Text>

        {shopItems.filter(i => i.category === 'hat' || i.category === 'costume').map(item => {
          const isOwned = user.inventory.includes(item.key);
          const isEquipped = user.equippedHat === item.key || user.equippedOutfit === item.key;
          const iconName = getIcon(item.icon);

          return (
            <View key={item.id} style={styles.shopCard}>
              <View style={styles.shopIconCircle}>
                <Ionicons name={iconName} size={30} color={colors.terracotaPrimary} />
              </View>

              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={styles.itemTag}>
                  <Text style={styles.itemTagText}>{item.tag || item.category}</Text>
                </View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
              </View>

              <PressableScale
                style={[
                  styles.actionBtn,
                  isEquipped && styles.actionBtnEquipped,
                  isOwned && !isEquipped && styles.actionBtnOwned,
                ]}
                onPress={() => handleAction(item)}
                pulse={!isEquipped}
              >
                {isEquipped ? (
                  <Text style={styles.actionBtnText}>Equipado</Text>
                ) : isOwned ? (
                  <Text style={styles.actionBtnTextOwned}>Equipar</Text>
                ) : (
                  <View style={styles.priceRow}>
                    <Ionicons name="color-filter" size={14} color="#FFFFFF" />
                    <Text style={styles.priceText}>{item.price}</Text>
                  </View>
                )}
              </PressableScale>
            </View>
          );
        })}

        {/* Potenciadores */}
        <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Potenciadores del Chaco</Text>

        {shopItems.filter(i => i.category === 'powerup').map(item => {
          const iconName = getIcon(item.icon);
          return (
            <View key={item.id} style={styles.shopCard}>
              <View style={[styles.shopIconCircle, { backgroundColor: colors.montePastel }]}>
                <Ionicons name={iconName} size={30} color={colors.montePrimary} />
              </View>

              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={[styles.itemTag, { backgroundColor: colors.montePastel }]}>
                  <Text style={[styles.itemTagText, { color: colors.monteDark }]}>
                    {item.tag || item.category}
                  </Text>
                </View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
              </View>

              <PressableScale
                style={styles.actionBtn}
                onPress={() => handleAction(item)}
                pulse
              >
                <View style={styles.priceRow}>
                  <Ionicons name="color-filter" size={14} color="#FFFFFF" />
                  <Text style={styles.priceText}>{item.price}</Text>
                </View>
              </PressableScale>
            </View>
          );
        })}
      </ScrollView>
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
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sandBackground,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.terracotaPrimary,
    marginTop: 6,
    gap: 6,
  },
  walletText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.terracotaDark,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.montePrimary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 14,
    gap: 8,
  },
  noticeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.sandBorder,
  },
  shopIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.terracotaPastel,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTag: {
    backgroundColor: colors.terracotaPastel,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  itemTagText: { fontSize: 10, fontWeight: '800', color: colors.terracotaDark },
  itemName: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  itemDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  actionBtn: {
    backgroundColor: colors.montePrimary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 78,
    borderBottomWidth: 3,
    borderBottomColor: colors.monteDark,
  },
  actionBtnEquipped: {
    backgroundColor: colors.montePastel,
    borderWidth: 1.5,
    borderColor: colors.montePrimary,
  },
  actionBtnOwned: {
    backgroundColor: colors.sandBackground,
    borderWidth: 1.5,
    borderColor: colors.sandBorder,
  },
  actionBtnText: { color: colors.monteDark, fontSize: 12, fontWeight: '800' },
  actionBtnTextOwned: { color: colors.textPrimary, fontSize: 12, fontWeight: '800' },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
});