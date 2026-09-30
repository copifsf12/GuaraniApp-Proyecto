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

const NUMBERS_DATA = [
  { id: 1, numero: 1, espanol: 'Uno', guarani: 'Peteĩ', emoji: '1️⃣', animType: 'pulse' },
  { id: 2, numero: 2, espanol: 'Dos', guarani: 'Mokõi', emoji: '2️⃣', animType: 'pulse' },
  { id: 3, numero: 3, espanol: 'Tres', guarani: 'Mbohapy', emoji: '3️⃣', animType: 'pulse' },
  { id: 4, numero: 4, espanol: 'Cuatro', guarani: 'Irundy', emoji: '4️⃣', animType: 'pulse' },
  { id: 5, numero: 5, espanol: 'Cinco', guarani: 'Po', emoji: '5️⃣', animType: 'pulse' },
  { id: 6, numero: 6, espanol: 'Seis', guarani: 'Poteĩ', emoji: '6️⃣', animType: 'pulse' },
  { id: 7, numero: 7, espanol: 'Siete', guarani: 'Pokõi', emoji: '7️⃣', animType: 'pulse' },
  { id: 8, numero: 8, espanol: 'Ocho', guarani: 'Poapy', emoji: '8️⃣', animType: 'pulse' },
  { id: 9, numero: 9, espanol: 'Nueve', guarani: 'Porundy', emoji: '9️⃣', animType: 'pulse' },
  { id: 10, numero: 10, espanol: 'Diez', guarani: 'Pa', emoji: '🔟', animType: 'pulse' },
  { id: 11, numero: 20, espanol: 'Veinte', guarani: 'Mokõipa', emoji: '💰', animType: 'bounce' },
  { id: 12, numero: 30, espanol: 'Treinta', guarani: 'Mbohapypa', emoji: '💰', animType: 'bounce' },
  { id: 13, numero: 40, espanol: 'Cuarenta', guarani: 'Irundypa', emoji: '💰', animType: 'bounce' },
  { id: 14, numero: 50, espanol: 'Cincuenta', guarani: 'Popa', emoji: '💰', animType: 'bounce' },
  { id: 15, numero: 60, espanol: 'Sesenta', guarani: 'Poteĩpa', emoji: '💰', animType: 'bounce' },
  { id: 16, numero: 70, espanol: 'Setenta', guarani: 'Pokõipa', emoji: '💰', animType: 'bounce' },
  { id: 17, numero: 80, espanol: 'Ochenta', guarani: 'Poapypa', emoji: '💰', animType: 'bounce' },
  { id: 18, numero: 90, espanol: 'Noventa', guarani: 'Porundypa', emoji: '💰', animType: 'bounce' },
  { id: 19, numero: 100, espanol: 'Cien', guarani: 'Sa', emoji: '💎', animType: 'pulse' },
  { id: 20, numero: 200, espanol: 'Doscientos', guarani: 'Mokõisa', emoji: '💎', animType: 'pulse' },
  { id: 21, numero: 300, espanol: 'Trescientos', guarani: 'Mbohapysa', emoji: '💎', animType: 'pulse' },
  { id: 22, numero: 400, espanol: 'Cuatrocientos', guarani: 'Irundysa', emoji: '💎', animType: 'pulse' },
  { id: 23, numero: 500, espanol: 'Quinientos', guarani: 'Posa', emoji: '💎', animType: 'pulse' },
  { id: 24, numero: 600, espanol: 'Seiscientos', guarani: 'Poteĩsa', emoji: '💎', animType: 'pulse' },
  { id: 25, numero: 700, espanol: 'Setecientos', guarani: 'Pokõisa', emoji: '💎', animType: 'pulse' },
  { id: 26, numero: 800, espanol: 'Ochocientos', guarani: 'Poapysa', emoji: '💎', animType: 'pulse' },
  { id: 27, numero: 900, espanol: 'Novecientos', guarani: 'Porundysa', emoji: '💎', animType: 'pulse' },
  { id: 28, numero: 1000, espanol: 'Mil', guarani: 'Su', emoji: '👑', animType: 'pulse' },
];

const getGradient = (num) => {
  if (num <= 10) return ['#FF6B6B', '#C92A2A'];
  if (num < 100) return ['#F59F00', '#B35C00'];
  if (num < 1000) return ['#4DABF7', '#1864AB'];
  return ['#9775FA', '#5F3DC4'];
};

export default function NumbersScreen({ onClose }) {
  const { theme } = useTheme();
  const [indice, setIndice] = useState(0);
  const numeroActual = NUMBERS_DATA[indice];
  const gradient = getGradient(numeroActual.numero);

  const reproducirSonido = () => {
    Speech.speak(`${numeroActual.numero}. ${numeroActual.guarani}`, {
      language: 'es-ES',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  const siguiente = () => { if (indice < NUMBERS_DATA.length - 1) setIndice(indice + 1); };
  const anterior = () => { if (indice > 0) setIndice(indice - 1); };

  const getGrupo = (num) => {
    if (num <= 10) return 'Unidades';
    if (num < 100) return 'Decenas';
    if (num < 1000) return 'Centenas';
    return 'Miles';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.sandBackground }]}>
      <LinearGradient colors={gradient} style={styles.backgroundGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton} activeOpacity={0.8}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Números en Guaraní</Text>
          <View style={styles.headerButton}>
            <Text style={styles.headerCount}>{indice + 1}/{NUMBERS_DATA.length}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={[styles.grupoBadge, { backgroundColor: gradient[0] + '25' }]}>
              <Text style={[styles.grupoText, { color: gradient[0] }]}>
                {getGrupo(numeroActual.numero).toUpperCase()}
              </Text>
            </View>

            <Text style={[styles.numeroGrande, { color: gradient[0] }]}>{numeroActual.numero}</Text>

            <View style={[styles.emojiCircle, { backgroundColor: gradient[0] + '20' }]}>
              <AnimatedAnimal emoji={numeroActual.emoji} size={110} type={numeroActual.animType} />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.palabraEspanol}>{numeroActual.espanol}</Text>
              <Text style={styles.palabraGuarani}>{numeroActual.guarani}</Text>
            </View>

            <TouchableOpacity style={styles.audioButton} onPress={reproducirSonido} activeOpacity={0.85}>
              <LinearGradient colors={gradient} style={styles.audioButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="volume-high" size={22} color="#FFFFFF" />
                <Text style={styles.audioButtonText}>Escuchar pronunciación</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.previewRow}>
            {NUMBERS_DATA.slice(Math.max(0, indice - 2), indice + 3).map((item) => {
              const isCurrent = item.id === numeroActual.id;
              return (
                <TouchableOpacity key={item.id} onPress={() => setIndice(NUMBERS_DATA.findIndex(n => n.id === item.id))} style={[styles.previewItem, isCurrent && styles.previewItemActive]} activeOpacity={0.7}>
                  <Text style={[styles.previewText, isCurrent && styles.previewTextActive]}>{item.numero}</Text>
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

          <TouchableOpacity style={[styles.navButton, indice === NUMBERS_DATA.length - 1 && styles.navButtonDisabled]} onPress={siguiente} disabled={indice === NUMBERS_DATA.length - 1} activeOpacity={0.85}>
            <Text style={[styles.navButtonText, indice === NUMBERS_DATA.length - 1 && styles.navButtonTextDisabled]}>Siguiente</Text>
            <Ionicons name="chevron-forward" size={28} color={indice === NUMBERS_DATA.length - 1 ? 'rgba(255,255,255,0.4)' : '#FFFFFF'} />
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
  card: { width: width - 40, backgroundColor: '#FFFFFF', borderRadius: 36, padding: 28, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 15, marginBottom: 24, position: 'relative' },
  grupoBadge: { position: 'absolute', top: 16, right: 16, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  grupoText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  numeroGrande: { fontSize: 100, fontWeight: '900', lineHeight: 110, marginTop: 20 },
  emojiCircle: { width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
  textContainer: { alignItems: 'center', marginTop: 8 },
  palabraEspanol: { fontSize: 28, fontWeight: '900', color: '#1E1E1E' },
  palabraGuarani: { fontSize: 22, fontStyle: 'italic', fontWeight: '700', color: '#757575', marginTop: 4 },
  audioButton: { marginTop: 24, borderRadius: 20, overflow: 'hidden', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  audioButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 24, gap: 10 },
  audioButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  previewRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  previewItem: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  previewItemActive: { backgroundColor: '#FFFFFF', transform: [{ scale: 1.15 }], borderColor: '#FFFFFF' },
  previewText: { fontSize: 16, fontWeight: '900', color: 'rgba(255,255,255,0.85)' },
  previewTextActive: { color: '#1E1E1E' },
  navigationButtons: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, gap: 12 },
  navButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.35)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', gap: 6 },
  navButtonDisabled: { opacity: 0.4 },
  navButtonText: { fontSize: 15, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  navButtonTextDisabled: { color: 'rgba(255,255,255,0.5)' },
});