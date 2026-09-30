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
  Easing,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import MascotAguara from '../components/MascotAguara';
import CulturalCapsuleModal from '../components/CulturalCapsuleModal';
import HeartsModal from '../components/HeartsModal';
import WalkingAguara from '../components/WalkingAguara';
import NoHeartsModal from '../components/NoHeartsModal';
import PathBackground from '../components/PathBackground';
import { AGE_GROUPS } from '../data/initialData';

// 🎯 NUEVOS MODALES
import AlphabetScreen from './AlphabetScreen';
import NumbersScreen from './NumbersScreen';
import CertificateScreen from './CertificateScreen';

const NODE_SIZE = 80;
const NODE_VERTICAL_GAP = 190;
const NODE_OFFSETS = [0, 90, -90];
const DOTS_PER_SEGMENT = 9;

const DOTS_TOP_MARGIN = 95;
const DOTS_BOTTOM_MARGIN = 35;

const UNIT_DECORATIONS = {
  1: [
    { emoji: '🌿', top: 30, left: '8%' },
    { emoji: '☀️', top: 110, left: '85%' },
    { emoji: '🌱', top: 220, left: '12%' },
    { emoji: '👋', top: 330, left: '82%' },
    { emoji: '🌿', top: 440, left: '10%' },
    { emoji: '☀️', top: 550, left: '86%' },
    { emoji: '🌱', top: 660, left: '14%' },
    { emoji: '👋', top: 770, left: '80%' },
  ],
  2: [
    { emoji: '🐾', top: 30, left: '10%' },
    { emoji: '🌳', top: 110, left: '84%' },
    { emoji: '🍃', top: 220, left: '12%' },
    { emoji: '🐾', top: 330, left: '86%' },
    { emoji: '🌲', top: 440, left: '10%' },
    { emoji: '🍃', top: 550, left: '84%' },
    { emoji: '🐾', top: 660, left: '13%' },
    { emoji: '🌳', top: 770, left: '82%' },
  ],
  3: [
    { emoji: '🏠', top: 30, left: '8%' },
    { emoji: '🔢', top: 110, left: '86%' },
    { emoji: '👨‍👩‍👧', top: 220, left: '10%' },
    { emoji: '🔢', top: 330, left: '84%' },
    { emoji: '🏡', top: 440, left: '12%' },
    { emoji: '👶', top: 550, left: '86%' },
    { emoji: '🔢', top: 660, left: '10%' },
    { emoji: '🏠', top: 770, left: '82%' },
  ],
};

// 🐾 Huellas y hojas entre nodos
function TrailMarker({ emoji, top, left, delay = 0, isDark }) {
  const wobble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(wobble, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(wobble, { toValue: -1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const rotate = wobble.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        styles.trailMarker,
        {
          top,
          left,
          opacity: isDark ? 0.3 : 0.5,
          transform: [{ rotate }],
        }
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

// ✨ Partículas flotantes alrededor del nodo actual
function NodeParticles({ color }) {
  const particles = [0, 1, 2, 3];
  const anims = particles.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    particles.forEach((_, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 400),
          Animated.timing(anims[i], { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(anims[i], { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const positions = [
    { top: -80, left: -80 },
    { top: -85, left: 30 },
    { top: 15, left: -90 },
    { top: 10, left: 40 },
  ];

  return (
    <>
      {particles.map((_, i) => {
        const opacity = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        });
        const translateY = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15],
        });

        return (
          <Animated.Text
            key={i}
            pointerEvents="none"
            style={[
              styles.particle,
              {
                top: positions[i].top,
                left: positions[i].left,
                opacity,
                transform: [{ translateY }],
              }
            ]}
          >
            ✨
          </Animated.Text>
        );
      })}
    </>
  );
}

function FloatingEmoji({ emoji, top, left, delay = 0, isDark }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2000 + delay, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000 + delay, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const rotate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <Animated.Text
      style={[
        styles.decorationEmoji,
        {
          top,
          left,
          opacity: isDark ? 0.35 : 0.55,
          transform: [{ translateY }, { rotate }],
        }
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
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
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

function WaveDot({ delay, size, opacity, color, isSparkle, monteDark, solGold }) {
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(waveAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.delay(1200 - delay),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay]);

  const scale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.35],
  });

  const shadowOpacity = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.45],
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
          backgroundColor: isSparkle ? solGold : color,
          shadowColor: monteDark,
          shadowOpacity,
          transform: [{ scale }],
        }
      ]}
    />
  );
}

export default function PathScreen() {
  const { theme, isDark } = useTheme();
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
    setCurrentScreen,
  } = useApp();

  const [activeCapsule, setActiveCapsule] = useState(null);
  const [heartsModalVisible, setHeartsModalVisible] = useState(false);
  const [buyingRefill, setBuyingRefill] = useState(false);
  const [noHeartsModalVisible, setNoHeartsModalVisible] = useState(false);

  const [showAlphabet, setShowAlphabet] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

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
          selectedLessons = [...normalLessons.slice(0, 1), ...gameLessons.slice(0, 2)];
        } else {
          const normalLessons = allLessons.filter(l => l.type === 'normal');
          const gameLessons = allLessons.filter(l => l.type === 'game');
          selectedLessons = [...normalLessons.slice(0, lessonsLimit), ...gameLessons.slice(0, 2)];
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
            offsetX: NODE_OFFSETS[idx % NODE_OFFSETS.length],
          };
        }
      }
    }
    return null;
  }, [filteredUnits, user.completedLessons]);

  // 🎓 Verificar si completó TODAS las lecciones del curso
  const allLessonsCompleted = useMemo(() => {
    if (!filteredUnits || filteredUnits.length === 0) return false;
    const totalLessons = filteredUnits.reduce(
      (sum, unit) => sum + (unit.lessons?.length || 0),
      0
    );
    const completedCount = filteredUnits.reduce((sum, unit) => {
      return sum + (unit.lessons?.filter(l => user.completedLessons?.includes(l.id)).length || 0);
    }, 0);
    return totalLessons > 0 && completedCount === totalLessons;
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
      const timer = setTimeout(() => setPendingAguaraWalk(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [pendingAguaraWalk]);

  const hasHearts = (user?.hearts || 0) > 0;

  const handleGoToShop = () => {
    setNoHeartsModalVisible(false);
    setActiveTab('shop');
    setCurrentScreen('main');
  };

  const handleNodePress = (lesson) => {
    if (lesson.type !== 'chest' && !hasHearts) {
      setNoHeartsModalVisible(true);
      return;
    }
    if (lesson.type === 'chest') {
      setActiveCapsule(lesson.cultural_capsule);
      return;
    }
    if (lesson.type === 'game') {
      if (startGame) startGame(lesson);
      return;
    }
    navigateTo('lesson_tutorial', { lessonId: lesson.id });
  };

  const handleBuyRefill = async () => {
    setBuyingRefill(true);
    const result = await buyShopItem('refill_hearts');
    setBuyingRefill(false);
    if (result.success) setHeartsModalVisible(false);
    else Alert.alert('Error', result.message || 'No se pudo recargar');
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
          style={[styles.dotWrapper, { top: yPos, transform: [{ translateX: xPos }] }]}
        >
          <WaveDot
            delay={d * 150}
            size={size}
            opacity={opacity}
            color={theme.monteMedium}
            isSparkle={isSparkle}
            monteDark={theme.monteDark}
            solGold={theme.solGold}
          />
        </View>
      );
    }
    return dots;
  };

  return (
    <>
      <LinearGradient
        colors={isDark ? ['#121212', '#1A1A1A'] : [theme.sandBackground, '#E8F0E0']}
        style={styles.container}
      >
        {/* 🌄 FONDO PREMIUM */}
        <PathBackground isDark={isDark} />

        <SafeAreaView style={styles.container}>
          <Header
            onVariantPress={() => navigateTo('onboarding')}
            onHeartsPress={() => setHeartsModalVisible(true)}
          />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ═══════════ HERRAMIENTAS DE ESTUDIO ═══════════ */}
            <View style={styles.referenceSection}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                📚 Herramientas de Estudio
              </Text>

              <View style={styles.referenceCardsContainer}>
                <TouchableOpacity
                  style={[styles.referenceCard, { borderColor: isDark ? '#333333' : '#FFFFFF' }]}
                  onPress={() => setShowAlphabet(true)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={isDark ? ['#2D6A4F', '#1B4332'] : ['#A8E6CF', '#56C596']}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.decorativeEmoji}>🔤</Text>
                    <View style={[styles.iconWrapper, { backgroundColor: isDark ? '#1E1E1E' : 'rgba(255, 255, 255, 0.9)' }]}>
                      <Text style={[styles.iconLetter, { color: isDark ? '#52B788' : '#2E7D32' }]}>Aa</Text>
                    </View>
                    <Text style={styles.refCardTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                      Abecedario
                    </Text>
                    <Text style={styles.refCardSubtitle} numberOfLines={1} adjustsFontSizeToFit>
                      Las letras
                    </Text>
                    <View style={[styles.actionPill, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0, 0, 0, 0.2)' }]}>
                      <Text style={styles.actionPillText}>Explorar</Text>
                      <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.referenceCard, { borderColor: isDark ? '#333333' : '#FFFFFF' }]}
                  onPress={() => setShowNumbers(true)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={isDark ? ['#7A4F2E', '#4A2F1A'] : ['#FFD3A5', '#FD9A5B']}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.decorativeEmoji}>🔢</Text>
                    <View style={[styles.iconWrapper, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
                      <Text style={[styles.iconLetter, { color: isDark ? '#FFB86B' : '#FD9A5B' }]}>123</Text>
                    </View>
                    <Text style={styles.refCardTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                      Números
                    </Text>
                    <Text style={styles.refCardSubtitle} numberOfLines={1} adjustsFontSizeToFit>
                      Del 1 al 1000
                    </Text>
                    <View style={[styles.actionPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#FFFFFF' }]}>
                      <Text style={[styles.actionPillText, { color: isDark ? '#FFB86B' : '#FD9A5B' }]}>Explorar</Text>
                      <Ionicons name="arrow-forward" size={12} color={isDark ? '#FFB86B' : '#FD9A5B'} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {unitsLoading && units.length === 0 && (
              <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando tu sendero...</Text>
            )}

            {filteredUnits.map(unit => {
              const decorations = UNIT_DECORATIONS[unit.id] || [];
              const completedInUnit = unit.lessons.filter(l => user.completedLessons.includes(l.id)).length;
              const unitProgress = unit.lessons.length > 0 ? (completedInUnit / unit.lessons.length) * 100 : 0;

              return (
                <View key={unit.id} style={styles.unitContainer}>
                  <View style={[styles.unitBannerWrapper, { backgroundColor: unit.theme_color }]}>
                    <LinearGradient
                      colors={[unit.theme_color, unit.theme_color + 'DD']}
                      style={styles.unitBanner}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
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
                    </LinearGradient>

                    <View style={styles.unitProgressRow}>
                      <View style={styles.unitProgressBar}>
                        <View style={[styles.unitProgressFill, { width: `${unitProgress}%` }]} />
                      </View>
                      <Text style={styles.unitProgressText}>
                        {completedInUnit}/{unit.lessons.length}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.kaaguyBadge, {
                    backgroundColor: isDark ? '#1E1E1E' : theme.sandCard,
                    borderColor: isDark ? '#333333' : theme.sandBorder,
                  }]}>
                    <Ionicons name="trail-sign" size={16} color={theme.montePrimary} />
                    <Text style={[styles.kaaguyText, { color: theme.monteDark }]}>Sendero Ka'aguy</Text>
                  </View>

                  <View style={styles.trailWrapper}>
                    {decorations.map((deco, i) => (
                      <FloatingEmoji
                        key={`deco-${unit.id}-${i}`}
                        emoji={deco.emoji}
                        top={deco.top}
                        left={deco.left}
                        delay={i * 200}
                        isDark={isDark}
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
                                    <View style={[styles.startBubble, {
                                      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                                      borderColor: theme.montePrimary,
                                    }]}>
                                      <Text style={[styles.startBubbleText, { color: theme.monteDark }]}>¡EMPEZAR!</Text>
                                      <View style={[styles.startBubbleTail, { borderTopColor: theme.montePrimary }]} />
                                    </View>
                                  )}

                                  {isCurrent && <NodeParticles color={theme.solGold} />}

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
                                        <Ionicons name="gift" size={34} color={isCompleted ? theme.solGold : '#B8860B'} />
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

                                  <Text style={[styles.nodeTitle, { color: theme.textPrimary }, isLocked && { color: theme.textMuted }]}>
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

                                <TrailMarker
                                  emoji="🐾"
                                  top={DOTS_TOP_MARGIN + 30}
                                  left={-15}
                                  delay={idx * 300}
                                  isDark={isDark}
                                />
                                <TrailMarker
                                  emoji="🍃"
                                  top={DOTS_TOP_MARGIN + 100}
                                  left={15}
                                  delay={idx * 300 + 300}
                                  isDark={isDark}
                                />
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

            {/* 🎓 CERTIFICADO — Aparece al completar todas las lecciones */}
            {allLessonsCompleted && (
              <View style={styles.certificateSection}>
                <LinearGradient
                  colors={isDark ? ['#4A3A1F', '#2A1508'] : ['#FFE8A3', '#FFD54F']}
                  style={styles.certificateBanner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.certificateEmoji}>🎓</Text>
                  <Text style={[styles.certificateTitle, { color: isDark ? '#FFD166' : theme.terracotaDark }]}>
                    ¡Curso Completado!
                  </Text>
                  <Text style={[styles.certificateText, { color: isDark ? '#FFB86B' : theme.terracotaPrimary }]}>
                    Has terminado todas las lecciones del Guaraní Oriental Boliviano
                  </Text>
                  <TouchableOpacity
                    style={styles.certificateBtn}
                    onPress={() => setShowCertificate(true)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="ribbon" size={20} color="#FFFFFF" />
                    <Text style={styles.certificateBtnText}>Ver mi Certificado</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}

            <View style={styles.pathCheerSection}>
              <MascotAguara
                size={110}
                speechText={
                  hasHearts
                    ? '¡Vas por excelente camino! La sabiduría del Chaco te acompaña.'
                    : '¡Sin corazones no podemos seguir! Compra en la tienda para continuar.'
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

          <NoHeartsModal
            visible={noHeartsModalVisible}
            onClose={() => setNoHeartsModalVisible(false)}
            onGoToShop={handleGoToShop}
          />
        </SafeAreaView>
      </LinearGradient>

      <Modal
        visible={showAlphabet}
        animationType="slide"
        onRequestClose={() => setShowAlphabet(false)}
        presentationStyle="fullScreen"
      >
        <AlphabetScreen onClose={() => setShowAlphabet(false)} />
      </Modal>

      <Modal
        visible={showNumbers}
        animationType="slide"
        onRequestClose={() => setShowNumbers(false)}
        presentationStyle="fullScreen"
      >
        <NumbersScreen onClose={() => setShowNumbers(false)} />
      </Modal>

      {/* 🎓 MODAL DEL CERTIFICADO */}
      <Modal
        visible={showCertificate}
        animationType="slide"
        onRequestClose={() => setShowCertificate(false)}
        presentationStyle="fullScreen"
      >
        <CertificateScreen onClose={() => setShowCertificate(false)} />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  loadingText: { textAlign: 'center', marginTop: 20 },
  unitContainer: { marginBottom: 24 },

  // 🌿 DECORACIONES
  decorationEmoji: {
    position: 'absolute',
    fontSize: 42,
    zIndex: 1,
  },
  trailMarker: {
    position: 'absolute',
    fontSize: 18,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    fontSize: 14,
    zIndex: 999,
  },

  // ═══════════ HERRAMIENTAS DE ESTUDIO ═══════════
  referenceSection: { marginTop: 16, marginBottom: 12, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 12, marginLeft: 4 },
  referenceCardsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  referenceCard: {
    flex: 1, borderRadius: 22, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 8, borderWidth: 3,
  },
  cardGradient: {
    padding: 12, paddingTop: 16, minHeight: 175,
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  decorativeEmoji: {
    position: 'absolute', bottom: -15, right: -10,
    fontSize: 80, opacity: 0.15, zIndex: 1,
  },
  iconWrapper: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 5, zIndex: 3,
    borderWidth: 3, borderColor: '#FFFFFF',
  },
  iconLetter: { fontSize: 22, fontWeight: '900' },
  refCardTitle: {
    fontSize: 14, fontWeight: '900', color: '#FFFFFF', marginBottom: 2,
    textAlign: 'center', zIndex: 3,
    textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2, width: '100%',
  },
  refCardSubtitle: {
    fontSize: 10, color: 'rgba(255,255,255,0.9)', fontWeight: '700',
    textAlign: 'center', zIndex: 3, marginBottom: 8, width: '100%',
  },
  actionPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4, zIndex: 3,
  },
  actionPillText: { fontSize: 10, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },

  // ═══════════ BANNER DE UNIDAD ═══════════
  unitBannerWrapper: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  unitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  unitNumber: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11, fontWeight: '800', letterSpacing: 1.2,
  },
  unitTitleGuarani: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginTop: 2 },
  unitTitleSpanish: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 13, fontWeight: '600' },
  unitIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', marginLeft: 12,
  },
  unitProgressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 10,
    gap: 10,
  },
  unitProgressBar: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  unitProgressFill: {
    height: '100%', borderRadius: 3, backgroundColor: '#FFFFFF',
  },
  unitProgressText: {
    color: '#FFFFFF', fontSize: 11, fontWeight: '900',
  },

  kaaguyBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14,
    borderWidth: 1, marginTop: 12, marginBottom: 8, gap: 6,
  },
  kaaguyText: { fontSize: 12, fontWeight: '700' },

  trailWrapper: { position: 'relative', width: '100%', paddingVertical: 20 },
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
  dotWrapper: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  dot: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3, elevation: 3,
  },

  aguaraSlot: {
    position: 'absolute', left: -140, top: -30,
    width: 140, height: 140, zIndex: 999,
  },

  startBubble: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14,
    borderWidth: 2, marginBottom: 6, alignItems: 'center',
  },
  startBubbleText: { fontSize: 12, fontWeight: '900' },
  startBubbleTail: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 6,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    marginTop: 2,
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
    backgroundColor: '#E9C46A',
    borderColor: '#D4AF37', borderBottomColor: '#B8860B',
  },
  nodeCircleCurrent: {
    backgroundColor: '#2D6A4F',
    borderColor: '#52B788', borderBottomColor: '#1E5E3A',
  },
  nodeCircleLocked: {
    backgroundColor: '#E0E0E0',
    borderColor: '#D5D5D5', borderBottomColor: '#BDBDBD',
  },
  nodeChest: {
    backgroundColor: '#FFF8DC',
    borderColor: '#E9C46A', borderBottomColor: '#CD853F',
  },
  nodeTeta: {
    backgroundColor: '#C85A32',
    borderColor: '#D97736', borderBottomColor: '#9E3D1B',
  },
  nodeGame: {
    backgroundColor: '#8E24AA',
    borderColor: '#AB47BC', borderBottomColor: '#6B1B9A',
  },
  crownBadge: {
    position: 'absolute', top: -6, right: -4,
    backgroundColor: '#8E24AA',
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  nodeTitle: {
    fontSize: 13, fontWeight: '700',
    marginTop: 10, maxWidth: 160, textAlign: 'center',
  },
  nodeTitleLocked: { color: '#9E9E9E' },
  pathCheerSection: { alignItems: 'center', marginTop: 20 },

  // 🎓 CERTIFICADO
  certificateSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  certificateBanner: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  certificateEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  certificateTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
  },
  certificateText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  certificateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#2D6A4F',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 18,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  certificateBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});