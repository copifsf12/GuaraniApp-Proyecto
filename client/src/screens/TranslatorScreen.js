import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import MascotAguara from '../components/MascotAguara';
import PressableScale from '../components/PressableScale';
import FeedbackModal from '../components/FeedbackModal';

// 🎯 Ejemplos rápidos por variante dialectal
const QUICK_EXAMPLES = {
  es_to_gn: [
    { text: 'Buenos días', emoji: '☀️' },
    { text: 'Gracias', emoji: '🙏' },
    { text: '¿Cómo estás?', emoji: '👋' },
    { text: 'Te quiero', emoji: '❤️' },
  ],
  gn_to_es: [
    { text: "Mba'éichapa", emoji: '👋' },
    { text: 'Aguyje', emoji: '🙏' },
    { text: 'Che rohayhu', emoji: '❤️' },
    { text: 'Jajotopata', emoji: '👋' },
  ],
};

// 🎬 Componente: ícono animado con brillo
function ShineIcon({ name, size = 28, color = '#FFFFFF' }) {
  const shine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shine, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(shine, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shine.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const scale = shine.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}

// 🎬 Componente: botón swap con rotación
function AnimatedSwapButton({ onPress, theme, isDark, direction }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: direction === 'es_to_gn' ? 0 : 1,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [direction]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity
      style={[
        styles.swapButton,
        {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderColor: isDark ? '#333' : theme.sandBorder,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <Ionicons name="swap-horizontal" size={22} color={theme.montePrimary} />
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function TranslatorScreen() {
  const { theme, isDark } = useTheme();
  const {
    user,
    speakText,
    translateText,
    translationHistory,
    loadTranslationHistory,
    toggleFavoriteTranslationItem,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [direction, setDirection] = useState('es_to_gn');
  const [dialect, setDialect] = useState(user?.dialectVariant || 'ava');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadTranslationHistory();
  }, []);

  // Pulso del botón cuando está listo
  useEffect(() => {
    if (inputText.trim() && !loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [inputText, loading]);

  const sourceLang = direction === 'es_to_gn' ? 'es' : 'gn';
  const targetLang = direction === 'es_to_gn' ? 'gn' : 'es';
  const targetLangName = targetLang === 'es' ? 'español' : 'guaraní';
  const sourceLangName = sourceLang === 'es' ? 'español' : 'guaraní';

  const handleSwapDirection = () => {
    setDirection(prev => (prev === 'es_to_gn' ? 'gn_to_es' : 'es_to_gn'));
    setResult(null);
    setError(null);
  };

  const handleTranslate = async (textToTranslate = null) => {
    const text = textToTranslate || inputText.trim();
    if (!text) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const translation = await translateText({
        text,
        sourceLang,
        targetLang,
        dialectVariant: dialect,
      });
      setResult(translation);
      setModalVisible(true);
    } catch (e) {
      setError(e.message);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setModalVisible(false);

  const handleRetry = () => {
    setModalVisible(false);
    setError(null);
    setTimeout(() => handleTranslate(), 300);
  };

  const handleClearInput = () => {
    setInputText('');
    setResult(null);
    setError(null);
  };

  const handleQuickExample = (text) => {
    setInputText(text);
    handleTranslate(text);
  };

  const handleCopy = async () => {
    if (result?.translated_text) {
      try {
        await Clipboard.setStringAsync(result.translated_text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.warn('No se pudo copiar');
      }
    }
  };

  const isSuccess = !!result && !error;
  const canTranslate = !!inputText.trim() && !loading;

  // 🎯 Agrupar historial por fecha
  const groupedHistory = translationHistory.reduce((acc, item) => {
    const created = new Date(item.created_at || item.createdAt || Date.now());
    const now = new Date();
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));

    let group = 'Anteriores';
    if (diffDays === 0) group = 'Hoy';
    else if (diffDays === 1) group = 'Ayer';
    else if (diffDays <= 7) group = 'Esta semana';

    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.sandBackground }]}>
      <Header onVariantPress={() => {}} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════════ HERO HEADER ═══════════ */}
        <LinearGradient
          colors={isDark ? ['#1B4332', '#0F291E'] : ['#A8E6CF', '#56C596']}
          style={styles.heroHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroHeaderContent}>
            <View style={styles.heroIconCircle}>
              <ShineIcon name="language" size={28} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.heroTitle, { color: '#FFFFFF' }]}>
                Traductor Guaraní
              </Text>
              <Text style={[styles.heroSubtitle, { color: 'rgba(255,255,255,0.9)' }]}>
                Español ↔ Ava, Izoceño y Simba
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ═══════════ MASCOTA ═══════════ */}
        <View style={styles.mascotSection}>
          <MascotAguara
            size={80}
            speechText={
              loading
                ? 'Traduciendo...'
                : inputText.trim()
                ? '¡Listo! Toca el botón para traducir.'
                : '¡Escribe algo y te ayudo a traducirlo!'
            }
          />
        </View>

        {/* ═══════════ SELECTOR DE DIALECTO ═══════════ */}
        <Text style={[styles.sectionLabel, { color: isDark ? '#B0B0B0' : theme.textMuted }]}>
          VARIANTE DIALECTAL
        </Text>
        <View style={styles.dialectRow}>
          {[
            { id: 'ava', label: 'Ava', icon: 'leaf' },
            { id: 'izoceño', label: 'Izoceño', icon: 'water' },
            { id: 'simba', label: 'Simba', icon: 'trail-sign' },
          ].map(d => {
            const isActive = dialect === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                style={[
                  styles.dialectChip,
                  {
                    backgroundColor: isActive
                      ? theme.montePrimary
                      : (isDark ? '#2A2A2A' : '#FFFFFF'),
                    borderColor: isActive
                      ? theme.montePrimary
                      : (isDark ? '#444' : theme.sandBorder),
                  },
                ]}
                onPress={() => setDialect(d.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={d.icon}
                  size={14}
                  color={isActive ? '#FFFFFF' : (isDark ? '#B0B0B0' : theme.textMuted)}
                />
                <Text
                  style={[
                    styles.dialectChipText,
                    {
                      color: isActive
                        ? '#FFFFFF'
                        : (isDark ? '#F5F5F5' : theme.textSecondary),
                    },
                  ]}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ═══════════ SELECTOR DE DIRECCIÓN ═══════════ */}
        <View style={styles.directionRow}>
          <View style={[
            styles.langBadge,
            {
              backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
              borderColor: isDark ? '#333' : theme.sandBorder,
            }
          ]}>
            <Ionicons
              name={sourceLang === 'es' ? 'document-text' : 'chatbubble-ellipses'}
              size={16}
              color={theme.montePrimary}
            />
            <Text style={[styles.langBadgeText, { color: isDark ? '#95D5B2' : theme.monteDark }]}>
              {sourceLang === 'es' ? 'Español' : 'Guaraní'}
            </Text>
          </View>

          <AnimatedSwapButton
            onPress={handleSwapDirection}
            theme={theme}
            isDark={isDark}
            direction={direction}
          />

          <View style={[
            styles.langBadge,
            {
              backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
              borderColor: isDark ? '#333' : theme.sandBorder,
            }
          ]}>
            <Ionicons
              name={targetLang === 'es' ? 'document-text' : 'chatbubble-ellipses'}
              size={16}
              color={theme.terracotaPrimary}
            />
            <Text style={[styles.langBadgeText, { color: isDark ? '#FFB86B' : theme.terracotaDark }]}>
              {targetLang === 'es' ? 'Español' : 'Guaraní'}
            </Text>
          </View>
        </View>

        {/* ═══════════ EJEMPLOS RÁPIDOS ═══════════ */}
        <Text style={[styles.sectionLabel, { color: isDark ? '#B0B0B0' : theme.textMuted }]}>
          TOCA PARA PROBAR
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickExamplesRow}
        >
          {QUICK_EXAMPLES[direction].map((ex, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.quickExampleChip,
                {
                  backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                  borderColor: isDark ? '#333' : theme.sandBorder,
                }
              ]}
              onPress={() => handleQuickExample(ex.text)}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.quickExampleEmoji}>{ex.emoji}</Text>
              <Text style={[
                styles.quickExampleText,
                { color: isDark ? '#F5F5F5' : theme.textPrimary }
              ]}>
                {ex.text}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ═══════════ INPUT DE TEXTO ═══════════ */}
        <View style={[
          styles.inputCard,
          {
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderColor: isDark ? '#333' : theme.sandBorder,
          }
        ]}>
          <TextInput
            style={[styles.textInput, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}
            placeholder={sourceLang === 'es' ? 'Escribe en español...' : 'Ehai guaraníme...'}
            placeholderTextColor={theme.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={300}
          />

          <View style={styles.inputFooter}>
            <Text style={[styles.charCounter, { color: theme.textMuted }]}>
              {inputText.length}/300
            </Text>
            {inputText.length > 0 && (
              <TouchableOpacity
                onPress={handleClearInput}
                style={styles.clearBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={16} color={theme.textMuted} />
                <Text style={[styles.clearBtnText, { color: theme.textMuted }]}>
                  Limpiar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ═══════════ BOTÓN TRADUCIR ═══════════ */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <PressableScale
            style={[styles.translateButtonWrapper, !canTranslate && { opacity: 0.6 }]}
            onPress={() => handleTranslate()}
            disabled={!canTranslate}
          >
            <LinearGradient
              colors={isDark ? ['#C85A32', '#9E3D1B'] : [theme.solPrimary, theme.terracotaPrimary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.translateButton}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={22} color="#FFFFFF" />
                  <Text style={styles.translateButtonText}>¡Traducir!</Text>
                </>
              )}
            </LinearGradient>
          </PressableScale>
        </Animated.View>

        {/* ═══════════ RESULTADO RÁPIDO ═══════════ */}
        {result && !modalVisible && (
          <LinearGradient
            colors={isDark ? ['#1B4332', '#0F291E'] : ['#EAFAF1', '#D8F3DC']}
            style={styles.resultCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={20} color={theme.successGreen} />
              <Text style={[styles.resultLabel, { color: isDark ? '#95D5B2' : theme.monteDark }]}>
                TRADUCCIÓN
              </Text>
            </View>
            <Text style={[styles.resultText, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
              {result.translated_text}
            </Text>
            <View style={styles.resultActions}>
              <TouchableOpacity
                style={[
                  styles.resultActionBtn,
                  { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
                ]}
                onPress={() => speakText(result.translated_text)}
                activeOpacity={0.8}
              >
                <Ionicons name="volume-high" size={18} color={theme.montePrimary} />
                <Text style={[styles.resultActionText, { color: isDark ? '#95D5B2' : theme.monteDark }]}>
                  Escuchar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.resultActionBtn,
                  { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
                ]}
                onPress={handleCopy}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={18}
                  color={copied ? theme.successGreen : theme.terracotaPrimary}
                />
                <Text style={[styles.resultActionText, {
                  color: copied ? theme.successGreen : (isDark ? '#FFB86B' : theme.terracotaDark)
                }]}>
                  {copied ? '¡Copiado!' : 'Copiar'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}

        {/* ═══════════ HISTORIAL ═══════════ */}
        <TouchableOpacity
          style={styles.historyToggle}
          onPress={() => setShowHistory(prev => !prev)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="time-outline"
            size={18}
            color={isDark ? '#B0B0B0' : theme.textSecondary}
          />
          <Text style={[styles.historyToggleText, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
            {showHistory ? 'Ocultar historial' : `Ver historial (${translationHistory.length})`}
          </Text>
          <Ionicons
            name={showHistory ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={isDark ? '#B0B0B0' : theme.textSecondary}
          />
        </TouchableOpacity>

        {showHistory && (
          <View style={styles.historyList}>
            {translationHistory.length === 0 ? (
              <View style={[
                styles.emptyHistoryBox,
                {
                  backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                  borderColor: isDark ? '#333' : theme.sandBorder,
                }
              ]}>
                <Ionicons name="book-outline" size={40} color={theme.textMuted} />
                <Text style={[styles.emptyHistoryText, { color: theme.textMuted }]}>
                  Aún no tienes traducciones guardadas.
                </Text>
              </View>
            ) : (
              Object.entries(groupedHistory).map(([groupName, items]) => (
                <View key={groupName} style={styles.historyGroup}>
                  <Text style={[styles.historyGroupTitle, { color: isDark ? '#B0B0B0' : theme.textMuted }]}>
                    {groupName.toUpperCase()}
                  </Text>
                  {items.map(item => (
                    <View
                      key={item.id}
                      style={[
                        styles.historyItem,
                        {
                          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                          borderColor: isDark ? '#333' : theme.sandBorder,
                        }
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.historySource, { color: theme.textMuted }]}>
                          {item.source_text}
                        </Text>
                        <Text style={[
                          styles.historyTranslated,
                          { color: isDark ? '#95D5B2' : theme.monteDark }
                        ]}>
                          → {item.translated_text}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => speakText(item.translated_text)}
                        style={styles.historyActionBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="volume-medium" size={20} color={theme.montePrimary} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => toggleFavoriteTranslationItem(item.id)}
                        style={styles.historyActionBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={item.is_favorite ? 'heart' : 'heart-outline'}
                          size={20}
                          color={theme.terracotaPrimary}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ═══════════ MODAL ÉXITO ═══════════ */}
      <FeedbackModal
        visible={modalVisible && isSuccess}
        type="success"
        title="¡Iporãiterei!"
        message={`Así se escribe en ${targetLangName}:`}
        primaryLabel="Aceptar"
        onPrimaryPress={closeModal}
        onClose={closeModal}
      >
        {result && (
          <View style={styles.modalContent}>
            <Text style={[styles.modalWord, { color: theme.monteDark }]}>
              {result.translated_text}
            </Text>

            <View style={styles.modalOriginalBox}>
              <Text style={styles.modalOriginalLabel}>
                En {sourceLangName}:
              </Text>
              <Text style={styles.modalOriginalText}>
                "{inputText.trim()}"
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalAudioBtn}
              onPress={() => speakText(result.translated_text)}
              activeOpacity={0.85}
            >
              <Ionicons name="volume-high" size={18} color="#FFFFFF" />
              <Text style={styles.modalAudioText}>Escuchar pronunciación</Text>
            </TouchableOpacity>
          </View>
        )}
      </FeedbackModal>

      {/* ═══════════ MODAL ERROR ═══════════ */}
      <FeedbackModal
        visible={modalVisible && !isSuccess && !!error}
        type="error"
        title="¡Ay, che irũ!"
        message={error || 'No se pudo traducir. Intenta de nuevo.'}
        primaryLabel="Reintentar"
        onPrimaryPress={handleRetry}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  // HERO HEADER
  heroHeader: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  heroHeaderContent: { flexDirection: 'row', alignItems: 'center' },
  heroIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },

  // MASCOTA
  mascotSection: { alignItems: 'center', marginBottom: 8 },

  // SECTION LABEL
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },

  // DIALECTO
  dialectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dialectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  dialectChipText: {
    fontSize: 13,
    fontWeight: '800',
  },

  // DIRECCIÓN
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  langBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    minWidth: 120,
    justifyContent: 'center',
  },
  langBadgeText: { fontWeight: '900', fontSize: 13 },
  swapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // EJEMPLOS RÁPIDOS
  quickExamplesRow: {
    gap: 8,
    paddingBottom: 16,
  },
  quickExampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  quickExampleEmoji: { fontSize: 16 },
  quickExampleText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // INPUT
  inputCard: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 14,
    minHeight: 120,
    marginBottom: 16,
  },
  textInput: {
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
  },
  charCounter: { fontSize: 11, fontWeight: '700' },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearBtnText: { fontSize: 12, fontWeight: '700' },

  // BOTÓN TRADUCIR
  translateButtonWrapper: {
    borderRadius: 18,
    shadowColor: '#C85A32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  translateButton: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  translateButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 0.5,
  },

  // RESULTADO
  resultCard: {
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  resultText: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 14,
    lineHeight: 30,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 10,
  },
  resultActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  resultActionText: {
    fontSize: 13,
    fontWeight: '800',
  },

  // HISTORIAL
  historyToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 28,
    paddingVertical: 12,
  },
  historyToggleText: {
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  historyList: { gap: 12, marginTop: 8 },
  historyGroup: { gap: 8 },
  historyGroupTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginLeft: 4,
    marginTop: 8,
  },
  emptyHistoryBox: {
    padding: 30,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  emptyHistoryText: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    gap: 8,
  },
  historySource: { fontSize: 12, fontWeight: '600' },
  historyTranslated: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 3,
  },
  historyActionBtn: { padding: 8 },

  // MODAL
  modalContent: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
    width: '100%',
  },
  modalWord: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  modalOriginalBox: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  modalOriginalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#968574',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalOriginalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#635345',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C85A32',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 22,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#9E3D1B',
  },
  modalAudioText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});