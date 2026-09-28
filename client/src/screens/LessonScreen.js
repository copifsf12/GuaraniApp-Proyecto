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
import HeartsBar from '../components/HeartsBar';
import NoHeartsModal from '../components/NoHeartsModal';
import { LessonScoreTracker } from '../utils/scoringEngine';
import { LOCAL_EXERCISES } from '../data/initialData';
import PressableScale from '../components/PressableScale';

const LESSON_STATE = {
  IN_PROGRESS: 'IN_PROGRESS',
  FEEDBACK_CORRECT: 'FEEDBACK_CORRECT',
  FEEDBACK_INCORRECT: 'FEEDBACK_INCORRECT',
  COMPLETED: 'COMPLETED'
};

function HintRing({ visible }) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible]);

  if (!visible) return null;

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1]
  });
  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02]
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.hintRing, { opacity, transform: [{ scale }] }]}
    />
  );
}

function RippleCard({ onPress, style, children, disabled, isYoung }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!isYoung) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30
    }).start();
  };

  const handlePressOut = () => {
    if (!isYoung) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        activeOpacity={isYoung ? 0.9 : 0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={{ width: '100%' }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LessonScreen() {
  const {
    activeLesson,
    activeExercises,
    user,
    loseHeart,
    completeLesson,
    setCurrentScreen,
    speakText,
    setActiveTab
  } = useApp();

  const lessonId = activeLesson?.id || 1;

  const ageGroup = user?.ageGroup || 'adulto';
  const isKid = ageGroup === 'nino';
  const isYoung = ageGroup === 'joven';
  const isSenior = ageGroup === 'mayor';

  // 🎯 Estado del modal "sin corazones"
  const [noHeartsModalVisible, setNoHeartsModalVisible] = useState(false);

  useEffect(() => {
    console.log('📚 Lección:', lessonId, '| Edad:', ageGroup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const exercises = (activeExercises && activeExercises.length > 0)
    ? activeExercises
    : (LOCAL_EXERCISES[lessonId] || LOCAL_EXERCISES[1] || []);

  const trackerRef = useRef(null);
  if (!trackerRef.current) {
    trackerRef.current = new LessonScoreTracker(exercises.length);
  }

  const [lessonState, setLessonState] = useState(LESSON_STATE.IN_PROGRESS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    setLessonState(LESSON_STATE.IN_PROGRESS);
    setCurrentIndex(0);
    setSelectedCardId(null);
    setSelectedTokens([]);
    setTypedText('');
    setSelectedNasalOption(null);
    setMatchSelected(null);
    setMatchedPairIds([]);
    setMatchWrongFlash([]);
    setSelectedMultipleChoiceId(null);
    setSelectedTrueFalse(null);
    setIsGameOver(false);
    trackerRef.current = new LessonScoreTracker(exercises.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const currentExercise = exercises[currentIndex];

  useEffect(() => {
    if (isGameOver) return;

    if (!currentExercise && exercises.length > 0 && currentIndex >= exercises.length) {
      trackerRef.current.finish();
      const metrics = trackerRef.current.getMetrics(
        activeLesson?.xp || 15,
        activeLesson?.coins || 10
      );
      completeLesson(lessonId, metrics);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, lessonId, isGameOver]);

  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [availableTokens, setAvailableTokens] = useState([]);
  const [typedText, setTypedText] = useState('');
  const [selectedNasalOption, setSelectedNasalOption] = useState(null);
  const [selectedMultipleChoiceId, setSelectedMultipleChoiceId] = useState(null);
  const [selectedTrueFalse, setSelectedTrueFalse] = useState(null);

  useEffect(() => {
    if (currentExercise?.type === 'sentence_builder') {
      setAvailableTokens(currentExercise.chips || []);
    } else {
      setAvailableTokens([]);
    }
  }, [currentIndex, currentExercise?.type]);

  const buildMatchDeck = (ex) => {
    if (!ex || ex.type !== 'matching_pairs') return [];
    const left = (ex.pairs || []).map(p => ({ cardId: `L-${p.id}`, pairId: p.id, text: p.left }));
    const right = (ex.pairs || []).map(p => ({ cardId: `R-${p.id}`, pairId: p.id, text: p.right }));
    return [...left, ...right].sort(() => Math.random() - 0.5);
  };
  const [matchDeck, setMatchDeck] = useState([]);
  const [matchSelected, setMatchSelected] = useState(null);
  const [matchedPairIds, setMatchedPairIds] = useState([]);
  const [matchWrongFlash, setMatchWrongFlash] = useState([]);

  useEffect(() => {
    if (currentExercise?.type === 'matching_pairs') {
      setMatchDeck(buildMatchDeck(currentExercise));
    } else {
      setMatchDeck([]);
    }
  }, [currentIndex, currentExercise?.type]);

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

  const [showExitModal, setShowExitModal] = useState(false);
  const [culturalCapsule, setCulturalCapsule] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const handlePlayAudio = (text) => {
    setAudioPlaying(true);
    speakText(text);
    setTimeout(() => setAudioPlaying(false), 1200);
  };

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

  const handleSpecialKey = (char) => {
    if (lessonState !== LESSON_STATE.IN_PROGRESS) return;
    setTypedText(prev => prev + char);
  };

  const isAnswerProvided = () => {
    if (!currentExercise) return false;
    if (currentExercise.type === 'card_selection') return selectedCardId !== null;
    if (currentExercise.type === 'sentence_builder') return selectedTokens.length > 0;
    if (currentExercise.type === 'nasal_discrimination') return selectedNasalOption !== null;
    if (currentExercise.type === 'special_keyboard' || currentExercise.type === 'audio_listening') {
      return typedText.trim().length > 0;
    }
    if (currentExercise.type === 'matching_pairs') {
      return matchedPairIds.length === (currentExercise.pairs?.length || 0);
    }
    if (currentExercise.type === 'multiple_choice') return selectedMultipleChoiceId !== null;
    if (currentExercise.type === 'true_false') return selectedTrueFalse !== null;
    return false;
  };

  const handleCheckAnswer = () => {
    if (!isAnswerProvided() || !currentExercise) return;

    let isCorrect = false;

    if (currentExercise.type === 'card_selection') {
      const option = (currentExercise.options || []).find(o => o.id === selectedCardId);
      isCorrect = option?.isCorrect || false;
    } else if (currentExercise.type === 'sentence_builder') {
      const sentence = selectedTokens.map(t => t.text).join(' ');
      isCorrect = sentence.toLowerCase().trim() === (currentExercise.correct_answer || '').toLowerCase().trim();
    } else if (currentExercise.type === 'nasal_discrimination') {
      const opt = (currentExercise.options || []).find(o => o.id === selectedNasalOption);
      isCorrect = opt?.isCorrect || false;
    } else if (currentExercise.type === 'special_keyboard' || currentExercise.type === 'audio_listening') {
      isCorrect = typedText.toLowerCase().trim() === (currentExercise.correct_answer || '').toLowerCase().trim();
    } else if (currentExercise.type === 'matching_pairs') {
      isCorrect = matchedPairIds.length === (currentExercise.pairs?.length || 0);
    } else if (currentExercise.type === 'multiple_choice') {
      const opt = (currentExercise.options || []).find(o => o.id === selectedMultipleChoiceId);
      isCorrect = opt?.isCorrect || false;
    } else if (currentExercise.type === 'true_false') {
      const correctBool =
        currentExercise.correct_answer === true ||
        currentExercise.correct_answer === 'true';
      isCorrect = selectedTrueFalse === correctBool;
    }

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

      const newHearts = Math.max(0, (user?.hearts ?? 1) - 1);
      if (newHearts <= 0) {
        setIsGameOver(true);
      }
    }
  };

  const handleContinue = () => {
    setLessonState(LESSON_STATE.IN_PROGRESS);
    setSelectedCardId(null);
    setSelectedTokens([]);
    setTypedText('');
    setSelectedNasalOption(null);
    setMatchSelected(null);
    setMatchedPairIds([]);
    setSelectedMultipleChoiceId(null);
    setSelectedTrueFalse(null);

    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      trackerRef.current.finish();
      const metrics = trackerRef.current.getMetrics(
        activeLesson?.xp || 15,
        activeLesson?.coins || 10
      );
      completeLesson(lessonId, metrics);
    }
  };

  // 🎯 Ir a la tienda desde el modal sin corazones
  const handleGoToShop = () => {
    setNoHeartsModalVisible(false);
    setActiveTab('shop');
    setCurrentScreen('main');
  };

  const progressPercent = ((currentIndex + 1) / exercises.length) * 100;

  const showCorrectFeedback = lessonState === LESSON_STATE.FEEDBACK_INCORRECT;

  if (!currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted }}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const correctBool = currentExercise.type === 'true_false'
    ? (currentExercise.correct_answer === true || currentExercise.correct_answer === 'true')
    : false;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => setShowExitModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.max(6, progressPercent)}%` }]} />
        </View>

        <View style={styles.heartWrapper}>
          <HeartsBar
            hearts={user.hearts}
            maxHearts={user.maxHearts ?? 5}
            size={22}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.exerciseScroll, isSenior && { paddingHorizontal: 16 }]}>
        <Text style={[styles.counterText, isSenior && { fontSize: 14 }]}>
          Ejercicio {currentIndex + 1} de {exercises.length}
        </Text>

        <Text style={[styles.promptSpanish, isSenior && { fontSize: 28, lineHeight: 36 }]}>
          {currentExercise.prompt_spanish}
        </Text>
        {currentExercise.prompt_guarani && (
          <Text style={[styles.promptGuarani, isSenior && { fontSize: 20, lineHeight: 28 }]}>
            {currentExercise.prompt_guarani}
          </Text>
        )}

        {currentExercise.audio_text && (
          <TouchableOpacity
            style={[styles.audioSpeakerBtn, audioPlaying && styles.audioSpeakerBtnActive, isSenior && { paddingVertical: 16, paddingHorizontal: 20 }]}
            onPress={() => handlePlayAudio(currentExercise.audio_text)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={audioPlaying ? 'volume-high' : 'volume-medium'}
              size={isSenior ? 32 : 28}
              color="#FFFFFF"
            />
            <Text style={[styles.audioSpeakerText, isSenior && { fontSize: 16 }]}>
              {audioPlaying ? 'Escuchando onda sonora...' : 'Escuchar pronunciación'}
            </Text>
          </TouchableOpacity>
        )}

        {currentExercise.type === 'card_selection' && (
          <View style={styles.cardGrid}>
            {(currentExercise.options || []).map(option => {
              const isSelected = selectedCardId === option.id;
              const showHint = isKid && lessonState === LESSON_STATE.IN_PROGRESS && option.isCorrect;
              const showCorrect = showCorrectFeedback && option.isCorrect;
              const showWrong = showCorrectFeedback && isSelected && !option.isCorrect;

              return (
                <RippleCard
                  key={option.id}
                  onPress={() => setSelectedCardId(option.id)}
                  isYoung={isYoung}
                  style={{ width: '48%' }}
                >
                  <View
                    style={[
                      styles.graphicCard,
                      { width: '100%' },
                      isSelected && !showCorrectFeedback && styles.graphicCardSelected,
                      showCorrect && styles.graphicCardCorrect,
                      showWrong && styles.graphicCardWrong,
                      isSenior && styles.graphicCardSenior,
                    ]}
                  >
                    {showHint && <HintRing visible />}
                    {showCorrect && (
                      <View style={styles.correctBadge}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                    {showWrong && (
                      <View style={styles.wrongBadge}>
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </View>
                    )}
                    <View style={[styles.cardIconCircle, isSenior && { width: 72, height: 72, borderRadius: 36 }]}>
                      <Ionicons
                        name={option.icon || 'star'}
                        size={isSenior ? 46 : 40}
                        color={
                          showCorrect ? colors.successGreen
                          : showWrong ? colors.errorRed
                          : isSelected ? colors.terracotaPrimary
                          : colors.montePrimary
                        }
                      />
                    </View>
                    <Text style={[
                      styles.cardTextGuarani,
                      isSelected && !showCorrectFeedback && styles.cardTextSelected,
                      showCorrect && styles.cardTextCorrect,
                      showWrong && styles.cardTextWrong,
                      isSenior && { fontSize: 22 }
                    ]}>
                      {option.text}
                    </Text>
                    {option.translation && (
                      <Text style={[styles.cardTextTranslation, isSenior && { fontSize: 14 }]}>
                        {option.translation}
                      </Text>
                    )}
                  </View>
                </RippleCard>
              );
            })}
          </View>
        )}

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

        {currentExercise.type === 'nasal_discrimination' && (
          <View style={styles.nasalContainer}>
            <View style={styles.earHeader}>
              <Ionicons name="ear" size={32} color={colors.aretePurple} />
              <Text style={styles.earHeaderText}>Módulo Fonético: Distinción Nasal vs Oral</Text>
            </View>

            {(currentExercise.options || []).map(opt => {
              const isSelected = selectedNasalOption === opt.id;
              const showCorrect = showCorrectFeedback && opt.isCorrect;
              const showWrong = showCorrectFeedback && isSelected && !opt.isCorrect;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.nasalOptionCard,
                    isSelected && !showCorrectFeedback && styles.nasalOptionSelected,
                    showCorrect && styles.nasalOptionCorrect,
                    showWrong && styles.nasalOptionWrong,
                  ]}
                  onPress={() => setSelectedNasalOption(opt.id)}
                  activeOpacity={0.8}
                  disabled={showCorrectFeedback}
                >
                  <View style={styles.nasalOptionLeft}>
                    <Ionicons
                      name={opt.isCorrect ? 'mic' : 'volume-low'}
                      size={24}
                      color={
                        showCorrect ? colors.successGreen
                        : showWrong ? colors.errorRed
                        : isSelected ? colors.aretePurple
                        : colors.textMuted
                      }
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.nasalOptionTitle}>{opt.text}</Text>
                      {opt.phonetic && (
                        <Text style={styles.nasalOptionPhonetic}>Pronunciación: {opt.phonetic}</Text>
                      )}
                      {opt.note && <Text style={styles.nasalOptionNote}>{opt.note}</Text>}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {(currentExercise.type === 'special_keyboard' || currentExercise.type === 'audio_listening') && (
          <View style={styles.typingArea}>
            <View style={styles.inputBox}>
              <TextInput
                style={[styles.textInput, isSenior && { fontSize: 20, height: 60 }]}
                placeholder="Escribe tu respuesta aquí..."
                placeholderTextColor={colors.textMuted}
                value={typedText}
                onChangeText={setTypedText}
                autoCapitalize="none"
                editable={!showCorrectFeedback}
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

        {currentExercise.type === 'multiple_choice' && (
          <View style={styles.mcContainer}>
            {(currentExercise.options || []).map((opt, idx) => {
              const isSelected = selectedMultipleChoiceId === opt.id;
              const showHint = isKid && lessonState === LESSON_STATE.IN_PROGRESS && opt.isCorrect;
              const showCorrect = showCorrectFeedback && opt.isCorrect;
              const showWrong = showCorrectFeedback && isSelected && !opt.isCorrect;

              return (
                <RippleCard
                  key={opt.id ?? idx}
                  onPress={() => setSelectedMultipleChoiceId(opt.id)}
                  isYoung={isYoung}
                  style={{ width: '100%' }}
                >
                  <View
                    style={[
                      styles.mcOption,
                      { width: '100%' },
                      isSelected && !showCorrectFeedback && styles.mcOptionSelected,
                      showCorrect && styles.mcOptionCorrect,
                      showWrong && styles.mcOptionWrong,
                      isSenior && styles.mcOptionSenior,
                    ]}
                  >
                    {showHint && <HintRing visible />}
                    {showCorrect && (
                      <View style={styles.correctBadge}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                    {showWrong && (
                      <View style={styles.wrongBadge}>
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </View>
                    )}
                    <View style={[
                      styles.mcBadge,
                      isSelected && !showCorrectFeedback && styles.mcBadgeSelected,
                      showCorrect && styles.mcBadgeCorrect,
                      showWrong && styles.mcBadgeWrong,
                      isSenior && { width: 44, height: 44, borderRadius: 22 }
                    ]}>
                      <Text style={[
                        styles.mcBadgeText,
                        isSelected && !showCorrectFeedback && styles.mcBadgeTextSelected,
                        (showCorrect || showWrong) && { color: '#FFFFFF' },
                        isSenior && { fontSize: 20 }
                      ]}>
                        {String.fromCharCode(65 + idx)}
                      </Text>
                    </View>
                    <Text style={[
                      styles.mcText,
                      isSelected && !showCorrectFeedback && styles.mcTextSelected,
                      showCorrect && styles.mcTextCorrect,
                      showWrong && styles.mcTextWrong,
                      isSenior && { fontSize: 20 }
                    ]}>
                      {opt.text}
                    </Text>
                  </View>
                </RippleCard>
              );
            })}
          </View>
        )}

        {currentExercise.type === 'true_false' && (
          <View style={styles.tfContainer}>
            <TouchableOpacity
              style={[
                styles.tfButton,
                showCorrectFeedback && correctBool && styles.tfButtonCorrect,
                showCorrectFeedback && selectedTrueFalse === true && !correctBool && styles.tfButtonWrong,
                !showCorrectFeedback && selectedTrueFalse === true && styles.tfButtonSelectedTrue,
                isSenior && styles.tfButtonSenior,
              ]}
              onPress={() => setSelectedTrueFalse(true)}
              activeOpacity={0.8}
              disabled={showCorrectFeedback}
            >
              <Ionicons
                name="checkmark-circle"
                size={isSenior ? 46 : 36}
                color={
                  selectedTrueFalse === true
                    || (showCorrectFeedback && correctBool)
                    ? '#FFFFFF'
                    : colors.successGreen
                }
              />
              <Text
                style={[
                  styles.tfText,
                  (selectedTrueFalse === true
                    || (showCorrectFeedback && correctBool))
                    && styles.tfTextSelected,
                  isSenior && { fontSize: 22 }
                ]}
              >
                Verdadero
              </Text>
              <Text
                style={[
                  styles.tfSubtext,
                  (selectedTrueFalse === true
                    || (showCorrectFeedback && correctBool))
                    && styles.tfTextSelected,
                  isSenior && { fontSize: 16 }
                ]}
              >
                Añetegua
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tfButton,
                showCorrectFeedback && !correctBool && styles.tfButtonCorrect,
                showCorrectFeedback && selectedTrueFalse === false && correctBool && styles.tfButtonWrong,
                !showCorrectFeedback && selectedTrueFalse === false && styles.tfButtonSelectedFalse,
                isSenior && styles.tfButtonSenior,
              ]}
              onPress={() => setSelectedTrueFalse(false)}
              activeOpacity={0.8}
              disabled={showCorrectFeedback}
            >
              <Ionicons
                name="close-circle"
                size={isSenior ? 46 : 36}
                color={
                  selectedTrueFalse === false
                    || (showCorrectFeedback && !correctBool)
                    ? '#FFFFFF'
                    : colors.errorRed
                }
              />
              <Text
                style={[
                  styles.tfText,
                  (selectedTrueFalse === false
                    || (showCorrectFeedback && !correctBool))
                    && styles.tfTextSelected,
                  isSenior && { fontSize: 22 }
                ]}
              >
                Falso
              </Text>
              <Text
                style={[
                  styles.tfSubtext,
                  (selectedTrueFalse === false
                    || (showCorrectFeedback && !correctBool))
                    && styles.tfTextSelected,
                  isSenior && { fontSize: 16 }
                ]}
              >
                Ndaha'éi
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

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
              <View style={{ marginLeft: 10, flex: 1 }}>
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
                <Text style={styles.correctAnswerText}>
                  {currentExercise.type === 'true_false'
                    ? (correctBool ? 'Verdadero' : 'Falso')
                    : currentExercise.correct_answer}
                </Text>
                <Text style={styles.feedbackDesc}>{currentExercise.explanation}</Text>
              </View>
            </View>
            <PressableScale
              style={[styles.continueButton, { backgroundColor: colors.errorRed, borderBottomColor: colors.errorRedDark }]}
              onPress={() => {
                if (isGameOver) {
                  // 🎯 NUEVO: Abrir modal sin corazones
                  setNoHeartsModalVisible(true);
                } else {
                  handleContinue();
                }
              }}
              pulse
            >
              <Text style={styles.continueButtonText}>ENTENDIDO</Text>
            </PressableScale>
          </View>
        )}
      </View>

      <ExitModal
        visible={showExitModal}
        onConfirm={() => {
          setShowExitModal(false);
          setCurrentScreen('main');
        }}
        onCancel={() => setShowExitModal(false)}
      />

      {culturalCapsule && (
        <CulturalCapsuleModal
          visible={!!culturalCapsule}
          title={culturalCapsule.title}
          content={culturalCapsule.content}
          onClose={() => setCulturalCapsule(null)}
        />
      )}

      {/* 🎯 NUEVO: Modal sin corazones */}
      <NoHeartsModal
        visible={noHeartsModalVisible}
        onClose={() => {
          setNoHeartsModalVisible(false);
          setCurrentScreen('main');
        }}
        onGoToShop={handleGoToShop}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sandBackground },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandBorder,
  },
  closeBtn: { padding: 4 },
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
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
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
  audioSpeakerBtnActive: { backgroundColor: colors.monteDark },
  audioSpeakerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  graphicCard: {
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
    position: 'relative',
  },
  graphicCardSenior: {
    borderWidth: 3,
    borderBottomWidth: 6,
    padding: 20,
  },
  graphicCardSelected: {
    borderColor: colors.terracotaPrimary,
    backgroundColor: colors.terracotaPastel,
  },
  graphicCardCorrect: {
    borderColor: colors.successGreen,
    backgroundColor: colors.successPastel,
  },
  graphicCardWrong: {
    borderColor: colors.errorRed,
    backgroundColor: colors.errorPastel,
  },
  correctBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.successGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 100,
  },
  wrongBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.errorRed,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 100,
  },
  hintRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.solGold,
    borderStyle: 'dashed',
    zIndex: 999,
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
  cardTextSelected: { color: colors.terracotaDark },
  cardTextCorrect: { color: colors.successGreenDark },
  cardTextWrong: { color: colors.errorRedDark },
  cardTextTranslation: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  sentenceBuilderArea: { marginTop: 10 },
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
  nasalOptionCorrect: {
    borderColor: colors.successGreen,
    backgroundColor: colors.successPastel,
  },
  nasalOptionWrong: {
    borderColor: colors.errorRed,
    backgroundColor: colors.errorPastel,
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
  typingArea: { marginTop: 10 },
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
  matchCardTextMatched: { color: colors.successGreenDark },

  mcContainer: {
    marginTop: 10,
    gap: 12,
  },
  mcOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.sandBorder,
    paddingVertical: 14,
    paddingHorizontal: 14,
    position: 'relative',
  },
  mcOptionSenior: {
    borderWidth: 3,
    borderBottomWidth: 6,
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  mcOptionSelected: {
    borderColor: colors.terracotaPrimary,
    backgroundColor: colors.terracotaPastel,
  },
  mcOptionCorrect: {
    borderColor: colors.successGreen,
    backgroundColor: colors.successPastel,
  },
  mcOptionWrong: {
    borderColor: colors.errorRed,
    backgroundColor: colors.errorPastel,
  },
  mcBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.sandBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mcBadgeSelected: {
    backgroundColor: colors.terracotaPrimary,
  },
  mcBadgeCorrect: {
    backgroundColor: colors.successGreen,
  },
  mcBadgeWrong: {
    backgroundColor: colors.errorRed,
  },
  mcBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textSecondary,
  },
  mcBadgeTextSelected: {
    color: '#FFFFFF',
  },
  mcText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  mcTextSelected: {
    color: colors.terracotaDark,
  },
  mcTextCorrect: {
    color: colors.successGreenDark,
  },
  mcTextWrong: {
    color: colors.errorRedDark,
  },

  tfContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  tfButton: {
    flex: 1,
    minHeight: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: colors.sandBorder,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 6,
  },
  tfButtonSenior: {
    borderWidth: 3,
    borderBottomWidth: 6,
    minHeight: 160,
    paddingVertical: 24,
  },
  tfButtonSelectedTrue: {
    backgroundColor: colors.successGreen,
    borderColor: colors.successGreenDark,
  },
  tfButtonSelectedFalse: {
    backgroundColor: colors.errorRed,
    borderColor: colors.errorRedDark,
  },
  tfButtonCorrect: {
    backgroundColor: colors.successGreen,
    borderColor: colors.successGreenDark,
  },
  tfButtonWrong: {
    backgroundColor: colors.errorRed,
    borderColor: colors.errorRedDark,
  },
  tfText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  tfSubtext: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  tfTextSelected: {
    color: '#FFFFFF',
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
  checkButtonActive: { opacity: 1 },
  checkButtonDisabled: { opacity: 0.5 },
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