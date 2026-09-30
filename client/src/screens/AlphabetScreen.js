import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useTheme } from '../context/ThemeContext';
import AnimatedAnimal from '../components/AnimatedAnimal';

const { width } = Dimensions.get('window');

// 🎯 ABECEDARIO COMPLETO CON ANIMACIONES
const ALPHABET_DATA = [
  { id: 1, letra: 'A', espanol: 'Abeja', guarani: 'Eiru', emoji: '🐝', animType: 'wiggle', color: ['#F9D423', '#FF4E50'] },
  { id: 2, letra: 'B', espanol: 'Búho', guarani: 'Ñakyrã', emoji: '🦉', animType: 'blink', color: ['#8B6F47', '#5C4033'] },
  { id: 3, letra: 'C', espanol: 'Casa', guarani: 'Óga', emoji: '🏠', animType: 'float', color: ['#FFB347', '#FF7B54'] },
  { id: 4, letra: 'D', espanol: 'Delfín', guarani: 'Pira', emoji: '🐬', animType: 'bounce', color: ['#4FC3F7', '#0288D1'] },
  { id: 5, letra: 'E', espanol: 'Elefante', guarani: 'Tapiirusu', emoji: '🐘', animType: 'wobble', color: ['#9E9E9E', '#616161'] },
  { id: 6, letra: 'F', espanol: 'Fuego', guarani: 'Tatá', emoji: '🔥', animType: 'flame', color: ['#FF6F00', '#D32F2F'] },
  { id: 7, letra: 'G', espanol: 'Gato', guarani: 'Mbarakaja', emoji: '🐱', animType: 'blink', color: ['#FFB6C1', '#FF69B4'] },
  { id: 8, letra: 'H', espanol: 'Hoja', guarani: 'Togue', emoji: '🍃', animType: 'swing', color: ['#81C784', '#388E3C'] },
  { id: 9, letra: 'I', espanol: 'Isla', guarani: "Ypa'ũ", emoji: '🏝️', animType: 'float', color: ['#4DD0E1', '#00838F'] },
  { id: 10, letra: 'J', espanol: 'Jaguar', guarani: 'Jaguarete', emoji: '🐆', animType: 'wiggle', color: ['#FFA726', '#E65100'] },
  { id: 11, letra: 'K', espanol: 'Kiwi', guarani: 'Kiwi', emoji: '🥝', animType: 'pulse', color: ['#AED581', '#558B2F'] },
  { id: 12, letra: 'L', espanol: 'Luna', guarani: 'Jasy', emoji: '🌙', animType: 'float', color: ['#CE93D8', '#6A1B9A'] },
  { id: 13, letra: 'M', espanol: 'Mariposa', guarani: 'Panambi', emoji: '🦋', animType: 'wiggle', color: ['#BA68C8', '#7B1FA2'] },
  { id: 14, letra: 'N', espanol: 'Nube', guarani: 'Arai', emoji: '☁️', animType: 'float', color: ['#B0BEC5', '#607D8B'] },
  { id: 15, letra: 'Ñ', espanol: 'Ñandú', guarani: 'Ñandu', emoji: '🦤', animType: 'wobble', color: ['#A1887F', '#5D4037'] },
  { id: 16, letra: 'O', espanol: 'Oso', guarani: 'Oso', emoji: '🐻', animType: 'wobble', color: ['#BCAAA4', '#4E342E'] },
  { id: 17, letra: 'P', espanol: 'Pájaro', guarani: 'Guyra', emoji: '🐦', animType: 'bounce', color: ['#4FC3F7', '#01579B'] },
  { id: 18, letra: 'Q', espanol: 'Queso', guarani: 'Kesu', emoji: '🧀', animType: 'pulse', color: ['#FFD54F', '#F57F17'] },
  { id: 19, letra: 'R', espanol: 'Rana', guarani: 'Kururu', emoji: '🐸', animType: 'bounce', color: ['#81C784', '#1B5E20'] },
  { id: 20, letra: 'S', espanol: 'Sol', guarani: 'Kuarahy', emoji: '☀️', animType: 'pulse', color: ['#FFEB3B', '#FF6F00'] },
  { id: 21, letra: 'T', espanol: 'Tigre', guarani: 'Jaguarete', emoji: '🐯', animType: 'wiggle', color: ['#FFB74D', '#E65100'] },
  { id: 22, letra: 'U', espanol: 'Uva', guarani: 'Uva', emoji: '🍇', animType: 'swing', color: ['#9C27B0', '#4A148C'] },
  { id: 23, letra: 'V', espanol: 'Vaca', guarani: 'Vaka', emoji: '🐮', animType: 'wobble', color: ['#F5F5F5', '#BDBDBD'] },
  { id: 24, letra: 'W', espanol: 'Wifi', guarani: 'Wifi', emoji: '📶', animType: 'pulse', color: ['#4FC3F7', '#0277BD'] },
  { id: 25, letra: 'X', espanol: 'Xilófono', guarani: 'Xilófono', emoji: '🎹', animType: 'wiggle', color: ['#9E9E9E', '#212121'] },
  { id: 26, letra: 'Y', espanol: 'Yacaré', guarani: 'Yakaré', emoji: '🐊', animType: 'wiggle', color: ['#66BB6A', '#1B5E20'] },
  { id: 27, letra: 'Z', espanol: 'Zorro', guarani: 'Aguará', emoji: '🦊', animType: 'wiggle', color: ['#FF7043', '#BF360C'] },
];

export default function AlphabetScreen({ onClose }) {
  const { theme } = useTheme();
  const [indice, setIndice] = useState(0);
  const letraActual = ALPHABET_DATA[indice];

  const reproducirSonido = () => {
    Speech.speak(`${letraActual.letra}. ${letraActual.guarani}`, {
      language: 'es-ES',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  const siguiente = () => { if (indice < ALPHABET_DATA.length - 1) setIndice(indice + 1); };
  const anterior = () => { if (indice > 0) setIndice(indice - 1); };

  return (
    <View style={[styles.container, { backgroundColor: theme.sandBackground }]}>
      <LinearGradient colors={letraActual.color} style={styles.backgroundGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton} activeOpacity={0.8}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Abecedario Guaraní</Text>
          <View style={styles.headerButton}>
            <Text style={styles.headerCount}>{indice + 1}/{ALPHABET_DATA.length}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.letraGrande}>{letraActual.letra}</Text>

            <View style={[styles.animationCircle, { backgroundColor: letraActual.color[0] + '25' }]}>
              <AnimatedAnimal emoji={letraActual.emoji} size={120} type={letraActual.animType} />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.palabraEspanol}>{letraActual.espanol}</Text>
              <Text style={styles.palabraGuarani}>{letraActual.guarani}</Text>
            </View>

            <TouchableOpacity style={styles.audioButton} onPress={reproducirSonido} activeOpacity={0.85}>
              <LinearGradient colors={letraActual.color} style={styles.audioButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="volume-high" size={22} color="#FFFFFF" />
                <Text style={styles.audioButtonText}>Escuchar pronunciación</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.previewRow}>
            {ALPHABET_DATA.slice(Math.max(0, indice - 2), indice + 3).map((item) => {
              const isCurrent = item.id === letraActual.id;
              return (
                <TouchableOpacity key={item.id} onPress={() => setIndice(ALPHABET_DATA.findIndex(l => l.id === item.id))} style={[styles.previewItem, isCurrent && styles.previewItemActive]} activeOpacity={0.7}>
                  <Text style={[styles.previewText, isCurrent && styles.previewTextActive]}>{item.letra}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.navigationButtons}>
          <TouchableOpacity style={[styles.navButton, indice === 0 && styles.navButtonDisabled]} onPress={anterior} disabled={indice === 0} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={28} color={indice === 0 ? 'rgba(255,255,255,0.4)' : '#FFFFFF'} />
            <Text style={[styles.navButtonText, indice === 0 && styles.navButtonTextDisabled]}>Anterior</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navButton, indice === ALPHABET_DATA.length - 1 && styles.navButtonDisabled]} onPress={siguiente} disabled={indice === ALPHABET_DATA.length - 1} activeOpacity={0.85}>
            <Text style={[styles.navButtonText, indice === ALPHABET_DATA.length - 1 && styles.navButtonTextDisabled]}>Siguiente</Text>
            <Ionicons name="chevron-forward" size={28} color={indice === ALPHABET_DATA.length - 1 ? 'rgba(255,255,255,0.4)' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundGradient: { ...StyleSheet.absoluteFillObject, opacity: 0.95 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  headerCount: { fontSize: 12, fontWeight: '900', color: '#FFFFFF' },
  scrollContent: { padding: 20, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  card: { width: width - 40, backgroundColor: '#FFFFFF', borderRadius: 36, padding: 28, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 15, marginBottom: 24 },
  letraGrande: { fontSize: 100, fontWeight: '900', color: '#1E1E1E', lineHeight: 110, textAlign: 'center' },
  animationCircle: { width: 180, height: 180, borderRadius: 90, justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
  textContainer: { alignItems: 'center', marginTop: 8 },
  palabraEspanol: { fontSize: 28, fontWeight: '900', color: '#1E1E1E' },
  palabraGuarani: { fontSize: 22, fontStyle: 'italic', fontWeight: '700', color: '#757575', marginTop: 4 },
  audioButton: { marginTop: 24, borderRadius: 20, overflow: 'hidden', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  audioButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 24, gap: 10 },
  audioButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  previewRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  previewItem: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  previewItemActive: { backgroundColor: '#FFFFFF', transform: [{ scale: 1.15 }], borderColor: '#FFFFFF' },
  previewText: { fontSize: 22, fontWeight: '900', color: 'rgba(255,255,255,0.85)' },
  previewTextActive: { color: '#1E1E1E' },
  navigationButtons: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, gap: 12 },
  navButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.35)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', gap: 6 },
  navButtonDisabled: { opacity: 0.4 },
  navButtonText: { fontSize: 15, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  navButtonTextDisabled: { color: 'rgba(255,255,255,0.5)' },
});