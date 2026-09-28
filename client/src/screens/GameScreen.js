import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { LOCAL_GAMES } from '../data/initialData';
import ExitModal from '../components/ExitModal';
import PressableScale from '../components/PressableScale';

const RETRY_COST = 5;
const SKIP_COST = 50;
const HINT_COST = 10;

const VOCAL_VARIANTS = {
  'A': ['A', 'Ã'],
  'E': ['E', 'Ẽ'],
  'I': ['I', 'Ĩ'],
  'O': ['O', 'Õ'],
  'U': ['U', 'Ũ'],
  'Y': ['Y', 'Ỹ'],
};

const getEquivalentLetters = (letter) => {
  for (const [key, variants] of Object.entries(VOCAL_VARIANTS)) {
    if (variants.includes(letter)) return variants;
  }
  return [letter];
};

export default function GameScreen() {
  const {
    activeGame,
    activeLesson,
    user,
    setCurrentScreen,
    completeGame,
    payForRetry,
    payForSkip,
    payCostRequest
  } = useApp();

  const gameId = activeGame?.game_type || activeGame?.id || 'matching';
  const gameData = LOCAL_GAMES[gameId] || LOCAL_GAMES.matching;

  const [gameState, setGameState] = useState('playing');
  const [showExitModal, setShowExitModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [wrongPair, setWrongPair] = useState(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [revealedLetter, setRevealedLetter] = useState(null); // 🎯 NUEVO

  // 🎯 NUEVO: Modal de confirmación custom
  const [confirmModal, setConfirmModal] = useState(null);
  // confirmModal = { type: 'retry' | 'skip' | 'hint', cost: number, title: string, description: string }

  const currentCoins = user?.coinsMbae || 0;

  // ═══════════════════════════════════════════════════════════
  // 🎯 MATCHING
  // ═══════════════════════════════════════════════════════════
  const buildMatchDeck = () => {
    if (!gameData.pairs) return [];
    const cards = [];
    gameData.pairs.forEach((p, idx) => {
      cards.push({ id: `L-${idx}`, pairKey: p.id, text: p.left, side: 'left' });
      cards.push({ id: `R-${idx}`, pairKey: p.id, text: p.right, side: 'right' });
    });
    return cards.sort(() => Math.random() - 0.5);
  };

  const [matchDeck, setMatchDeck] = useState(buildMatchDeck());
  const [matchSelected, setMatchSelected] = useState(null);
  const [matchedPairKeys, setMatchedPairKeys] = useState([]);

  const handleMatchCardPress = (card) => {
    if (gameState !== 'playing' || processing) return;
    if (matchedPairKeys.includes(card.pairKey)) return;
    if (!matchSelected) { setMatchSelected(card); return; }
    if (matchSelected.id === card.id) return;
    if (matchSelected.side === card.side) { setMatchSelected(card); return; }

    if (matchSelected.pairKey === card.pairKey) {
      const newMatched = [...matchedPairKeys, card.pairKey];
      setMatchedPairKeys(newMatched);
      setMatchSelected(null);
      if (newMatched.length === gameData.pairs.length) setGameState('won');
    } else {
      const correctPair = gameData.pairs.find(p => p.id === matchSelected.pairKey);
      setWrongPair(correctPair);
      setGameState('lost');
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 🃏 MEMORY
  // ═══════════════════════════════════════════════════════════
  const buildMemoryDeck = () => {
    if (!gameData.pairs) return [];
    const cards = [];
    gameData.pairs.forEach((p, idx) => {
      cards.push({ id: `M-${idx}-a`, pairKey: p.id, word: p.word, emoji: p.emoji });
      cards.push({ id: `M-${idx}-b`, pairKey: p.id, word: p.word, emoji: p.emoji });
    });
    return cards.sort(() => Math.random() - 0.5);
  };

  const [memoryDeck, setMemoryDeck] = useState(buildMemoryDeck());
  const [memoryFlipped, setMemoryFlipped] = useState([]);
  const [memoryMatched, setMemoryMatched] = useState([]);
  const [memoryBusy, setMemoryBusy] = useState(false);

  const handleMemoryCardPress = (card) => {
    if (gameState !== 'playing' || memoryBusy) return;
    if (memoryMatched.includes(card.pairKey)) return;
    if (memoryFlipped.find(c => c.id === card.id)) return;

    const newFlipped = [...memoryFlipped, card];
    setMemoryFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryBusy(true);
      const [a, b] = newFlipped;
      if (a.pairKey === b.pairKey) {
        const newMatched = [...memoryMatched, a.pairKey];
        setTimeout(() => {
          setMemoryMatched(newMatched);
          setMemoryFlipped([]);
          setMemoryBusy(false);
          if (newMatched.length === gameData.pairs.length) setGameState('won');
        }, 400);
      } else {
        const correctPair = gameData.pairs.find(p => p.id === a.pairKey);
        setTimeout(() => {
          setWrongPair(correctPair);
          setGameState('lost');
          setMemoryBusy(false);
        }, 900);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════
  // ⚡ QUICK QUIZ
  // ═══════════════════════════════════════════════════════════
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTimeLeft, setQuizTimeLeft] = useState(gameData.timePerQuestion || 10);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizShuffled, setQuizShuffled] = useState([]);

  useEffect(() => {
    if (gameId !== 'quick_quiz') return;
    const q = gameData.questions?.[quizIndex];
    if (!q) return;
    setQuizShuffled([...q.options].sort(() => Math.random() - 0.5));
    setQuizTimeLeft(gameData.timePerQuestion || 10);
    setQuizSelected(null);
  }, [quizIndex, gameId]);

  useEffect(() => {
    if (gameId !== 'quick_quiz' || gameState !== 'playing' || quizSelected !== null) return;
    if (quizTimeLeft <= 0) {
      setQuizSelected('__timeout__');
      setTimeout(() => advanceQuiz(false), 1000);
      return;
    }
    const timer = setTimeout(() => setQuizTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [quizTimeLeft, quizSelected, gameState, gameId]);

  const advanceQuiz = (wasCorrect) => {
    const newScore = wasCorrect ? quizScore + 1 : quizScore;
    setQuizScore(newScore);

    if (quizIndex + 1 >= (gameData.questions?.length || 0)) {
      if (newScore >= Math.ceil((gameData.questions?.length || 1) * 0.6)) {
        setGameState('won');
      } else {
        const q = gameData.questions[quizIndex];
        setWrongPair({ left: q.prompt, right: q.correct });
        setGameState('lost');
      }
    } else {
      setQuizIndex(i => i + 1);
    }
  };

  const handleQuizAnswer = (option) => {
    if (quizSelected !== null) return;
    const q = gameData.questions[quizIndex];
    const isCorrect = option === q.correct;
    setQuizSelected(option);
    setTimeout(() => advanceQuiz(isCorrect), 800);
  };

  // ═══════════════════════════════════════════════════════════
  // 🪢 HANGMAN
  // ═══════════════════════════════════════════════════════════
  const [hangmanWord, setHangmanWord] = useState(null);
  const [hangmanGuessed, setHangmanGuessed] = useState([]);
  const [hangmanLives, setHangmanLives] = useState(5);

  useEffect(() => {
    if (gameId !== 'hangman') return;
    const random = gameData.words[Math.floor(Math.random() * gameData.words.length)];
    setHangmanWord(random);
    setHangmanGuessed([]);
    setHangmanLives(5);
    setRevealedLetter(null);
  }, [gameId]);

  const handleHangmanLetter = (letter) => {
    if (gameState !== 'playing' || !hangmanWord) return;

    const equivalents = getEquivalentLetters(letter);

    if (equivalents.some(e => hangmanGuessed.includes(e))) return;

    const newGuessed = [...hangmanGuessed, ...equivalents];
    setHangmanGuessed(newGuessed);

    const isInWord = equivalents.some(e => hangmanWord.word.includes(e));

    if (!isInWord) {
      const newLives = hangmanLives - 1;
      setHangmanLives(newLives);
      if (newLives <= 0) {
        setWrongPair({ left: hangmanWord.hint, right: hangmanWord.word });
        setGameState('lost');
        return;
      }
    }

    const allRevealed = hangmanWord.word.split('').every(l =>
      l === ' ' || newGuessed.includes(l)
    );
    if (allRevealed) setGameState('won');
  };

  // ═══════════════════════════════════════════════════════════
  // 🧩 COMPLETE WORD
  // ═══════════════════════════════════════════════════════════
  const [cwWord, setCwWord] = useState(null);
  const [cwOptions, setCwOptions] = useState([]);

  useEffect(() => {
    if (gameId !== 'complete_word') return;
    const random = gameData.words[Math.floor(Math.random() * gameData.words.length)];
    setCwWord(random);
    const correctLetter = random.word[random.missingIndex];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÃẼĨÕŨỸÑ';
    const wrongLetters = [];
    while (wrongLetters.length < 3) {
      const l = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (l !== correctLetter && !wrongLetters.includes(l)) wrongLetters.push(l);
    }
    setCwOptions([correctLetter, ...wrongLetters].sort(() => Math.random() - 0.5));
  }, [gameId]);

  const handleCwAnswer = (letter) => {
    if (!cwWord || gameState !== 'playing') return;
    const correctLetter = cwWord.word[cwWord.missingIndex];
    if (letter === correctLetter) {
      setGameState('won');
    } else {
      setWrongPair({ left: cwWord.hint, right: cwWord.word });
      setGameState('lost');
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 🔤 WORD SEARCH
  // ═══════════════════════════════════════════════════════════
  const [wsWords, setWsWords] = useState([]);
  const [wsFound, setWsFound] = useState([]);

  useEffect(() => {
    if (gameId !== 'word_search') return;
    setWsWords([...gameData.words]);
    setWsFound([]);
  }, [gameId]);

  const handleWsFound = (word) => {
    if (wsFound.includes(word)) return;
    const newFound = [...wsFound, word];
    setWsFound(newFound);
    if (newFound.length === wsWords.length) setGameState('won');
  };

  // ═══════════════════════════════════════════════════════════
  // 💡 ABRIR MODAL DE PISTA
  // ═══════════════════════════════════════════════════════════
  const openHintModal = () => {
    if (processing || hintUsed) return;

    if (currentCoins < HINT_COST) {
      setConfirmModal({
        type: 'error',
        title: '💡 Mbae insuficientes',
        description: `Necesitas ${HINT_COST} Mbae.\n\nTienes: ${currentCoins} Mbae`
      });
      return;
    }

    setConfirmModal({
      type: 'hint',
      cost: HINT_COST,
      title: '💡 Usar Pista',
      description: `Vas a revelar la primera letra de la palabra.\n\nCosto: ${HINT_COST} Mbae`
    });
  };

  // ═══════════════════════════════════════════════════════════
  // 🔄 ABRIR MODAL DE REINICIAR
  // ═══════════════════════════════════════════════════════════
  const openRetryModal = () => {
    if (processing) return;

    if (currentCoins < RETRY_COST) {
      setConfirmModal({
        type: 'error',
        title: '🔄 Mbae insuficientes',
        description: `Necesitas ${RETRY_COST} Mbae.\n\nTienes: ${currentCoins} Mbae`
      });
      return;
    }

    setConfirmModal({
      type: 'retry',
      cost: RETRY_COST,
      title: '🔄 Reiniciar Juego',
      description: `¿Quieres reiniciar desde cero?\n\nCosto: ${RETRY_COST} Mbae\nSaldo después: ${currentCoins - RETRY_COST} Mbae`
    });
  };

  // ═══════════════════════════════════════════════════════════
  // 🚩 ABRIR MODAL DE TERMINAR
  // ═══════════════════════════════════════════════════════════
  const openSkipModal = () => {
    if (processing) return;

    if (currentCoins < SKIP_COST) {
      setConfirmModal({
        type: 'error',
        title: '🚩 Mbae insuficientes',
        description: `Necesitas ${SKIP_COST} Mbae.\n\nTienes: ${currentCoins} Mbae`
      });
      return;
    }

    setConfirmModal({
      type: 'skip',
      cost: SKIP_COST,
      title: '🚩 Terminar Juego',
      description: `¿Terminar sin recompensa?\n\nCosto: ${SKIP_COST} Mbae\nSaldo después: ${currentCoins - SKIP_COST} Mbae`
    });
  };

  // ═══════════════════════════════════════════════════════════
  // ✅ CONFIRMAR ACCIÓN DEL MODAL
  // ═══════════════════════════════════════════════════════════
  const confirmAction = async () => {
    if (!confirmModal || confirmModal.type === 'error') {
      setConfirmModal(null);
      return;
    }

    const { type } = confirmModal;
    setProcessing(true);

    if (type === 'hint') {
      const result = await payCostRequest(HINT_COST, 'hint');
      setProcessing(false);
      setConfirmModal(null);

      if (!result?.success) {
        setConfirmModal({
          type: 'error',
          title: 'Error',
          description: result?.message || 'No se pudo procesar el pago'
        });
        return;
      }

      // 🎯 Revelar la primera letra
      if (gameId === 'hangman' && hangmanWord) {
        const firstLetter = hangmanWord.word[0];
        const equivalents = getEquivalentLetters(firstLetter);

        const newGuessed = equivalents.some(e => hangmanGuessed.includes(e))
          ? hangmanGuessed
          : [...hangmanGuessed, ...equivalents];
        setHangmanGuessed(newGuessed);
        setRevealedLetter(firstLetter);

        const allRevealed = hangmanWord.word.split('').every(l =>
          l === ' ' || newGuessed.includes(l)
        );
        if (allRevealed) setGameState('won');
      } else if (gameId === 'complete_word' && cwWord) {
        const correctLetter = cwWord.word[cwWord.missingIndex];
        setCwOptions([correctLetter]);
        setRevealedLetter(correctLetter);
        setTimeout(() => setGameState('won'), 800);
      }

      setHintUsed(true);
    } else if (type === 'retry') {
      const result = await payForRetry(RETRY_COST);
      setProcessing(false);
      setConfirmModal(null);

      if (result.success) resetGame();
      else setConfirmModal({ type: 'error', title: 'Error', description: result.message });
    } else if (type === 'skip') {
      const result = await payForSkip(SKIP_COST);
      setProcessing(false);
      setConfirmModal(null);

      if (result.success) setCurrentScreen('main');
      else setConfirmModal({ type: 'error', title: 'Error', description: result.message });
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RESET
  // ═══════════════════════════════════════════════════════════
  const resetGame = () => {
    setMatchDeck(buildMatchDeck());
    setMatchSelected(null);
    setMatchedPairKeys([]);
    setMemoryDeck(buildMemoryDeck());
    setMemoryFlipped([]);
    setMemoryMatched([]);
    setMemoryBusy(false);
    setHintUsed(false);
    setRevealedLetter(null);

    if (gameId === 'quick_quiz') {
      setQuizIndex(0);
      setQuizScore(0);
      setQuizTimeLeft(gameData.timePerQuestion || 10);
      setQuizSelected(null);
    } else if (gameId === 'hangman') {
      const random = gameData.words[Math.floor(Math.random() * gameData.words.length)];
      setHangmanWord(random);
      setHangmanGuessed([]);
      setHangmanLives(5);
    } else if (gameId === 'complete_word') {
      const random = gameData.words[Math.floor(Math.random() * gameData.words.length)];
      setCwWord(random);
      const correctLetter = random.word[random.missingIndex];
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÃẼĨÕŨỸÑ';
      const wrongLetters = [];
      while (wrongLetters.length < 3) {
        const l = alphabet[Math.floor(Math.random() * alphabet.length)];
        if (l !== correctLetter && !wrongLetters.includes(l)) wrongLetters.push(l);
      }
      setCwOptions([correctLetter, ...wrongLetters].sort(() => Math.random() - 0.5));
    } else if (gameId === 'word_search') {
      setWsWords([...gameData.words]);
      setWsFound([]);
    }

    setWrongPair(null);
    setGameState('playing');
  };

  const handleWin = async () => {
    if (processing) return;
    setProcessing(true);
    await completeGame(activeLesson?.id || activeGame?.id);
    setProcessing(false);
  };

  // ═══════════════════════════════════════════════════════════
  // PROGRESO
  // ═══════════════════════════════════════════════════════════
  const getProgress = () => {
    if (gameId === 'matching') return (matchedPairKeys.length / (gameData.pairs?.length || 1)) * 100;
    if (gameId === 'memory') return (memoryMatched.length / (gameData.pairs?.length || 1)) * 100;
    if (gameId === 'quick_quiz') return (quizIndex / (gameData.questions?.length || 1)) * 100;
    if (gameId === 'hangman') return hangmanWord ? (hangmanWord.word.split('').filter(l => hangmanGuessed.includes(l)).length / hangmanWord.word.replace(/\s/g, '').length) * 100 : 0;
    if (gameId === 'complete_word') return cwWord ? 50 : 0;
    if (gameId === 'word_search') return (wsFound.length / (wsWords.length || 1)) * 100;
    return 0;
  };

  const progress = getProgress();

  const canShowHint =
    ['hangman', 'complete_word'].includes(gameId) &&
    !hintUsed &&
    gameState === 'playing';

  // ═══════════════════════════════════════════════════════════
  // RENDERS
  // ═══════════════════════════════════════════════════════════
  const renderMatching = () => (
    <View style={styles.matchingGrid}>
      {matchDeck.map(card => {
        const isMatched = matchedPairKeys.includes(card.pairKey);
        const isSelected = matchSelected?.id === card.id;
        const isDisabled = gameState !== 'playing';
        return (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.matchCard,
              card.side === 'left' && styles.matchCardLeft,
              card.side === 'right' && styles.matchCardRight,
              isSelected && styles.matchCardSelected,
              isMatched && styles.matchCardMatched,
              isDisabled && !isMatched && styles.matchCardDisabled,
            ]}
            onPress={() => handleMatchCardPress(card)}
            activeOpacity={0.8}
            disabled={isMatched || isDisabled}
          >
            <Text style={[styles.matchCardText, isMatched && styles.matchCardTextMatched]}>
              {card.text}
            </Text>
            {isMatched && (
              <Ionicons name="checkmark-circle" size={20} color={colors.successGreen} style={styles.matchCheck} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderMemory = () => (
    <View style={styles.memoryGrid}>
      {memoryDeck.map(card => {
        const isFlipped = memoryFlipped.find(c => c.id === card.id) || memoryMatched.includes(card.pairKey);
        const isMatched = memoryMatched.includes(card.pairKey);
        return (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.memoryCard,
              isFlipped && styles.memoryCardFlipped,
              isMatched && styles.memoryCardMatched,
            ]}
            onPress={() => handleMemoryCardPress(card)}
            activeOpacity={0.8}
            disabled={isFlipped || isMatched || gameState !== 'playing'}
          >
            {isFlipped ? (
              <Text style={styles.memoryEmoji}>{card.emoji}</Text>
            ) : (
              <Ionicons name="help" size={32} color={colors.montePrimary} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderQuickQuiz = () => {
    const q = gameData.questions[quizIndex];
    if (!q) return null;
    return (
      <View style={styles.quizContainer}>
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>{quizTimeLeft}</Text>
        </View>

        <View style={styles.quizProgressRow}>
          <Text style={styles.quizProgressText}>
            {quizIndex + 1} / {gameData.questions.length}
          </Text>
          <Text style={styles.quizScoreText}>✅ {quizScore}</Text>
        </View>

        <View style={styles.quizQuestionBox}>
          <Text style={styles.quizQuestion}>{q.prompt}</Text>
        </View>

        <View style={styles.quizOptions}>
          {quizShuffled.map((option, idx) => {
            const isSelected = quizSelected === option;
            const isCorrect = option === q.correct;
            const showCorrect = quizSelected !== null && isCorrect;
            const showWrong = quizSelected !== null && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.quizOption,
                  showCorrect && styles.quizOptionCorrect,
                  showWrong && styles.quizOptionWrong,
                ]}
                onPress={() => handleQuizAnswer(option)}
                disabled={quizSelected !== null}
                activeOpacity={0.8}
              >
                <Text style={styles.quizOptionText}>{option}</Text>
                {showCorrect && <Ionicons name="checkmark-circle" size={24} color={colors.successGreen} />}
                {showWrong && <Ionicons name="close-circle" size={24} color={colors.errorRed} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderHangman = () => {
    if (!hangmanWord) return null;

    const word = hangmanWord.word;
    const displayWord = word.split('').map((letter, idx) => {
      if (letter === ' ') return ' ';
      return hangmanGuessed.includes(letter) ? letter : '_';
    });

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÑ\''.split('');

    return (
      <View style={styles.hangmanContainer}>
        <View style={styles.hangmanLives}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < hangmanLives ? 'heart' : 'heart-outline'}
              size={24}
              color={i < hangmanLives ? colors.errorRed : colors.textMuted}
            />
          ))}
        </View>

        <View style={styles.hangmanDrawing}>
          <Text style={styles.hangmanEmoji}>{hangmanLives > 2 ? '🦊' : '😰'}</Text>
          <Text style={styles.hangmanEmojiSmall}>
            {'💀'.repeat(5 - hangmanLives)}
          </Text>
        </View>

        <View style={styles.hangmanHint}>
          <Text style={styles.hangmanHintEmoji}>{hangmanWord.emoji}</Text>
          <Text style={styles.hangmanHintText}>{hangmanWord.hint}</Text>
          <Text style={styles.hangmanHintCategory}>{hangmanWord.category}</Text>
        </View>

        {/* 🎯 MENSAJE DE PISTA REVELADA */}
        {revealedLetter && (
          <View style={styles.revealedBanner}>
            <Ionicons name="bulb" size={20} color={colors.solGold} />
            <Text style={styles.revealedText}>
              La primera letra es: <Text style={styles.revealedLetterText}>{revealedLetter}</Text>
            </Text>
          </View>
        )}

        <View style={styles.hangmanWordBox}>
          {displayWord.map((letter, idx) => (
            <Text key={idx} style={styles.hangmanLetter}>
              {letter}
            </Text>
          ))}
        </View>

        <View style={styles.hangmanKeyboard}>
          {alphabet.map(letter => {
            const isUsed = hangmanGuessed.includes(letter);
            const isCorrect = word.includes(letter);
            return (
              <TouchableOpacity
                key={letter}
                style={[
                  styles.hangmanKey,
                  isUsed && isCorrect && styles.hangmanKeyCorrect,
                  isUsed && !isCorrect && styles.hangmanKeyWrong,
                ]}
                onPress={() => handleHangmanLetter(letter)}
                disabled={isUsed || gameState !== 'playing'}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.hangmanKeyText,
                  isUsed && styles.hangmanKeyTextUsed
                ]}>
                  {letter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderCompleteWord = () => {
    if (!cwWord) return null;
    const word = cwWord.word;
    const missingIdx = cwWord.missingIndex;

    return (
      <View style={styles.cwContainer}>
        <View style={styles.cwHint}>
          <Text style={styles.cwHintEmoji}>{cwWord.emoji}</Text>
          <Text style={styles.cwHintText}>{cwWord.hint}</Text>
        </View>

        {revealedLetter && (
          <View style={styles.revealedBanner}>
            <Ionicons name="bulb" size={20} color={colors.solGold} />
            <Text style={styles.revealedText}>
              La letra correcta es: <Text style={styles.revealedLetterText}>{revealedLetter}</Text>
            </Text>
          </View>
        )}

        <View style={styles.cwWordBox}>
          {word.split('').map((letter, idx) => (
            <View
              key={idx}
              style={[
                styles.cwLetterBox,
                idx === missingIdx && styles.cwLetterBoxMissing
              ]}
            >
              <Text style={[
                styles.cwLetterText,
                idx === missingIdx && styles.cwLetterTextMissing
              ]}>
                {idx === missingIdx ? '?' : letter}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.cwInstruction}>Elige la letra que falta:</Text>
        <View style={styles.cwOptions}>
          {cwOptions.map((letter, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.cwOption}
              onPress={() => handleCwAnswer(letter)}
              disabled={gameState !== 'playing'}
              activeOpacity={0.8}
            >
              <Text style={styles.cwOptionText}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderWordSearch = () => (
    <View style={styles.wsContainer}>
      <Text style={styles.wsInstruction}>
        Encuentra estas {wsWords.length} palabras:
      </Text>
      <View style={styles.wsWordsList}>
        {wsWords.map((word, idx) => {
          const isFound = wsFound.includes(word);
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.wsWordChip, isFound && styles.wsWordChipFound]}
              onPress={() => handleWsFound(word)}
              activeOpacity={0.8}
              disabled={isFound}
            >
              <Text style={[styles.wsWordChipText, isFound && styles.wsWordChipTextFound]}>
                {isFound ? '✅ ' : ''}{word}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.wsHint}>
        💡 Toca cada palabra cuando la encuentres
      </Text>
      <Text style={styles.wsCounter}>
        {wsFound.length} / {wsWords.length} encontradas
      </Text>
    </View>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ═══════════════════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => setShowExitModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={26} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.progressBarBg}>
          <View style={[
            styles.progressBarFill,
            { width: `${Math.max(6, progress)}%`, backgroundColor: gameData.color || colors.aretePurple }
          ]} />
        </View>

        <TouchableOpacity
          style={[styles.topActionBtn, currentCoins < RETRY_COST && styles.topActionBtnDisabled]}
          onPress={openRetryModal}
          disabled={processing || currentCoins < RETRY_COST}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topActionBtn, styles.topActionBtnSkip, currentCoins < SKIP_COST && styles.topActionBtnDisabled]}
          onPress={openSkipModal}
          disabled={processing || currentCoins < SKIP_COST}
          activeOpacity={0.7}
        >
          <Ionicons name="flag" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.heartWrapper}>
          <Ionicons
            name={gameState === 'lost' ? 'heart-dislike' : 'heart'}
            size={22}
            color={gameState === 'lost' ? '#BDBDBD' : colors.errorRed}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.gameHeader}>
          <View style={[styles.gameIconCircle, { backgroundColor: gameData.color || colors.aretePurple }]}>
            <Ionicons name={gameData.icon || 'game-controller'} size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.gameTitle}>{gameData.title}</Text>
          <Text style={styles.gameDescription}>{gameData.description}</Text>
        </View>

        {gameId === 'matching' && renderMatching()}
        {gameId === 'memory' && renderMemory()}
        {gameId === 'quick_quiz' && renderQuickQuiz()}
        {gameId === 'hangman' && renderHangman()}
        {gameId === 'complete_word' && renderCompleteWord()}
        {gameId === 'word_search' && renderWordSearch()}

        {canShowHint && (
          <TouchableOpacity
            style={[
              styles.hintBtn,
              currentCoins < HINT_COST && styles.hintBtnDisabled
            ]}
            onPress={openHintModal}
            disabled={processing || currentCoins < HINT_COST}
            activeOpacity={0.8}
          >
            <Ionicons name="bulb" size={22} color="#FFFFFF" />
            <View style={styles.hintBtnTextBlock}>
              <Text style={styles.hintBtnTitle}>💡 Usar Pista</Text>
              <Text style={styles.hintBtnCost}>Revela la primera letra ({HINT_COST} Mbae)</Text>
            </View>
          </TouchableOpacity>
        )}

        {gameState === 'won' && (
          <View style={styles.resultBox}>
            <Ionicons name="trophy" size={56} color={colors.solGold} />
            <Text style={styles.resultTitle}>¡Iporãiterei!</Text>
            <Text style={styles.resultSubtitle}>¡Ganaste el juego!</Text>
            <PressableScale style={styles.primaryBtn} onPress={handleWin} disabled={processing} pulse>
              {processing ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>RECLAMAR RECOMPENSA</Text>}
            </PressableScale>
          </View>
        )}

        {gameState === 'lost' && (
          <View style={styles.resultBoxLost}>
            <Ionicons name="heart-dislike" size={56} color={colors.errorRed} />
            <Text style={styles.resultTitleLost}>¡Oh no!</Text>
            <Text style={styles.resultSubtitleLost}>La respuesta correcta era:</Text>

            {wrongPair && (
              <View style={styles.correctAnswerBox}>
                <View style={styles.correctAnswerRow}>
                  <Text style={styles.correctAnswerLabel}>Pregunta:</Text>
                  <Text style={styles.correctAnswerValue}>{wrongPair.left}</Text>
                </View>
                <View style={styles.correctAnswerRow}>
                  <Text style={styles.correctAnswerLabel}>Correcto:</Text>
                  <Text style={styles.correctAnswerValue}>{wrongPair.right}</Text>
                </View>
              </View>
            )}

            <Text style={styles.lostHint}>¿Quieres intentar de nuevo? Solo {RETRY_COST} Mbae</Text>

            <PressableScale
              style={[styles.retrySmallBtn, currentCoins < RETRY_COST && styles.retrySmallBtnDisabled]}
              onPress={openRetryModal}
              disabled={processing || currentCoins < RETRY_COST}
              pulse
            >
              {processing ? <ActivityIndicator color="#FFFFFF" /> : (
                <>
                  <Ionicons name="refresh" size={18} color="#FFFFFF" />
                  <Text style={styles.retrySmallBtnText}>REINTENTAR ({RETRY_COST} Mbae)</Text>
                </>
              )}
            </PressableScale>

            <Text style={styles.skipHint}>O termina el juego sin recompensa</Text>

            <PressableScale
              style={[styles.skipSmallBtn, currentCoins < SKIP_COST && styles.skipSmallBtnDisabled]}
              onPress={openSkipModal}
              disabled={processing || currentCoins < SKIP_COST}
            >
              <Ionicons name="flag" size={18} color="#FFFFFF" />
              <Text style={styles.skipSmallBtnText}>TERMINAR ({SKIP_COST} Mbae)</Text>
            </PressableScale>
          </View>
        )}
      </ScrollView>

      <View style={styles.balanceBar}>
        <Ionicons name="color-filter" size={20} color={colors.solGold} />
        <Text style={styles.balanceLabel}>Tu saldo:</Text>
        <Text style={styles.balanceValue}>{currentCoins} Mbae</Text>
      </View>

      {/* ═══════════ MODAL DE CONFIRMACIÓN CUSTOM ═══════════ */}
      <Modal
        visible={!!confirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>
              {confirmModal?.title || ''}
            </Text>
            <Text style={styles.confirmDescription}>
              {confirmModal?.description || ''}
            </Text>

            {/* Si es error, solo botón OK */}
            {confirmModal?.type === 'error' ? (
              <TouchableOpacity
                style={[styles.confirmBtn, styles.confirmBtnOk]}
                onPress={() => setConfirmModal(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmBtnOkText}>Entendido</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={[styles.confirmBtn, styles.confirmBtnCancel]}
                  onPress={() => setConfirmModal(null)}
                  disabled={processing}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmBtnCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmBtn, styles.confirmBtnConfirm]}
                  onPress={confirmAction}
                  disabled={processing}
                  activeOpacity={0.8}
                >
                  {processing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.confirmBtnConfirmText}>
                      {confirmModal?.type === 'retry' ? 'Reiniciar' :
                       confirmModal?.type === 'skip' ? 'Terminar' :
                       'Usar Pista'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <ExitModal
        visible={showExitModal}
        onConfirm={() => { setShowExitModal(false); setCurrentScreen('main'); }}
        onCancel={() => setShowExitModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sandBackground },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandBorder,
    gap: 8,
  },
  closeBtn: { padding: 4 },
  progressBarBg: {
    flex: 1,
    height: 12,
    backgroundColor: '#E6D7C3',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 6 },
  topActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.terracotaPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: colors.terracotaDark,
  },
  topActionBtnSkip: {
    backgroundColor: colors.aretePurple,
    borderBottomColor: '#6A1B9A',
  },
  topActionBtnDisabled: {
    backgroundColor: '#BDBDBD',
    borderBottomColor: '#757575',
    opacity: 0.6,
  },
  heartWrapper: { flexDirection: 'row', alignItems: 'center' },

  scrollContent: { padding: 20, paddingBottom: 40 },

  gameHeader: { alignItems: 'center', marginBottom: 24 },
  gameIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  gameTitle: { fontSize: 24, fontWeight: '900', color: colors.textPrimary, marginBottom: 4 },
  gameDescription: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 8 },

  matchingGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginBottom: 24 },
  matchCard: {
    width: '48%', minHeight: 64, backgroundColor: '#FFFFFF', borderRadius: 16,
    borderWidth: 2, borderBottomWidth: 4, borderColor: colors.sandBorder,
    justifyContent: 'center', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8,
    position: 'relative',
  },
  matchCardLeft: { borderLeftWidth: 6, borderLeftColor: colors.monteMedium },
  matchCardRight: { borderRightWidth: 6, borderRightColor: colors.terracotaMedium },
  matchCardSelected: { borderColor: colors.aretePurple, backgroundColor: colors.aretePastel },
  matchCardMatched: { borderColor: colors.successGreen, backgroundColor: colors.successPastel, opacity: 0.7 },
  matchCardDisabled: { opacity: 0.5 },
  matchCardText: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  matchCardTextMatched: { color: colors.successGreenDark },
  matchCheck: { position: 'absolute', top: 4, right: 4 },

  memoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginBottom: 24 },
  memoryCard: {
    width: '31%', aspectRatio: 1, backgroundColor: '#FFFFFF', borderRadius: 16,
    borderWidth: 2, borderBottomWidth: 4, borderColor: colors.sandBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  memoryCardFlipped: { backgroundColor: colors.aretePastel, borderColor: colors.aretePurple },
  memoryCardMatched: { backgroundColor: colors.successPastel, borderColor: colors.successGreen, opacity: 0.6 },
  memoryEmoji: { fontSize: 36 },

  quizContainer: { marginBottom: 24 },
  timerCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFFFFF', borderWidth: 4, borderColor: colors.aretePurple,
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: 16,
  },
  timerText: { fontSize: 32, fontWeight: '900', color: colors.aretePurple },
  quizProgressRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 12, paddingHorizontal: 8,
  },
  quizProgressText: { fontSize: 14, fontWeight: '800', color: colors.textSecondary },
  quizScoreText: { fontSize: 14, fontWeight: '800', color: colors.successGreen },
  quizQuestionBox: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 22, marginBottom: 20,
    borderWidth: 2, borderColor: colors.aretePurple,
  },
  quizQuestion: { fontSize: 20, fontWeight: '900', color: colors.textPrimary, textAlign: 'center' },
  quizOptions: { gap: 12 },
  quizOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18,
    borderWidth: 2, borderBottomWidth: 4, borderColor: colors.sandBorder,
  },
  quizOptionCorrect: { backgroundColor: colors.successPastel, borderColor: colors.successGreen },
  quizOptionWrong: { backgroundColor: '#FFE5E5', borderColor: colors.errorRed },
  quizOptionText: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },

  hangmanContainer: { marginBottom: 24 },
  hangmanLives: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 12 },
  hangmanDrawing: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 2, borderColor: colors.sandBorder,
  },
  hangmanEmoji: { fontSize: 80 },
  hangmanEmojiSmall: { fontSize: 24, marginTop: 6 },
  hangmanHint: {
    backgroundColor: colors.aretePastel, borderRadius: 16, padding: 14,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1.5, borderColor: colors.aretePurple,
  },
  hangmanHintEmoji: { fontSize: 32, marginBottom: 4 },
  hangmanHintText: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  hangmanHintCategory: { fontSize: 11, color: colors.textMuted, marginTop: 2, letterSpacing: 1 },

  // 🎯 NUEVO: Banner de pista revelada
  revealedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.solGold,
    marginBottom: 16,
    gap: 8,
  },
  revealedText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  revealedLetterText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.solGold,
    letterSpacing: 2,
  },

  hangmanWordBox: {
    flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap',
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 2, borderColor: colors.sandBorder, gap: 6,
  },
  hangmanLetter: {
    fontSize: 26, fontWeight: '900', color: colors.textPrimary,
    minWidth: 24, textAlign: 'center', letterSpacing: 2,
  },
  hangmanKeyboard: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  hangmanKey: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#FFFFFF', borderWidth: 2, borderBottomWidth: 3,
    borderColor: colors.sandBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  hangmanKeyCorrect: { backgroundColor: colors.successPastel, borderColor: colors.successGreen },
  hangmanKeyWrong: { backgroundColor: '#FFE5E5', borderColor: colors.errorRed, opacity: 0.5 },
  hangmanKeyText: { fontSize: 16, fontWeight: '900', color: colors.textPrimary },
  hangmanKeyTextUsed: { opacity: 0.5 },

  cwContainer: { marginBottom: 24, alignItems: 'center' },
  cwHint: {
    backgroundColor: colors.aretePastel, borderRadius: 16, padding: 14,
    alignItems: 'center', marginBottom: 20, width: '100%',
    borderWidth: 1.5, borderColor: colors.aretePurple,
  },
  cwHintEmoji: { fontSize: 40, marginBottom: 6 },
  cwHintText: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  cwWordBox: { flexDirection: 'row', gap: 6, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  cwLetterBox: {
    width: 44, height: 54, borderRadius: 12,
    backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: colors.sandBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  cwLetterBoxMissing: { borderColor: colors.aretePurple, backgroundColor: colors.aretePastel, borderWidth: 3 },
  cwLetterText: { fontSize: 24, fontWeight: '900', color: colors.textPrimary },
  cwLetterTextMissing: { color: colors.aretePurple, fontSize: 28 },
  cwInstruction: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 12 },
  cwOptions: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  cwOption: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: '#FFFFFF', borderWidth: 2, borderBottomWidth: 4,
    borderColor: colors.sandBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  cwOptionText: { fontSize: 28, fontWeight: '900', color: colors.textPrimary },

  wsContainer: { alignItems: 'center', marginBottom: 24 },
  wsInstruction: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 16 },
  wsWordsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 20 },
  wsWordChip: {
    backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16,
    borderWidth: 2, borderColor: colors.sandBorder,
  },
  wsWordChipFound: { backgroundColor: colors.successPastel, borderColor: colors.successGreen },
  wsWordChipText: { fontSize: 15, fontWeight: '900', color: colors.textPrimary, letterSpacing: 1 },
  wsWordChipTextFound: { color: colors.successGreenDark, textDecorationLine: 'line-through' },
  wsHint: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic', marginBottom: 10 },
  wsCounter: { fontSize: 14, fontWeight: '800', color: colors.aretePurple },

  hintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.solGold,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: '#B8860B',
    gap: 12,
    marginTop: 12,
  },
  hintBtnDisabled: {
    backgroundColor: '#BDBDBD',
    borderBottomColor: '#757575',
    opacity: 0.6,
  },
  hintBtnTextBlock: { flex: 1 },
  hintBtnTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  hintBtnCost: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700', marginTop: 2 },

  balanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 2,
    borderTopColor: colors.sandBorder,
    gap: 8,
  },
  balanceLabel: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  balanceValue: { fontSize: 16, fontWeight: '900', color: colors.terracotaDark },

  // 🎯 MODAL CUSTOM
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 26,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.sandBorder,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  confirmDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnCancel: {
    backgroundColor: colors.sandBackground,
    borderWidth: 2,
    borderColor: colors.sandBorder,
  },
  confirmBtnCancelText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  confirmBtnConfirm: {
    backgroundColor: colors.montePrimary,
    borderBottomWidth: 3,
    borderBottomColor: colors.monteDark,
  },
  confirmBtnConfirmText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  confirmBtnOk: {
    backgroundColor: colors.montePrimary,
    width: '100%',
    borderBottomWidth: 3,
    borderBottomColor: colors.monteDark,
  },
  confirmBtnOkText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  resultBox: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, alignItems: 'center',
    borderWidth: 2, borderColor: colors.solGold, marginTop: 16,
    shadowColor: colors.solGold, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  resultTitle: { fontSize: 26, fontWeight: '900', color: colors.terracotaDark, marginTop: 12 },
  resultSubtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: 20, marginTop: 4 },
  primaryBtn: {
    backgroundColor: colors.montePrimary, paddingVertical: 16, paddingHorizontal: 32,
    borderRadius: 18, width: '100%', alignItems: 'center',
    borderBottomWidth: 4, borderBottomColor: colors.monteDark,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

  resultBoxLost: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, alignItems: 'center',
    borderWidth: 2, borderColor: colors.errorRed, marginTop: 16,
  },
  resultTitleLost: { fontSize: 26, fontWeight: '900', color: colors.errorRedDark, marginTop: 12 },
  resultSubtitleLost: { fontSize: 15, color: colors.textSecondary, marginBottom: 16, marginTop: 4, textAlign: 'center' },
  correctAnswerBox: {
    backgroundColor: colors.successPastel, paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 16, width: '100%', borderWidth: 2, borderColor: colors.successGreen, marginBottom: 16,
  },
  correctAnswerRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  correctAnswerLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  correctAnswerValue: { fontSize: 15, fontWeight: '900', color: colors.successGreenDark },
  lostHint: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: 12, fontStyle: 'italic' },
  retrySmallBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.terracotaPrimary, paddingVertical: 14, paddingHorizontal: 24,
    borderRadius: 16, width: '100%', borderBottomWidth: 4,
    borderBottomColor: colors.terracotaDark, gap: 8, marginBottom: 12,
  },
  retrySmallBtnDisabled: {
    backgroundColor: '#9E9E9E',
    borderBottomColor: '#616161',
    opacity: 0.6,
  },
  retrySmallBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },
  skipHint: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginBottom: 8, fontStyle: 'italic' },
  skipSmallBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.aretePurple, paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 14, width: '100%', borderBottomWidth: 3,
    borderBottomColor: '#6A1B9A', gap: 8,
  },
  skipSmallBtnDisabled: {
    backgroundColor: '#9E9E9E',
    borderBottomColor: '#616161',
    opacity: 0.6,
  },
  skipSmallBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 0.3 },
});