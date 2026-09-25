import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import ExitModal from '../components/ExitModal';
import SpecialKeyboard from '../components/SpecialKeyboard';
import CulturalCapsuleModal from '../components/CulturalCapsuleModal';
import { LessonScoreTracker } from '../utils/scoringEngine';
import { LOCAL_EXERCISES } from '../data/initialData';
import PressableScale from '../components/PressableScale';

// Strict State Machine
const LESSON_STATE = {
  IN_PROGRESS: 'IN_PROGRESS',
  FEEDBACK_CORRECT: 'FEEDBACK_CORRECT',
  FEEDBACK_INCORRECT: 'FEEDBACK_INCORRECT',
  COMPLETED: 'COMPLETED'
};

export default function LessonScreen() {
  const {
    activeLesson,
    activeExercises,
    user,
    loseHeart,
    completeLesson,
    setCurrentScreen,
    speakText
  } = useApp();

  const lessonId = activeLesson?.id || 1;
  // Usa los ejercicios reales de Supabase; si una lección todavía no tiene
  // contenido cargado ahí, cae de vuelta al set local de muestra.
  const exercises = (activeExercises && activeExercises.length > 0)
    ? activeExercises
    : (LOCAL_EXERCISES[lessonId] || LOCAL_EXERCISES[1]);

  // Scoring engine instance (persistent across renders)
  const trackerRef = useRef(null);
  if (!trackerRef.current) {
    trackerRef.current = new LessonScoreTracker(exercises.length);
  }

  // State Management
  const [lessonState, setLessonState] = useState(LESSON_STATE.IN_PROGRESS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentExercise = exercises[currentIndex];

  // User input states per exercise type
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [availableTokens, setAvailableTokens] = useState(
    currentExercise?.type === 'sentence_builder' ? currentExercise.chips : []
  );
  const [typedText, setTypedText] = useState('');
  const [selectedNasalOption, setSelectedNasalOption] = useState(null);

  // Matching pairs game state
  const buildMatchDeck = (ex) => {
    if (!ex || ex.type !== 'matching_pairs') return [];
    const left = ex.pairs.map(p => ({ cardId: `L-${p.id}`, pairId: p.id, text: p.left }));
    const right = ex.pairs.map(p => ({ cardId: `R-${p.id}`, pairId: p.id, text: p.right }));
    return [...left, ...right].sort(() => Math.random() - 0.5);
  };
  const [matchDeck, setMatchDeck] = useState(buildMatchDeck(currentExercise));
  const [matchSelected, setMatchSelected] = useState(null);
  const [matchedPairIds, setMatchedPairIds] = useState([]);
  const [matchWrongFlash, setMatchWrongFlash] = useState([]);

  const handleMatchCardPress = (card) => {
    if (lessonState !== LESSON_STATE.IN_PROGRESS) return;
    if (matchedPairIds.includes(card.pairId)) return;
    if (!matchSelected) {
      setMatchSelected(card);
      return;
    }
    if (matchSelected.cardId === card.cardId) return;
    if (matchSelected.pairId === card.pairId) {
      setMatchedPairIds(prev => [...prev, card.pairId]);
      setMatchSelected(null);
    } else {
      setMatchWrongFlash([matchSelected.cardId, card.cardId]);
      setTimeout(() => setMatchWrongFlash([]), 400);
      setMatchSelected(null);
    }
  };

  // Modals & UI animations
  const [showExitModal, setShowExitModal] = useState(false);
  const [culturalCapsule, setCulturalCapsule] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Audio trigger with visual wave animation
  const handlePlayAudio = (text) => {
    setAudioPlaying(true);
    speakText(text);
    setTimeout(() => setAudioPlaying(false), 1200);
  };

  // Sentence builder token tap
  const handleTokenPress = (token) => {
    if (lessonState !== LESSON_STATE.IN_PROGRESS) return;
    setSelectedTokens([...selectedTokens, token]);
    setAvailableTokens(availableTokens.filter(t => t.id !== token.id));
  };

  const handleRemoveToken = (token) => {
    if (lessonState !== LESSON_STATE.IN_PROGRESS) return;
    setAvailableTokens([...availableTokens, token]);
    setSelectedTokens(selectedTokens.filter(t => t.id !== token.id));
  };

  // Special keyboard key press
  const handleSpecialKey = (char) => {
    if (lessonState !== LESSON_STATE.IN_PROGRESS) return;
    setTypedText(prev => prev + char);
  };

  // Check whether user has selected an answer
  const isAnswerProvided = () => {
    if (currentExercise.type === 'card_selection') return selectedCardId !== null;
    if (currentExercise.type === 'sentence_builder') return selectedTokens.length > 0;
    if (currentExercise.type === 'nasal_discrimination') return selectedNasalOption !== null;
    if (currentExercise.type === 'special_keyboard' || currentExercise.type === 'audio_listening') {
      return typedText.trim().length > 0;
    }
    if (currentExercise.type === 'matching_pairs') {
      return matchedPairIds.length === currentExercise.pairs.length;
    }
    return false;
  };

  // Verify answer & record strictly in the scoring engine
  const handleCheckAnswer = () => {
    if (!isAnswerProvided()) return;

    let isCorrect = false;

    if (currentExercise.type === 'card_selection') {
      const option = currentExercise.options.find(o => o.id === selectedCardId);
      isCorrect = option?.isCorrect || false;
    } else if (currentExercise.type === 'sentence_builder') {
      const sentence = selectedTokens.map(t => t.text).join(' ');
      isCorrect = sentence.toLowerCase().trim() === currentExercise.correct_answer.toLowerCase().trim();
    } else if (currentExercise.type === 'nasal_discrimination') {
      const opt = currentExercise.options.find(o => o.id === selectedNasalOption);
      isCorrect = opt?.isCorrect || false;
    } else if (currentExercise.type === 'special_keyboard' || currentExercise.type === 'audio_listening') {
      isCorrect = typedText.toLowerCase().trim() === currentExercise.correct_answer.toLowerCase().trim();
    } else if (currentExercise.type === 'matching_pairs') {
      isCorrect = matchedPairIds.length === currentExercise.pairs.length;
    }

    // Record strict attempt in tracker
    trackerRef.current.recordAttempt(currentExercise.id, isCorrect);

    if (isCorrect) {
      setLessonState(LESSON_STATE.FEEDBACK_CORRECT);
      if (currentExercise.cultural_fact) {
        setCulturalCapsule({
          title: '🌿 Sabiduría de la Palabra',
          content: currentExercise.cultural_fact
        });
      }
    } else {
      setLessonState(LESSON_STATE.FEEDBACK_INCORRECT);
      loseHeart();
    }
  };

  // Move to next exercise or finish with full telemetry
  const handleContinue = () => {
    setLessonState(LESSON_STATE.IN_PROGRESS);
    setSelectedCardId(null);
    setSelectedTokens([]);
    setTypedText('');
    setSelectedNasalOption(null);
    setMatchSelected(null);
    setMatchedPairIds([]);

    if (currentIndex + 1 < exercises.length) {
      const nextEx = exercises[currentIndex + 1];
      if (nextEx.type === 'sentence_builder') {
        setAvailableTokens(nextEx.chips);
      }
      if (nextEx.type === 'matching_pairs') {
        setMatchDeck(buildMatchDeck(nextEx));
      }
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finish and compute metrics
      trackerRef.current.finish();
      const metrics = trackerRef.current.getMetrics(activeLesson?.xp || 15, activeLesson?.coins || 10);
      completeLesson(lessonId, metrics);
    }
  };

  const progressPercent = ((currentIndex) / exercises.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header: Close button, Realtime Progress Bar, Hearts */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => setShowExitModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Animated Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.max(6, progressPercent)}%` }]} />
        </View>

        {/* Hearts indicator */}
        <View style={styles.heartWrapper}>
          <Ionicons name="heart" size={22} color={colors.errorRed} />
          <Text style={styles.heartCount}>{user.hearts}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.exerciseScroll}>
        {/* Exercise Prompt */}
        <Text style={styles.promptSpanish}>{currentExercise.prompt_spanish}</Text>
        {currentExercise.prompt_guarani && (
          <Text style={styles.promptGuarani}>{currentExercise.prompt_guarani}</Text>
        )}

        {/* Audio Speaker with Interactive Wave Animation */}
        {currentExercise.audio_text && (
          <TouchableOpacity
            style={[styles.audioSpeakerBtn, audioPlaying && styles.audioSpeakerBtnActive]}
            onPress={() => handlePlayAudio(currentExercise.audio_text)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={audioPlaying ? 'volume-high' : 'volume-medium'}
              size={28}
              color="#FFFFFF"
            />
            <Text style={styles.audioSpeakerText}>
              {audioPlaying ? 'Escuchando onda sonora...' : 'Escuchar pronunciación'}
            </Text>
            {audioPlaying && (
              <View style={styles.soundWaveBars}>
                <View style={[styles.waveBar, { height: 16 }]} />
                <View style={[styles.waveBar, { height: 24 }]} />
                <View style={[styles.waveBar, { height: 12 }]} />
                <View style={[styles.waveBar, { height: 20 }]} />
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* 1. GRAPHIC CARDS SELECTION */}
        {currentExercise.type === 'card_selection' && (
          <View style={styles.cardGrid}>
            {currentExercise.options.map(option => {
              const isSelected = selectedCardId === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.graphicCard, isSelected && styles.graphicCardSelected]}
                  onPress={() => setSelectedCardId(option.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardIconCircle}>
                    <Ionicons
                      name={option.icon}
                      size={40}
                      color={isSelected ? colors.terracotaPrimary : colors.montePrimary}
                    />
                  </View>
                  <Text style={[styles.cardTextGuarani, isSelected && styles.cardTextSelected]}>
                    {option.text}
                  </Text>
                  {option.translation && (
                    <Text style={styles.cardTextTranslation}>{option.translation}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 2. SENTENCE BUILDER */}
        {currentExercise.type === 'sentence_builder' && (
          <View style={styles.sentenceBuilderArea}>
            <View style={styles.targetSentenceSlot}>
              {selectedTokens.length === 0 ? (
                <Text style={styles.slotPlaceholder}>Toca las fichas de abajo para formar la frase</Text>
              ) : (
                <View style={styles.tokensRow}>
                  {selectedTokens.map(token => (
                    <TouchableOpacity
                      key={token.id}
                      style={styles.tokenChipSelected}
                      onPress={() => handleRemoveToken(token)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.tokenTextSelected}>{token.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <Text style={styles.chipsLabel}>Fichas disponibles:</Text>
            <View style={styles.tokensRow}>
              {availableTokens.map(token => (
                <TouchableOpacity
                  key={token.id}
                  style={styles.tokenChipAvailable}
                  onPress={() => handleTokenPress(token)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.tokenTextAvailable}>{token.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 3. NASAL DISCRIMINATION MODULE */}
        {currentExercise.type === 'nasal_discrimination' && (
          <View style={styles.nasalContainer}>
            <View style={styles.earHeader}>
              <Ionicons name="ear" size={32} color={colors.aretePurple} />
              <Text style={styles.earHeaderText}>Módulo Fonético: Distinción Nasal vs Oral</Text>
            </View>

            {currentExercise.options.map(opt => {
              const isSelected = selectedNasalOption === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.nasalOptionCard, isSelected && styles.nasalOptionSelected]}
                  onPress={() => setSelectedNasalOption(opt.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.nasalOptionLeft}>
                    <Ionicons
                      name={opt.isCorrect ? 'mic' : 'volume-low'}
                      size={24}
                      color={isSelected ? colors.aretePurple : colors.textMuted}
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.nasalOptionTitle}>{opt.text}</Text>
                      <Text style={styles.nasalOptionPhonetic}>Pronunciación: {opt.phonetic}</Text>
                      <Text style={styles.nasalOptionNote}>{opt.note}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.miniPlayBtn}
                    onPress={() => handlePlayAudio(opt.text.split(' ')[0])}
                  >
                    <Ionicons name="play" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 4 & 5. SPECIAL KEYBOARD / AUDIO LISTENING */}
        {(currentExercise.type === 'special_keyboard' || currentExercise.type === 'audio_listening') && (
          <View style={styles.typingArea}>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                placeholder="Escribe tu respuesta aquí..."
                placeholderTextColor={colors.textMuted}
                value={typedText}
                onChangeText={setTypedText}
                autoCapitalize="none"
              />
              {typedText.length > 0 && (
                <TouchableOpacity onPress={() => setTypedText('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <SpecialKeyboard onCharacterPress={handleSpecialKey} />
          </View>
        )}

        {/* 6. MATCHING PAIRS GAME (Memoria) */}
        {currentExercise.type === 'matching_pairs' && (
          <View style={styles.matchGrid}>
            {matchDeck.map(card => {
              const isMatched = matchedPairIds.includes(card.pairId);
              const isSelected = matchSelected?.cardId === card.cardId;
              const isWrong = matchWrongFlash.includes(card.cardId);
              return (
                <TouchableOpacity
                  key={card.cardId}
                  style={[
                    styles.matchCard,
                    isSelected && styles.matchCardSelected,
                    isMatched && styles.matchCardMatched,
                    isWrong && styles.matchCardWrong,
                  ]}
                  onPress={() => handleMatchCardPress(card)}
                  activeOpacity={0.8}
                  disabled={isMatched}
                >
                  <Text style={[styles.matchCardText, isMatched && styles.matchCardTextMatched]}>
                    {card.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* BOTTOM ACTION & FEEDBACK SLIDE-UP SHEET */}
      <View
        style={[
          styles.bottomSheet,
          lessonState === LESSON_STATE.FEEDBACK_CORRECT && styles.bottomSheetCorrect,
          lessonState === LESSON_STATE.FEEDBACK_INCORRECT && styles.bottomSheetWrong,
        ]}
      >
        {lessonState === LESSON_STATE.IN_PROGRESS ? (
          <PressableScale
            style={[
              styles.checkButton,
              isAnswerProvided() ? styles.checkButtonActive : styles.checkButtonDisabled
            ]}
            onPress={handleCheckAnswer}
            disabled={!isAnswerProvided()}
            pulse={isAnswerProvided()}
          >
            <Text style={styles.checkButtonText}>COMPROBAR RESPUESTA</Text>
          </PressableScale>
        ) : lessonState === LESSON_STATE.FEEDBACK_CORRECT ? (
          <View>
            <View style={styles.feedbackHeader}>
              <Ionicons name="checkmark-circle" size={32} color={colors.successGreen} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.feedbackTitleSuccess}>¡Iporãiterei! (¡Excelente!)</Text>
                <Text style={styles.feedbackDesc}>{currentExercise.explanation}</Text>
              </View>
            </View>
            <PressableScale
              style={[styles.continueButton, { backgroundColor: colors.successGreen, borderBottomColor: colors.successGreenDark }]}
              onPress={handleContinue}
              pulse
            >
              <Text style={styles.continueButtonText}>CONTINUAR</Text>
            </PressableScale>
          </View>
        ) : (
          <View>
            <View style={styles.feedbackHeader}>
              <Ionicons name="close-circle" size={32} color={colors.errorRed} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.feedbackTitleWrong}>Respuesta correcta:</Text>
                <Text style={styles.correctAnswerText}>{currentExercise.correct_answer}</Text>
                <Text style={styles.feedbackDesc}>{currentExercise.explanation}</Text>
              </View>
            </View>
            <PressableScale
              style={[styles.continueButton, { backgroundColor: colors.errorRed, borderBottomColor: colors.errorRedDark }]}
              onPress={handleContinue}
              pulse
            >
              <Text style={styles.continueButtonText}>ENTENDIDO</Text>
            </PressableScale>
          </View>
        )}
      </View>

      {/* Exit Modal */}
      <ExitModal
        visible={showExitModal}
        onConfirm={() => {
          setShowExitModal(false);
          setCurrentScreen('main');
        }}
        onCancel={() => setShowExitModal(false)}
      />

      {/* Cultural Capsule Modal */}
      {culturalCapsule && (
        <CulturalCapsuleModal
          visible={!!culturalCapsule}
          title={culturalCapsule.title}
          content={culturalCapsule.content}
          onClose={() => setCulturalCapsule(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sandBackground,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandBorder,
  },
  closeBtn: {
    padding: 4,
  },
  progressBarBg: {
    flex: 1,
    height: 14,
    backgroundColor: '#E6D7C3',
    borderRadius: 7,
    marginHorizontal: 14,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.successGreen,
    borderRadius: 7,
  },
  heartWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartCount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.errorRed,
    marginLeft: 4,
  },
  exerciseScroll: {
    padding: 20,
    paddingBottom: 130,
  },
  promptSpanish: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 30,
    marginBottom: 4,
  },
  promptGuarani: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.montePrimary,
    fontStyle: 'italic',
    lineHeight: 23,
    marginBottom: 16,
  },
  matchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  matchCard: {
    width: '48%',
    minHeight: 64,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.sandBorder,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  matchCardSelected: {
    borderColor: colors.aretePurple,
    backgroundColor: colors.aretePastel,
  },
  matchCardMatched: {
    borderColor: colors.successGreen,
    backgroundColor: colors.successPastel,
    opacity: 0.6,
  },
  matchCardWrong: {
    borderColor: colors.errorRed,
    backgroundColor: colors.errorPastel,
  },
  matchCardText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  matchCardTextMatched: {
    color: colors.successGreenDark,
  },
  audioSpeakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.montePrimary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 20,
    gap: 8,
  },
  audioSpeakerBtnActive: {
    backgroundColor: colors.monteDark,
  },
  audioSpeakerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  soundWaveBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 6,
  },
  waveBar: {
    width: 3,
    backgroundColor: colors.solGold,
    borderRadius: 2,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  graphicCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: colors.sandBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  graphicCardSelected: {
    borderColor: colors.terracotaPrimary,
    backgroundColor: colors.terracotaPastel,
  },
  cardIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.sandBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTextGuarani: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cardTextSelected: {
    color: colors.terracotaDark,
  },
  cardTextTranslation: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  sentenceBuilderArea: {
    marginTop: 10,
  },
  targetSentenceSlot: {
    minHeight: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.monteMedium,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  slotPlaceholder: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  chipsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  tokensRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tokenChipAvailable: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.sandBorder,
  },
  tokenTextAvailable: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tokenChipSelected: {
    backgroundColor: colors.montePrimary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.monteDark,
  },
  tokenTextSelected: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  nasalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.sandBorder,
  },
  earHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  earHeaderText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.aretePurple,
  },
  nasalOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.sandBackground,
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.sandBorder,
    marginBottom: 10,
  },
  nasalOptionSelected: {
    borderColor: colors.aretePurple,
    backgroundColor: colors.aretePastel,
  },
  nasalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nasalOptionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  nasalOptionPhonetic: {
    fontSize: 12,
    color: colors.aretePurple,
    fontWeight: '700',
  },
  nasalOptionNote: {
    fontSize: 11,
    color: colors.textMuted,
  },
  miniPlayBtn: {
    backgroundColor: colors.aretePurple,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingArea: {
    marginTop: 10,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.monteMedium,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: colors.sandBorder,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  bottomSheetCorrect: {
    backgroundColor: colors.successPastel,
    borderTopColor: colors.successGreen,
  },
  bottomSheetWrong: {
    backgroundColor: colors.errorPastel,
    borderTopColor: colors.errorRed,
  },
  checkButton: {
    backgroundColor: colors.montePrimary,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: colors.monteDark,
    shadowColor: colors.monteDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  checkButtonActive: {
    opacity: 1,
  },
  checkButtonDisabled: {
    opacity: 0.5,
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  feedbackTitleSuccess: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.successGreenDark,
  },
  feedbackTitleWrong: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.errorRedDark,
  },
  correctAnswerText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.errorRedDark,
    marginVertical: 2,
  },
  feedbackDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  continueButton: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});