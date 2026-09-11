import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { DIALECT_VARIANTS } from '../data/initialData';
import {
  registerRequest,
  loginRequest,
  fetchProfile,
  fetchUnits,
  fetchLessonExercises,
  completeLessonRequest,
  fetchStories,
  completeStoryRequest,
  fetchShop,
  purchaseShopItemRequest,
  saveSettings,
  sessionStorage
} from '../api/apiClient';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState('splash'); // 'splash' | 'onboarding' | 'auth' | 'main' | 'lesson' | 'lesson_complete' | 'story_reader'
  const [activeTab, setActiveTab] = useState('learn'); // 'learn' | 'stories' | 'leagues' | 'shop' | 'profile'

  // Preferencias elegidas en el onboarding, antes de crear la cuenta
  const [onboardingDraft, setOnboardingDraft] = useState({
    dialectVariant: 'ava',
    ageGroup: 'adulto',
    dailyGoalMinutes: 10
  });

  // Sesión real contra el backend / Supabase
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Contenido del curso, cargado desde Supabase vía el backend
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);

  // Cuentos (Kassukuaa) y tienda, cargados desde Supabase vía el backend
  const [stories, setStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [shopItems, setShopItems] = useState([]);
  const [shopLoading, setShopLoading] = useState(false);

  // Logros/insignias, calculados en el backend a partir del progreso real
  const [achievements, setAchievements] = useState([]);

  // User Profile & Gamification (se llena con datos reales tras login)
  const [user, setUser] = useState(null);

  // Current Active Lesson & Story state
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeStory, setActiveStory] = useState(null);
  const [lastLessonResult, setLastLessonResult] = useState(null);
  const [activeExercises, setActiveExercises] = useState([]);

  // Accessibility / Easy Mode
  const [accessibilityMode, setAccessibilityMode] = useState({
    largeText: false,
    autoAudio: true,
    simplifiedUI: false
  });

  // Al abrir la app, intenta recuperar una sesión guardada
  useEffect(() => {
    (async () => {
      const saved = await sessionStorage.loadSession();
      if (saved?.access_token) {
        try {
          const profileData = await fetchProfile(saved.access_token);
          setToken(saved.access_token);
          setUser(mapProfileToUser(profileData.profile));
          setAchievements(profileData.achievements || []);
          await Promise.all([
            loadUnits(saved.access_token),
            loadStories(saved.access_token),
            loadShop(saved.access_token)
          ]);
        } catch (e) {
          await sessionStorage.clearSession();
        }
      }
    })();
  }, []);

  const mapProfileToUser = (profile, inventory = []) => ({
    id: profile.id,
    username: profile.username,
    email: profile.email,
    dialectVariant: profile.dialect_variant,
    ageGroup: profile.age_group,
    dailyGoalMinutes: profile.daily_goal_minutes,
    hearts: profile.hearts,
    maxHearts: profile.max_hearts,
    coinsMbae: profile.coins_mbae,
    xpTotal: profile.xp_total,
    streakDays: profile.streak_days,
    currentRank: profile.current_rank,
    equippedHat: profile.equipped_hat,
    equippedOutfit: profile.equipped_outfit,
    equippedTheme: profile.equipped_theme,
    completedLessons: [],
    inventory
  });

  const loadUnits = async (authToken) => {
    setUnitsLoading(true);
    try {
      const { units: fetchedUnits, userStats } = await fetchUnits(authToken);
      setUnits(fetchedUnits);
      if (userStats) {
        setUser(prev => prev ? { ...prev, hearts: userStats.hearts, coinsMbae: userStats.coins_mbae, streakDays: userStats.streak_days, xpTotal: userStats.xp_total } : prev);
      }
    } catch (e) {
      console.warn('No se pudieron cargar las unidades:', e.message);
    } finally {
      setUnitsLoading(false);
    }
  };

  // Carga los logros/insignias (calculados en el backend según el progreso real)
  const loadAchievements = async (authToken) => {
    try {
      const profileData = await fetchProfile(authToken);
      setAchievements(profileData.achievements || []);
    } catch (e) {
      console.warn('No se pudieron cargar los logros:', e.message);
    }
  };

  // Carga los cuentos reales (Kassukuaa) desde Supabase
  const loadStories = async (authToken) => {
    setStoriesLoading(true);
    try {
      const fetchedStories = await fetchStories(authToken);
      setStories(fetchedStories);
    } catch (e) {
      console.warn('No se pudieron cargar los cuentos:', e.message);
    } finally {
      setStoriesLoading(false);
    }
  };

  // Carga el catálogo de la tienda y sincroniza el inventario real del usuario
  const loadShop = async (authToken) => {
    setShopLoading(true);
    try {
      const { items, balance } = await fetchShop(authToken);
      setShopItems(items);
      const ownedKeys = items.filter(i => i.is_purchased).map(i => i.key);
      setUser(prev => prev ? { ...prev, coinsMbae: balance, inventory: ownedKeys } : prev);
    } catch (e) {
      console.warn('No se pudo cargar la tienda:', e.message);
    } finally {
      setShopLoading(false);
    }
  };

  // ---- Autenticación real ----
  const register = async ({ email, password, username, dialect_variant, age_group, daily_goal_minutes }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await registerRequest({ email, password, username, dialect_variant, age_group, daily_goal_minutes });
      if (data.session) {
        await sessionStorage.saveSession(data.session);
        setToken(data.session.access_token);
        setUser(mapProfileToUser(data.user));
        await Promise.all([
          loadUnits(data.session.access_token),
            loadAchievements(data.session.access_token),
          loadStories(data.session.access_token),
          loadShop(data.session.access_token)
        ]);
        setCurrentScreen('main');
      }
      return data; // incluye "message" (ej: pide confirmar email)
    } catch (e) {
      setAuthError(e.message);
      throw e;
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await loginRequest({ email, password });
      await sessionStorage.saveSession(data.session);
      setToken(data.session.access_token);
      setUser(mapProfileToUser(data.user));
      await Promise.all([
        loadUnits(data.session.access_token),
        loadAchievements(data.session.access_token),
        loadStories(data.session.access_token),
        loadShop(data.session.access_token)
      ]);
      setCurrentScreen('main');
      return data;
    } catch (e) {
      setAuthError(e.message);
      throw e;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await sessionStorage.clearSession();
    setToken(null);
    setUser(null);
    setUnits([]);
    setStories([]);
    setShopItems([]);
    setAchievements([]);
    setCurrentScreen('auth');
  };

  // Speech Pronunciation Function (cross-platform, works on Web and Mobile)
  const speakText = (text) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85; // Slightly slower for clear learning
        utterance.pitch = 1.0;
        // Search for Spanish or Portuguese voice as approximation for Guaraní phonetics
        const voices = window.speechSynthesis.getVoices();
        const esVoice = voices.find(v => v.lang.includes('es')) || voices[0];
        if (esVoice) utterance.voice = esVoice;
        window.speechSynthesis.speak(utterance);
      } else {
        console.log('[Audio Guaraní Pronunciación]:', text);
      }
    } catch (e) {
      console.warn('Audio no disponible:', e);
    }
  };

  // Carga los ejercicios reales de una lección (desde Supabase)
  const loadLessonExercises = async (lessonId) => {
    const data = await fetchLessonExercises(token, lessonId);
    setActiveExercises(data.exercises);
    return data.exercises;
  };

  // Lesson Completion Action: ahora guarda el progreso real en Supabase
  const completeLesson = async (lessonId, metrics) => {
    try {
      const result = await completeLessonRequest(token, lessonId, {
        accuracy: metrics?.accuracy,
        time_spent_seconds: metrics?.timeSpentSeconds
      });

      setUser(prev => ({
        ...prev,
        xpTotal: result.user.xp_total,
        coinsMbae: result.user.coins_mbae,
        streakDays: result.user.streak_days
      }));

      setLastLessonResult({
        lessonId,
        title: activeLesson?.title || 'Lección',
        xpGained: result.rewards.xp,
        coinsGained: result.rewards.coins,
        accuracy: result.rewards.accuracy,
        correctCount: metrics?.correctCount ?? 0,
        incorrectCount: metrics?.incorrectCount ?? 0,
        formattedTime: metrics?.formattedTime ?? '0:45',
        culturalCapsule: result.cultural_capsule
      });

      // Refresca las unidades para reflejar la lección desbloqueada siguiente
      await loadUnits(token);
    } catch (e) {
      console.warn('Error completando la lección:', e.message);
    }

    setCurrentScreen('lesson_complete');
  };

  // Lose a heart on mistake
  const loseHeart = () => {
    setUser(prev => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1)
    }));
  };

  // Compra un artículo real en Supabase (descuenta monedas y actualiza inventario)
  const buyShopItem = async (itemKey) => {
    try {
      const result = await purchaseShopItemRequest(token, itemKey);
      setUser(prev => ({
        ...prev,
        coinsMbae: result.user.coins_mbae,
        hearts: result.user.hearts,
        equippedHat: result.user.equipped_hat,
        equippedOutfit: result.user.equipped_outfit,
        equippedTheme: result.user.equipped_theme,
        inventory: prev.inventory.includes(itemKey) ? prev.inventory : [...prev.inventory, itemKey]
      }));
      setShopItems(prev => prev.map(i => i.key === itemKey ? {
        ...i,
        is_purchased: true,
        is_equipped: result.user.equipped_hat === i.key || result.user.equipped_outfit === i.key || result.user.equipped_theme === i.key
      } : i));
      return { success: true, message: result.message };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  // Equipa un artículo que ya compró, y guarda el cambio en su perfil
  const equipItem = async (category, itemKey) => {
    const field = category === 'hat' ? 'equippedHat' : 'equippedOutfit';
    const fallback = category === 'hat' ? 'ninguno' : 'tradicional';
    const newValue = user[field] === itemKey ? fallback : itemKey;

    setUser(prev => ({ ...prev, [field]: newValue }));
    try {
      await saveSettings(token, category === 'hat' ? { equipped_hat: newValue } : { equipped_outfit: newValue });
    } catch (e) {
      console.warn('No se pudo guardar el artículo equipado:', e.message);
    }
  };

  // Marca un cuento como completado en Supabase y otorga su XP
  const completeStory = async (storyId) => {
    try {
      const result = await completeStoryRequest(token, storyId);
      if (result.user) {
        setUser(prev => ({ ...prev, xpTotal: result.user.xp_total }));
      }
      setStories(prev => prev.map(s => s.id === storyId ? { ...s, is_completed: true } : s));
      return result;
    } catch (e) {
      console.warn('No se pudo guardar el progreso del cuento:', e.message);
    }
  };

  // Navigate helper
  const navigateTo = async (screen, params = {}) => {
    if (params.lessonId) {
      const allLessons = units.flatMap(u => u.lessons);
      const targetLesson = allLessons.find(l => l.id === params.lessonId) || allLessons[0];
      setActiveLesson(targetLesson);
      if (targetLesson) {
        await loadLessonExercises(targetLesson.id);
      }
    }
    if (params.storyId) {
      const targetStory = stories.find(s => s.id === params.storyId) || stories[0];
      setActiveStory(targetStory);
    }
    setCurrentScreen(screen);
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        activeTab,
        setActiveTab,
        onboardingDraft,
        setOnboardingDraft,
        user,
        setUser,
        token,
        authLoading,
        authError,
        register,
        login,
        logout,
        units,
        unitsLoading,
        stories,
        storiesLoading,
        shopItems,
        shopLoading,
        achievements,
        activeLesson,
        setActiveLesson,
        activeExercises,
        activeStory,
        setActiveStory,
        lastLessonResult,
        completeLesson,
        completeStory,
        loseHeart,
        buyShopItem,
        equipItem,
        speakText,
        navigateTo,
        accessibilityMode,
        setAccessibilityMode,
        variants: DIALECT_VARIANTS
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);