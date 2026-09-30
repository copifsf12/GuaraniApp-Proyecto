import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';

const { width } = Dimensions.get('window');

// 🎯 MAPA DE CATEGORÍAS Y EMOJIS POR HISTORIA
const STORY_STYLES = {
  1: { // Aguara ha Yagua - El Zorro y el Jaguar
    emoji: '🦊',
    category: 'Cuento',
    gradient: ['#F9A03F', '#C85A32'],
  },
  2: { // Abatí Rembiasa - La Leyenda del Maíz Sagrado
    emoji: '🌽',
    category: 'Leyenda',
    gradient: ['#FFD166', '#F4A261'],
  },
  3: { // Ysyrỹ Parapetĩ Ypy - El Origen del Río Parapetí
    emoji: '💧',
    category: 'Mito',
    gradient: ['#4FC3F7', '#0288D1'],
  },
  // Fallback para historias sin estilo definido
  default: {
    emoji: '📖',
    category: 'Cuento',
    gradient: ['#A8E6CF', '#56C596'],
  },
};

const CATEGORIES = [
  { key: 'all', label: 'Todos', emoji: '📚' },
  { key: 'Cuento', label: 'Cuentos', emoji: '🦊' },
  { key: 'Leyenda', label: 'Leyendas', emoji: '🌽' },
  { key: 'Mito', label: 'Mitos', emoji: '💧' },
];

export default function StoriesScreen() {
  const { theme, isDark } = useTheme();
  const { speakText, stories, completeStory, user } = useApp();
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userAnswerIndex, setUserAnswerIndex] = useState(null);
  const [showQuestionFeedback, setShowQuestionFeedback] = useState(false);
  const [storyCompleted, setStoryCompleted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 🎯 Filtrar historias por categoría
  const filteredStories = useMemo(() => {
    if (selectedCategory === 'all') return stories;
    return stories.filter(story => {
      const style = STORY_STYLES[story.id] || STORY_STYLES.default;
      return style.category === selectedCategory;
    });
  }, [stories, selectedCategory]);

  // Verificar si una historia ya fue completada
  const isStoryCompleted = (storyId) => {
    return user?.completedStories?.includes(storyId) ||
           user?.completedLessons?.includes(`story_${storyId}`) ||
           false;
  };

  // Open story reader
  const handleOpenStory = (story) => {
    setSelectedStory(story);
    setCurrentLineIndex(0);
    setUserAnswerIndex(null);
    setShowQuestionFeedback(false);
    setStoryCompleted(false);
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
    const storyStyle = STORY_STYLES[selectedStory.id] || STORY_STYLES.default;
    const progress = ((currentLineIndex + 1) / selectedStory.dialogues.length) * 100;

    return (
      <View style={[styles.container, { backgroundColor: theme.sandBackground }]}>
        {/* Header con gradiente del cuento */}
        <LinearGradient
          colors={storyStyle.gradient}
          style={styles.readerHeaderGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.readerHeader}>
              <TouchableOpacity
                style={styles.readerBackBtn}
                onPress={() => setSelectedStory(null)}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.readerHeaderTitleGuarani}>
                  {selectedStory.title_guarani}
                </Text>
                <Text style={styles.readerHeaderTitleSpanish}>
                  {selectedStory.title_spanish}
                </Text>
              </View>
              <View style={styles.readerXpBadge}>
                <Ionicons name="flash" size={14} color="#FFFFFF" />
                <Text style={styles.readerXpBadgeText}>+{selectedStory.xp}</Text>
              </View>
            </View>

            {/* Barra de progreso */}
            <View style={styles.readerProgressContainer}>
              <View style={styles.readerProgressBg}>
                <View style={[styles.readerProgressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.readerProgressText}>
                {currentLineIndex + 1} / {selectedStory.dialogues.length}
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.readerContent}>
          {/* History dialogues revealed up to currentLineIndex */}
          {selectedStory.dialogues.slice(0, currentLineIndex + 1).map((line, idx) => (
            <View
              key={idx}
              style={[
                styles.speechCard,
                {
                  backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                  borderColor: isDark ? '#333' : theme.sandBorder,
                },
              ]}
            >
              <View style={styles.speakerRow}>
                <View
                  style={[
                    styles.speakerAvatarCircle,
                    { backgroundColor: storyStyle.gradient[0] + '30' },
                  ]}
                >
                  <Ionicons
                    name={line.avatar || 'person'}
                    size={20}
                    color={storyStyle.gradient[0]}
                  />
                </View>
                <Text
                  style={[
                    styles.speakerName,
                    { color: isDark ? '#95D5B2' : theme.monteDark },
                  ]}
                >
                  {line.speaker}
                </Text>
                <TouchableOpacity
                  style={styles.listenInlineBtn}
                  onPress={() => speakText(line.guarani)}
                >
                  <Ionicons
                    name="volume-medium"
                    size={18}
                    color={storyStyle.gradient[0]}
                  />
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  styles.dialogueGuarani,
                  { color: isDark ? '#F5F5F5' : theme.textPrimary },
                ]}
              >
                {line.guarani}
              </Text>
              <Text
                style={[
                  styles.dialogueSpanish,
                  { color: isDark ? '#B0B0B0' : theme.textMuted },
                ]}
              >
                {line.spanish}
              </Text>

              {/* Comprehension Question */}
              {idx === currentLineIndex && line.hasQuestion && !storyCompleted && (
                <View
                  style={[
                    styles.questionBox,
                    {
                      backgroundColor: isDark ? '#2D1B33' : theme.aretePastel,
                      borderColor: theme.aretePurple,
                    },
                  ]}
                >
                  <View style={styles.questionHeader}>
                    <Ionicons name="help-circle" size={20} color={theme.aretePurple} />
                    <Text style={[styles.questionTitle, { color: theme.aretePurple }]}>
                      Pregunta de comprensión
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.questionPrompt,
                      { color: isDark ? '#F5F5F5' : theme.textPrimary },
                    ]}
                  >
                    {line.question.prompt}
                  </Text>

                  {line.question.options.map((opt, optIdx) => {
                    const isSelected = userAnswerIndex === optIdx;
                    return (
                      <TouchableOpacity
                        key={optIdx}
                        style={[
                          styles.questionOption,
                          {
                            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                            borderColor: isDark ? '#444' : theme.sandBorder,
                          },
                          isSelected && {
                            borderColor: theme.aretePurple,
                            backgroundColor: isDark ? '#3D1F44' : '#F3E5F5',
                          },
                        ]}
                        onPress={() => {
                          setUserAnswerIndex(optIdx);
                          setShowQuestionFeedback(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.questionOptionText,
                            { color: isDark ? '#F5F5F5' : theme.textPrimary },
                            isSelected && {
                              color: theme.aretePurple,
                              fontWeight: '800',
                            },
                          ]}
                        >
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {showQuestionFeedback && (
                    <View style={styles.questionFeedbackBadge}>
                      <Text
                        style={[
                          styles.questionFeedbackText,
                          { color: isDark ? '#95D5B2' : theme.monteDark },
                        ]}
                      >
                        {userAnswerIndex === line.question.correctIndex
                          ? '✅ ¡Correcto! Has entendido el sentido del relato.'
                          : '💡 Pista: Piensa en el comportamiento del personaje.'}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}

          {/* Story completed */}
          {storyCompleted && (
            <LinearGradient
              colors={storyStyle.gradient}
              style={styles.completedCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.completedEmoji}>
                <Text style={{ fontSize: 60 }}>{storyStyle.emoji}</Text>
              </View>
              <Text style={styles.completedTitle}>¡Cuento Finalizado!</Text>
              <Text style={styles.completedDesc}>
                Has ganado +{selectedStory.xp} puntos XP por aprender de los relatos
                de los abuelos del Chaco.
              </Text>
              <TouchableOpacity
                style={styles.finishStoryBtn}
                onPress={() => setSelectedStory(null)}
                activeOpacity={0.85}
              >
                <Ionicons name="book" size={18} color={storyStyle.gradient[0]} />
                <Text style={[styles.finishStoryBtnText, { color: storyStyle.gradient[0] }]}>
                  Volver a la Biblioteca
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          )}
        </ScrollView>

        {/* Botón continuar */}
        {!storyCompleted && (!isQuestionLine || showQuestionFeedback) && (
          <View style={[styles.readerBottomBar, { 
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderTopColor: isDark ? '#333' : theme.sandBorder,
          }]}>
            <TouchableOpacity
              style={styles.readerNextBtnWrapper}
              onPress={handleNextLine}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={storyStyle.gradient}
                style={styles.readerNextBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.readerNextBtnText}>
                  {currentLineIndex + 1 < selectedStory.dialogues.length
                    ? 'Siguiente Frase'
                    : 'Finalizar Cuento'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // =========================================================================
  // VIEW 2: STORY LIBRARY CATALOG (PREMIUM)
  // =========================================================================
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.sandBackground }]}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Header */}
        <View style={styles.libraryHeader}>
          <Text style={[styles.librarySubtitle, { color: theme.terracotaPrimary }]}>
            📖 KASSUKUAA STORIES
          </Text>
          <Text
            style={[
              styles.libraryTitle,
              { color: isDark ? '#F5F5F5' : theme.textPrimary },
            ]}
          >
            Cuentos del Chaco Boliviano
          </Text>
          <Text
            style={[
              styles.libraryDesc,
              { color: isDark ? '#B0B0B0' : theme.textSecondary },
            ]}
          >
            Aprende guaraní leyendo relatos milenarios de la fauna, la flora y las
            leyendas del monte oriental.
          </Text>
        </View>

        {/* Filtros por categoría */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isActive
                      ? theme.montePrimary
                      : isDark
                      ? '#2A2A2A'
                      : '#FFFFFF',
                    borderColor: isActive ? theme.montePrimary : (isDark ? '#444' : theme.sandBorder),
                  },
                ]}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: isActive
                        ? '#FFFFFF'
                        : isDark
                        ? '#F5F5F5'
                        : theme.textPrimary,
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Stories List */}
        {filteredStories.map(story => {
          const storyStyle = STORY_STYLES[story.id] || STORY_STYLES.default;
          const completed = isStoryCompleted(story.id);

          return (
            <TouchableOpacity
              key={story.id}
              style={[
                styles.storyCard,
                {
                  backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                  borderColor: isDark ? '#333' : theme.sandBorder,
                },
              ]}
              onPress={() => handleOpenStory(story)}
              activeOpacity={0.85}
            >
              {/* Banner con gradiente */}
              <LinearGradient
                colors={storyStyle.gradient}
                style={styles.storyCardBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.storyCoverCircle}>
                  <Text style={{ fontSize: 32 }}>{storyStyle.emoji}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <View style={styles.badgeRow}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>{storyStyle.category}</Text>
                    </View>
                    {completed && (
                      <View style={styles.completedTag}>
                        <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
                        <Text style={styles.completedTagText}>Leído</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.storyTitleGuarani}>{story.title_guarani}</Text>
                  <Text style={styles.storyTitleSpanish}>{story.title_spanish}</Text>
                </View>
              </LinearGradient>

              <View style={styles.storyBody}>
                <Text
                  style={[
                    styles.storySynopsis,
                    { color: isDark ? '#B0B0B0' : theme.textSecondary },
                  ]}
                >
                  {story.synopsis}
                </Text>

                {/* Barra de progreso si está completada */}
                {completed && (
                  <View style={styles.progressRow}>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { backgroundColor: storyStyle.gradient[0] },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.progressPercent,
                        { color: storyStyle.gradient[0] },
                      ]}
                    >
                      100%
                    </Text>
                  </View>
                )}

                <View
                  style={[
                    styles.storyFooter,
                    { borderTopColor: isDark ? '#333' : theme.sandBorder },
                  ]}
                >
                  <View style={styles.rewardPill}>
                    <Ionicons name="flash" size={14} color={theme.solGold} />
                    <Text
                      style={[
                        styles.rewardText,
                        { color: isDark ? '#B0B0B0' : theme.textSecondary },
                      ]}
                    >
                      +{story.xp} XP
                    </Text>
                  </View>
                  <View style={styles.readActionBtn}>
                    <Text
                      style={[
                        styles.readActionText,
                        { color: storyStyle.gradient[0] },
                      ]}
                    >
                      {completed ? 'Leer de nuevo' : 'Leer Cuento'}
                    </Text>
                    <Ionicons
                      name={completed ? 'refresh' : 'book'}
                      size={16}
                      color={storyStyle.gradient[0]}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // ═══════════ LIBRARY HEADER ═══════════
  libraryHeader: { marginBottom: 20 },
  librarySubtitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  libraryTitle: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4,
  },
  libraryDesc: {
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },

  // ═══════════ CATEGORÍAS ═══════════
  categoriesContainer: {
    paddingBottom: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
    marginRight: 8,
  },
  categoryEmoji: { fontSize: 14 },
  categoryText: {
    fontSize: 13,
    fontWeight: '800',
  },

  // ═══════════ STORY CARD ═══════════
  storyCard: {
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  storyCardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  storyCoverCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  categoryTag: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  completedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  completedTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  storyTitleGuarani: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  storyTitleSpanish: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginTop: 2,
  },
  storyBody: { padding: 16 },
  storySynopsis: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '900',
  },
  storyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '700',
  },
  readActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readActionText: {
    fontSize: 14,
    fontWeight: '900',
  },

  // ═══════════ READER HEADER ═══════════
  readerHeaderGradient: {
    paddingBottom: 12,
  },
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  readerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readerHeaderTitleGuarani: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  readerHeaderTitleSpanish: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  readerXpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  readerXpBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  readerProgressContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  readerProgressBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  readerProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  readerProgressText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
  },

  // ═══════════ READER CONTENT ═══════════
  readerContent: {
    padding: 20,
    paddingBottom: 120,
  },
  speechCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  speakerAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  speakerName: {
    fontSize: 14,
    fontWeight: '900',
    flex: 1,
  },
  listenInlineBtn: { padding: 6 },
  dialogueGuarani: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
  },
  dialogueSpanish: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // ═══════════ QUESTION ═══════════
  questionBox: {
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1.5,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  questionTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  questionPrompt: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  questionOption: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
  },
  questionOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  questionFeedbackBadge: { marginTop: 6 },
  questionFeedbackText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ═══════════ BOTTOM BAR ═══════════
  readerBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  readerNextBtnWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  readerNextBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  readerNextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // ═══════════ COMPLETED ═══════════
  completedCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  completedEmoji: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  completedTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  completedDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginVertical: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  finishStoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  finishStoryBtnText: {
    fontSize: 15,
    fontWeight: '900',
  },
});