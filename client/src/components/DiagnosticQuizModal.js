import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// 🎯 5 preguntas fáciles de diagnóstico
const QUESTIONS = [
  {
    id: 1,
    question: '¿Cómo se dice "Hola" en guaraní?',
    emoji: '👋',
    options: ['Maitei', 'Kaaruma', 'Puama', 'Sy'],
    correct: 'Maitei'
  },
  {
    id: 2,
    question: '¿Cómo se dice "Dos" en guaraní?',
    emoji: '2️⃣',
    options: ['Peteĩ', 'Mokõi', 'Mbohapy', 'Irundy'],
    correct: 'Mokõi'
  },
  {
    id: 3,
    question: '¿Qué significa "Aguará"?',
    emoji: '🦊',
    options: ['Zorro', 'Jaguar', 'Armadillo', 'Venado'],
    correct: 'Zorro'
  },
  {
    id: 4,
    question: '¿Cómo se dice "Buenos días"?',
    emoji: '🌅',
    options: ['Puama', 'Kaaruma', 'Pîtuma', 'Maitei'],
    correct: 'Puama'
  },
  {
    id: 5,
    question: '¿Qué significa "Sy"?',
    emoji: '👩',
    options: ['Madre', 'Padre', 'Abuelo', 'Hermano'],
    correct: 'Madre'
  }
];

export default function DiagnosticQuizModal({ visible, onClose, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQuestion = QUESTIONS[currentIndex];
  const isAnswered = selectedAnswer !== null;

  const handleAnswer = (answer) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    if (answer === currentQuestion.correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= QUESTIONS.length) {
      setFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
    }
  };

  const handleFinish = () => {
    const finalScore = score;
    // Resetear
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
    // Llamar al padre con el score
    onFinish(finalScore);
  };

  const handleCancel = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
    onClose();
  };

  const getResultInfo = (s) => {
    if (s === 5) return { level: '🏆 Avanzado', message: '¡Increíble! Empieza desde Unidad 3', unit: 3 };
    if (s === 4) return { level: '⭐ Intermedio', message: '¡Muy bien! Empieza desde Unidad 2', unit: 2 };
    if (s === 3) return { level: '🌱 Básico', message: '¡Buen inicio! Empieza desde Lección 2', unit: 'leccion2' };
    return { level: '🌿 Principiante', message: 'Empezarás desde el inicio del sendero', unit: 1 };
  };

  return (
    <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={handleCancel}>
      <SafeAreaView style={styles.container}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleCancel} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={26} color={colors.textSecondary} />
          </TouchableOpacity>
          {!finished && (
            <Text style={styles.stepText}>
              Pregunta {currentIndex + 1} de {QUESTIONS.length}
            </Text>
          )}
          {finished && <Text style={styles.stepText}>Resultado</Text>}
          <View style={{ width: 34 }} />
        </View>

        {/* Progreso */}
        {!finished && (
          <View style={styles.progressContainer}>
            {QUESTIONS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.progressDot,
                  idx <= currentIndex && styles.progressDotActive
                ]}
              />
            ))}
          </View>
        )}

        {/* Contenido */}
        {!finished ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>

            <View style={styles.questionBox}>
              <Text style={styles.emoji}>{currentQuestion.emoji}</Text>
              <Text style={styles.question}>{currentQuestion.question}</Text>
            </View>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, idx) => {
                const isCorrect = option === currentQuestion.correct;
                const isSelected = option === selectedAnswer;
                const showAsCorrect = isAnswered && isCorrect;
                const showAsWrong = isAnswered && isSelected && !isCorrect;

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.optionBtn,
                      showAsCorrect && styles.optionCorrect,
                      showAsWrong && styles.optionWrong,
                      isSelected && !showAsCorrect && !showAsWrong && styles.optionSelected
                    ]}
                    onPress={() => handleAnswer(option)}
                    disabled={isAnswered}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionLetter}>
                      <Text style={styles.optionLetterText}>
                        {String.fromCharCode(65 + idx)}
                      </Text>
                    </View>
                    <Text style={styles.optionText}>{option}</Text>
                    {showAsCorrect && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.successGreen} />
                    )}
                    {showAsWrong && (
                      <Ionicons name="close-circle" size={24} color={colors.errorRed} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {isAnswered && (
              <View style={[
                styles.feedbackBox,
                selectedAnswer === currentQuestion.correct
                  ? styles.feedbackCorrect
                  : styles.feedbackWrong
              ]}>
                <Text style={styles.feedbackText}>
                  {selectedAnswer === currentQuestion.correct
                    ? '✅ ¡Iporãiterei! ¡Correcto!'
                    : `❌ Casi... La respuesta era: ${currentQuestion.correct}`}
                </Text>
              </View>
            )}

            {isAnswered && (
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>
                  {currentIndex + 1 >= QUESTIONS.length ? 'VER RESULTADO' : 'SIGUIENTE'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}

          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.resultContainer}>
              <View style={styles.resultIconCircle}>
                <Text style={styles.resultEmoji}>
                  {score === 5 ? '🏆' : score >= 4 ? '⭐' : score >= 3 ? '🌱' : '🌿'}
                </Text>
              </View>

              <Text style={styles.resultTitle}>
                {score === 5 ? '¡EXCELENTE!' : score >= 4 ? '¡MUY BIEN!' : score >= 3 ? '¡BUEN INICIO!' : '¡A APRENDER!'}
              </Text>

              <Text style={styles.resultScore}>
                {score} de {QUESTIONS.length} correctas
              </Text>

              <View style={styles.resultBadge}>
                <Text style={styles.resultBadgeText}>
                  {getResultInfo(score).level}
                </Text>
              </View>

              <Text style={styles.resultMessage}>
                {getResultInfo(score).message}
              </Text>

              <TouchableOpacity
                style={styles.finishBtn}
                onPress={handleFinish}
                activeOpacity={0.85}
              >
                <Text style={styles.finishBtnText}>CONTINUAR AL REGISTRO</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sandBackground },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandBorder,
  },
  closeBtn: { padding: 4 },
  stepText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  progressDot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.sandBorder,
  },
  progressDotActive: {
    backgroundColor: colors.montePrimary,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  questionBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  question: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
  },

  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.sandBorder,
    gap: 12,
  },
  optionSelected: {
    borderColor: colors.aretePurple,
    backgroundColor: colors.aretePastel,
  },
  optionCorrect: {
    borderColor: colors.successGreen,
    backgroundColor: colors.successPastel,
  },
  optionWrong: {
    borderColor: colors.errorRed,
    backgroundColor: '#FFE5E5',
  },
  optionLetter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.sandBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetterText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textSecondary,
  },
  optionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  feedbackBox: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  feedbackCorrect: {
    backgroundColor: colors.successPastel,
    borderWidth: 1.5,
    borderColor: colors.successGreen,
  },
  feedbackWrong: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1.5,
    borderColor: colors.errorRed,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.montePrimary,
    paddingVertical: 16,
    borderRadius: 18,
    borderBottomWidth: 4,
    borderBottomColor: colors.monteDark,
    gap: 10,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  resultContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  resultIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: colors.solGold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.solGold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  resultEmoji: {
    fontSize: 64,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.terracotaDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  resultScore: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  resultBadge: {
    backgroundColor: colors.montePrimary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 16,
  },
  resultBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  resultMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.montePrimary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderBottomWidth: 4,
    borderBottomColor: colors.monteDark,
    gap: 10,
    width: '100%',
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});