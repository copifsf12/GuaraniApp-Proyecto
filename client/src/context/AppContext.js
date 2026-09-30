import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import {
  DIALECT_VARIANTS,
  LOCAL_GAMES,
  MBAE_PACKS
} from '../data/initialData';
import {
  registerRequest,
  loginRequest,
  fetchProfile,
  fetchUnits,
  fetchLessonExercises,
  completeLessonRequest,
  completeGameRequest,
  payCostRequest,
  fetchStories,
  completeStoryRequest,
  fetchShop,
  purchaseItemRequest,
  translateRequest,
  fetchTranslationHistory,
  toggleFavoriteTranslation,
  fetchLeaderboard,
  loseHeartRequest,
  sessionStorage
} from '../api/apiClient';

const AppContext = createContext();

// 🎯 MAPA DE JUEGOS por grupo de edad y unidad
const GAME_MAP = {
  nino: {
    1: ['memory', 'matching'],
    2: ['matching', 'memory'],
    3: ['memory', 'matching'],
  },
  joven: {
    1: ['matching', 'quick_quiz'],
    2: ['hangman', 'quick_quiz'],
    3: ['hangman', 'quick_quiz'],
  },
  adulto: {
    1: ['complete_word', 'word_search'],
    2: ['word_search', 'complete_word'],
    3: ['hangman', 'word_search'],
  },
  mayor: {
    1: ['memory', 'matching'],
    2: ['matching', 'memory'],
    3: ['memory', 'matching'],
  },
};

// 🎯 Lecciones que se saltan según el resultado del diagnóstico
const DIAGNOSTIC_SKIP_MAP = {
  unit3: [1, 101, 2, 102, 3, 103, 4, 104],
  unit2: [1, 101, 2, 102],
  lesson2: [1],
  fresh: [],
};

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

  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [communityProgress, setCommunityProgress] = useState({ lessons: 0, target: 10000, users: 0 });

  const [user, setUser] = useState(null);

  const [activeLesson, setActiveLesson] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [activeStory, setActiveStory] = useState(null);
  const [lastLessonResult, setLastLessonResult] = useState(null);
  const [activeExercises, setActiveExercises] = useState([]);

  const [pendingAguaraWalk, setPendingAguaraWalk] = useState(null);

  const [accessibilityMode, setAccessibilityMode] = useState({
    largeText: false,
    autoAudio: true,
    simplifiedUI: false
  });

  // 🎯 NUEVA FUNCIÓN: Cambiar tab y resetear pantalla a 'main'
  const handleSetActiveTab = (tabKey) => {
    setActiveTab(tabKey);
    setCurrentScreen('main'); // 👈 ESTO ES CLAVE
  };

  useEffect(() => {
    (async () => {
      if (!sessionStorage || typeof sessionStorage.loadSession !== 'function') {
        console.warn('⚠️ sessionStorage no está disponible. Saltando restauración de sesión.');
        return;
      }

      const saved = await sessionStorage.loadSession();
      if (saved?.access_token) {
        try {
          const profileData = await fetchProfile(saved.access_token);
          setToken(saved.access_token);
          setUser(mapProfileToUser(profileData.profile));
          await loadAllContent(saved.access_token);
        } catch (e) {
          console.warn('❌ Error restaurando sesión:', e.message);
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
    wordsLearned: profile.words_learned ?? profile.wordsLearned ?? 0,
    hintsAvailable: profile.hints_available ?? 0,
    streakFreezeCount: profile.streak_freeze_count ?? 0
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
      const { items, balance, hearts, maxHearts } = await fetchShop(authToken);
      setShopItems(items);
      const inventory = items.filter(i => i.is_purchased).map(i => i.key);
      setUser(prev => prev ? {
        ...prev,
        inventory,
        coinsMbae: balance,
        hearts: hearts ?? prev.hearts,
        maxHearts: maxHearts ?? prev.maxHearts
      } : prev);
    } catch (e) {
      console.warn('No se pudo cargar la tienda:', e.message);
    }
  };

  const loadLeaderboard = async () => {
    if (!token) return;
    try {
      const data = await fetchLeaderboard(token);
      setLeaderboard(data.leaderboard || []);
      setUserRank(data.user_rank);
      if (data.community_progress) {
        setCommunityProgress(data.community_progress);
      }
    } catch (e) {
      console.warn('No se pudo cargar el leaderboard:', e.message);
    }
  };

  const applyDiagnosticSkips = async (authToken, levelChoice) => {
    if (!levelChoice || levelChoice === 'fresh') return;

    const lessonsToSkip = DIAGNOSTIC_SKIP_MAP[levelChoice] || [];
    if (lessonsToSkip.length === 0) return;

    console.log(`🎯 Aplicando diagnóstico "${levelChoice}" - Saltando ${lessonsToSkip.length} lecciones`);

    try {
      for (const lessonId of lessonsToSkip) {
        try {
          await completeLessonRequest(authToken, lessonId, {
            accuracy: 100,
            time_spent_seconds: 0
          });
        } catch (e) {
          console.warn(`⚠️ No se pudo saltar la lección ${lessonId}:`, e.message);
        }
      }
      console.log(`✅ Diagnóstico aplicado: ${lessonsToSkip.length} lecciones saltadas`);
    } catch (e) {
      console.warn('Error aplicando diagnóstico:', e.message);
    }
  };

  const loadAllContent = async (authToken) => {
    await Promise.all([
      loadUnits(authToken),
      loadStories(authToken),
      loadShop(authToken),
      loadLeaderboard()
    ]);
    try {
      const profileData = await fetchProfile(authToken);
      setAchievements(profileData.achievements || []);
      const wl = profileData.profile?.words_learned ?? profileData.profile?.wordsLearned;
      if (typeof wl === 'number') {
        setUser(prev => prev ? { ...prev, wordsLearned: wl } : prev);
      }
      if (profileData.profile?.completed_lessons) {
        setUser(prev => prev ? {
          ...prev,
          completedLessons: profileData.profile.completed_lessons
        } : prev);
      }
      if (profileData.profile) {
        setUser(prev => prev ? {
          ...prev,
          hintsAvailable: profileData.profile.hints_available ?? prev.hintsAvailable,
          streakFreezeCount: profileData.profile.streak_freeze_count ?? prev.streakFreezeCount
        } : prev);
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
      if (profileData.profile?.completed_lessons) {
        setUser(prev => prev ? {
          ...prev,
          completedLessons: profileData.profile.completed_lessons
        } : prev);
      }
      if (profileData.profile) {
        setUser(prev => prev ? {
          ...prev,
          hintsAvailable: profileData.profile.hints_available ?? prev.hintsAvailable,
          streakFreezeCount: profileData.profile.streak_freeze_count ?? prev.streakFreezeCount
        } : prev);
      }
    } catch (e) {
      console.warn('No se pudieron recargar los logros:', e.message);
    }
  };

  const register = async ({
    email, password, username, dialect_variant, age_group, daily_goal_minutes
  }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await registerRequest({
        email, password, username, dialect_variant, age_group, daily_goal_minutes
      });

      if (data.session?.access_token && data.autoLoggedIn) {
        console.log('🎯 Auto-login después de registrar');

        if (sessionStorage?.saveSession) {
          await sessionStorage.saveSession(data.session);
        }

        setToken(data.session.access_token);
        setUser(mapProfileToUser(data.user));

        await loadAllContent(data.session.access_token);

        if (onboardingDraft?.levelChoice && onboardingDraft.levelChoice !== 'fresh') {
          console.log(`🎯 Aplicando diagnóstico: ${onboardingDraft.levelChoice}`);
          await applyDiagnosticSkips(data.session.access_token, onboardingDraft.levelChoice);
          await loadAllContent(data.session.access_token);
        }

        setCurrentScreen('welcome');

        return {
          ...data,
          autoLoggedIn: true,
          message: '¡Bienvenido a GuaraniApp!'
        };
      }

      return {
        ...data,
        autoLoggedIn: false,
        message: data.message || 'Cuenta creada. Revisa tu correo para confirmar.'
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

      if (sessionStorage?.saveSession) {
        await sessionStorage.saveSession(data.session);
      } else {
        console.warn('⚠️ No se pudo guardar la sesión: sessionStorage no disponible.');
      }

      setToken(data.session.access_token);
      setUser(mapProfileToUser(data.user));
      await loadAllContent(data.session.access_token);

      if (onboardingDraft?.levelChoice && onboardingDraft.levelChoice !== 'fresh') {
        console.log(`🎯 Aplicando diagnóstico al login: ${onboardingDraft.levelChoice}`);
        await applyDiagnosticSkips(data.session.access_token, onboardingDraft.levelChoice);
        await loadAllContent(data.session.access_token);
      }

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
    if (sessionStorage?.clearSession) {
      await sessionStorage.clearSession();
    }
    setToken(null);
    setUser(null);
    setUnits([]);
    setCurrentScreen('auth');
  };

  const speakText = (text) => {
    if (!text) return;
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.rate = 0.75;
        utterance.pitch = 1.0;
        utterance.lang = 'es-419';

        const voices = window.speechSynthesis.getVoices();

        const guaraniVoice = voices.find(v => v.lang && v.lang.includes('gn'));
        const latinVoice = voices.find(v => v.lang && v.lang.includes('es-419'))
                        || voices.find(v => v.lang && v.lang.includes('es-MX'))
                        || voices.find(v => v.lang && v.lang.includes('es-AR'))
                        || voices.find(v => v.lang && v.lang.includes('es-CO'));
        const anySpanish = voices.find(v => v.lang && v.lang.includes('es'));

        if (guaraniVoice) {
          utterance.voice = guaraniVoice;
          console.log('🎙️ Voz guaraní detectada:', guaraniVoice.name);
        } else if (latinVoice) {
          utterance.voice = latinVoice;
          console.log('🎙️ Voz latinoamericana:', latinVoice.name);
        } else if (anySpanish) {
          utterance.voice = anySpanish;
          console.log('🎙️ Voz español genérica:', anySpanish.name);
        }

        window.speechSynthesis.speak(utterance);
      } else {
        Speech.stop();
        Speech.speak(text, {
          language: 'es-419',
          pitch: 1.0,
          rate: 0.75
        });
      }
    } catch (e) {
      console.warn('Audio no disponible:', e);
    }
  };

  const loadLessonExercises = async (lessonId) => {
    const ageGroup = user?.ageGroup || 'adulto';
    const data = await fetchLessonExercises(token, lessonId, ageGroup);
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

      setCurrentScreen('lesson_complete');

      loadUnits(token).catch(e => console.warn('⚠️ loadUnits:', e.message));
      loadAchievements().catch(e => console.warn('⚠️ loadAchievements:', e.message));
      loadLeaderboard().catch(e => console.warn('⚠️ loadLeaderboard:', e.message));
    } catch (e) {
      console.warn('Error completando la lección:', e.message);
      setCurrentScreen('lesson_complete');
    }
  };

  const startGame = (lesson) => {
    if (!lesson || lesson.type !== 'game') {
      console.warn('startGame: no es un juego válido');
      return;
    }

    const userAgeGroup = user?.ageGroup || 'adulto';

    const currentUnit = units.find(u =>
      (u.lessons || []).some(l => l.id === lesson.id)
    );
    const unitNumber = currentUnit?.unit_number || 1;

    const unitGames = (currentUnit?.lessons || []).filter(l => l.type === 'game');
    const gameIndex = Math.max(0, unitGames.findIndex(l => l.id === lesson.id));

    const gamesForGroup = GAME_MAP[userAgeGroup] || GAME_MAP.adulto;
    const gamesForUnit = gamesForGroup[unitNumber] || gamesForGroup[1];
    const gameType = gamesForUnit[gameIndex] || gamesForUnit[0] || 'matching';

    const gameData = LOCAL_GAMES[gameType];

    if (!gameData) {
      console.warn(`startGame: tipo de juego "${gameType}" no encontrado. Fallback a matching.`);
      setActiveGame({
        ...lesson,
        game_type: 'matching',
        game_data: LOCAL_GAMES.matching
      });
      setActiveLesson(lesson);
      setCurrentScreen('game');
      return;
    }

    console.log(`🎮 Juego: "${gameType}" | Grupo: "${userAgeGroup}" | Unidad: ${unitNumber} | Índice: ${gameIndex}`);

    setActiveGame({
      ...lesson,
      game_type: gameType,
      game_data: gameData
    });
    setActiveLesson(lesson);
    setCurrentScreen('game');
  };

  const completeGame = async (gameId) => {
    try {
      const xpReward = activeGame?.xp || 20;
      const coinsReward = activeGame?.coins || 15;

      const result = await completeGameRequest(token, gameId, {
        xp_earned: xpReward,
        coins_earned: coinsReward
      });

      setUser(prev => ({
        ...prev,
        xpTotal: result.user.xp_total,
        coinsMbae: result.user.coins_mbae,
        completedLessons: prev.completedLessons.includes(gameId)
          ? prev.completedLessons
          : [...prev.completedLessons, gameId]
      }));

      setLastLessonResult({
        lessonId: gameId,
        title: activeGame?.title || 'Juego',
        xpGained: xpReward,
        coinsGained: coinsReward,
        accuracy: 100,
        correctCount: activeGame?.game_data?.pairs?.length || activeGame?.game_data?.words?.length || activeGame?.game_data?.questions?.length || 0,
        incorrectCount: 0,
        formattedTime: '0:45',
        culturalCapsule: activeGame?.cultural_capsule,
        newlyUnlockedAchievements: result.newly_unlocked_achievements || []
      });

      setCurrentScreen('lesson_complete');

      loadUnits(token).catch(e => console.warn('⚠️ loadUnits:', e.message));
      loadAchievements().catch(e => console.warn('⚠️ loadAchievements:', e.message));
      loadLeaderboard().catch(e => console.warn('⚠️ loadLeaderboard:', e.message));
    } catch (e) {
      console.warn('Error completando el juego:', e.message);
      setCurrentScreen('lesson_complete');
    }
  };

  const payForRetry = async (cost = 5) => {
    try {
      const result = await payCostRequest(token, cost, 'retry_game');
      setUser(prev => ({
        ...prev,
        coinsMbae: result.new_balance
      }));
      return { success: true, message: result.message };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const payForSkip = async (cost = 50) => {
    try {
      const result = await payCostRequest(token, cost, 'skip_game');
      setUser(prev => ({
        ...prev,
        coinsMbae: result.new_balance
      }));
      return { success: true, message: result.message };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const payCustomCost = async (cost = 10, reason = 'hint') => {
    try {
      const result = await payCostRequest(token, cost, reason);
      setUser(prev => ({
        ...prev,
        coinsMbae: result.new_balance
      }));
      return { success: true, message: result.message };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const addMbae = (amount) => {
    if (!amount || amount <= 0) return;
    setUser(prev => prev ? {
      ...prev,
      coinsMbae: (prev.coinsMbae || 0) + amount
    } : prev);
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
      setPendingAguaraWalk({ type: 'walk-to-next', nextLessonId: nextLesson.id });
      setCurrentScreen('main');
    } else {
      setCurrentScreen('main');
    }
  };

  const goBackToMap = () => {
    setPendingAguaraWalk({ type: 'walk-to-map' });
    setCurrentScreen('main');
  };

  const loseHeart = async () => {
    try {
      const result = await loseHeartRequest(token);
      setUser(prev => ({
        ...prev,
        hearts: result.hearts,
        maxHearts: result.max_hearts
      }));
      console.log(`💔 Corazón perdido: ${result.hearts}/${result.max_hearts}`);
      return { success: true, hearts: result.hearts };
    } catch (e) {
      console.warn('Error perdiendo corazón en server, usando fallback local:', e.message);
      setUser(prev => ({
        ...prev,
        hearts: Math.max(0, (prev.hearts || 5) - 1)
      }));
      return { success: false, message: e.message };
    }
  };

  const completeStory = async (storyId) => {
    try {
      const result = await completeStoryRequest(token, storyId);
      if (result.user) {
        setUser(prev => ({ ...prev, xpTotal: result.user.xp_total }));
      }
      loadAchievements().catch(e => console.warn('⚠️', e.message));
      loadLeaderboard().catch(e => console.warn('⚠️', e.message));
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

  const buyShopItem = async (itemKey, quantity = 1) => {
    try {
      const result = await purchaseItemRequest(token, itemKey, quantity);
      await loadShop(token);

      setUser(prev => {
        const updates = {
          coinsMbae: result.new_balance,
          hintsAvailable: result.user?.hints_available ?? prev.hintsAvailable,
          streakFreezeCount: result.user?.streak_freeze_count ?? prev.streakFreezeCount
        };

        if (result.item_key === 'refill_hearts') {
          updates.hearts = result.user.hearts;
          updates.maxHearts = result.user.max_hearts;
          updates.heartRegenAt = null;
        }

        return { ...prev, ...updates };
      });

      return { success: true, message: result.message, data: result };
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
        setActiveTab: handleSetActiveTab, // 👈 CAMBIO AQUÍ
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
        activeGame,
        activeExercises,
        activeStory,
        setActiveStory,
        lastLessonResult,
        completeLesson,
        startGame,
        completeGame,
        payForRetry,
        payForSkip,
        payCostRequest: payCustomCost,
        addMbae,
        goToNextLesson,
        goBackToMap,
        pendingAguaraWalk,
        setPendingAguaraWalk,
        loseHeart,
        buyShopItem,
        equipItem,
        speakText,
        navigateTo,
        accessibilityMode,
        setAccessibilityMode,
        variants: DIALECT_VARIANTS,
        mbaePacks: MBAE_PACKS,
        leaderboard,
        userRank,
        communityProgress,
        loadLeaderboard
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);