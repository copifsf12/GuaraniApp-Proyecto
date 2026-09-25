import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import MascotAguara from '../components/MascotAguara';
import CulturalCapsuleModal from '../components/CulturalCapsuleModal';
import HeartsModal from '../components/HeartsModal';

export default function PathScreen() {
  const { user, units, unitsLoading, navigateTo, buyShopItem } = useApp();
  const [activeCapsule, setActiveCapsule] = useState(null);
  const [heartsModalVisible, setHeartsModalVisible] = useState(false);
  const [buyingRefill, setBuyingRefill] = useState(false);

  const nodeOffsets = [0, 50, -40, 45, 0];

  const handleNodePress = (lesson) => {
    if (lesson.type === 'chest') {
      setActiveCapsule(lesson.cultural_capsule);
      return;
    }
    navigateTo('lesson_tutorial', { lessonId: lesson.id });
  };

  const handleBuyRefill = async () => {
    setBuyingRefill(true);
    const result = await buyShopItem('refill_hearts');
    setBuyingRefill(false);
    if (result.success) {
      setHeartsModalVisible(false);
    } else {
      Alert.alert('Error', result.message || 'No se pudo recargar');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        onVariantPress={() => navigateTo('onboarding')}
        onHeartsPress={() => setHeartsModalVisible(true)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {unitsLoading && units.length === 0 && (
          <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textMuted }}>
            Cargando tu sendero de aprendizaje...
          </Text>
        )}
        {units.map(unit => (
          <View key={unit.id} style={styles.unitContainer}>
            <View style={[styles.unitBanner, { backgroundColor: unit.theme_color }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.unitNumber}>UNIDAD {unit.unit_number}</Text>
                <Text style={styles.unitTitleGuarani}>{unit.title_guarani}</Text>
                <Text style={styles.unitTitleSpanish}>{unit.title_spanish}</Text>
              </View>
              <View style={styles.unitIconCircle}>
                <Ionicons
                  name={unit.id === 1 ? 'hand-right' : 'paw'}
                  size={26}
                  color={unit.theme_color}
                />
              </View>
            </View>

            <View style={styles.kaaguyBadge}>
              <Ionicons name="trail-sign" size={16} color={colors.montePrimary} />
              <Text style={styles.kaaguyText}>Sendero Ka'aguy (Monte Chaqueño)</Text>
            </View>

            <View style={styles.pathTrail}>
              {unit.lessons.map((lesson, idx) => {
                const isCompleted = user.completedLessons.includes(lesson.id);
                const isCurrent = !isCompleted && (idx === 0 || user.completedLessons.includes(unit.lessons[idx - 1]?.id));
                const isLocked = !isCompleted && !isCurrent;
                const offset = nodeOffsets[idx % nodeOffsets.length];

                return (
                  <View
                    key={lesson.id}
                    style={[styles.nodeWrapper, { transform: [{ translateX: offset }] }]}
                  >
                    {isCurrent && (
                      <View style={styles.startBubble}>
                        <Text style={styles.startBubbleText}>¡EMPEZAR!</Text>
                        <View style={styles.startBubbleTail} />
                      </View>
                    )}

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => !isLocked && handleNodePress(lesson)}
                      disabled={isLocked}
                      style={[
                        styles.nodeCircle,
                        isCompleted && styles.nodeCircleCompleted,
                        isCurrent && styles.nodeCircleCurrent,
                        isLocked && styles.nodeCircleLocked,
                        lesson.type === 'chest' && styles.nodeChest,
                        lesson.type === 'checkpoint_teta' && styles.nodeTeta,
                      ]}
                    >
                      {lesson.type === 'chest' ? (
                        <Ionicons name="gift" size={32} color={isCompleted ? colors.solGold : '#B8860B'} />
                      ) : lesson.type === 'checkpoint_teta' ? (
                        <Ionicons name="home" size={34} color="#FFFFFF" />
                      ) : isCompleted ? (
                        <Ionicons name="checkmark" size={36} color="#FFFFFF" />
                      ) : isCurrent ? (
                        <Ionicons name="star" size={34} color="#FFFFFF" />
                      ) : (
                        <Ionicons name="lock-closed" size={28} color="#9E9E9E" />
                      )}

                      {isCompleted && lesson.type !== 'chest' && (
                        <View style={styles.crownBadge}>
                          <Ionicons name="ribbon" size={14} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>

                    <Text style={[styles.nodeTitle, isLocked && styles.nodeTitleLocked]}>
                      {lesson.title}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.pathCheerSection}>
          <MascotAguara
            size={110}
            speechText="¡Vas por excelente camino! La sabiduría del Chaco te acompaña."
          />
        </View>
      </ScrollView>

      {activeCapsule && (
        <CulturalCapsuleModal
          visible={!!activeCapsule}
          title={activeCapsule.title}
          content={activeCapsule.content}
          onClose={() => setActiveCapsule(null)}
        />
      )}

      <HeartsModal
        visible={heartsModalVisible}
        user={user}
        buyLoading={buyingRefill}
        onClose={() => setHeartsModalVisible(false)}
        onBuyRefill={handleBuyRefill}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sandBackground },
  scrollContent: { paddingBottom: 40 },
  unitContainer: { marginBottom: 24 },
  unitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  unitNumber: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  unitTitleGuarani: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  unitTitleSpanish: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  unitIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  kaaguyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.sandCard,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    marginTop: 12,
    marginBottom: 8,
    gap: 6,
  },
  kaaguyText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.monteDark,
  },
  pathTrail: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  nodeWrapper: {
    alignItems: 'center',
    marginVertical: 14,
  },
  startBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.montePrimary,
    marginBottom: 6,
    alignItems: 'center',
  },
  startBubbleText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.monteDark,
  },
  startBubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.montePrimary,
    marginTop: 2,
  },
  nodeCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderBottomWidth: 6,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    position: 'relative',
  },
  nodeCircleCompleted: {
    backgroundColor: colors.solGold,
    borderColor: '#D4AF37',
    borderBottomColor: '#B8860B',
  },
  nodeCircleCurrent: {
    backgroundColor: colors.montePrimary,
    borderColor: colors.monteLight,
    borderBottomColor: colors.monteDark,
  },
  nodeCircleLocked: {
    backgroundColor: '#E0E0E0',
    borderColor: '#D5D5D5',
    borderBottomColor: '#BDBDBD',
  },
  nodeChest: {
    backgroundColor: '#FFF8DC',
    borderColor: colors.solGold,
    borderBottomColor: '#CD853F',
  },
  nodeTeta: {
    backgroundColor: colors.terracotaPrimary,
    borderColor: colors.terracotaMedium,
    borderBottomColor: colors.terracotaDark,
  },
  crownBadge: {
    position: 'absolute',
    top: -6,
    right: -4,
    backgroundColor: colors.aretePurple,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nodeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
    maxWidth: 140,
    textAlign: 'center',
  },
  nodeTitleLocked: {
    color: colors.textMuted,
  },
  pathCheerSection: {
    alignItems: 'center',
    marginTop: 10,
  },
});