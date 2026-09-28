import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import MascotAguara from '../components/MascotAguara';
import PressableScale from '../components/PressableScale';
import { LOCAL_EXERCISES } from '../data/initialData';

export default function LessonTutorialScreen() {
  const { activeLesson, activeExercises, setCurrentScreen, speakText } = useApp();
  const [cardIndex, setCardIndex] = useState(0);

  const exercises = useMemo(
    () =>
      (activeExercises && activeExercises.length > 0)
        ? activeExercises
        : (LOCAL_EXERCISES[activeLesson?.id] || LOCAL_EXERCISES[1]),
    [activeExercises, activeLesson]
  );

  // 🎯 Solo 3 tarjetas ÚNICAS (sin repetir palabra) para el tutorial
  const vocabCards = useMemo(() => {
    const cards = exercises.map(ex => ({
      guarani: ex.audio_text || ex.correct_answer,
      explanation: ex.explanation,
      culturalFact: ex.cultural_fact
    }));

    const unique = [];
    const seen = new Set();
    for (const c of cards) {
      if (!c.guarani) continue;
      const key = c.guarani.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(c);
      if (unique.length === 3) break;
    }
    return unique;
  }, [exercises]);

  const current = vocabCards[cardIndex];
  const isLastCard = cardIndex === vocabCards.length - 1;

  const handleNext = () => {
    if (isLastCard) {
      setCurrentScreen('lesson');
    } else {
      setCardIndex(prev => prev + 1);
      speakText(vocabCards[cardIndex + 1]?.guarani);
    }
  };

  const handleSkip = () => setCurrentScreen('lesson');

  // 🛡️ Si por alguna razón no hay tarjetas, saltamos directo a la lección
  if (!current) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted }}>Cargando tutorial...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <PressableScale onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Saltar tutorial</Text>
          </PressableScale>
        </View>

        <MascotAguara
          size={90}
          speechText={`¡Aprendamos juntos "${activeLesson?.title || 'esta lección'}"!`}
        />

        {/* Progreso de tarjetas */}
        <View style={styles.progressDots}>
          {vocabCards.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === cardIndex && styles.dotActive,
                i < cardIndex && styles.dotDone
              ]}
            />
          ))}
        </View>

        {/* Tarjeta interactiva de vocabulario */}
        <LinearGradient
          colors={[colors.montePastel, colors.solLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.vocabCard}
        >
          <Text style={styles.vocabWord}>{current.guarani}</Text>

          <PressableScale
            style={styles.listenButton}
            onPress={() => speakText(current.guarani)}
            pulse
          >
            <Ionicons name="volume-high" size={22} color="#FFFFFF" />
            <Text style={styles.listenButtonText}>Escuchar pronunciación</Text>
          </PressableScale>

          <Text style={styles.repeatText}>
            🎤 Ahora repítela en voz alta antes de continuar.
          </Text>

          {current.explanation ? (
            <Text style={styles.explanationText}>{current.explanation}</Text>
          ) : null}

          {current.culturalFact ? (
            <View style={styles.factBox}>
              <Ionicons name="sparkles" size={16} color={colors.solPrimary} />
              <Text style={styles.factText}>{current.culturalFact}</Text>
            </View>
          ) : null}
        </LinearGradient>

        <Text style={styles.counterText}>
          {cardIndex + 1} de {vocabCards.length}
        </Text>

        {/* Navegación de tarjetas */}
        <View style={styles.navRow}>
          <PressableScale
            style={[styles.navButton, cardIndex === 0 && { opacity: 0.4 }]}
            onPress={() => cardIndex > 0 && setCardIndex(prev => prev - 1)}
            disabled={cardIndex === 0}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          </PressableScale>

          <PressableScale style={styles.mainNextButton} onPress={handleNext} pulse>
            <Text style={styles.mainNextButtonText}>
              {isLastCard ? '¡Empezar ejercicios!' : 'Siguiente palabra'}
            </Text>
            <Ionicons
              name={isLastCard ? 'rocket' : 'arrow-forward'}
              size={20}
              color="#FFFFFF"
            />
          </PressableScale>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sandBackground,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 13,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.sandBorder,
  },
  dotActive: {
    backgroundColor: colors.terracotaPrimary,
    width: 20,
  },
  dotDone: {
    backgroundColor: colors.monteMedium,
  },
  vocabCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.monteDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  vocabWord: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.monteDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.terracotaPrimary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: colors.terracotaDark,
    marginBottom: 16,
  },
  listenButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  repeatText: {
    marginTop: 18,
    fontSize: 15,
    fontWeight: '700',
    color: colors.monteDark,
    textAlign: 'center',
  },
  explanationText: {
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 12,
    marginTop: 12,
  },
  factBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  factText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  counterText: {
    marginTop: 12,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.sandBorder,
  },
  mainNextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.montePrimary,
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
    borderBottomWidth: 4,
    borderBottomColor: colors.monteDark,
  },
  mainNextButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});