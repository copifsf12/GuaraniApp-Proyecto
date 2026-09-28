import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import MascotAguara from '../components/MascotAguara';
import CulturalCapsuleModal from '../components/CulturalCapsuleModal';
import HeartsModal from '../components/HeartsModal';
import WalkingAguara from '../components/WalkingAguara';
import NoHeartsModal from '../components/NoHeartsModal';
import { AGE_GROUPS } from '../data/initialData';

const NODE_SIZE = 80;
const NODE_VERTICAL_GAP = 220;
const NODE_OFFSETS = [0, 90, -90];
const DOTS_PER_SEGMENT = 9;

const DOTS_TOP_MARGIN = 115;
const DOTS_BOTTOM_MARGIN = 40;

const UNIT_DECORATIONS = {
  1: [
    { emoji: '🌿', top: 40,  left: '10%' },
    { emoji: '☀️', top: 130, left: '82%' },
    { emoji: '🌱', top: 260, left: '14%' },
    { emoji: '👋', top: 380, left: '80%' },
    { emoji: '🌿', top: 500, left: '12%' },
    { emoji: '☀️', top: 620, left: '84%' },
    { emoji: '🌱', top: 740, left: '16%' },
    { emoji: '👋', top: 860, left: '78%' }
  ],
  2: [
    { emoji: '🐾', top: 40,  left: '12%' },
    { emoji: '🌳', top: 130, left: '80%' },
    { emoji: '🍃', top: 260, left: '14%' },
    { emoji: '🐾', top: 380, left: '82%' },
    { emoji: '🌲', top: 500, left: '12%' },
    { emoji: '🍃', top: 620, left: '80%' },
    { emoji: '🐾', top: 740, left: '15%' },
    { emoji: '🌳', top: 860, left: '78%' }
  ],
  3: [
    { emoji: '🏠', top: 40,  left: '10%' },
    { emoji: '🔢', top: 130, left: '82%' },
    { emoji: '👨‍👩‍👧', top: 260, left: '12%' },
    { emoji: '🔢', top: 380, left: '80%' },
    { emoji: '🏡', top: 500, left: '14%' },
    { emoji: '👶', top: 620, left: '82%' },
    { emoji: '🔢', top: 740, left: '12%' },
    { emoji: '🏠', top: 860, left: '78%' }
  ]
};

function FloatingEmoji({ emoji, top, left, delay = 0 }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000 + delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000 + delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12]
  });

  const rotate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg']
  });

  return (
    <Animated.Text
      style={[
        styles.decorationEmoji,
        { top, left, transform: [{ translateY }, { rotate }] }
      ]}
      pointerEvents="none"
    >
      {emoji}
    </Animated.Text>
  );
}

function PulsingNode({ isCurrent, children }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isCurrent) {
      pulseAnim.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isCurrent]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      {children}
    </Animated.View>
  );
}

function WaveDot({ delay, size, opacity, color, isSparkle }) {
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.delay(1200 - delay)
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay]);

  const scale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.35]
  });

  const shadowOpacity = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.45]
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          opacity,
          backgroundColor: isSparkle ? colors.solGold : color,
          shadowColor: colors.monteDark,
          shadowOpacity,
          transform: [{ scale }]
        }
      ]}
    />
  );
}

export default function PathScreen() {
  const {
    user,
    units,
    unitsLoading,
    navigateTo,
    buyShopItem,
    pendingAguaraWalk,
    setPendingAguaraWalk,
    startGame,
    setActiveTab,
    setCurrentScreen
  } = useApp();

  const [activeCapsule, setActiveCapsule] = useState(null);
  const [heartsModalVisible, setHeartsModalVisible] = useState(false);
  const [buyingRefill, setBuyingRefill] = useState(false);
  // 🎯 NUEVO: modal de "sin corazones"
  const [noHeartsModalVisible, setNoHeartsModalVisible] = useState(false);

  const ageGroup = useMemo(() => {
    const userGroup = user?.ageGroup || 'adulto';
    return AGE_GROUPS.find(g => g.id === userGroup) || AGE_GROUPS[2];
  }, [user?.ageGroup]);

  const unitsLimit = ageGroup.unitsLimit || 3;
  const lessonsLimit = ageGroup.lessonsLimit || 3;

  const filteredUnits = useMemo(() => {
    return units
      .slice(0, unitsLimit)
      .map(unit => {
        const allLessons = unit.lessons || [];
        let selectedLessons;

        if (ageGroup.id === 'nino') {
          const normalLessons = allLessons.filter(l => l.type === 'normal');
          const gameLessons = allLessons.filter(l => l.type === 'game');
          selectedLessons = [
            ...normalLessons.slice(0, 1),
            ...gameLessons.slice(0, 2)
          ];
        } else {
          const normalLessons = allLessons.filter(l => l.type === 'normal');
          const gameLessons = allLessons.filter(l => l.type === 'game');
          selectedLessons = [
            ...normalLessons.slice(0, lessonsLimit),
            ...gameLessons.slice(0, 2)
          ];
        }

        const orderedLessons = [];
        const normals = selectedLessons.filter(l => l.type === 'normal');
        const games = selectedLessons.filter(l => l.type === 'game');
        const maxLen = Math.max(normals.length, games.length);

        for (let i = 0; i < maxLen; i++) {
          if (normals[i]) orderedLessons.push(normals[i]);
          if (games[i]) orderedLessons.push(games[i]);
        }

        return { ...unit, lessons: orderedLessons };
      })
      .filter(unit => unit.lessons.length > 0);
  }, [units, unitsLimit, lessonsLimit, ageGroup]);

  const currentNodeInfo = useMemo(() => {
    for (const unit of filteredUnits) {
      for (let idx = 0; idx < unit.lessons.length; idx++) {
        const lesson = unit.lessons[idx];
        const isCompleted = user.completedLessons.includes(lesson.id);
        if (!isCompleted) {
          return {
            unitId: unit.id,
            lessonId: lesson.id,
            lessonIndex: idx,
            offsetX: NODE_OFFSETS[idx % NODE_OFFSETS.length]
          };
        }
      }
    }
    return null;
  }, [filteredUnits, user.completedLessons]);

  useEffect(() => {
    if (!pendingAguaraWalk) return;

    if (pendingAguaraWalk.type === 'walk-to-next' && pendingAguaraWalk.nextLessonId) {
      const nextId = pendingAguaraWalk.nextLessonId;
      const timer = setTimeout(() => {
        setPendingAguaraWalk(null);
        navigateTo('lesson_tutorial', { lessonId: nextId });
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setPendingAguaraWalk(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [pendingAguaraWalk]);

  // 🎯 Verificar si tiene corazones
  const hasHearts = (user?.hearts || 0) > 0;

  // 🎯 Ir a la tienda desde el modal
  const handleGoToShop = () => {
    setNoHeartsModalVisible(false);
    setActiveTab('shop');
    setCurrentScreen('main');
  };

  // 🎯 MODIFICADO: Verificar corazones antes de entrar
  const handleNodePress = (lesson) => {
    // 🎯 Verificar corazones primero (solo para lecciones y juegos, no cofres)
    if (lesson.type !== 'chest' && !hasHearts) {
      setNoHeartsModalVisible(true);
      return;
    }

    // Cofre → modal cultural
    if (lesson.type === 'chest') {
      setActiveCapsule(lesson.cultural_capsule);
      return;
    }
    // Juego → pantalla de juego
    if (lesson.type === 'game') {
      if (startGame) {
        startGame(lesson);
      } else {
        console.warn('startGame no está disponible en AppContext');
      }
      return;
    }
    // Lección normal → tutorial
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

  const renderSegmentDots = (unitId, fromIdx, fromOffset, toOffset) => {
    const dots = [];

    for (let d = 0; d < DOTS_PER_SEGMENT; d++) {
      const t = (d + 1) / (DOTS_PER_SEGMENT + 1);

      const yStart = DOTS_TOP_MARGIN;
      const yEnd = NODE_VERTICAL_GAP - DOTS_BOTTOM_MARGIN;

      const xPos = fromOffset + (toOffset - fromOffset) * t;
      const yPos = yStart + (yEnd - yStart) * t;

      const size = 6 + t * 8;
      const opacity = 0.5 + t * 0.5;
      const isSparkle = (d + 1) % 4 === 0;

      dots.push(
        <View
          key={`dot-wrapper-${unitId}-${fromIdx}-${d}`}
          style={[
            styles.dotWrapper,
            {
              top: yPos,
              transform: [{ translateX: xPos }]
            }
          ]}
        >
          <WaveDot
            delay={d * 150}
            size={size}
            opacity={opacity}
            color={colors.monteMedium}
            isSparkle={isSparkle}
          />
        </View>
      );
    }
    return dots;
  };

  return (
    <LinearGradient
      colors={[colors.sandBackground, '#F0F4E8']}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <Header
          onVariantPress={() => navigateTo('onboarding')}
          onHeartsPress={() => setHeartsModalVisible(true)}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {unitsLoading && units.length === 0 && (
            <Text style={styles.loadingText}>Cargando tu sendero...</Text>
          )}

          {filteredUnits.map(unit => {
            const decorations = UNIT_DECORATIONS[unit.id] || [];

            return (
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
                  <Text style={styles.kaaguyText}>Sendero Ka'aguy</Text>
                </View>

                <View style={styles.trailWrapper}>
                  {decorations.map((deco, i) => (
                    <FloatingEmoji
                      key={`deco-${unit.id}-${i}`}
                      emoji={deco.emoji}
                      top={deco.top}
                      left={deco.left}
                      delay={i * 200}
                    />
                  ))}

                  <View style={styles.trailContainer}>
                    {unit.lessons.map((lesson, idx) => {
                      const isCompleted = user.completedLessons.includes(lesson.id);
                      const isCurrent = !isCompleted && (
                        idx === 0 || user.completedLessons.includes(unit.lessons[idx - 1]?.id)
                      );
                      const isLocked = !isCompleted && !isCurrent;

                      const offsetX = NODE_OFFSETS[idx % NODE_OFFSETS.length];
                      const nextOffset = NODE_OFFSETS[(idx + 1) % NODE_OFFSETS.length];
                      const isLast = idx === unit.lessons.length - 1;

                      const isGlobalCurrent =
                        currentNodeInfo &&
                        currentNodeInfo.unitId === unit.id &&
                        currentNodeInfo.lessonId === lesson.id;

                      return (
                        <View key={lesson.id} style={styles.nodeSlotWrapper}>
                          <View style={styles.nodeSlot}>
                            <View style={[styles.nodeRow, { transform: [{ translateX: offsetX }] }]}>
                              {isGlobalCurrent && (
                                <View style={styles.aguaraSlot}>
                                  <WalkingAguara size={140} />
                                </View>
                              )}

                              <View style={styles.nodeColumn}>
                                {isCurrent && (
                                  <View style={styles.startBubble}>
                                    <Text style={styles.startBubbleText}>¡EMPEZAR!</Text>
                                    <View style={styles.startBubbleTail} />
                                  </View>
                                )}

                                <PulsingNode isCurrent={isCurrent}>
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
                                      lesson.type === 'game' && styles.nodeGame,
                                    ]}
                                  >
                                    {lesson.type === 'chest' ? (
                                      <Ionicons name="gift" size={34} color={isCompleted ? colors.solGold : '#B8860B'} />
                                    ) : lesson.type === 'checkpoint_teta' ? (
                                      <Ionicons name="home" size={36} color="#FFFFFF" />
                                    ) : lesson.type === 'game' ? (
                                      <Ionicons name="game-controller" size={34} color="#FFFFFF" />
                                    ) : isCompleted ? (
                                      <Ionicons name="checkmark" size={38} color="#FFFFFF" />
                                    ) : isCurrent ? (
                                      <Ionicons name="star" size={36} color="#FFFFFF" />
                                    ) : (
                                      <Ionicons name="lock-closed" size={30} color="#9E9E9E" />
                                    )}

                                    {isCompleted && lesson.type !== 'chest' && (
                                      <View style={styles.crownBadge}>
                                        <Ionicons name="ribbon" size={14} color="#FFFFFF" />
                                      </View>
                                    )}
                                  </TouchableOpacity>
                                </PulsingNode>

                                <Text style={[styles.nodeTitle, isLocked && styles.nodeTitleLocked]}>
                                  {lesson.title}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {!isLast && (
                            <View
                              style={[styles.dotsContainer, { transform: [{ translateX: offsetX }] }]}
                              pointerEvents="none"
                            >
                              {renderSegmentDots(unit.id, idx, 0, nextOffset - offsetX)}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            );
          })}

          <View style={styles.pathCheerSection}>
            <MascotAguara
              size={110}
              speechText={
                hasHearts
                  ? "¡Vas por excelente camino! La sabiduría del Chaco te acompaña."
                  : "¡Sin corazones no podemos seguir! Compra en la tienda para continuar."
              }
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

        {/* 🎯 NUEVO: Modal sin corazones */}
        <NoHeartsModal
          visible={noHeartsModalVisible}
          onClose={() => setNoHeartsModalVisible(false)}
          onGoToShop={handleGoToShop}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  loadingText: { textAlign: 'center', marginTop: 20, color: colors.textMuted },
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
  unitTitleGuarani: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginTop: 2 },
  unitTitleSpanish: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 13, fontWeight: '600' },
  unitIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', marginLeft: 12,
  },

  kaaguyBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
    backgroundColor: colors.sandCard,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14,
    borderWidth: 1, borderColor: colors.sandBorder,
    marginTop: 12, marginBottom: 8, gap: 6,
  },
  kaaguyText: { fontSize: 12, fontWeight: '700', color: colors.monteDark },

  trailWrapper: { position: 'relative', width: '100%', paddingVertical: 20 },
  decorationEmoji: { position: 'absolute', fontSize: 44, opacity: 0.6, zIndex: 1 },

  trailContainer: { alignItems: 'center', zIndex: 2 },
  nodeSlotWrapper: { position: 'relative', width: '100%', alignItems: 'center' },
  nodeSlot: {
    height: NODE_VERTICAL_GAP, justifyContent: 'center', alignItems: 'center',
    position: 'relative', width: '100%',
  },
  nodeRow: { alignItems: 'center', position: 'relative', zIndex: 10 },
  nodeColumn: { alignItems: 'center' },

  dotsContainer: {
    position: 'absolute', top: '50%', left: '50%',
    width: 0, height: 0, zIndex: 0,
  },
  dotWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },

  aguaraSlot: {
    position: 'absolute', left: -140, top: -30,
    width: 140, height: 140, zIndex: 999,
  },

  startBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14,
    borderWidth: 2, borderColor: colors.montePrimary,
    marginBottom: 6, alignItems: 'center',
  },
  startBubbleText: { fontSize: 12, fontWeight: '900', color: colors.monteDark },
  startBubbleTail: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 6,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: colors.montePrimary, marginTop: 2,
  },

  nodeCircle: {
    width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_SIZE / 2,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderBottomWidth: 6,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 5, elevation: 5,
    position: 'relative',
  },
  nodeCircleCompleted: {
    backgroundColor: colors.solGold,
    borderColor: '#D4AF37', borderBottomColor: '#B8860B',
  },
  nodeCircleCurrent: {
    backgroundColor: colors.montePrimary,
    borderColor: colors.monteLight, borderBottomColor: colors.monteDark,
  },
  nodeCircleLocked: {
    backgroundColor: '#E0E0E0',
    borderColor: '#D5D5D5', borderBottomColor: '#BDBDBD',
  },
  nodeChest: {
    backgroundColor: '#FFF8DC',
    borderColor: colors.solGold, borderBottomColor: '#CD853F',
  },
  nodeTeta: {
    backgroundColor: colors.terracotaPrimary,
    borderColor: colors.terracotaMedium, borderBottomColor: colors.terracotaDark,
  },
  nodeGame: {
    backgroundColor: colors.aretePurple,
    borderColor: '#AB47BC', borderBottomColor: '#6B1B9A',
  },
  crownBadge: {
    position: 'absolute', top: -6, right: -4,
    backgroundColor: colors.aretePurple,
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  nodeTitle: {
    fontSize: 13, fontWeight: '700', color: colors.textPrimary,
    marginTop: 10, maxWidth: 160, textAlign: 'center',
  },
  nodeTitleLocked: { color: colors.textMuted },
  pathCheerSection: { alignItems: 'center', marginTop: 20 },
});