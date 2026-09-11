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

export default function StoriesScreen() {
  const { speakText, stories, completeStory } = useApp();
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userAnswerIndex, setUserAnswerIndex] = useState(null);
  const [showQuestionFeedback, setShowQuestionFeedback] = useState(false);
  const [storyCompleted, setStoryCompleted] = useState(false);

  // Open story reader
  const handleOpenStory = (story) => {
    setSelectedStory(story);
    setCurrentLineIndex(0);
    setUserAnswerIndex(null);
    setShowQuestionFeedback(false);
    setStoryCompleted(false);
    // Speak first line automatically
    if (story.dialogues[0]?.guarani) {
      speakText(story.dialogues[0].guarani);
    }
  };

  // Step to next dialogue line
  const handleNextLine = () => {
    if (!selectedStory) return;
    const nextIdx = currentLineIndex + 1;
    if (nextIdx < selectedStory.dialogues.length) {
      setCurrentLineIndex(nextIdx);
      setUserAnswerIndex(null);
      setShowQuestionFeedback(false);
      const nextLine = selectedStory.dialogues[nextIdx];
      if (nextLine.guarani) {
        speakText(nextLine.guarani);
      }
    } else {
      setStoryCompleted(true);
      completeStory(selectedStory.id);
    }
  };

  // =========================================================================
  // VIEW 1: INTERACTIVE STORY READER
  // =========================================================================
  if (selectedStory) {
    const currentLine = selectedStory.dialogues[currentLineIndex];
    const isQuestionLine = currentLine.hasQuestion;

    return (
      <SafeAreaView style={styles.container}>
        {/* Story Header */}
        <View style={styles.readerHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setSelectedStory(null)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.readerTitleGuarani}>{selectedStory.title_guarani}</Text>
            <Text style={styles.readerTitleSpanish}>{selectedStory.title_spanish}</Text>
          </View>
          <View style={styles.xpBadge}>
            <Ionicons name="flash" size={14} color={colors.solGold} />
            <Text style={styles.xpBadgeText}>+{selectedStory.xp} XP</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.readerContent}>
          {/* History dialogues revealed up to currentLineIndex */}
          {selectedStory.dialogues.slice(0, currentLineIndex + 1).map((line, idx) => (
            <View key={idx} style={styles.speechCard}>
              <View style={styles.speakerRow}>
                <View style={styles.speakerAvatarCircle}>
                  <Ionicons name={line.avatar || 'person'} size={20} color={colors.montePrimary} />
                </View>
                <Text style={styles.speakerName}>{line.speaker}</Text>
                <TouchableOpacity
                  style={styles.listenInlineBtn}
                  onPress={() => speakText(line.guarani)}
                >
                  <Ionicons name="volume-medium" size={18} color={colors.montePrimary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.dialogueGuarani}>{line.guarani}</Text>
              <Text style={styles.dialogueSpanish}>{line.spanish}</Text>

              {/* Comprehension Question if active line has one */}
              {idx === currentLineIndex && line.hasQuestion && !storyCompleted && (
                <View style={styles.questionBox}>
                  <View style={styles.questionHeader}>
                    <Ionicons name="help-circle" size={20} color={colors.aretePurple} />
                    <Text style={styles.questionTitle}>Pregunta de comprensión:</Text>
                  </View>
                  <Text style={styles.questionPrompt}>{line.question.prompt}</Text>

                  {line.question.options.map((opt, optIdx) => {
                    const isSelected = userAnswerIndex === optIdx;
                    return (
                      <TouchableOpacity
                        key={optIdx}
                        style={[styles.questionOption, isSelected && styles.questionOptionSelected]}
                        onPress={() => {
                          setUserAnswerIndex(optIdx);
                          setShowQuestionFeedback(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.questionOptionText, isSelected && styles.questionOptionTextSelected]}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {showQuestionFeedback && (
                    <View style={styles.questionFeedbackBadge}>
                      <Text style={styles.questionFeedbackText}>
                        {userAnswerIndex === line.question.correctIndex
                          ? '¡Correcto! Has entendido el sentido del relato.'
                          : 'Pista: El astuto zorro siempre busca salvarse con promesas.'}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}

          {/* Story completed announcement */}
          {storyCompleted && (
            <View style={styles.completedCard}>
              <Ionicons name="ribbon" size={48} color={colors.solGold} />
              <Text style={styles.completedTitle}>¡Cuento Finalizado!</Text>
              <Text style={styles.completedDesc}>
                Has ganado +{selectedStory.xp} puntos XP de sabiduría por aprender de los relatos de los abuelos del Chaco.
              </Text>
              <TouchableOpacity
                style={styles.finishStoryBtn}
                onPress={() => setSelectedStory(null)}
              >
                <Text style={styles.finishStoryBtnText}>Volver a la Biblioteca</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Continue reading button if not finished and question answered */}
        {!storyCompleted && (!isQuestionLine || showQuestionFeedback) && (
          <View style={styles.readerBottomBar}>
            <TouchableOpacity
              style={styles.readerNextBtn}
              onPress={handleNextLine}
              activeOpacity={0.85}
            >
              <Text style={styles.readerNextBtnText}>
                {currentLineIndex + 1 < selectedStory.dialogues.length ? 'Siguiente Frase' : 'Finalizar Cuento'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // =========================================================================
  // VIEW 2: STORY LIBRARY CATALOG
  // =========================================================================
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section Header */}
        <View style={styles.libraryHeader}>
          <Text style={styles.librarySubtitle}>KASSUKUAA STORIES</Text>
          <Text style={styles.libraryTitle}>Cuentos del Chaco Boliviano</Text>
          <Text style={styles.libraryDesc}>
            Aprende guaraní leyendo relatos milenarios de la fauna, la flora y las leyendas del monte oriental.
          </Text>
        </View>

        {/* Stories List */}
        {stories.map(story => (
          <TouchableOpacity
            key={story.id}
            style={styles.storyCard}
            onPress={() => handleOpenStory(story)}
            activeOpacity={0.85}
          >
            <View style={styles.storyCardBanner}>
              <View style={styles.storyCoverCircle}>
                <Ionicons
                  name={story.id === 1 ? 'paw' : 'sparkles'}
                  size={32}
                  color={colors.montePrimary}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={styles.badgeRow}>
                  <View style={styles.dialectTag}>
                    <Text style={styles.dialectTagText}>{story.dialect}</Text>
                  </View>
                  <View style={styles.difficultyTag}>
                    <Text style={styles.difficultyTagText}>{story.difficulty}</Text>
                  </View>
                </View>
                <Text style={styles.storyTitleGuarani}>{story.title_guarani}</Text>
                <Text style={styles.storyTitleSpanish}>{story.title_spanish}</Text>
              </View>
            </View>

            <Text style={styles.storySynopsis}>{story.synopsis}</Text>

            <View style={styles.storyFooter}>
              <View style={styles.rewardPill}>
                <Ionicons name="flash" size={14} color={colors.solGold} />
                <Text style={styles.rewardText}>+{story.xp} XP Recompensa</Text>
              </View>
              <View style={styles.readActionBtn}>
                <Text style={styles.readActionText}>Leer Cuento</Text>
                <Ionicons name="book" size={16} color={colors.montePrimary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  },
  libraryHeader: {
    marginBottom: 20,
  },
  librarySubtitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.terracotaPrimary,
    letterSpacing: 1.2,
  },
  libraryTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 2,
  },
  libraryDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  storyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.sandBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  storyCardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyCoverCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.montePastel,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  dialectTag: {
    backgroundColor: colors.montePastel,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dialectTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.monteDark,
  },
  difficultyTag: {
    backgroundColor: colors.sandBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.sandBorder,
  },
  difficultyTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  storyTitleGuarani: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  storyTitleSpanish: {
    fontSize: 13,
    color: colors.textMuted,
  },
  storySynopsis: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginVertical: 12,
  },
  storyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.sandBorder,
    paddingTop: 10,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  readActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readActionText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.montePrimary,
  },
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandBorder,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 6,
  },
  readerTitleGuarani: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  readerTitleSpanish: {
    fontSize: 12,
    color: colors.textMuted,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.solLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.terracotaDark,
  },
  readerContent: {
    padding: 20,
    paddingBottom: 100,
  },
  speechCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.sandBorder,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  speakerAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.montePastel,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  speakerName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.monteDark,
    flex: 1,
  },
  listenInlineBtn: {
    padding: 4,
  },
  dialogueGuarani: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 24,
  },
  dialogueSpanish: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  questionBox: {
    backgroundColor: colors.aretePastel,
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: colors.aretePurple,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  questionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.aretePurple,
  },
  questionPrompt: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  questionOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: colors.sandBorder,
  },
  questionOptionSelected: {
    borderColor: colors.aretePurple,
    backgroundColor: '#F3E5F5',
  },
  questionOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  questionOptionTextSelected: {
    color: colors.aretePurple,
    fontWeight: '800',
  },
  questionFeedbackBadge: {
    marginTop: 6,
  },
  questionFeedbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.monteDark,
  },
  readerBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.sandBorder,
  },
  readerNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.montePrimary,
    paddingVertical: 15,
    borderRadius: 16,
    borderBottomWidth: 4,
    borderBottomColor: colors.monteDark,
    gap: 8,
  },
  readerNextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  completedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.solGold,
    marginTop: 10,
  },
  completedTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 10,
  },
  completedDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 20,
  },
  finishStoryBtn: {
    backgroundColor: colors.montePrimary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 6,
  },
  finishStoryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
