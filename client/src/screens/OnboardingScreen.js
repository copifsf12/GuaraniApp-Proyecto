import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import MascotAguara from '../components/MascotAguara';
import OnboardingBackground from '../components/OnboardingBackground';
import PressableScale from '../components/PressableScale';
import DiagnosticQuizModal from '../components/DiagnosticQuizModal';
import { DIALECT_VARIANTS, AGE_GROUPS, DAILY_GOALS } from '../data/initialData';

export default function OnboardingScreen() {
  const { onboardingDraft, setOnboardingDraft, setCurrentScreen } = useApp();

  const [step, setStep] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(onboardingDraft.dialectVariant);
  const [selectedAge, setSelectedAge] = useState(onboardingDraft.ageGroup);
  const [selectedGoal, setSelectedGoal] = useState('regular');
  const [showQuiz, setShowQuiz] = useState(false);

  const handleFinishOnboarding = (levelChoice) => {
    setOnboardingDraft({
      dialectVariant: selectedVariant,
      ageGroup: selectedAge,
      dailyGoalMinutes: selectedGoal === 'casual' ? 5 : selectedGoal === 'regular' ? 10 : selectedGoal === 'serio' ? 15 : 20,
      levelChoice: levelChoice || 'fresh'
    });
    setCurrentScreen('auth');
  };

  const handleQuizFinish = (score) => {
    let levelChoice = 'fresh';
    if (score === 5) levelChoice = 'unit3';
    else if (score === 4) levelChoice = 'unit2';
    else if (score === 3) levelChoice = 'lesson2';

    setShowQuiz(false);
    handleFinishOnboarding(levelChoice);
  };

  // STEP 0: WELCOME
  if (step === 0) {
    return (
      <OnboardingBackground style={styles.container}>
        <View style={styles.topPattern}>
          <Text style={styles.badgeText}>EL IDIOMA DEL GRAN CHACO</Text>
        </View>

        <View style={styles.centerContent}>
          <MascotAguara
            size={160}
            speechText="¡Puama! Soy Aguará, tu compañero para aprender Guaraní."
          />
          <Text style={styles.mainTitle}>Aprende Guaraní Oriental</Text>
          <Text style={styles.mainSubtitle}>
            Hablado en Santa Cruz, Tarija y Chuquisaca. Práctico, lúdico y 100% boliviano.
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <PressableScale
            style={styles.primaryButton}
            onPress={() => setStep(1)}
            pulse
          >
            <Text style={styles.primaryButtonText}>Empezar desde cero</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </PressableScale>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setCurrentScreen('auth')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Ya tengo una cuenta</Text>
          </TouchableOpacity>
        </View>
      </OnboardingBackground>
    );
  }

  // STEP 1: DIALECT VARIANT
  if (step === 1) {
    return (
      <OnboardingBackground style={styles.container}>
        <View style={styles.stepHeader}>
          <TouchableOpacity onPress={() => setStep(0)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>Paso 1 de 4: Variante Dialectal</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Elige tu variante de Guaraní:</Text>
          <Text style={styles.sectionDesc}>
            El guaraní boliviano tiene variantes hermanas que comparten el mismo alfabeto oficial unificado.
          </Text>

          {DIALECT_VARIANTS.map(variant => {
            const isSelected = selectedVariant === variant.id;
            return (
              <TouchableOpacity
                key={variant.id}
                style={[styles.cardOption, isSelected && styles.cardOptionSelected]}
                onPress={() => setSelectedVariant(variant.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.variantIconCircle}>
                    <Ionicons
                      name="earth"
                      size={24}
                      color={isSelected ? colors.montePrimary : colors.terracotaPrimary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                      {variant.name}
                    </Text>
                    <Text style={styles.cardRegion}>{variant.region}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={26} color={colors.montePrimary} />
                  )}
                </View>
                <Text style={styles.cardDesc}>{variant.description}</Text>
                <View style={styles.sampleBadge}>
                  <Text style={styles.sampleText}>Ej: "{variant.greetingSample}"</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.bottomNav}>
          <PressableScale
            style={styles.primaryButton}
            onPress={() => setStep(2)}
            pulse
          >
            <Text style={styles.primaryButtonText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </PressableScale>
        </View>
      </OnboardingBackground>
    );
  }

  // STEP 2: AGE GROUP
  if (step === 2) {
    return (
      <OnboardingBackground style={styles.container}>
        <View style={styles.stepHeader}>
          <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>Paso 2 de 4: Rango de Edad</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>¿Cuál es tu grupo de edad?</Text>
          <Text style={styles.sectionDesc}>
            Adaptamos el contenido, la cantidad de unidades y los juegos según tu edad.
          </Text>

          {AGE_GROUPS.map(age => {
            const isSelected = selectedAge === age.id;
            return (
              <TouchableOpacity
                key={age.id}
                style={[styles.cardOption, isSelected && styles.cardOptionSelected]}
                onPress={() => setSelectedAge(age.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <Ionicons
                    name={age.icon}
                    size={28}
                    color={isSelected ? colors.montePrimary : colors.textSecondary}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                      {age.label}
                    </Text>
                    <Text style={styles.cardDesc}>{age.subtext}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={26} color={colors.montePrimary} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.bottomNav}>
          <PressableScale
            style={styles.primaryButton}
            onPress={() => setStep(3)}
            pulse
          >
            <Text style={styles.primaryButtonText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </PressableScale>
        </View>
      </OnboardingBackground>
    );
  }

  // STEP 3: DAILY GOAL
  if (step === 3) {
    return (
      <OnboardingBackground style={styles.container}>
        <View style={styles.stepHeader}>
          <TouchableOpacity onPress={() => setStep(2)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>Paso 3 de 4: Meta Diaria</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Elige tu ritmo de aprendizaje:</Text>
          <Text style={styles.sectionDesc}>
            Puedes cambiar tu meta en cualquier momento desde tu perfil.
          </Text>

          {DAILY_GOALS.map(goal => {
            const isSelected = selectedGoal === goal.id;
            return (
              <TouchableOpacity
                key={goal.id}
                style={[styles.cardOption, isSelected && styles.cardOptionSelected]}
                onPress={() => setSelectedGoal(goal.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <Ionicons
                    name={goal.icon}
                    size={28}
                    color={isSelected ? colors.terracotaPrimary : colors.textSecondary}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                      {goal.label}
                    </Text>
                    <Text style={styles.cardDesc}>{goal.subtext}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={26} color={colors.terracotaPrimary} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.bottomNav}>
          <PressableScale
            style={styles.primaryButton}
            onPress={() => setStep(4)}
            pulse
          >
            <Text style={styles.primaryButtonText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </PressableScale>
        </View>
      </OnboardingBackground>
    );
  }

  // STEP 4: LEVEL CHOICE
  return (
    <OnboardingBackground style={styles.container}>
      <View style={styles.stepHeader}>
        <TouchableOpacity onPress={() => setStep(3)} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Paso 4 de 4: Nivel de Inicio</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MascotAguara
          size={120}
          speechText="¡Excelente elección! ¿Cómo prefieres comenzar tu viaje?"
        />

        <TouchableOpacity
          style={styles.levelCard}
          onPress={() => handleFinishOnboarding('fresh')}
          activeOpacity={0.85}
        >
          <View style={styles.levelIconBadge}>
            <Ionicons name="leaf" size={32} color={colors.montePrimary} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.levelTitle}>Empezar desde cero</Text>
            <Text style={styles.levelSubtitle}>
              Ideal si nunca has hablado guaraní oriental. Comenzaremos con saludos básicos.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.monteDark} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.levelCard}
          onPress={() => setShowQuiz(true)}
          activeOpacity={0.85}
        >
          <View style={[styles.levelIconBadge, { backgroundColor: colors.solLight }]}>
            <Ionicons name="compass" size={32} color={colors.terracotaPrimary} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.levelTitle}>Prueba de Diagnóstico</Text>
            <Text style={styles.levelSubtitle}>
              ¿Ya conoces palabras o frases chaqueñas? Descubre tu nivel en 2 minutos.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.terracotaDark} />
        </TouchableOpacity>
      </ScrollView>

      <DiagnosticQuizModal
        visible={showQuiz}
        onClose={() => setShowQuiz(false)}
        onFinish={handleQuizFinish}
      />
    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topPattern: { alignItems: 'center', paddingTop: 16, paddingBottom: 8 },
  badgeText: {
    fontSize: 12, fontWeight: '800', letterSpacing: 1.5,
    color: colors.monteDark, backgroundColor: colors.montePastel,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12,
  },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  mainTitle: {
    fontSize: 28, fontWeight: '900', color: colors.terracotaDark,
    textAlign: 'center', marginTop: 14,
  },
  mainSubtitle: {
    fontSize: 15, color: colors.textSecondary, textAlign: 'center',
    marginTop: 8, lineHeight: 22, maxWidth: 300,
  },
  actionsContainer: { paddingHorizontal: 24, paddingBottom: 24, gap: 12 },
  primaryButton: {
    backgroundColor: colors.montePrimary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 18,
    borderBottomWidth: 4, borderBottomColor: colors.monteDark, gap: 8,
    shadowColor: colors.monteDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 6,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  secondaryButton: {
    backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 18,
    alignItems: 'center', borderWidth: 2, borderColor: colors.sandBorder,
  },
  secondaryButtonText: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  stepHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.sandBorder,
  },
  backButton: { padding: 6 },
  stepIndicator: {
    fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginLeft: 10,
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 14, color: colors.textSecondary, marginBottom: 18, lineHeight: 20,
  },
  cardOption: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginBottom: 12,
    borderWidth: 2, borderColor: colors.sandBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardOptionSelected: { borderColor: colors.montePrimary, backgroundColor: colors.montePastel },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  variantIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.sandBackground,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  cardTitleSelected: { color: colors.monteDark },
  cardRegion: { fontSize: 12, fontWeight: '600', color: colors.terracotaPrimary, marginTop: 2 },
  cardDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 8, lineHeight: 18 },
  sampleBadge: {
    backgroundColor: 'rgba(255,255,255,0.7)', alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 8,
  },
  sampleText: { fontSize: 12, fontStyle: 'italic', color: colors.monteDark, fontWeight: '600' },
  bottomNav: {
    padding: 16, borderTopWidth: 1, borderTopColor: colors.sandBorder, backgroundColor: '#FFFFFF',
  },
  levelCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    padding: 18, borderRadius: 20, borderWidth: 2, borderColor: colors.sandBorder,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 5, elevation: 3,
  },
  levelIconBadge: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.montePastel,
    justifyContent: 'center', alignItems: 'center',
  },
  levelTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  levelSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
});