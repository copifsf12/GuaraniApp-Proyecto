import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import MascotAguara from '../components/MascotAguara';

export default function AuthScreen() {
  const { setCurrentScreen, setUser } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    // Foolproof validation: if fields are empty, assign friendly defaults
    const finalUsername = username.trim() || (isLogin ? 'Estudiante Chaqueño' : 'Nuevo Explorador');
    const finalEmail = email.trim() || 'usuario@guaraniapp.bo';

    setUser(prev => ({
      ...prev,
      username: finalUsername,
      email: finalEmail
    }));

    setCurrentScreen('main');
  };

  const handleGuestEntry = () => {
    setUser(prev => ({
      ...prev,
      username: 'Visitante del Chaco',
      email: 'invitado@guaraniapp.bo'
    }));
    setCurrentScreen('main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('onboarding')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>

        {/* Mascot Greeting */}
        <MascotAguara
          size={110}
          speechText={
            isLogin
              ? '¡Qué alegría verte de vuelta! Continuemos aprendiendo.'
              : '¡Crea tu perfil y guarda tus rachas en la nube!'
          }
        />

        {/* Auth Mode Toggle Tabs */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabButton, isLogin && styles.tabButtonActive]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.tabButtonText, isLogin && styles.tabButtonTextActive]}>
              Iniciar Sesión
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, !isLogin && styles.tabButtonActive]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.tabButtonText, !isLogin && styles.tabButtonTextActive]}>
              Crear Cuenta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {!isLogin && (
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

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.submitButtonText}>
              {isLogin ? 'Ingresar a mi cuenta' : 'Registrarme y Empezar'}
            </Text>
          </TouchableOpacity>

          {/* OR Divider */}
          <View style={styles.orDivider}>
            <View style={styles.line} />
            <Text style={styles.orText}>O TAMBIÉN</Text>
            <View style={styles.line} />
          </View>

          {/* FOOLPROOF GUEST ACCESS (No typing required) */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestEntry}
            activeOpacity={0.85}
          >
            <Ionicons name="flash" size={20} color={colors.montePrimary} />
            <Text style={styles.guestButtonText}>
              Entrar como Invitado (Sin contraseñas)
            </Text>
          </TouchableOpacity>
          <Text style={styles.guestHint}>
            No perderás nada: tus puntos se guardan automáticamente en tu dispositivo.
          </Text>
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
  submitButton: {
    backgroundColor: colors.terracotaPrimary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    borderBottomWidth: 4,
    borderBottomColor: colors.terracotaDark,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.sandBorder,
  },
  orText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    marginHorizontal: 12,
    letterSpacing: 1,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.montePastel,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.monteMedium,
    gap: 8,
  },
  guestButtonText: {
    color: colors.monteDark,
    fontSize: 15,
    fontWeight: '800',
  },
  guestHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
