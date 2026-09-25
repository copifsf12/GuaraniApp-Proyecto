import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import {
  DIALECT_VARIANTS
} from '../data/initialData';
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
  purchaseItemRequest,
  translateRequest,
  fetchTranslationHistory,
  toggleFavoriteTranslation,
  sessionStorage
} from '../api/apiClient';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [activeTab, setActiveTab] = useState('learn');

  const [onboardingDraft, setOnboardingDraft] = useState({
    dialectVariant: 'ava',
    ageGroup: 'adulto',
    dailyGoalMinutes: 10
  });

  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [stories, setStories] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [translationHistory, setTranslationHistory] = useState([]);

  const [user, setUser] = useState(null);

  const [activeLesson, setActiveLesson] = useState(null);
  const [activeStory, setActiveStory] = useState(null);
  const [lastLessonResult, setLastLessonResult] = useState(null);
  const [activeExercises, setActiveExercises] = useState([]);

  const [accessibilityMode, setAccessibilityMode] = useState({
    largeText: false,
    autoAudio: true,
    simplifiedUI: false
  });

  useEffect(() => {
    (async () => {
      const saved = await sessionStorage.loadSession();
      if (saved?.access_token) {
        try {
          const profileData = await fetchProfile(saved.access_token);
          setToken(saved.access_token);
          setUser(mapProfileToUser(profileData.profile));
          await loadAllContent(saved.access_token);
        } catch (e) {
          await sessionStorage.clearSession();
        }
      }
    })();
  }, []);

  const mapProfileToUser = (profile) => ({
    id: profile.id,
    username: profile.username,
    email: profile.email,
    dialectVariant: profile.dialect_variant,
    ageGroup: profile.age_group,
    dailyGoalMinutes: profile.daily_goal_minutes,
    hearts: profile.hearts,
    maxHearts: profile.max_hearts,
    heartRegenAt: profile.heart_regen_at || null,
    coinsMbae: profile.coins_mbae,
    xpTotal: profile.xp_total,
    streakDays: profile.streak_days,
    currentRank: profile.current_rank,
    equippedHat: profile.equipped_hat,
    equippedOutfit: profile.equipped_outfit,
    equippedTheme: profile.equipped_theme,
    completedLessons: profile.completed_lessons || [],
    inventory: profile.inventory || [],
    wordsLearned: profile.words_learned ?? profile.wordsLearned ?? 0
  });

  const loadUnits = async (authToken) => {
    setUnitsLoading(true);
    try {
      const { units: fetchedUnits, userStats } = await fetchUnits(authToken);
      setUnits(fetchedUnits);
      if (userStats) {
        setUser(prev => prev ? {
          ...prev,
          hearts: userStats.hearts,
          maxHearts: userStats.max_hearts,
          heartRegenAt: userStats.heart_regen_at || null,
          coinsMbae: userStats.coins_mbae,
          streakDays: userStats.streak_days,
          xpTotal: userStats.xp_total
        } : prev);
      }
    } catch (e) {
      console.warn('No se pudieron cargar las unidades:', e.message);
    } finally {
      setUnitsLoading(false);
    }
  };

  const loadStories = async (authToken) => {
    try {
      const fetchedStories = await fetchStories(authToken);
      setStories(fetchedStories);
    } catch (e) {
      console.warn('No se pudieron cargar los cuentos:', e.message);
    }
  };

  const loadShop = async (authToken) => {
    try {
      const { items, balance } = await fetchShop(authToken);
      setShopItems(items);
      const inventory = items.filter(i => i.is_purchased).map(i => i.key);
      setUser(prev => prev ? { ...prev, inventory, coinsMbae: balance } : prev);
    } catch (e) {
      console.warn('No se pudo cargar la tienda:', e.message);
    }
  };

  const loadAllContent = async (authToken) => {
    await Promise.all([loadUnits(authToken), loadStories(authToken), loadShop(authToken)]);
    try {
      const profileData = await fetchProfile(authToken);
      setAchievements(profileData.achievements || []);
      const wl = profileData.profile?.words_learned ?? profileData.profile?.wordsLearned;
      if (typeof wl === 'number') {
        setUser(prev => prev ? { ...prev, wordsLearned: wl } : prev);
      }
    } catch (e) {
      console.warn('No se pudieron cargar los logros:', e.message);
    }
  };

  const loadAchievements = async () => {
    if (!token) return;
    try {
      const profileData = await fetchProfile(token);
      setAchievements(profileData.achievements || []);
      const wl = profileData.profile?.words_learned ?? profileData.profile?.wordsLearned;
      if (typeof wl === 'number') {
        setUser(prev => prev ? { ...prev, wordsLearned: wl } : prev);
      }
    } catch (e) {
      console.warn('No se pudieron recargar los logros:', e.message);
    }
  };

  const register = async ({
    email,
    password,
    username,
    dialect_variant,
    age_group,
    daily_goal_minutes
  }) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const data = await registerRequest({
        email,
        password,
        username,
        dialect_variant,
        age_group,
        daily_goal_minutes
      });

      return {
        ...data,
        message:
          "✅ Cuenta creada exitosamente. Ahora inicia sesión con tu correo y contraseña."
      };

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
      await loadAllContent(data.session.access_token);

      setCurrentScreen('welcome');

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
    setCurrentScreen('auth');
  };

  // 🔊 Pronunciación: web = speechSynthesis, móvil = expo-speech
  const speakText = (text) => {
    if (!text) return;
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        // Web: usar la voz del navegador
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.lang = 'es-ES';
        const voices = window.speechSynthesis.getVoices();
        const esVoice = voices.find(v => v.lang.includes('es')) || voices[0];
        if (esVoice) utterance.voice = esVoice;
        window.speechSynthesis.speak(utterance);
      } else {
        // Móvil: usar expo-speech
        Speech.stop();
        Speech.speak(text, {
          language: 'es-ES',
          pitch: 1.0,
          rate: 0.85
        });
      }
    } catch (e) {
      console.warn('Audio no disponible:', e);
    }
  };

  const loadLessonExercises = async (lessonId) => {
    const data = await fetchLessonExercises(token, lessonId);
    setActiveExercises(data.exercises);
    return data.exercises;
  };

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
        streakDays: result.user.streak_days,
        heartRegenAt: result.user.heart_regen_at || prev.heartRegenAt || null,
        completedLessons: prev.completedLessons.includes(lessonId)
          ? prev.completedLessons
          : [...prev.completedLessons, lessonId]
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
        culturalCapsule: result.cultural_capsule,
        newlyUnlockedAchievements: result.newly_unlocked_achievements || []
      });

      await loadUnits(token);
      await loadAchievements();
    } catch (e) {
      console.warn('Error completando la lección:', e.message);
    }

    setCurrentScreen('lesson_complete');
  };

  const goToNextLesson = async () => {
    if (!lastLessonResult?.lessonId) {
      setCurrentScreen('main');
      return;
    }

    const allLessons = units
      .flatMap(u => u.lessons || [])
      .sort((a, b) => a.id - b.id);

    const currentIndex = allLessons.findIndex(l => l.id === lastLessonResult.lessonId);
    const nextLesson = allLessons[currentIndex + 1];

    if (nextLesson) {
      setActiveLesson(nextLesson);
      try {
        await loadLessonExercises(nextLesson.id);
      } catch (e) {
        console.warn('No se pudieron cargar los ejercicios:', e.message);
      }
      setCurrentScreen('lesson_tutorial');
    } else {
      setCurrentScreen('main');
    }
  };

  const loseHeart = () => {
    setUser(prev => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1)
    }));
  };

  const completeStory = async (storyId) => {
    try {
      const result = await completeStoryRequest(token, storyId);
      if (result.user) {
        setUser(prev => ({ ...prev, xpTotal: result.user.xp_total }));
      }
      await loadAchievements();
    } catch (e) {
      console.warn('Error completando el cuento:', e.message);
    }
  };

  const translateText = async ({ text, sourceLang, targetLang, dialectVariant }) => {
    const data = await translateRequest(token, {
      text,
      source_lang: sourceLang,
      target_lang: targetLang,
      dialect_variant: dialectVariant || user?.dialectVariant || 'ava'
    });
    setTranslationHistory(prev => [data.translation, ...prev]);
    return data.translation;
  };

  const loadTranslationHistory = async () => {
    try {
      const history = await fetchTranslationHistory(token);
      setTranslationHistory(history);
    } catch (e) {
      console.warn('No se pudo cargar el historial de traducciones:', e.message);
    }
  };

  const toggleFavoriteTranslationItem = async (translationId) => {
    try {
      const result = await toggleFavoriteTranslation(token, translationId);
      setTranslationHistory(prev =>
        prev.map(t => (t.id === translationId ? { ...t, is_favorite: result.translation.is_favorite } : t))
      );
    } catch (e) {
      console.warn('Error al marcar favorito:', e.message);
    }
  };

  const buyShopItem = async (itemKey) => {
    try {
      const result = await purchaseItemRequest(token, itemKey);
      await loadShop(token);
      setUser(prev => ({
        ...prev,
        coinsMbae: result.new_balance,
        equippedHat: result.user.equipped_hat,
        equippedOutfit: result.user.equipped_outfit,
        equippedTheme: result.user.equipped_theme,
        hearts: result.user.hearts,
        heartRegenAt: result.user.heart_regen_at || null
      }));
      return { success: true, message: result.message };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const equipItem = async (category, itemKey) => {
    const item = shopItems.find(i => i.key === itemKey);
    if (!item) return;
    await buyShopItem(itemKey);
  };

  const navigateTo = async (screen, params = {}) => {
    if (params.lessonId) {
      const allLessons = units.flatMap(u => u.lessons || []);
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
        shopItems,
        achievements,
        completeStory,
        translationHistory,
        translateText,
        loadTranslationHistory,
        toggleFavoriteTranslationItem,
        loadAchievements,
        activeLesson,
        setActiveLesson,
        activeExercises,
        activeStory,
        setActiveStory,
        lastLessonResult,
        completeLesson,
        goToNextLesson,
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