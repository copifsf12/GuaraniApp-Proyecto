import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { AGE_GROUPS } from '../data/initialData';
import MascotAguara from '../components/MascotAguara';
import PressableScale from '../components/PressableScale';

export default function AuthScreen() {
  const { setCurrentScreen, login, register, authLoading, onboardingDraft, setOnboardingDraft } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  // 🎯 Edad seleccionada para el registro
  const [selectedAge, setSelectedAge] = useState(onboardingDraft?.ageGroup || 'adulto');

  const handleSubmit = async () => {
    setFormError(null);
    setInfoMessage(null);

    if (!email.trim() || !password.trim()) {
      setFormError('Ingresa tu correo y contraseña.');
      return;
    }

    try {
      if (isLogin) {
        await login({ email: email.trim(), password });
      } else {
        // 🎯 Actualizar el draft del onboarding con la edad seleccionada
        setOnboardingDraft(prev => ({ ...prev, ageGroup: selectedAge }));

        const data = await register({
          email: email.trim(),
          password,
          username: username.trim() || 'Nuevo Explorador',
          dialect_variant: onboardingDraft.dialectVariant,
          age_group: selectedAge,   // 🎯 La edad elegida en el formulario
          daily_goal_minutes: onboardingDraft.dailyGoalMinutes
        });

        setUsername('');
        setEmail('');
        setPassword('');

        setInfoMessage(
          data.message || "✅ Cuenta creada exitosamente. Ahora inicia sesión con tu correo y contraseña."
        );

        setIsLogin(true);
      }
    } catch (e) {
      setFormError(e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('onboarding')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>

        <MascotAguara
          size={110}
          speechText={
            isLogin
              ? '¡Qué alegría verte de vuelta! Continuemos aprendiendo.'
              : '¡Crea tu perfil y guarda tus rachas en la nube!'
          }
        />

        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabButton, isLogin && styles.tabButtonActive]}
            onPress={() => { setIsLogin(true); setFormError(null); }}
          >
            <Text style={[styles.tabButtonText, isLogin && styles.tabButtonTextActive]}>
              Iniciar Sesión
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, !isLogin && styles.tabButtonActive]}
            onPress={() => { setIsLogin(false); setFormError(null); }}
          >
            <Text style={[styles.tabButtonText, !isLogin && styles.tabButtonTextActive]}>
              Crear Cuenta
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {!isLogin && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tu Nombre o Apodo:</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={colors.textMuted} />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Ej: Kuarahy o Carlos"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* 🎯 SELECTOR DE EDAD EN EL REGISTRO */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🎂 ¿Cuál es tu grupo de edad?</Text>
                <Text style={styles.ageHint}>
                  Adaptamos el contenido y las preguntas según tu edad.
                </Text>

                <View style={styles.ageOptionsRow}>
                  {AGE_GROUPS.map(group => {
                    const isSelected = selectedAge === group.id;
                    return (
                      <TouchableOpacity
                        key={group.id}
                        style={[styles.ageChip, isSelected && styles.ageChipSelected]}
                        onPress={() => setSelectedAge(group.id)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={group.icon || 'person-outline'}
                          size={20}
                          color={isSelected ? '#FFFFFF' : colors.montePrimary}
                        />
                        <Text style={[styles.ageChipText, isSelected && styles.ageChipTextSelected]}>
                          {group.label.split(' ')[0]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {selectedAge && (
                  <Text style={styles.selectedAgeSubtext}>
                    {AGE_GROUPS.find(g => g.id === selectedAge)?.subtext}
                  </Text>
                )}
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Correo Electrónico:</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.inputField}
                placeholder="ejemplo@correo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contraseña:</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.inputField}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {formError && <Text style={styles.errorText}>{formError}</Text>}
          {infoMessage && <Text style={styles.infoText}>{infoMessage}</Text>}

          <PressableScale
            style={[styles.submitButton, authLoading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={authLoading}
            pulse={!authLoading}
          >
            {authLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isLogin ? 'Ingresar a mi cuenta' : 'Registrarme y Empezar'}
              </Text>
            )}
          </PressableScale>
        </View>
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
    padding: 24,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: 6,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    marginVertical: 16,
    borderWidth: 1.5,
    borderColor: colors.sandBorder,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: colors.montePrimary,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.sandBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.sandBorder,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: colors.sandBackground,
  },
  inputField: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: colors.textPrimary,
    marginLeft: 8,
  },

  // 🎯 SELECTOR DE EDAD
  ageHint: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  ageOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.montePrimary,
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  ageChipSelected: {
    backgroundColor: colors.montePrimary,
    borderColor: colors.monteDark,
  },
  ageChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.monteDark,
  },
  ageChipTextSelected: {
    color: '#FFFFFF',
  },
  selectedAgeSubtext: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },

  submitButton: {
    backgroundColor: colors.terracotaPrimary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    borderBottomWidth: 4,
    borderBottomColor: colors.terracotaDark,
    shadowColor: colors.terracotaDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  errorText: {
    color: '#C0392B',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    color: colors.monteDark,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
});