import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import MascotAguara from '../components/MascotAguara';
import PressableScale from '../components/PressableScale';
import FeedbackModal from '../components/FeedbackModal';

export default function TranslatorScreen() {
  const {
    user,
    speakText,
    translateText,
    translationHistory,
    loadTranslationHistory,
    toggleFavoriteTranslationItem
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [direction, setDirection] = useState('es_to_gn');
  const [dialect, setDialect] = useState(user?.dialectVariant || 'ava');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadTranslationHistory();
  }, []);

  const sourceLang = direction === 'es_to_gn' ? 'es' : 'gn';
  const targetLang = direction === 'es_to_gn' ? 'gn' : 'es';
  const targetLangName = targetLang === 'es' ? 'español' : 'guaraní';
  const sourceLangName = sourceLang === 'es' ? 'español' : 'guaraní';

  const handleSwapDirection = () => {
    setDirection(prev => (prev === 'es_to_gn' ? 'gn_to_es' : 'es_to_gn'));
    setResult(null);
    setError(null);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const translation = await translateText({
        text: inputText.trim(),
        sourceLang,
        targetLang,
        dialectVariant: dialect
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

  const isSuccess = !!result && !error;

  return (
    <SafeAreaView style={styles.container}>
      <Header onVariantPress={() => {}} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MascotAguara
          size={80}
          speechText="¡Escribe algo y te ayudo a traducirlo al guaraní!"
        />

        <View style={styles.dialectRow}>
          {['ava', 'izoceño', 'simba'].map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.dialectChip, dialect === d && styles.dialectChipActive]}
              onPress={() => setDialect(d)}
            >
              <Text style={[styles.dialectChipText, dialect === d && styles.dialectChipTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.directionRow}>
          <View style={styles.langBadge}>
            <Text style={styles.langBadgeText}>
              {sourceLang === 'es' ? 'Español' : 'Guaraní'}
            </Text>
          </View>
          <TouchableOpacity style={styles.swapButton} onPress={handleSwapDirection}>
            <Ionicons name="swap-horizontal" size={22} color={colors.montePrimary} />
          </TouchableOpacity>
          <View style={styles.langBadge}>
            <Text style={styles.langBadgeText}>
              {targetLang === 'es' ? 'Español' : 'Guaraní'}
            </Text>
          </View>
        </View>

        <View style={styles.inputCard}>
          <TextInput
            style={styles.textInput}
            placeholder={sourceLang === 'es' ? 'Escribe en español...' : 'Ehai guaraníme...'}
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
        </View>

        <PressableScale
          style={[styles.translateButtonWrapper, (!inputText.trim() || loading) && { opacity: 0.6 }]}
          onPress={handleTranslate}
          disabled={!inputText.trim() || loading}
          pulse={!!inputText.trim() && !loading}
        >
          <LinearGradient
            colors={[colors.solPrimary, colors.terracotaPrimary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.translateButton}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                <Text style={styles.translateButtonText}>¡Traducir!</Text>
              </>
            )}
          </LinearGradient>
        </PressableScale>

        <TouchableOpacity
          style={styles.historyToggle}
          onPress={() => setShowHistory(prev => !prev)}
        >
          <Text style={styles.historyToggleText}>
            {showHistory ? 'Ocultar historial' : `Ver historial (${translationHistory.length})`}
          </Text>
          <Ionicons
            name={showHistory ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {showHistory && (
          <View style={styles.historyList}>
            {translationHistory.length === 0 && (
              <Text style={styles.emptyHistoryText}>Aún no tienes traducciones guardadas.</Text>
            )}
            {translationHistory.map(item => (
              <View key={item.id} style={styles.historyItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historySource}>{item.source_text}</Text>
                  <Text style={styles.historyTranslated}>→ {item.translated_text}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => speakText(item.translated_text)}
                  style={{ padding: 6 }}
                >
                  <Ionicons name="volume-medium" size={18} color={colors.montePrimary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleFavoriteTranslationItem(item.id)}>
                  <Ionicons
                    name={item.is_favorite ? 'heart' : 'heart-outline'}
                    size={20}
                    color={colors.terracotaPrimary}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* MODAL FLOTANTE CON EL ZORRO — Éxito */}
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
            {/* Palabra traducida — grande y centrada */}
            <Text style={styles.modalWord}>{result.translated_text}</Text>

            {/* Recordatorio del original */}
            <View style={styles.modalOriginalBox}>
              <Text style={styles.modalOriginalLabel}>
                En {sourceLangName}:
              </Text>
              <Text style={styles.modalOriginalText}>
                "{inputText.trim()}"
              </Text>
            </View>

            {/* Botón de audio */}
            <TouchableOpacity
              style={styles.modalAudioBtn}
              onPress={() => speakText(result.translated_text)}
            >
              <Ionicons name="volume-high" size={18} color="#FFFFFF" />
              <Text style={styles.modalAudioText}>Escuchar pronunciación</Text>
            </TouchableOpacity>
          </View>
        )}
      </FeedbackModal>

      {/* MODAL FLOTANTE CON EL ZORRO — Error */}
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
  container: { flex: 1, backgroundColor: colors.sandBackground },
  scrollContent: { padding: 16, paddingBottom: 40 },

  dialectRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 12 },
  dialectChip: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: colors.sandCard, borderWidth: 1, borderColor: colors.sandBorder,
  },
  dialectChipActive: { backgroundColor: colors.montePrimary, borderColor: colors.montePrimary },
  dialectChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'capitalize' },
  dialectChipTextActive: { color: '#FFFFFF' },

  directionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, marginBottom: 12,
  },
  langBadge: {
    backgroundColor: colors.montePastel, paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 12, minWidth: 100, alignItems: 'center',
  },
  langBadgeText: { fontWeight: '700', color: colors.monteDark },
  swapButton: {
    padding: 8, backgroundColor: '#FFFFFF', borderRadius: 20,
    borderWidth: 1, borderColor: colors.sandBorder,
  },

  inputCard: {
    backgroundColor: colors.sandCard, borderRadius: 16, borderWidth: 1,
    borderColor: colors.sandBorder, padding: 14, minHeight: 90, marginBottom: 12,
  },
  textInput: { fontSize: 16, color: colors.textPrimary, minHeight: 60, textAlignVertical: 'top' },

  translateButtonWrapper: {
    borderRadius: 16, shadowColor: colors.terracotaDark,
    shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 8,
  },
  translateButton: {
    flexDirection: 'row', paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', gap: 8,
    borderBottomWidth: 4, borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  translateButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 0.3 },

  historyToggle: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 6, marginTop: 24, paddingVertical: 10,
  },
  historyToggleText: { fontWeight: '700', color: colors.textSecondary },
  historyList: { gap: 10 },
  emptyHistoryText: {
    textAlign: 'center', color: colors.textMuted, fontSize: 13, paddingVertical: 10,
  },
  historyItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.sandCard, borderRadius: 12,
    borderWidth: 1, borderColor: colors.sandBorder, padding: 12, gap: 10,
  },
  historySource: { fontSize: 13, color: colors.textMuted },
  historyTranslated: {
    fontSize: 15, fontWeight: '700', color: colors.monteDark, marginTop: 2,
  },

  // Contenido dentro del modal de éxito
  modalContent: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
    width: '100%',
  },
  modalWord: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.monteDark,
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
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalOriginalText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.terracotaPrimary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: colors.terracotaDark,
  },
  modalAudioText: {
    color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.3,
  }
});